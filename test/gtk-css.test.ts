import { test } from 'node:test';
import assert from 'node:assert/strict';

import { hex } from '../src/color.ts';
import { gtkColor, gtkCss, gtkRef } from '../src/formats/gtk-css.ts';

test('gtkColor writes #rrggbb, or rgba() when the color is translucent', () => {
  assert.equal(gtkColor(hex('#1d1d2f')), '#1d1d2f');
  assert.equal(gtkColor(hex('#000000'), 0.45), 'rgba(0, 0, 0, 0.45)');
  assert.equal(gtkColor(hex('#ff8000'), 1 / 3), 'rgba(255, 128, 0, 0.333)');
  assert.equal(gtkColor(hex('#ffffff'), 0), 'rgba(255, 255, 255, 0)');
  for (const alpha of [-0.1, 1.1, Number.NaN]) assert.throws(() => gtkColor(hex('#ffffff'), alpha), RangeError);
});

test('gtkRef points at another defined color', () => {
  assert.equal(gtkRef('san-glass-azure'), '@san-glass-azure');
  for (const name of ['', 'San', '-san', 'san-', 'san--a', 'a;b', 'a b']) assert.throws(() => gtkRef(name), /name/);
});

test('gtkCss writes comments, then one @define-color per line', () => {
  const text = gtkCss({ comments: ['Theme', 'Generated'], colors: [['san-text', gtkColor(hex('#ff0000'))], ['san-accent', gtkRef('san-text')]] });
  assert.equal(text, '/* Theme */\n/* Generated */\n\n@define-color san-text #ff0000;\n@define-color san-accent @san-text;\n');
});

test('gtkCss refuses text that would break out of its definition or comment', () => {
  const color = gtkColor(hex('#ff0000'));
  for (const name of ['san-text;window{}', 'san-text\n', 'san text']) {
    assert.throws(() => gtkCss({ comments: ['ok'], colors: [[name, color]] }), /name/);
  }
  for (const comment of ['a */ window { }', 'a\nb', 'a /* b']) {
    assert.throws(() => gtkCss({ comments: [comment], colors: [['san-text', color]] }), /comment/);
  }
});
