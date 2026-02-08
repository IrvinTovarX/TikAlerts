import type { AppDb } from './db.js';

export interface Profile {
  id: string;
  name: string;
  isActive: number;
  createdAt: string;
}

export class ProfilesRepo {
  constructor(private readonly db: AppDb) {}

  listProfiles(): Profile[] {
    return [...this.db.data.profiles].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  getActiveProfile(): Profile {
    return this.db.data.profiles.find((p) => p.isActive === 1) ?? this.db.data.profiles[0];
  }

  setActiveProfile(profileId: string): void {
    for (const profile of this.db.data.profiles) {
      profile.isActive = profile.id === profileId ? 1 : 0;
    }
    this.db.save();
  }
}
