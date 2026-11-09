// foot: one [colors-dark] or [colors-light] section per flavor, by the flavor's scheme.
// Keys and value shapes follow foot.ini(5) of foot 1.28.

import { bare, type Hex } from '../../src/color.ts';
import { ini } from '../../src/formats/ini.ts';
import { notice, type FlavorContext, type Port } from '../../src/port.ts';

type Index = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Keys that take one color. */
type Single =
  | 'foreground'
  | 'background'
  | `regular${Index}`
  | `bright${Index}`
  | 'selection-foreground'
  | 'selection-background'
  | 'urls'
  | 'flash';

/** Keys that take a text color and the background it is drawn on, in that order. */
type Pair = 'cursor' | 'jump-labels' | 'scrollback-indicator' | 'search-box-match' | 'search-box-no-match';

export type FootColors = { [K in Single]: Hex } & { [K in Pair]: readonly [text: Hex, background: Hex] };

const ANSI = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as const;

export function footColors(flavor: FlavorContext): FootColors {
  const c = flavor.color;
  // The sixteen terminal colors. The palette names black and white without "bright" for the regular pair.
  const regular = Object.fromEntries(ANSI.map((name, i) => [`regular${i}`, c(`ansi-${name}`)]));
  const bright = Object.fromEntries(ANSI.map((name, i) => [`bright${i}`, c(`ansi-bright-${name}`)]));
  return {
    foreground: c('text'),
    background: c('surface'),
    ...(regular as Record<`regular${Index}`, Hex>),
    ...(bright as Record<`bright${Index}`, Hex>),
    // The accent's pane, not a raised stone: against the surface both are close in lightness,
    // and the pane's hue is what tells the selection apart.
    'selection-foreground': c('accent-on-pane'),
    'selection-background': c('accent-pane'),
    cursor: [c('accent-on'), c('accent')],
    urls: c('accent-ink'),
    'jump-labels': [c('accent-on'), c('accent')],
    'scrollback-indicator': [c('text'), c('surface-raised-3')],
    'search-box-match': [c('accent-on'), c('accent')],
    'search-box-no-match': [c('danger-on'), c('danger')],
    flash: c('warning'),
  };
}

/** The order the keys are written in: base, terminal colors, then foot's own interface. */
const ORDER: readonly (Single | Pair)[] = [
  'foreground',
  'background',
  ...ANSI.map((_, i) => `regular${i as Index}` as const),
  ...ANSI.map((_, i) => `bright${i as Index}` as const),
  'selection-foreground',
  'selection-background',
  'cursor',
  'urls',
  'jump-labels',
  'scrollback-indicator',
  'search-box-match',
  'search-box-no-match',
  'flash',
];

const value = (color: Hex | readonly [Hex, Hex]) => (typeof color === 'string' ? bare(color) : color.map(bare).join(' '));

export const foot: Port = {
  id: 'foot',
  name: 'foot',
  homepage: 'https://codeberg.org/dnkl/foot',
  category: 'terminal',
  // The release that added [colors-dark] and [colors-light].
  minVersion: '1.26.0',
  files: (ctx) =>
    ctx.flavors.map((flavor) => {
      const colors = footColors(flavor);
      return {
        path: `themes/sanctuary-${flavor.id}.ini`,
        flavor: flavor.id,
        contents: ini({
          comments: notice(foot, flavor, ctx),
          sections: [{ name: `colors-${flavor.scheme}`, entries: ORDER.map((key) => [key, value(colors[key])] as const) }],
        }),
      };
    }),
};
