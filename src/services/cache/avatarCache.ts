import path from 'node:path';
import { FileCache } from './fileCache.js';

export class AvatarCache extends FileCache {
  constructor() {
    super(path.resolve('data/cache/avatars'));
  }
}
