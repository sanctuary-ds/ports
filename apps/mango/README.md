# Sanctuary for mango

The colors of every Sanctuary flavor for [mango](https://mangowm.github.io), 0.18.4 or later, with an accent layer for each of the twelve pigments.

| Flavor | Hour | Default accent | Theme |
|--------|------|----------------|-------|
| Lauds | Dawn | cobalt | [`sanctuary-lauds.conf`](themes/sanctuary-lauds.conf) |
| Vespers | Dusk | ember | [`sanctuary-vespers.conf`](themes/sanctuary-vespers.conf) |
| Compline | Night | cobalt | [`sanctuary-compline.conf`](themes/sanctuary-compline.conf) |
| Matins | Deep night | viridian | [`sanctuary-matins.conf`](themes/sanctuary-matins.conf) |

Each theme sets the backdrop, the window borders by state, the drop and split indicators, the shadow, and the jump labels, group bar, tab bar and title bar. Border width, radius, gaps, blur, shadows on or off, dimming and layouts stay in your configuration.

## Install

Copy a theme next to your configuration and source it from `~/.config/mango/config.conf`, after any color you set yourself:

```ini
source=./sanctuary-vespers.conf
```

### Another accent

The theme uses the flavor's default accent. To choose another one, source its layer after the theme; mango keeps the last value of a key, so the layer's colors win:

```ini
source=./sanctuary-vespers.conf
source=./accents/vespers/azure.conf
```

A layer belongs to one flavor, `accents/<flavor>/<pigment>.conf`, and sets only the keys that follow the accent: the focused border, the split and drop indicators, and the focused bars and labels.

## Colors

| mango | Sanctuary |
|-------|-----------|
| `root_color` | `surface-sunken` |
| `border_color` | `lead` |
| `focus_color` | `accent` |
| `urgent_color` | `danger` |
| `split_color` | `accent-lume` |
| `drop_color` | `accent`, at mango's own opacity of `0x55` |
| `maximized_screen_color` | `success` |
| `scratchpad_color` | `info` |
| `global_color` | `glass-amethyst` |
| `overlay_color` | `glass-rose` |
| `shadows_color` | `umbra-key`, with its opacity |
| `group_bar_button_color` | `danger` |
| `*_decorate_fg_color`, `*_decorate_bg_color` | `text` on `surface-raised-2` |
| `*_decorate_focus_fg_color`, `*_decorate_focus_bg_color` | `accent-on` on `accent` |
| `*_decorate_border_color` | `lead` |

The window states use colors that no flavor takes for its default accent. With the amethyst or rose layer, a global or overlay window looks like the focused one.

Every text color reaches 4.5:1 on its bar, in every flavor and with every accent; the tests check it.

The themes are generated from [`template.ts`](template.ts); do not edit them by hand.
