import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { footColors, type FootColors } from '../apps/foot/template.ts';
import { contrast, type Hex } from '../src/color.ts';
import { context } from '../src/context.ts';
import { render } from '../src/generate.ts';

const ctx = context();
const files = render(ctx);
const theme = (id: string) => files.get(`apps/foot/themes/sanctuary-${id}.ini`) ?? '';

test('each theme is one colors section, chosen by the flavor scheme', () => {
  for (const flavor of ctx.flavors) {
    const sections = theme(flavor.id).match(/^\[.*\]$/gm);
    assert.deepEqual(sections, [`[colors-${flavor.scheme}]`], flavor.id);
  }
});

test('every value is one or two RRGGBB colors', () => {
  for (const flavor of ctx.flavors) {
    const values = theme(flavor.id).split('\n').filter((line) => line.includes('=')).map((line) => line.split('=')[1]);
    assert.ok(values.length > 0);
    for (const value of values) assert.match(value, /^[0-9a-f]{6}( [0-9a-f]{6})?$/, `${flavor.id}: ${value}`);
  }
});

test('text reaches 4.5:1 on every background it is drawn on', () => {
  const pairs = (c: FootColors): [string, Hex, Hex][] => [
    ['foreground', c.foreground, c.background],
    ['selection', c['selection-foreground'], c['selection-background']],
    ['cursor', ...c.cursor],
    ['jump-labels', ...c['jump-labels']],
    ['scrollback-indicator', ...c['scrollback-indicator']],
    ['search-box-match', ...c['search-box-match']],
    ['search-box-no-match', ...c['search-box-no-match']],
  ];
  for (const flavor of ctx.flavors) {
    for (const [label, fg, bg] of pairs(footColors(flavor))) {
      const ratio = contrast(fg, bg);
      assert.ok(ratio >= 4.5, `${flavor.id} ${label}: ${ratio.toFixed(2)}`);
    }
  }
});

test('the URL underline reaches 3:1 on the background', () => {
  for (const flavor of ctx.flavors) {
    const c = footColors(flavor);
    const ratio = contrast(c.urls, c.background);
    assert.ok(ratio >= 3, `${flavor.id}: ${ratio.toFixed(2)}`);
  }
});

const hasFoot = spawnSync('foot', ['--version']).status === 0;

test('foot accepts every theme, alone and paired', { skip: !hasFoot && 'foot is not installed' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'sanctuary-foot-'));
  try {
    const paths = ctx.flavors.map((flavor) => {
      const path = join(dir, `${flavor.id}.ini`);
      writeFileSync(path, theme(flavor.id));
      return path;
    });
    // One configuration per theme, and one that includes them all, as a light and dark pair does.
    for (const includes of [...paths.map((path) => [path]), paths]) {
      const config = join(dir, 'foot.ini');
      writeFileSync(config, includes.map((path) => `include=${path}\n`).join(''));
      // --check-config exits non-zero on an unknown key or a malformed value.
      execFileSync('foot', ['--check-config', '--config', config], { stdio: 'pipe' });
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
