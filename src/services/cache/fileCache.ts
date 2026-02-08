import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

export class FileCache {
  constructor(private readonly rootDir: string, private readonly maxBytes = 200 * 1024 * 1024) {
    mkdirSync(rootDir, { recursive: true });
  }

  prune(): void {
    const files = readdirSync(this.rootDir).map((name) => {
      const filePath = path.join(this.rootDir, name);
      const st = statSync(filePath);
      return { filePath, mtimeMs: st.mtimeMs, size: st.size };
    }).sort((a, b) => a.mtimeMs - b.mtimeMs);

    let total = files.reduce((sum, f) => sum + f.size, 0);
    for (const file of files) {
      if (total <= this.maxBytes) break;
      rmSync(file.filePath, { force: true });
      total -= file.size;
    }
  }
}
