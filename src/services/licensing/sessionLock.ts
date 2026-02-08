export class SessionLockService {
  private activeDeviceId?: string;

  acquire(deviceId: string): boolean {
    if (!this.activeDeviceId || this.activeDeviceId === deviceId) {
      this.activeDeviceId = deviceId;
      return true;
    }
    return false;
  }
}
