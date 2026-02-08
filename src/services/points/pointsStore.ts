import type Database from 'better-sqlite3';

export class PointsStore {
  constructor(private readonly db: Database.Database) {}

  addPoints(profileId: string, userId: string, points: number): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO points(profileId,userId,total,firstSeenAt,lastSeenAt)
      VALUES(@profileId,@userId,@points,@now,@now)
      ON CONFLICT(profileId,userId) DO UPDATE SET
        total = total + @points,
        lastSeenAt = @now
    `).run({ profileId, userId, points, now });
  }

  pruneInactive(days: number): number {
    const threshold = new Date(Date.now() - days * 86_400_000).toISOString();
    const result = this.db.prepare('DELETE FROM points WHERE lastSeenAt < ?').run(threshold);
    return result.changes;
  }
}
