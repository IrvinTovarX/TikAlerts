import { resolveField } from './conditions.js';

export function renderTemplate(template: string | undefined, source: unknown): string {
  if (!template) return '';
  return template.replace(/\{([a-zA-Z0-9_.]+)\}/g, (_match, path: string) => {
    const value = resolveField(source, path);
    return value === undefined || value === null ? '' : String(value);
  });
}
