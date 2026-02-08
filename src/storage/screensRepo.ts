import { randomUUID } from 'node:crypto';
import type { AppDb } from './db.js';

export interface Screen {
  id: string;
  name: string;
  createdAt: string;
}

export class ScreensRepo {
  constructor(private readonly db: AppDb) {}

  listScreens(): Screen[] {
    return [...this.db.data.screens].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  createScreen(name: string): Screen {
    const screen: Screen = {
      id: `screen-${randomUUID().slice(0, 8)}`,
      name,
      createdAt: new Date().toISOString()
    };
    this.db.data.screens.push(screen);
    this.db.save();
    return screen;
  }
}
