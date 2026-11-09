import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { pigments, type PigmentId } from '@sanctuary-ds/tokens/palette';

import { ACCENT_KEYS, flavorAccent, mangoColors, pigmentAccent, type MangoColors } from '../apps/mango/template.ts';
import { contrast, hex, type Hex } from '../src/color.ts';
import { context } from '../src/context.ts';
import { render } from '../src/generate.ts';

const ctx = context();
const files = render(ctx);
const theme = (flavor: string) => files.get(`apps/mango/themes/sanctuary-${flavor}.conf`) ?? '';
const layer = (flavor: string, pigment: string) => files.get(`apps/mango/accents/${flavor}/${pigment}.conf`) ?? '';
const PIGMENTS = Object.keys(pigments) as PigmentId[];
const keys = (text: string) => text.split('\n').filter((line) => line.includes('=')).map((line) => line.split('=')[0]);
/** The color part of 0xrrggbbaa, for the contrast formula. */
const rgb = (value: string): Hex => hex(`#${value.slice(2, 8)}`);

test('every value is 0xrrggbbaa', () => {
  for (const [path, text] of files) {
    if (!path.startsWith('apps/mango/')) continue;
    for (const line of text.split('\n').filter((l) => l.includes('='))) assert.match(line, /^[a-z_]+=0x[0-9a-f]{8}$/, path);
  }
});

test('there is one accent layer per flavor and pigment, setting only the accent keys', () => {
  for (const flavor of ctx.flavors) {
    for (const pigment of PIGMENTS) assert.deepEqual(keys(layer(flavor.id, pigment)), [...ACCENT_KEYS], `${flavor.id} ${pigment}`);
  }
  const layers = [...files.keys()].filter((path) => path.startsWith('apps/mango/accents/'));
  assert.equal(layers.length, ctx.flavors.length * PIGMENTS.length);
});

test("the layer of the flavor's own accent changes nothing", () => {
  for (const flavor of ctx.flavors) {
    const lines = new Set(theme(flavor.id).split('\n'));
    for (const line of layer(flavor.id, flavor.accent).split('\n').filter((l) => l.includes('='))) {
      assert.ok(lines.has(line), `${flavor.id}: ${line}`);
    }
  }
});

test("no window state shares the color of the flavor's focused border", () => {
  for (const flavor of ctx.flavors) {
    const c = mangoColors(flavor, flavorAccent(flavor));
    for (const key of ['border_color', 'urgent_color', 'maximized_screen_color', 'scratchpad_color', 'global_color', 'overlay_color'] as const) {
      assert.notEqual(c[key], c.focus_color, `${flavor.id} ${key}`);
    }
  }
});

test('text reaches 4.5:1 on every bar and label, with every accent', () => {
  const pairs = (c: MangoColors) =>
    (['jump_label', 'group_bar', 'tab_bar', 'title_message_bar'] as const).flatMap((bar) => [
      [`${bar}`, c[`${bar}_decorate_fg_color`], c[`${bar}_decorate_bg_color`]],
      [`${bar} focused`, c[`${bar}_decorate_focus_fg_color`], c[`${bar}_decorate_focus_bg_color`]],
    ]);
  for (const flavor of ctx.flavors) {
    for (const pigment of PIGMENTS) {
      for (const [label, fg, bg] of pairs(mangoColors(flavor, pigmentAccent(flavor, pigment)))) {
        const ratio = contrast(rgb(fg), rgb(bg));
        assert.ok(ratio >= 4.5, `${flavor.id} ${pigment} ${label}: ${ratio.toFixed(2)}`);
      }
    }
  }
});

const hasMango = spawnSync('mango', ['-v']).status === 0;

test('mango accepts every theme, alone and with every accent layer', { skip: !hasMango && 'mango is not installed' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'sanctuary-mango-'));
  try {
    const config = join(dir, 'config.conf');
    for (const flavor of ctx.flavors) {
      for (const pigment of [undefined, ...PIGMENTS]) {
        // One file, theme then layer: mango -p exits 0 on an error inside a source= file
        // (0.18.4), so the layer is appended instead of sourced, and the output is read too.
        writeFileSync(config, theme(flavor.id) + (pigment ? layer(flavor.id, pigment) : ''));
        const run = spawnSync('mango', ['-c', config, '-p'], { encoding: 'utf8' });
        const label = `${flavor.id} ${pigment ?? 'theme'}`;
        assert.equal(run.status, 0, `${label}: ${run.stdout}${run.stderr}`);
        assert.doesNotMatch(run.stdout + run.stderr, /ERROR/, label);
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
