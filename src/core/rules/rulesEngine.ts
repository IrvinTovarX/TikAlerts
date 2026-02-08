import pino from 'pino';
import type { EventBus } from '../bus/eventBus.js';
import type { CanonicalEvent } from '../events/canonical.js';
import { normalizeToCanonical } from '../events/normalize.js';
import { evaluateCondition, type Condition } from './conditions.js';
import { buildAlertFromRule, type RulePayload } from './actions.js';
import { RulesRepo, type StoredRule } from '../../storage/rulesRepo.js';

const cooldowns = new Map<string, number>();

export class RulesEngine {
  constructor(
    private readonly bus: EventBus,
    private readonly rulesRepo: RulesRepo,
    private readonly logger: pino.Logger
  ) {}

  wire(): void {
    this.bus.onEvent('*', (busEvent) => {
      if (busEvent.name === 'overlay.alert') return;
      const canonical = normalizeToCanonical(busEvent);
      this.evaluateRules(canonical);
    });
  }

  evaluateRules(event: CanonicalEvent): void {
    const rules = this.rulesRepo.listEnabledRulesForActiveProfile();
    for (const rule of rules) {
      if (rule.eventName !== event.name && rule.eventName !== event.kind && rule.eventName !== '*') continue;
      const payload = safeParseRulePayload(rule);
      const condition = payload.condition as Condition | undefined;
      if (!evaluateCondition(condition, event)) continue;
      if (!passesCooldown(rule, event)) continue;

      const alert = buildAlertFromRule(event, {
        ...payload,
        targetScreenId: rule.targetScreenId
      } as RulePayload);
      this.logger.info({ ruleId: rule.id, event: event.name }, 'rule matched');
      this.bus.emitEvent('overlay.alert', alert);
      this.bus.emitEvent('canonical.event', event);
    }
  }
}

function safeParseRulePayload(rule: StoredRule): Record<string, unknown> {
  try {
    return JSON.parse(rule.payloadJson || '{}') as Record<string, unknown>;
  } catch {
    return {};
  }
}

function passesCooldown(rule: StoredRule, event: CanonicalEvent): boolean {
  const payload = safeParseRulePayload(rule);
  const globalCooldownMs = Number(payload.globalCooldownMs ?? 0);
  const perUserCooldownMs = Number(payload.perUserCooldownMs ?? 0);
  const now = Date.now();

  if (globalCooldownMs > 0) {
    const key = `${rule.id}:global`;
    const last = cooldowns.get(key) ?? 0;
    if (now - last < globalCooldownMs) return false;
    cooldowns.set(key, now);
  }

  if (perUserCooldownMs > 0 && event.user?.id) {
    const key = `${rule.id}:user:${event.user.id}`;
    const last = cooldowns.get(key) ?? 0;
    if (now - last < perUserCooldownMs) return false;
    cooldowns.set(key, now);
  }

  return true;
}
