# Roadmap

Themes for desktop applications, generated from the palette of [`@sanctuary-ds/tokens`](https://github.com/sanctuary-ds/tokens). Every application configured by a file lives here; an application installed from a git URL, such as a Neovim or tmux plugin, gets a repository of its own, named after it.

This document is the brief for whoever changes the ports. Read it before changing anything, and change it when a decision below is taken. Decisions that cross repositories are recorded in the core's [`docs/ecosystem.md`](https://github.com/sanctuary-ds/tokens/blob/main/docs/ecosystem.md).

## Scope

| In this repository | Elsewhere |
|--------------------|-----------|
| One template per application, the generator, and the themes they write | The palette and its colors: [`tokens`](https://github.com/sanctuary-ds/tokens) |
| The list of ports, `ports.json`, for the site | The ports gallery: [`sanctuary-ds.github.io`](https://github.com/sanctuary-ds/sanctuary-ds.github.io) |
| How to install each theme | Choosing one flavor and accent for a whole desktop: your dotfiles |

## Principles

- **Color only.** A port holds only what you would lose by switching palettes. Fonts, sizes, padding, radii, layouts, modules, keybindings and toggles such as blur or transparency stay in your configuration.
- **The application's own mechanism.** A theme is a file the application includes (`include=`, `source=`, `@import`), so it adds to a configuration instead of replacing it.
- **Data, never code.** No theme runs anything: no `exec`, no shell, no click handlers. Install steps never pipe a download into a shell.
- **Generated, committed, checked.** The themes are written by the generator and committed, so installing one needs no tooling; CI fails when a committed file differs from what the generator writes.
- **The core owns the colors.** A color a port needs is added to the palette, never invented here.

## Contract with the core

- Depend on `@sanctuary-ds/tokens` from npm, pinned to an exact version. Dependabot opens the pull request two days after a release; the themes are regenerated on that branch.
- Every generated file names the palette version it was written from.
- Templates read the typed palette module, so a color that does not exist fails the type check.

## Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| What a template returns | Typed data (sections, keys and colors), written to text by one serializer per format (`ini`, `gtk-css`, `mango-conf`, later TOML through `smol-toml`) | Syntax and escaping live in one place, and an application key that does not exist fails the type check |
| Accent | Every port ships one theme per flavor with the flavor's default accent. Where an accent leads the application, it also ships an accent layer: one file per pigment, included after the theme | The flavor is the minimum; which accent a whole desktop uses is the dotfiles' choice, not the port's |
| Accent layer by format | By reference where the format allows it (GTK CSS: `accents/<pigment>.css` redefines `@san-accent`, 12 files), by override where the last key wins (mango: `accents/<flavor>/<pigment>.conf`, 48 files) | Each format gets the smallest layer it can express |
| Releases | One version for the whole repository, through release-please, tagged `vX.Y.Z`, one changelog with a scope per application | One maintainer, and a palette release moves every port at once: per-port versions would open one release per application for every palette update |
| Versioning | A palette update that changes values is a minor release; a new port or accent layer is a minor release; renaming or removing a generated file or a color name a theme defines is a major release. Before `1.0.0`, each level moves one place to the right, as in the core | The paths and names of the generated files are this repository's public API |
| Template tool | TypeScript run directly by Node, not Catppuccin's whiskers | Whiskers' Tera templates cannot be type-checked against the palette |
| Contrast | Each template's text pairs (foreground on background, selection, cursor text) are tested to reach 4.5:1, with the WCAG 2 formula written in the tests | The core guarantees its documented pairs; a port that pairs other colors checks its own |
| foot selection | `accent-on-pane` on `accent-pane`, not a raised stone | Against the surface both are close in lightness (1.05 and 1.14 in Lauds); the pane's hue is what sets the selection apart. To be revisited on a real desktop |
| mango window states | Maximized, scratchpad, global and overlay borders take `success`, `info`, `glass-amethyst` and `glass-rose`, colors no flavor uses for its default accent | A state must not look like the focused window. Matins' accent is viridian, so overlay could not be viridian |
| Generated files | The generator owns `themes/` and `accents/` of every application and `ports.json`; a file there it no longer writes is stale, and `--check` reports it | A renamed theme cannot linger in the repository after its template stopped writing it |
| Release age | pnpm waits a day before installing any new version, strictly, with the palette as the only exception, and refuses a version whose provenance was downgraded | The palette is ours and published with provenance; every other dependency keeps the wait |

## Phases

Each phase is one branch and one pull request.

### Phase 0: Bootstrap

- [x] Package, pnpm settings, TypeScript configuration, license, readme and this roadmap.
- [x] Workflows: release-please, pull request titles, and an audit of the workflows themselves (actionlint, zizmor). The test workflow arrives with the generator.
- [x] Dependabot for the actions and for the palette.
- [x] Repository settings on GitHub: a ruleset on `main` (pull requests, signed commits, required checks, no force pushes), secret scanning with push protection, private vulnerability reporting, and the release app installed.

### Phase 1: The generator and foot

- [x] The `Port` type, the generator with `--check`, the `ini` serializer and the manifest.
- [x] The foot port: `[colors-dark]` or `[colors-light]` by the flavor's scheme, with the sixteen terminal colors, cursor, selection, links, search box and jump labels.
- [x] Tests on every generated file: color formats, no forbidden keys, one theme per flavor, the palette version in the header, contrast of the text pairs; and `foot --check-config` on each theme where foot is installed.
- [x] The test workflow: type check, tests and the generated-files check.
- [x] Add the test workflow to the required checks of the `main` ruleset, once it has run on this pull request.

### Phase 2: mango

- [x] The `mango-conf` serializer (`0xRRGGBBAA`).
- [x] The mango port: border, focus, urgent, scratchpad, global, overlay, root and shadow colors, and the bars and labels mango draws text on, with every key checked by `mango -p` on mango 0.18.4.
- [x] The accent layer, one file per flavor and pigment.

### Phase 3: waybar

- [ ] The `gtk-css` serializer (`@define-color`).
- [ ] The waybar port: the semantic colors (stone, ink, lead, accent, status) and the twelve pigments, named `san-*`.
- [ ] The accent layer, one file per pigment.

### Phase 4: First release (`0.1.0`)

- [ ] Use the three ports on a real desktop, through the dotfiles, with a preview image per port (four flavors composed with catwalk).
- [ ] Release `0.1.0`, the `initial-version` in the release-please configuration (without it, its first release would be `1.0.0`), with `ports.json` attached to the release.
- [ ] In the other repositories: record the decisions above that cross repositories, correct the site's guide to writing a port, and mark the core's `1.0.0` criterion as met.

### Next

From the applications of the same desktop: fuzzel, mako, swaylock, GTK 3 and 4, wlogout, btop, yazi, starship, alacritty.

## Open decisions

- **How the site reads the list of ports**: from `ports.json` attached to each release, or from a package published as `@sanctuary-ds/ports`. Decided with the site's ports milestone.
- **An accent layer for foot**: possible, since a later `include=` overrides the keys of an earlier one (checked on foot 1.28 by layering each dark flavor over Vespers). Not needed while the accent only colors the cursor, the selection and the links.

## Notes for the core

- `ansi-bright-black` reaches 2.7:1 to 3.2:1 on `surface` in the dark flavors. That is usual for a dim terminal color (shell suggestions, faded comments), but below the 4.5:1 of text; worth stating in the core's accessibility notes if they promise 4.5:1 for terminal colors.

## Notes on the applications

- `mango -p` (0.18.4) prints an error inside a `source=` file but exits 0. The tests append the accent layer to the theme instead of sourcing it, and fail on any `ERROR` in the output.

## Working agreement

- Commits are signed and follow Conventional Commits (`type(scope): subject`), with the application as the scope (`feat(foot): ...`) and no emoji.
- Pull request titles are plain sentences: the merge commit copies the title, and release-please would list a conventional one twice.
- A feature pull request never raises the version; a release pull request does.
