// Colors as the palette gives them, and the arithmetic the tests use on them.

declare const brand: unique symbol;

/** A color as `#rrggbb`, lowercase. Only `hex()` makes one, so every Hex has been checked. */
export type Hex = string & { readonly [brand]: 'Hex' };

const HEX = /^#[0-9a-f]{6}$/;

export function hex(value: string): Hex {
  if (!HEX.test(value)) throw new TypeError(`Not a #rrggbb color: ${JSON.stringify(value)}`);
  return value as Hex;
}

/** `rrggbb` without the `#`, as foot writes its colors. */
export function bare(color: Hex): string {
  return color.slice(1);
}

/** Relative luminance, as WCAG 2 defines it for sRGB. */
export function luminance(color: Hex): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(color.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio, from 1 to 21, whichever color is lighter. */
export function contrast(a: Hex, b: Hex): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
