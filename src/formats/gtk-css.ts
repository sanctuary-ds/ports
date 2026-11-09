// GTK CSS color definitions, as waybar and other GTK applications read them:
// `@define-color name value;`, where the value is a color or `@another-name`.

import { bare, type Hex } from '../color.ts';

declare const brand: unique symbol;

/** A color value GTK CSS reads. Only `gtkColor()` and `gtkRef()` make one. */
export type GtkColor = string & { readonly [brand]: 'GtkColor' };

/** Lowercase words joined by single hyphens: no character that could end the definition. */
const NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
/** One line that cannot open or close another comment. */
const COMMENT = /^(?:(?!\/\*|\*\/)[^\r\n])*$/;

function check(kind: string, text: string, pattern: RegExp): string {
  if (!pattern.test(text)) throw new TypeError(`Invalid GTK CSS ${kind}: ${JSON.stringify(text)}`);
  return text;
}

/**
 * `#rrggbb` for an opaque color, `rgba()` otherwise: GTK 3 does not read `#rrggbbaa`.
 * `alpha` is the opacity, from 0 to 1, as the palette gives it.
 */
export function gtkColor(color: Hex, alpha = 1): GtkColor {
  if (!(alpha >= 0 && alpha <= 1)) throw new RangeError(`Alpha out of range: ${alpha}`);
  if (alpha === 1) return color as string as GtkColor;
  const value = bare(color);
  const [r, g, b] = [0, 2, 4].map((at) => Number.parseInt(value.slice(at, at + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})` as GtkColor;
}

/** A reference to another defined color. GTK resolves it when it paints, and says nothing if the name is missing. */
export function gtkRef(name: string): GtkColor {
  return `@${check('name', name, NAME)}` as GtkColor;
}

export interface GtkCssDocument {
  comments: readonly string[];
  colors: readonly (readonly [name: string, value: GtkColor])[];
}

/** Writes the document. A name or comment that could start another rule throws. */
export function gtkCss(doc: GtkCssDocument): string {
  const head = doc.comments.map((comment) => `/* ${check('comment', comment, COMMENT)} */`).join('\n');
  const body = doc.colors.map(([name, value]) => `@define-color ${check('name', name, NAME)} ${value};`).join('\n');
  return `${head}\n\n${body}\n`;
}
