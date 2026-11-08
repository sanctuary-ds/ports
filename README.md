# Sanctuary ports

Themes for desktop applications, generated from the [Sanctuary](https://sanctuary-ds.github.io/) palette: the stone, glass and light of a Gothic nave, carried to a terminal, a window manager and a status bar.

No port is published yet. The [roadmap](ROADMAP.md) lists the first ones and how they are built.

## What a port is

A port gives one application the colors of every Sanctuary flavor, and nothing else. It is a file the application already knows how to include, such as foot's `include=`, mango's `source=` or waybar's `@import`, so it adds to your configuration instead of replacing it. Fonts, sizes, layouts, modules and keybindings stay yours.

Where one accent leads the application, such as the border of the focused window, the port also ships an accent layer: a small file per pigment that you include after the theme to choose your accent.

## How the themes are made

Every theme is generated from the palette of [`@sanctuary-ds/tokens`](https://www.npmjs.com/package/@sanctuary-ds/tokens), pinned to an exact version that each file names in its header. The generated files are committed, so installing a port needs neither Node.js nor this repository's tooling. Do not edit them by hand: change the application's template and regenerate.

## License

[MIT](LICENSE)
