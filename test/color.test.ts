import { test } from 'node:test';
import assert from 'node:assert/strict';

import { bare, contrast, hex } from '../src/color.ts';

test('hex accepts only lowercase #rrggbb', () => {
  assert.equal(hex('#1d1d2f'), '#1d1d2f');
  for (const value of ['1d1d2f', '#1D1D2F', '#1d1d2', '#1d1d2f80', '#1d1d2f\n', '']) {
    assert.throws(() => hex(value), TypeError, value);
  }
});

test('bare drops the leading #', () => {
  assert.equal(bare(hex('#f5f0e6')), 'f5f0e6');
});

test('contrast follows the WCAG 2 formula', () => {
  const white = hex('#ffffff');
  const black = hex('#000000');
  assert.equal(contrast(white, black), 21);
  assert.equal(contrast(black, white), 21);
  assert.equal(contrast(white, white), 1);
  // #767676 on white is the usual example of a gray that just reaches 4.5:1.
  assert.equal(contrast(hex('#767676'), white).toFixed(2), '4.54');
});
