import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('liveAlerts', {
  version: '0.1.0'
});
