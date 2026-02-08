import type { AppDb } from '../../storage/db.js';

export class PointsStore {
  constructor(private readonly db: AppDb) {}

  addPoints(profileId: string, userId: string, points: number): void {
    const now = new Date().toISOString();
    const existing = this.db.data.points.find((p) => p.profileId === profileId && p.userId === userId);
    if (existing) {
      existing.total += points;
      existing.lastSeenAt = now;
    } else {
      this.db.data.points.push({ profileId, userId, total: points, firstSeenAt: now, lastSeenAt: now });
    }
    this.db.save();
  }

  pruneInactive(days: number): number {
    const thresholdMs = Date.now() - days * 86_400_000;
    const before = this.db.data.points.length;
    this.db.data.points = this.db.data.points.filter((p) => new Date(p.lastSeenAt).getTime() >= thresholdMs);
    const removed = before - this.db.data.points.length;
    if (removed > 0) this.db.save();
    return removed;
  }
}
