import type { PlanTier } from '../../shared/types.js';

const limits: Record<PlanTier, number> = { free: 5, standard: 50, pro: Number.POSITIVE_INFINITY };

export class TtsService {
  canAddBlockedWord(plan: PlanTier, currentCount: number): boolean {
    return currentCount < limits[plan];
  }

  speak(text: string): void {
    // MVP stub: integrate Windows SAPI later.
    void text;
  }
}
