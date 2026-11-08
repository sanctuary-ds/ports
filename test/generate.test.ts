import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compare, render, write } from '../src/generate.ts';

test('compare reports changed, missing and stale files, and write repairs them', () => {
  const root = mkdtempSync(join(tmpdir(), 'sanctuary-ports-'));
  try {
    const files = render();
    write(root, files);
    assert.deepEqual(compare(root, files), []);

    const [first, second] = [...files.keys()].filter((path) => path.startsWith('apps/'));
    writeFileSync(join(root, first), 'edited by hand\n');
    rmSync(join(root, second));
    mkdirSync(join(root, 'apps/foot/themes'), { recursive: true });
    writeFileSync(join(root, 'apps/foot/themes/sanctuary-old.ini'), 'renamed long ago\n');
    assert.deepEqual(compare(root, files), [
      `changed: ${first}`,
      `missing: ${second}`,
      'stale: apps/foot/themes/sanctuary-old.ini',
    ]);

    write(root, files);
    assert.deepEqual(compare(root, files), []);
    assert.equal(existsSync(join(root, 'apps/foot/themes/sanctuary-old.ini')), false);
    assert.equal(readFileSync(join(root, first), 'utf8'), files.get(first));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the committed files match what the generator writes', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  assert.deepEqual(compare(root, render()), [], 'run `pnpm run generate` and commit the result');
});
