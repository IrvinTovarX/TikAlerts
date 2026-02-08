import { cpSync, existsSync, mkdirSync } from 'node:fs';

mkdirSync('dist/renderer', { recursive: true });
if (existsSync('src/renderer/index.html')) {
  cpSync('src/renderer/index.html', 'dist/renderer/index.html');
}
