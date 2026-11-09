# Sanctuary for foot

The colors of every Sanctuary flavor for [foot](https://codeberg.org/dnkl/foot), 1.26 or later.

| Flavor | Hour | Section | File |
|--------|------|---------|------|
| Lauds | Dawn | `[colors-light]` | [`sanctuary-lauds.ini`](themes/sanctuary-lauds.ini) |
| Vespers | Dusk | `[colors-dark]` | [`sanctuary-vespers.ini`](themes/sanctuary-vespers.ini) |
| Compline | Night | `[colors-dark]` | [`sanctuary-compline.ini`](themes/sanctuary-compline.ini) |
| Matins | Deep night | `[colors-dark]` | [`sanctuary-matins.ini`](themes/sanctuary-matins.ini) |

Each file sets the text and background, the sixteen terminal colors, the selection, the cursor, the URL underline and jump labels, the scrollback indicator, the search box and the flash. Fonts, padding, transparency, blur and the cursor's shape stay in your configuration.

## Install

Copy a theme next to your configuration and include it from the top of `~/.config/foot/foot.ini`, before any section:

```ini
include=~/.config/foot/sanctuary-vespers.ini
```

foot needs the path to be absolute or to start with `~/`.

### A light and a dark flavor

Lauds writes `[colors-light]` and the other flavors write `[colors-dark]`, so including Lauds and one dark flavor gives foot both themes:

```ini
include=~/.config/foot/sanctuary-lauds.ini
include=~/.config/foot/sanctuary-vespers.ini

[key-bindings]
color-theme-toggle=Control+Shift+t
```

foot starts with the dark theme. Set `initial-color-theme=light` in `[main]` to start with Lauds, which is also needed when Lauds is the only theme you include. `SIGUSR1` and `SIGUSR2` switch a running foot to the dark and the light theme.

## Colors

| foot | Sanctuary |
|------|-----------|
| `foreground`, `background` | `text`, `surface` |
| `regular0`–`7`, `bright0`–`7` | `ansi-*`, `ansi-bright-*` |
| `selection-foreground`, `selection-background` | `accent-on-pane`, `accent-pane` |
| `cursor`, `jump-labels`, `search-box-match` | `accent-on` on `accent` |
| `urls` | `accent-ink` |
| `scrollback-indicator` | `text` on `surface-raised-3` |
| `search-box-no-match` | `danger-on` on `danger` |
| `flash` | `warning` |

Every text color reaches 4.5:1 on the background it is drawn on, in every flavor, and the URL underline reaches 3:1. The tests check both.

The themes are generated from [`template.ts`](template.ts); do not edit them by hand.
