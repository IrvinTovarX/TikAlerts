import type { AppDb } from './db.js';

export interface StoredRule {
  id: string;
  profileId: string;
  name: string;
  eventName: string;
  enabled: number;
  payloadJson: string;
  targetScreenId: string;
  createdAt: string;
}

export class RulesRepo {
  constructor(private readonly db: AppDb) {}

  listRules(profileId: string): StoredRule[] {
    return this.db.data.rules
      .filter((r) => r.profileId === profileId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  listEnabledRulesForActiveProfile(): StoredRule[] {
    const activeProfile = this.db.data.profiles.find((p) => p.isActive === 1);
    if (!activeProfile) return [];
    return this.db.data.rules
      .filter((r) => r.profileId === activeProfile.id && r.enabled === 1)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  upsertRule(rule: StoredRule): void {
    const idx = this.db.data.rules.findIndex((r) => r.id === rule.id);
    if (idx >= 0) this.db.data.rules[idx] = rule;
    else this.db.data.rules.push(rule);
    this.db.save();
  }
}
