// mango's configuration: `# ` comments and `key=value` lines, colors as 0xrrggbbaa.

import { bare, type Hex } from '../color.ts';

declare const brand: unique symbol;

/** A color as mango reads it, `0xrrggbbaa`. Only `mangoColor()` makes one. */
export type MangoColor = string & { readonly [brand]: 'MangoColor' };

/** `alpha` is the opacity, from 0 to 1, as the palette gives it. */
export function mangoColor(color: Hex, alpha = 1): MangoColor {
  if (!(alpha >= 0 && alpha <= 1)) throw new RangeError(`Alpha out of range: ${alpha}`);
  const byte = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `0x${bare(color)}${byte}` as MangoColor;
}

export interface MangoDocument {
  comments: readonly string[];
  entries: readonly (readonly [key: string, value: MangoColor])[];
}

const KEY = /^[a-z][a-z0-9_]*$/;
const LINE = /^[^\r\n]*$/;

function check(kind: string, text: string, pattern: RegExp): string {
  if (!pattern.test(text)) throw new TypeError(`Invalid mango ${kind}: ${JSON.stringify(text)}`);
  return text;
}

/** Writes the document. A key or comment that could start a new line throws. */
export function mangoConf(doc: MangoDocument): string {
  const head = doc.comments.map((comment) => `# ${check('comment', comment, LINE)}`).join('\n');
  const body = doc.entries.map(([key, value]) => `${check('key', key, KEY)}=${value}`).join('\n');
  return `${head}\n\n${body}\n`;
}
