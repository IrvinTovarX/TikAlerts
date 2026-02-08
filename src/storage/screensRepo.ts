import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';

export interface Screen {
  id: string;
  name: string;
  createdAt: string;
}

export class ScreensRepo {
  constructor(private readonly db: Database.Database) {}

  listScreens(): Screen[] {
    return this.db.prepare('SELECT * FROM screens ORDER BY createdAt ASC').all() as Screen[];
  }

  createScreen(name: string): Screen {
    const screen: Screen = {
      id: `screen-${randomUUID().slice(0, 8)}`,
      name,
      createdAt: new Date().toISOString()
    };
    this.db.prepare('INSERT INTO screens(id,name,createdAt) VALUES(@id,@name,@createdAt)').run(screen);
    return screen;
  }
}
