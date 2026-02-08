import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import type pino from 'pino';
import type { EventBus } from '../core/bus/eventBus.js';
import type { AlertPayload } from '../shared/types.js';
import { ScreenStatusTracker } from './statusTracker.js';
import { ScreensRepo } from '../storage/screensRepo.js';

interface OverlayDeps {
  bus: EventBus;
  logger: pino.Logger;
  screensRepo: ScreensRepo;
  port?: number;
}

export function startOverlayServer({ bus, logger, screensRepo, port = 3210 }: OverlayDeps): void {
  const app = express();
  const statusTracker = new ScreenStatusTracker();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const screenSockets = new Map<string, Set<import('ws').WebSocket>>();

  app.use(express.json());

  app.get('/', (_req, res) => res.send('LiveAlerts overlay server is running.'));

  app.get('/api/screens', (_req, res) => {
    res.json({ screens: screensRepo.listScreens(), states: statusTracker.listStates() });
  });

  app.post('/api/screens', (req, res) => {
    const name = String(req.body?.name ?? `Screen ${Date.now()}`);
    const created = screensRepo.createScreen(name);
    res.status(201).json(created);
  });

  app.get('/test', (_req, res) => {
    bus.emitEvent('test.alert', {
      platform: 'local',
      kind: 'test',
      user: { id: 'local-user', name: 'Local Tester' },
      gift: { name: 'Rose', qty: 1 },
      metrics: { diamonds: 100 },
      text: 'This is a LiveAlerts test alert.'
    });
    res.json({ ok: true });
  });

  app.get('/screen/:id', (req, res) => {
    const screenId = req.params.id;
    const debug = 'debug' in req.query;
    statusTracker.touchLoading(screenId);
    res.type('html').send(renderOverlayHtml(screenId, debug));
  });

  wss.on('connection', (socket) => {
    let boundScreenId: string | null = null;

    socket.on('message', (raw) => {
      const msg = JSON.parse(raw.toString()) as { type: string; screenId?: string };
      if (msg.type === 'HELLO' && msg.screenId) {
        boundScreenId = msg.screenId;
        statusTracker.touchLoading(msg.screenId);
        if (!screenSockets.has(msg.screenId)) screenSockets.set(msg.screenId, new Set());
        screenSockets.get(msg.screenId)?.add(socket);
      }
      if (msg.type === 'READY' && msg.screenId) {
        statusTracker.markOnline(msg.screenId);
      }
      if (msg.type === 'HEARTBEAT' && msg.screenId) {
        statusTracker.heartbeat(msg.screenId);
      }
    });

    socket.on('close', () => {
      if (!boundScreenId) return;
      screenSockets.get(boundScreenId)?.delete(socket);
    });
  });

  setInterval(() => statusTracker.markOfflineExpired(15000), 3000).unref();

  bus.onEvent<AlertPayload>('overlay.alert', (event) => {
    const sockets = screenSockets.get(event.payload.targetScreenId);
    if (!sockets || sockets.size === 0) return;
    statusTracker.incrementEvents(event.payload.targetScreenId);
    for (const ws of sockets) {
      ws.send(JSON.stringify({ type: 'ALERT', payload: event.payload, screenId: event.payload.targetScreenId }));
    }
  });

  server.listen(port, '0.0.0.0', () => {
    logger.info({ port }, 'overlay server started');
  });
}

function renderOverlayHtml(screenId: string, debug: boolean): string {
  const debugPanel = debug
    ? `<div id="debugCard" class="debug-card">Debug enabled · <span id="status">LOADING</span> · events: <span id="count">0</span></div>`
    : '';
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>LiveAlerts Overlay</title>
<style>
:root { --bg:#1d2327; --accent:#63e6be; --text:#f5f7f8; }
html,body{margin:0;padding:0;width:100%;height:100%;background:transparent;overflow:hidden;font-family:Segoe UI,sans-serif;color:var(--text)}
#stage{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
#alertQueue{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;gap:14px;align-items:center}
.alert{min-width:320px;max-width:640px;background:rgba(29,35,39,.92);border:2px solid var(--accent);border-radius:16px;padding:16px;box-shadow:0 12px 30px rgba(0,0,0,.4);display:flex;gap:12px;align-items:center;animation:enter .35s ease}
.alert.exit{animation:exit .3s ease forwards}
.media{width:72px;height:72px;border-radius:12px;background:#2a3136;object-fit:cover}
.badge{width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--accent)}
.texts{display:flex;flex-direction:column;gap:4px}
.title{font-weight:700;font-size:1.1rem}
.body{opacity:.9}
.debug-card{position:absolute;left:50%;top:20px;transform:translateX(-50%);background:#1d2327;border:2px solid var(--accent);padding:10px 14px;border-radius:12px}
@keyframes enter { from { opacity:0; transform:translateY(14px) scale(.96);} to {opacity:1; transform:translateY(0) scale(1);} }
@keyframes exit { from { opacity:1; transform:translateY(0);} to { opacity:0; transform:translateY(-12px);} }
</style>
</head>
<body>
<div id="stage"><div id="alertQueue"></div>${debugPanel}</div>
<script>
const screenId = ${JSON.stringify(screenId)};
const debug = ${debug ? 'true':'false'};
const queueEl = document.getElementById('alertQueue');
let eventCount = 0;
function connect(){
 const ws = new WebSocket('ws://127.0.0.1:3210');
 ws.addEventListener('open',()=>{ws.send(JSON.stringify({type:'HELLO',screenId}));ws.send(JSON.stringify({type:'READY',screenId}));});
 ws.addEventListener('message',(ev)=>{const msg=JSON.parse(ev.data);if(msg.type==='ALERT'&&msg.screenId===screenId){eventCount++;if(debug){document.getElementById('count').textContent=String(eventCount);document.getElementById('status').textContent='ONLINE';}enqueue(msg.payload);}});
 ws.addEventListener('close',()=>{if(debug){document.getElementById('status').textContent='OFFLINE';}setTimeout(connect,1200);});
 setInterval(()=>{if(ws.readyState===1){ws.send(JSON.stringify({type:'HEARTBEAT',screenId}));}},5000);
}
function enqueue(alert){
 const card=document.createElement('div');card.className='alert';
 const primary=alert.primaryMedia?.url?'<img class=\"media\" src=\"'+alert.primaryMedia.url+'\" />':'';
 const badge=alert.badgeMedia?.url?'<img class=\"badge\" src=\"'+alert.badgeMedia.url+'\" />':'';
 const platform=alert.showPlatformIcon&&alert.platformIcon?'<img class=\"badge\" src=\"'+alert.platformIcon+'\" />':'';
 card.innerHTML=primary+'<div class=\"texts\"><div class=\"title\">'+(alert.title||'')+'</div><div class=\"body\">'+(alert.text||'')+'</div><div>'+badge+platform+'</div></div>';
 queueEl.appendChild(card);
 setTimeout(()=>{card.classList.add('exit');setTimeout(()=>card.remove(),350);}, alert.durationMs||4500);
}
connect();
</script>
</body></html>`;
}
