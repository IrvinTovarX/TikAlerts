import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Profile } from './profilesRepo.js';
import type { Screen } from './screensRepo.js';
import type { StoredRule } from './rulesRepo.js';

export interface PointEntry {
  profileId: string;
  userId: string;
  total: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

interface DbShape {
  profiles: Profile[];
  screens: Screen[];
  rules: StoredRule[];
  points: PointEntry[];
}

export interface AppDb {
  filePath: string;
  data: DbShape;
  save: () => void;
}

export function createDb(dbFile = path.resolve('data/livealerts.sqlite')): AppDb {
  mkdirSync(path.dirname(dbFile), { recursive: true });

  const data = loadOrCreate(dbFile);
  const db: AppDb = {
    filePath: dbFile,
    data,
    save: () => writeFileSync(dbFile, JSON.stringify(db.data, null, 2), 'utf8')
  };

  seedDefaults(db);
  db.save();
  return db;
}

function loadOrCreate(dbFile: string): DbShape {
  try {
    const raw = readFileSync(dbFile, 'utf8');
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return {
      profiles: parsed.profiles ?? [],
      screens: parsed.screens ?? [],
      rules: parsed.rules ?? [],
      points: parsed.points ?? []
    };
  } catch {
    return { profiles: [], screens: [], rules: [], points: [] };
  }
}

function seedDefaults(db: AppDb): void {
  const now = new Date().toISOString();

  if (!db.data.profiles.some((p) => p.id === 'profile-default')) {
    db.data.profiles.push({ id: 'profile-default', name: 'Default', isActive: 1, createdAt: now });
  }

  if (!db.data.profiles.some((p) => p.isActive === 1)) {
    const first = db.data.profiles[0];
    if (first) first.isActive = 1;
  }

  if (!db.data.screens.some((s) => s.id === 'screen-default')) {
    db.data.screens.push({ id: 'screen-default', name: 'Screen 1', createdAt: now });
  }

  if (!db.data.rules.some((r) => r.id === 'rule-test-alert')) {
    db.data.rules.push({
      id: 'rule-test-alert',
      profileId: 'profile-default',
      name: 'Test Alert Rule',
      eventName: 'test.alert',
      enabled: 1,
      payloadJson: JSON.stringify({
        layout: 'gift_v',
        titleTemplate: '{user.name}',
        textTemplate: '{text}',
        durationMs: 4500,
        showPlatformIcon: true
      }),
      targetScreenId: 'screen-default',
      createdAt: now
    });
  }
}
