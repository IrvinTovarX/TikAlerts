import type { CanonicalEvent } from '../events/canonical.js';

export type Condition =
  | { field: string; op: 'eq' | 'gte' | 'contains' | 'startsWith' | 'in'; value: unknown }
  | { and: Condition[] }
  | { or: Condition[] };

export function evaluateCondition(condition: Condition | undefined, event: CanonicalEvent): boolean {
  if (!condition) return true;
  if ('and' in condition) return condition.and.every((c) => evaluateCondition(c, event));
  if ('or' in condition) return condition.or.some((c) => evaluateCondition(c, event));

  const actual = resolveField(event, condition.field);
  switch (condition.op) {
    case 'eq':
      return actual === condition.value;
    case 'gte':
      return Number(actual ?? 0) >= Number(condition.value ?? 0);
    case 'contains':
      return String(actual ?? '').toLowerCase().includes(String(condition.value ?? '').toLowerCase());
    case 'startsWith':
      return String(actual ?? '').toLowerCase().startsWith(String(condition.value ?? '').toLowerCase());
    case 'in':
      return Array.isArray(condition.value) ? condition.value.includes(actual) : false;
    default:
      return false;
  }
}

export function resolveField(source: unknown, field: string): unknown {
  return field.split('.').reduce<unknown>((acc, key) => {
    if (typeof acc !== 'object' || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, source);
}
