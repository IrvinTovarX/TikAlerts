import type Database from 'better-sqlite3';

export interface Profile {
  id: string;
  name: string;
  isActive: number;
  createdAt: string;
}

export class ProfilesRepo {
  constructor(private readonly db: Database.Database) {}

  listProfiles(): Profile[] {
    return this.db.prepare('SELECT * FROM profiles ORDER BY createdAt ASC').all() as Profile[];
  }

  getActiveProfile(): Profile {
    return this.db.prepare('SELECT * FROM profiles WHERE isActive = 1 LIMIT 1').get() as Profile;
  }

  setActiveProfile(profileId: string): void {
    const tx = this.db.transaction(() => {
      this.db.prepare('UPDATE profiles SET isActive = 0').run();
      this.db.prepare('UPDATE profiles SET isActive = 1 WHERE id = ?').run(profileId);
    });
    tx();
  }
}
