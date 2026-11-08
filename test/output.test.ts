import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ports } from '../apps/index.ts';
import { context } from '../src/context.ts';
import { render } from '../src/generate.ts';

const ctx = context();
const files = render(ctx);
const themes = [...files].filter(([path]) => path !== 'ports.json');

// Keys that run a program or a handler in the applications this repository themes.
const FORBIDDEN = /^\s*(exec|exec-once|exec_once|shell|login-shell|notify|spawn|spawn-terminal|on-click[\w-]*|on-scroll[\w-]*|command|launch)\s*[=:]/m;

test('every port has a unique id', () => {
  const ids = ports.map((port) => port.id);
  assert.deepEqual(ids, [...new Set(ids)]);
});

test('every port writes one theme per flavor', () => {
  for (const port of ports) {
    for (const flavor of ctx.flavors) {
      const theme = themes.filter(([path]) => path.startsWith(`apps/${port.id}/themes/`) && path.includes(flavor.id));
      assert.equal(theme.length, 1, `${port.id} ${flavor.id}`);
    }
  }
});

test('every generated file names the palette version it was written from', () => {
  for (const [path, contents] of themes) {
    const head = contents.split('\n').slice(0, 5).join('\n');
    assert.match(head, new RegExp(`@sanctuary-ds/tokens ${ctx.palette.version.replaceAll('.', '\\.')}\\b`), path);
  }
});

test('no generated file runs anything', () => {
  for (const [path, contents] of themes) assert.doesNotMatch(contents, FORBIDDEN, path);
});

test('the manifest lists every port and its themes', () => {
  const manifest = JSON.parse(files.get('ports.json') ?? '');
  assert.equal(manifest.palette.version, ctx.palette.version);
  assert.deepEqual(manifest.ports.map((port: { id: string }) => port.id), ports.map((port) => port.id));
  for (const port of manifest.ports) {
    assert.deepEqual(Object.keys(port.themes), ctx.flavors.map((flavor) => flavor.id));
    for (const path of Object.values(port.themes)) assert.ok(files.has(path as string), path as string);
  }
});
