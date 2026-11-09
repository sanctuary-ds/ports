# Sanctuary for Waybar

The colors of every Sanctuary flavor for [Waybar](https://github.com/Alexays/Waybar), 0.15.0 or later, as GTK CSS colors named `san-*`, with an accent layer for each of the twelve pigments.

| Flavor | Hour | Default accent | Theme |
|--------|------|----------------|-------|
| Lauds | Dawn | cobalt | [`sanctuary-lauds.css`](themes/sanctuary-lauds.css) |
| Vespers | Dusk | ember | [`sanctuary-vespers.css`](themes/sanctuary-vespers.css) |
| Compline | Night | cobalt | [`sanctuary-compline.css`](themes/sanctuary-compline.css) |
| Matins | Deep night | viridian | [`sanctuary-matins.css`](themes/sanctuary-matins.css) |

A theme only defines colors; it styles nothing. Which module takes which color stays in your `style.css`, with your fonts, sizes and layout.

## Install

Copy a theme next to your `style.css` and import it at the top, before any rule:

```css
@import "sanctuary-vespers.css";

window#waybar {
  background: @san-surface;
  color: @san-text;
}

#workspaces button.active {
  background: @san-accent;
  color: @san-accent-on;
}
```

### Another accent

The theme's `san-accent*` colors are the flavor's default accent. To choose another one, import its layer after the theme; the last definition of a name wins:

```css
@import "sanctuary-vespers.css";
@import "accents/azure.css";
```

A layer works with every flavor: it points the six accent names at the pigment's glass (`@define-color san-accent @san-glass-azure;`), and every theme defines that glass in its own colors.

### Light and dark

Waybar reads `style-light.css` or `style-dark.css` before `style.css`, following the system's appearance. Import Lauds in the light one and a night flavor in the dark one.

## Example

A starting point: a floating bar where only the focused workspace takes the accent, states color their text, and only an alert gets a background.

```css
@import "sanctuary-vespers.css";

* {
  font-family: "JetBrains Mono", "Symbols Nerd Font Mono";
  font-size: 13px;
  border: none;
  min-height: 0;
}

window#waybar {
  background: alpha(@san-surface, 0.92);
  color: @san-text;
  border: 1px solid @san-lead-soft;
  border-radius: 12px;
}

#workspaces button {
  color: @san-text-subtle;
  padding: 0 9px;
  border-radius: 8px;
}

#workspaces button.active {
  background: @san-accent;
  color: @san-accent-on;
}

#network,
#pulseaudio,
#battery {
  background: @san-surface-raised-1;
  padding: 0 10px;
  margin: 6px 0;
  border-radius: 8px;
}

#network { color: @san-success-ink; }
#battery.warning { color: @san-warning-ink; }
#battery.critical { color: @san-danger-ink; }

#custom-notification.alert {
  background: @san-danger-pane;
  color: @san-danger-on-pane;
  padding: 0 10px;
  border-radius: 8px;
}
```

The selectors depend on your modules: `ext/workspaces` marks the current workspace `.active`, `sway/workspaces` marks it `.focused`. `alpha()` is GTK's own: it takes any color, the port's included, and changes its opacity.

## Colors

Every name is the palette's, with `san-` in front, so it cannot clash with GTK's own `theme_*` colors.

| Group | Names |
|-------|-------|
| Stone | `san-surface-sunken`, `san-surface`, `san-surface-raised-1` to `-4`, `san-surface-inverse` |
| Ink | `san-text`, `san-text-muted`, `san-text-subtle`, `san-text-disabled`, `san-text-inverse` |
| Lead | `san-lead-soft`, `san-lead`, `san-lead-strong`, `san-lead-came` |
| Shadow | `san-umbra-key`, `san-umbra-ambient`, `san-scrim`, translucent |
| Accent | `san-accent`, with `-lume`, `-ink`, `-pane`, `-on` and `-on-pane` |
| Status | `san-danger`, `san-warning`, `san-success`, `san-info`, each with the same five variants |
| Glass | `san-glass-<pigment>` for the twelve pigments, each with the same five variants |

Pair a color with its own `-on` for text on it, and a `-pane` with its `-on-pane`: those are the pairs the palette makes legible. The ANSI and syntax colors are left out; they belong to terminals and editors.

GTK says nothing when a style uses a name no file defines: the color is just not drawn. If something stays unstyled, check the name.

The themes are generated from [`template.ts`](template.ts); do not edit them by hand.
