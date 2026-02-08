export type Platform = 'local' | 'tiktok' | 'youtube' | 'twitch' | 'kick';

export type EventKind = 'gift' | 'follow' | 'sub' | 'like' | 'chat' | 'command' | 'test';

export interface CanonicalEvent {
  id: string;
  platform: Platform;
  kind: EventKind;
  name: string;
  user?: {
    id?: string;
    name?: string;
    avatarUrl?: string;
  };
  metrics?: {
    diamonds?: number;
    bits?: number;
    amount?: number;
    likes?: number;
  };
  gift?: {
    id?: string;
    name?: string;
    qty?: number;
    imageUrl?: string;
  };
  chat?: {
    text?: string;
    command?: string;
  };
  text?: string;
  raw?: unknown;
}

export const platformIconMap: Record<Platform, string> = {
  local: '/assets/platform-local.svg',
  tiktok: '/assets/platform-tiktok.svg',
  youtube: '/assets/platform-youtube.svg',
  twitch: '/assets/platform-twitch.svg',
  kick: '/assets/platform-kick.svg'
};
