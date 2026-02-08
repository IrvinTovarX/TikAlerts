import { randomUUID } from 'node:crypto';
import type { AlertPayload, AlertLayout } from '../../shared/types.js';
import type { CanonicalEvent } from '../events/canonical.js';
import { platformIconMap } from '../events/canonical.js';
import { renderTemplate } from './templates.js';

export interface RulePayload {
  layout?: AlertLayout;
  titleTemplate?: string;
  textTemplate?: string;
  durationMs?: number;
  showPlatformIcon?: boolean;
  theme?: AlertPayload['theme'];
  primaryMediaUrl?: string;
  badgeMediaUrl?: string;
  targetScreenId?: string;
}

export function buildAlertFromRule(event: CanonicalEvent, payload: RulePayload): AlertPayload {
  const primaryFallback = event.gift?.imageUrl ?? event.user?.avatarUrl;
  const badgeFallback = event.kind === 'gift' ? event.user?.avatarUrl : undefined;

  return {
    id: randomUUID(),
    layout: payload.layout ?? defaultLayout(event.kind),
    title: renderTemplate(payload.titleTemplate ?? '{user.name}', event),
    text: renderTemplate(payload.textTemplate ?? '{text}', event),
    durationMs: payload.durationMs ?? 4500,
    showPlatformIcon: payload.showPlatformIcon ?? true,
    targetScreenId: payload.targetScreenId ?? 'screen-default',
    theme: payload.theme,
    primaryMedia: payload.primaryMediaUrl || primaryFallback ? { type: 'image', url: payload.primaryMediaUrl ?? primaryFallback ?? '' } : undefined,
    badgeMedia: payload.badgeMediaUrl || badgeFallback ? { type: 'image', url: payload.badgeMediaUrl ?? badgeFallback ?? '' } : undefined,
    platformIcon: platformIconMap[event.platform]
  };
}

function defaultLayout(kind: CanonicalEvent['kind']): AlertLayout {
  if (kind === 'gift') return 'gift_v';
  if (kind === 'chat' || kind === 'like') return 'mini';
  return 'user_v';
}
