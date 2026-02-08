import type Database from 'better-sqlite3';

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
  constructor(private readonly db: Database.Database) {}

  listRules(profileId: string): StoredRule[] {
    return this.db.prepare('SELECT * FROM rules WHERE profileId = ? ORDER BY createdAt ASC').all(profileId) as StoredRule[];
  }

  listEnabledRulesForActiveProfile(): StoredRule[] {
    return this.db.prepare(`
      SELECT r.* FROM rules r
      JOIN profiles p ON p.id = r.profileId
      WHERE p.isActive = 1 AND r.enabled = 1
      ORDER BY r.createdAt ASC
    `).all() as StoredRule[];
  }

  upsertRule(rule: StoredRule): void {
    this.db.prepare(`
      INSERT INTO rules(id,profileId,name,eventName,enabled,payloadJson,targetScreenId,createdAt)
      VALUES(@id,@profileId,@name,@eventName,@enabled,@payloadJson,@targetScreenId,@createdAt)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        eventName = excluded.eventName,
        enabled = excluded.enabled,
        payloadJson = excluded.payloadJson,
        targetScreenId = excluded.targetScreenId
    `).run(rule);
  }
}
