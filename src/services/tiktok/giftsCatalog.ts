import type pino from 'pino';

export interface GiftItem {
  giftId: string;
  name: string;
  imageUrl?: string;
  region?: string;
}

export class GiftsCatalog {
  private readonly gifts = new Map<string, GiftItem>();

  constructor(private readonly logger: pino.Logger) {}

  async loadInitial(): Promise<void> {
    this.logger.info('tiktok gifts catalog initialized (stub)');
  }

  upsertUnknownGift(gift: GiftItem): void {
    const key = `${gift.region ?? 'global'}:${gift.giftId}`;
    if (!this.gifts.has(key)) this.logger.warn({ gift }, 'unknown gift inserted as placeholder');
    this.gifts.set(key, gift);
  }
}
