// waybar: the palette as GTK CSS colors, named san-*, for a style.css to use. GTK colors can
// point at each other, so one accent layer per pigment serves every flavor: it points the
// accent's names at that pigment's glass, which every theme defines in its own colors.

import type { ColorName, PigmentId } from '@sanctuary-ds/tokens/palette';

import { gtkColor, gtkCss, gtkRef } from '../../src/formats/gtk-css.ts';
import { banner, notice, type FlavorContext, type Port } from '../../src/port.ts';

/** The six colors of an accent, a status or a glass: the color and what goes with it. */
const VARIANTS = ['', '-lume', '-ink', '-pane', '-on', '-on-pane'] as const;

/** Stone, ink, lead and shadow, in the palette's order. */
const NEUTRALS = [
  'surface-sunken',
  'surface',
  'surface-raised-1',
  'surface-raised-2',
  'surface-raised-3',
  'surface-raised-4',
  'surface-inverse',
  'text',
  'text-muted',
  'text-subtle',
  'text-disabled',
  'text-inverse',
  'lead-soft',
  'lead',
  'lead-strong',
  'lead-came',
  'umbra-key',
  'umbra-ambient',
  'scrim',
] as const satisfies readonly ColorName[];

const STATUSES = ['danger', 'warning', 'success', 'info'] as const;

/** The names an accent layer redefines. */
export const ACCENT_NAMES = VARIANTS.map((variant) => `accent${variant}` as const) satisfies readonly ColorName[];

const glass = (pigment: PigmentId) => VARIANTS.map((variant) => `glass-${pigment}${variant}` as const) satisfies readonly ColorName[];

/**
 * Every color a bar can use, in the palette's order. The ANSI and syntax colors are left out:
 * they belong to terminals and editors.
 */
export const colorNames = (pigments: readonly PigmentId[]): readonly ColorName[] => [
  ...NEUTRALS,
  ...pigments.flatMap(glass),
  ...ACCENT_NAMES,
  ...STATUSES.flatMap((status) => VARIANTS.map((variant) => `${status}${variant}` as const)),
];

const PREFIX = 'san-';

export const waybar: Port = {
  id: 'waybar',
  name: 'Waybar',
  homepage: 'https://github.com/Alexays/Waybar',
  category: 'status-bar',
  // The release the themes were checked against; 0.16.0 is still GTK 3 and reads them the same.
  minVersion: '0.15.0',
  files: (ctx) => {
    const names = colorNames(ctx.pigments);
    const themes = ctx.flavors.map((flavor: FlavorContext) => ({
      path: `themes/sanctuary-${flavor.id}.css`,
      flavor: flavor.id,
      contents: gtkCss({
        comments: notice(waybar, flavor, ctx),
        colors: names.map((name) => [`${PREFIX}${name}`, gtkColor(flavor.color(name), flavor.alpha(name))] as const),
      }),
    }));
    const layers = ctx.pigments.map((pigment) => ({
      path: `accents/${pigment}.css`,
      pigment,
      contents: gtkCss({
        comments: [...banner(waybar, ctx, `Sanctuary ${pigment} accent`), 'Import it after the theme of any flavor.'],
        colors: ACCENT_NAMES.map((name) => [`${PREFIX}${name}`, gtkRef(`${PREFIX}${name.replace('accent', `glass-${pigment}`)}`)] as const),
      }),
    }));
    return [...themes, ...layers];
  },
};
