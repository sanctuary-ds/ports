import { test } from 'node:test';
import assert from 'node:assert/strict';

import { hex } from '../src/color.ts';
import { mangoColor, mangoConf } from '../src/formats/mango-conf.ts';

test('mangoColor writes 0xrrggbbaa, opaque unless an alpha is given', () => {
  assert.equal(mangoColor(hex('#1d1d2f')), '0x1d1d2fff');
  assert.equal(mangoColor(hex('#000000'), 0.18), '0x0000002e');
  assert.equal(mangoColor(hex('#ffffff'), 0), '0xffffff00');
  for (const alpha of [-0.1, 1.1, Number.NaN]) assert.throws(() => mangoColor(hex('#ffffff'), alpha), RangeError);
});

test('mangoConf writes comments, then one key per line', () => {
  const text = mangoConf({ comments: ['Theme'], entries: [['focus_color', mangoColor(hex('#ff0000'))]] });
  assert.equal(text, '# Theme\n\nfocus_color=0xff0000ff\n');
});

test('mangoConf refuses text that would break out of its line', () => {
  const color = mangoColor(hex('#ff0000'));
  assert.throws(() => mangoConf({ comments: ['ok'], entries: [['focus_color\nexec', color]] }), /key/);
  assert.throws(() => mangoConf({ comments: ['a\nexec=sh'], entries: [['focus_color', color]] }), /comment/);
});
