import { EventEmitter } from 'node:events';

export interface BusEvent<T = unknown> {
  name: string;
  payload: T;
  ts: number;
}

type Handler<T = unknown> = (event: BusEvent<T>) => void;

export class EventBus {
  private emitter = new EventEmitter();

  emitEvent<T>(name: string, payload: T): void {
    this.emitter.emit(name, { name, payload, ts: Date.now() } satisfies BusEvent<T>);
    this.emitter.emit('*', { name, payload, ts: Date.now() } satisfies BusEvent<T>);
  }

  onEvent<T>(name: string, handler: Handler<T>): () => void {
    this.emitter.on(name, handler as Handler);
    return () => this.emitter.off(name, handler as Handler);
  }
}

export const eventBus = new EventBus();
