import type { ScreenStatus } from '../shared/types.js';

interface State {
  status: ScreenStatus;
  lastHeartbeat: number;
  eventCount: number;
}

export class ScreenStatusTracker {
  private readonly screens = new Map<string, State>();

  touchLoading(screenId: string): void {
    const state = this.screens.get(screenId) ?? { status: 'LOADING', lastHeartbeat: Date.now(), eventCount: 0 };
    state.status = 'LOADING';
    state.lastHeartbeat = Date.now();
    this.screens.set(screenId, state);
  }

  markOnline(screenId: string): void {
    const state = this.screens.get(screenId) ?? { status: 'ONLINE', lastHeartbeat: Date.now(), eventCount: 0 };
    state.status = 'ONLINE';
    state.lastHeartbeat = Date.now();
    this.screens.set(screenId, state);
  }

  heartbeat(screenId: string): void {
    const state = this.screens.get(screenId) ?? { status: 'LOADING', lastHeartbeat: Date.now(), eventCount: 0 };
    state.lastHeartbeat = Date.now();
    state.status = 'ONLINE';
    this.screens.set(screenId, state);
  }

  incrementEvents(screenId: string): void {
    const state = this.screens.get(screenId);
    if (!state) return;
    state.eventCount += 1;
  }

  getState(screenId: string): State {
    return this.screens.get(screenId) ?? { status: 'OFFLINE', lastHeartbeat: 0, eventCount: 0 };
  }

  listStates(): Record<string, State> {
    return Object.fromEntries(this.screens.entries());
  }

  markOfflineExpired(timeoutMs: number): void {
    const now = Date.now();
    for (const [screenId, state] of this.screens.entries()) {
      if (now - state.lastHeartbeat > timeoutMs) {
        state.status = 'OFFLINE';
        this.screens.set(screenId, state);
      }
    }
  }
}
