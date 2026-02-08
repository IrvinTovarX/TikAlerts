import type { PlanTier } from '../../shared/types.js';

export interface AuthState {
  loggedIn: boolean;
  plan: PlanTier;
  graceUntil?: number;
}

export class LicensingAuthService {
  private state: AuthState = { loggedIn: true, plan: 'pro' };

  getState(): AuthState {
    return this.state;
  }

  enforceOfflineGrace(now = Date.now()): boolean {
    if (!this.state.graceUntil) {
      this.state.graceUntil = now + 20 * 60 * 1000;
      return true;
    }
    return now <= this.state.graceUntil;
  }
}
