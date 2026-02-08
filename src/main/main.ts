import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import pino from 'pino';
import updaterPkg from 'electron-updater';
import { eventBus } from '../core/bus/eventBus.js';
import { createDb } from '../storage/db.js';
import { ProfilesRepo } from '../storage/profilesRepo.js';
import { ScreensRepo } from '../storage/screensRepo.js';
import { RulesRepo } from '../storage/rulesRepo.js';
import { startOverlayServer } from '../overlay/server.js';
import { RulesEngine } from '../core/rules/rulesEngine.js';
import { TikTokConnector } from '../services/tiktok/connector.js';
import { GiftsCatalog } from '../services/tiktok/giftsCatalog.js';
import { AvatarCache } from '../services/cache/avatarCache.js';

const logger = pino({ name: 'LiveAlerts' });

async function bootstrap(): Promise<void> {
  await app.whenReady();

  const db = createDb();
  const profilesRepo = new ProfilesRepo(db);
  const screensRepo = new ScreensRepo(db);
  const rulesRepo = new RulesRepo(db);

  const activeProfile = profilesRepo.getActiveProfile();
  const screens = screensRepo.listScreens();
  logger.info({ profile: activeProfile.id, screens: screens.length }, 'startup loaded');
  logger.info({ defaultScreenUrl: 'http://127.0.0.1:3210/screen/screen-default' }, 'default screen url');

  const rulesEngine = new RulesEngine(eventBus, rulesRepo, logger);
  rulesEngine.wire();

  startOverlayServer({ bus: eventBus, logger, screensRepo, port: 3210 });

  const tiktok = new TikTokConnector(eventBus, logger);
  tiktok.start();
  const giftsCatalog = new GiftsCatalog(logger);
  await giftsCatalog.loadInitial();

  const avatarCache = new AvatarCache();
  setInterval(() => avatarCache.prune(), 10 * 60 * 1000).unref();

  createMainWindow();

  eventBus.emitEvent('app.started', { platform: 'local', kind: 'test', text: 'app started' });
  logger.info('app.started emitted');

  const { autoUpdater } = updaterPkg;
  autoUpdater.autoDownload = true;
  autoUpdater.checkForUpdatesAndNotify().catch((err) => logger.warn({ err }, 'auto-updater check failed'));
}

function createMainWindow(): void {
  const win = new BrowserWindow({
    width: 1024,
    height: 720,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'dist/main/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(app.getAppPath(), 'dist/renderer/index.html'));
}

bootstrap().catch((error) => {
  logger.error({ error }, 'fatal bootstrap error');
  app.exit(1);
});
