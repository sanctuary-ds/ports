// mango: the color keys of mango 0.18.4, checked with `mango -p`, and an accent layer per
// flavor and pigment. mango has no variables, so a layer repeats the accent's keys and wins
// by coming last.

import type { PigmentId } from '@sanctuary-ds/tokens/palette';

import type { Hex } from '../../src/color.ts';
import { mangoColor, mangoConf, type MangoColor } from '../../src/formats/mango-conf.ts';
import { notice, type FlavorContext, type Port } from '../../src/port.ts';

/** The bars and labels mango draws text on, each with the same five colors. */
type Bar = 'jump_label' | 'group_bar' | 'tab_bar' | 'title_message_bar';
type BarKey = `${Bar}_decorate_${'fg' | 'bg' | 'focus_fg' | 'focus_bg' | 'border'}_color`;

type Key =
  | 'root_color'
  | 'border_color'
  | 'focus_color'
  | 'urgent_color'
  | 'split_color'
  | 'drop_color'
  | 'maximized_screen_color'
  | 'scratchpad_color'
  | 'global_color'
  | 'overlay_color'
  | 'shadows_color'
  | 'group_bar_button_color'
  | BarKey;

export type MangoColors = Record<Key, MangoColor>;

/** The three colors that follow the accent. */
export interface Accent {
  accent: Hex;
  lume: Hex;
  on: Hex;
}

export const flavorAccent = (flavor: FlavorContext): Accent => ({
  accent: flavor.color('accent'),
  lume: flavor.color('accent-lume'),
  on: flavor.color('accent-on'),
});

export const pigmentAccent = (flavor: FlavorContext, pigment: PigmentId): Accent => ({
  accent: flavor.color(`glass-${pigment}`),
  lume: flavor.color(`glass-${pigment}-lume`),
  on: flavor.color(`glass-${pigment}-on`),
});

const BARS = ['jump_label', 'group_bar', 'tab_bar', 'title_message_bar'] as const;

/** The keys an accent layer sets: every key below whose color comes from the accent. */
export const ACCENT_KEYS = [
  'focus_color',
  'split_color',
  'drop_color',
  ...BARS.flatMap((bar) => [`${bar}_decorate_focus_fg_color`, `${bar}_decorate_focus_bg_color`] as const),
] as const satisfies readonly Key[];

/** mango's own opacity for the window being dragged, kept so the windows under it stay visible. */
const DROP_ALPHA = 0x55 / 255;

export function mangoColors(flavor: FlavorContext, accent: Accent): MangoColors {
  const c = (name: Parameters<FlavorContext['color']>[0]) => mangoColor(flavor.color(name), flavor.alpha(name));
  const bars = Object.fromEntries(
    BARS.flatMap((bar) => [
      [`${bar}_decorate_fg_color`, c('text')],
      [`${bar}_decorate_bg_color`, c('surface-raised-2')],
      [`${bar}_decorate_focus_fg_color`, mangoColor(accent.on)],
      [`${bar}_decorate_focus_bg_color`, mangoColor(accent.accent)],
      [`${bar}_decorate_border_color`, c('lead')],
    ]),
  ) as Record<BarKey, MangoColor>;
  return {
    root_color: c('surface-sunken'),
    // Lead is the came between the panes: the border of every window but the focused one.
    border_color: c('lead'),
    focus_color: mangoColor(accent.accent),
    urgent_color: c('danger'),
    split_color: mangoColor(accent.lume),
    drop_color: mangoColor(accent.accent, DROP_ALPHA),
    // Window states, in colors no flavor uses for its default accent.
    maximized_screen_color: c('success'),
    scratchpad_color: c('info'),
    global_color: c('glass-amethyst'),
    overlay_color: c('glass-rose'),
    // Shadow with the palette's own opacity.
    shadows_color: c('umbra-key'),
    group_bar_button_color: c('danger'),
    ...bars,
  };
}

const ORDER: readonly Key[] = [
  'root_color',
  'border_color',
  'focus_color',
  'urgent_color',
  'split_color',
  'drop_color',
  'maximized_screen_color',
  'scratchpad_color',
  'global_color',
  'overlay_color',
  'shadows_color',
  'group_bar_button_color',
  ...BARS.flatMap((bar) => (['fg', 'bg', 'focus_fg', 'focus_bg', 'border'] as const).map((part) => `${bar}_decorate_${part}_color` as const)),
];

export const mango: Port = {
  id: 'mango',
  name: 'mango',
  homepage: 'https://mangowm.github.io',
  category: 'window-manager',
  // The release the keys were checked against.
  minVersion: '0.18.4',
  files: (ctx) =>
    ctx.flavors.flatMap((flavor) => {
      const colors = mangoColors(flavor, flavorAccent(flavor));
      const theme = {
        path: `themes/sanctuary-${flavor.id}.conf`,
        flavor: flavor.id,
        contents: mangoConf({ comments: notice(mango, flavor, ctx), entries: ORDER.map((key) => [key, colors[key]] as const) }),
      };
      const layers = ctx.pigments.map((pigment) => {
        const layer = mangoColors(flavor, pigmentAccent(flavor, pigment));
        return {
          path: `accents/${flavor.id}/${pigment}.conf`,
          flavor: flavor.id,
          pigment,
          contents: mangoConf({
            comments: [...notice(mango, flavor, ctx, `${pigment} accent`), 'Source it after the theme.'],
            entries: ACCENT_KEYS.map((key) => [key, layer[key]] as const),
          }),
        };
      });
      return [theme, ...layers];
    }),
};
