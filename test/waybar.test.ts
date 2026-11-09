import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { pigments, type PigmentId } from '@sanctuary-ds/tokens/palette';

import { ACCENT_NAMES } from '../apps/waybar/template.ts';
import { context } from '../src/context.ts';
import { render } from '../src/generate.ts';

const ctx = context();
const files = render(ctx);
const theme = (flavor: string) => files.get(`apps/waybar/themes/sanctuary-${flavor}.css`) ?? '';
const layer = (pigment: string) => files.get(`apps/waybar/accents/${pigment}.css`) ?? '';
const PIGMENTS = Object.keys(pigments) as PigmentId[];
/** `@define-color <name> <value>;` as [name, value]; the value may hold spaces, as rgba() does. */
const parse = (line: string) => line.match(/^@define-color (\S+) (.+);$/)?.slice(1, 3) as [string, string] | undefined;
/** The name → value pairs of a file's definitions. */
const defs = (text: string) => new Map(text.split('\n').map(parse).filter((pair) => pair !== undefined));

const VALUE = /^(#[0-9a-f]{6}|rgba\(\d{1,3}, \d{1,3}, \d{1,3}, (0|1|0\.\d{1,3})\)|@san-[a-z0-9-]+)$/;

test('every line is a comment, blank, or one @define-color of a san- name', () => {
  for (const [path, text] of files) {
    if (!path.startsWith('apps/waybar/')) continue;
    for (const line of text.split('\n')) {
      if (line === '' || /^\/\* .* \*\/$/.test(line)) continue;
      assert.match(line, /^@define-color san-[a-z0-9-]+ [^;]+;$/, path);
      assert.match(parse(line)?.[1] ?? '', VALUE, `${path}: ${line}`);
    }
  }
});

test('every flavor defines the same names, in the same order, without ANSI or syntax colors', () => {
  const [first, ...rest] = ctx.flavors.map((flavor) => [...defs(theme(flavor.id)).keys()]);
  assert.ok(first && first.length > 0);
  for (const names of rest) assert.deepEqual(names, first);
  assert.ok(!first.some((name) => /^san-(ansi|syntax)-/.test(name)));
  for (const name of ['san-surface', 'san-text', 'san-lead', 'san-accent', 'san-danger', 'san-glass-rose-on-pane']) assert.ok(first.includes(name), name);
});

test('there is one accent layer per pigment, pointing every accent name at that pigment', () => {
  const layers = [...files.keys()].filter((path) => path.startsWith('apps/waybar/accents/'));
  assert.equal(layers.length, PIGMENTS.length);
  for (const pigment of PIGMENTS) {
    const values = defs(layer(pigment));
    assert.deepEqual([...values.keys()], ACCENT_NAMES.map((name) => `san-${name}`), pigment);
    for (const [name, value] of values) assert.equal(value, `@${name.replace('san-accent', `san-glass-${pigment}`)}`, pigment);
  }
});

test('every name a layer points at is defined by every theme', () => {
  // GTK says nothing about a missing name: the color is just not drawn. This test is the check.
  for (const flavor of ctx.flavors) {
    const names = defs(theme(flavor.id));
    for (const pigment of PIGMENTS) {
      for (const value of defs(layer(pigment)).values()) assert.ok(names.has(value.slice(1)), `${flavor.id} ${pigment}: ${value}`);
    }
  }
});

test("the layer of the flavor's own accent changes nothing", () => {
  for (const flavor of ctx.flavors) {
    const names = defs(theme(flavor.id));
    for (const [name, value] of defs(layer(flavor.accent))) {
      assert.equal(names.get(value.slice(1)), names.get(name), `${flavor.id} ${name}`);
    }
  }
});

// GTK 3 itself, through its Python bindings, with a display to style a window on.
const GTK = `
import json, sys, gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk
provider = Gtk.CssProvider()
provider.load_from_path(sys.argv[1])
context = Gtk.Window().get_style_context()
context.add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_USER)
print(json.dumps({name: (lambda found: found[0] and found[1].to_string())(context.lookup_color(name)) for name in sys.argv[2:]}))
`;
const hasGtk = spawnSync('python3', ['-I', '-c', `${GTK.split('provider =')[0]}assert Gtk.init_check()[0]`]).status === 0;

test('GTK resolves every color of every theme, with every accent layer', { skip: !hasGtk && 'GTK 3 or a display is missing' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'sanctuary-waybar-'));
  try {
    for (const flavor of ctx.flavors) {
      const names = [...defs(theme(flavor.id)).keys()];
      writeFileSync(join(dir, 'theme.css'), theme(flavor.id));
      for (const pigment of PIGMENTS) {
        writeFileSync(join(dir, 'accent.css'), layer(pigment));
        writeFileSync(join(dir, 'style.css'), '@import "theme.css";\n@import "accent.css";\n');
        const run = spawnSync('python3', ['-I', '-c', GTK, join(dir, 'style.css'), ...names], { encoding: 'utf8' });
        assert.equal(run.status, 0, `${flavor.id} ${pigment}: ${run.stderr}`);
        const colors: Record<string, string | false> = JSON.parse(run.stdout);
        for (const name of names) assert.ok(colors[name], `${flavor.id} ${pigment}: ${name}`);
        for (const name of ACCENT_NAMES) {
          assert.equal(colors[`san-${name}`], colors[`san-${name.replace('accent', `glass-${pigment}`)}`], `${flavor.id} ${pigment}: ${name}`);
        }
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
