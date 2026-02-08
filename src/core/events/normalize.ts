import { randomUUID } from 'node:crypto';
import type { BusEvent } from '../bus/eventBus.js';
import type { CanonicalEvent, Platform } from './canonical.js';

export function normalizeToCanonical(event: BusEvent<unknown>): CanonicalEvent {
  const payload = (event.payload ?? {}) as Record<string, unknown>;
  const platform = (payload.platform as Platform) ?? 'local';
  return {
    id: randomUUID(),
    platform,
    kind: (payload.kind as CanonicalEvent['kind']) ?? guessKind(event.name),
    name: event.name,
    user: payload.user as CanonicalEvent['user'],
    metrics: payload.metrics as CanonicalEvent['metrics'],
    gift: payload.gift as CanonicalEvent['gift'],
    chat: payload.chat as CanonicalEvent['chat'],
    text: (payload.text as string) ?? event.name,
    raw: payload.raw ?? payload
  };
}

function guessKind(name: string): CanonicalEvent['kind'] {
  if (name.includes('gift')) return 'gift';
  if (name.includes('follow')) return 'follow';
  if (name.includes('sub')) return 'sub';
  if (name.includes('like')) return 'like';
  if (name.includes('chat')) return 'chat';
  if (name.includes('command')) return 'command';
  return 'test';
}
