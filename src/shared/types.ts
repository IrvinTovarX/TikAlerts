export type PlanTier = 'free' | 'standard' | 'pro';

export type ScreenStatus = 'LOADING' | 'ONLINE' | 'OFFLINE';

export type OverlayMessage =
  | { type: 'STATUS'; payload: { screenId: string; status: ScreenStatus } }
  | { type: 'ALERT'; screenId: string; payload: AlertPayload }
  | { type: 'PING'; timestamp: number };

export type AlertLayout = 'gift_v' | 'gift_h' | 'user_v' | 'epic_v' | 'mini';

export interface AlertPayload {
  id: string;
  layout: AlertLayout;
  title: string;
  text: string;
  durationMs: number;
  showPlatformIcon: boolean;
  targetScreenId: string;
  theme?: {
    cardBg?: string;
    textColor?: string;
    border?: string;
    accent?: string;
  };
  primaryMedia?: { type: 'image' | 'gif' | 'video'; url: string };
  badgeMedia?: { type: 'image' | 'gif'; url: string };
  platformIcon?: string;
}
