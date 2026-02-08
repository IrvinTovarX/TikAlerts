import type pino from 'pino';
import type { EventBus } from '../../core/bus/eventBus.js';

export class TikTokConnector {
  private handle?: string;
  constructor(private readonly bus: EventBus, private readonly logger: pino.Logger) {}

  setHandle(handle: string): void {
    this.handle = handle;
  }

  start(): void {
    this.logger.info({ handle: this.handle }, 'tiktok connector started (stub)');
    setInterval(() => {
      if (!this.handle) return;
      this.bus.emitEvent('tiktok.chat', {
        platform: 'tiktok',
        kind: 'chat',
        user: { id: 'tt-user-1', name: 'TikTokUser' },
        chat: { text: 'Hello from TikTok', command: '!tts' },
        text: 'Hello from TikTok'
      });
    }, 45000).unref();
  }
}
