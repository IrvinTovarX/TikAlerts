import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

export function createDb(dbFile = path.resolve('data/livealerts.sqlite')): Database.Database {
  mkdirSync(path.dirname(dbFile), { recursive: true });
  const db = new Database(dbFile);
  db.pragma('journal_mode = WAL');
  migrate(db);
  seedDefaults(db);
  return db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS screens (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      name TEXT NOT NULL,
      eventName TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      payloadJson TEXT NOT NULL,
      targetScreenId TEXT NOT NULL DEFAULT 'screen-default',
      createdAt TEXT NOT NULL,
      FOREIGN KEY(profileId) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS points (
      profileId TEXT NOT NULL,
      userId TEXT NOT NULL,
      total INTEGER NOT NULL DEFAULT 0,
      firstSeenAt TEXT NOT NULL,
      lastSeenAt TEXT NOT NULL,
      PRIMARY KEY(profileId, userId)
    );
  `);
}

function seedDefaults(db: Database.Database): void {
  const now = new Date().toISOString();
  db.prepare(`INSERT OR IGNORE INTO profiles(id,name,isActive,createdAt) VALUES('profile-default','Default',1,@now)`).run({ now });
  db.prepare(`UPDATE profiles SET isActive = CASE WHEN id='profile-default' THEN 1 ELSE isActive END`).run();
  db.prepare(`INSERT OR IGNORE INTO screens(id,name,createdAt) VALUES('screen-default','Screen 1',@now)`).run({ now });
  db.prepare(`
    INSERT OR IGNORE INTO rules(id,profileId,name,eventName,enabled,payloadJson,targetScreenId,createdAt)
    VALUES('rule-test-alert','profile-default','Test Alert Rule','test.alert',1,@payload,'screen-default',@now)
  `).run({
    now,
    payload: JSON.stringify({
      layout: 'gift_v',
      titleTemplate: '{user.name}',
      textTemplate: '{text}',
      durationMs: 4500,
      showPlatformIcon: true
    })
  });
}
