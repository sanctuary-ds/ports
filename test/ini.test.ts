import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ini } from '../src/formats/ini.ts';

test('ini writes comments, then each section with its keys', () => {
  const text = ini({
    comments: ['First line', 'Second line'],
    sections: [
      { name: 'colors-dark', entries: [['foreground', 'ffffff'], ['cursor', '000000 ffffff']] },
      { name: 'main', entries: [['font', 'monospace']] },
    ],
  });
  assert.equal(
    text,
    '# First line\n# Second line\n\n[colors-dark]\nforeground=ffffff\ncursor=000000 ffffff\n\n[main]\nfont=monospace\n',
  );
});

test('ini refuses text that would break out of its line', () => {
  const doc = (name: string, key: string, value: string, comment = 'ok') => ({
    comments: [comment],
    sections: [{ name, entries: [[key, value]] as const }],
  });
  assert.throws(() => ini(doc('colors]\n[main', 'foreground', 'ffffff')), /section/);
  assert.throws(() => ini(doc('colors-dark', 'shell=sh\nforeground', 'ffffff')), /key/);
  assert.throws(() => ini(doc('colors-dark', 'foreground', 'ffffff\nshell=sh')), /value/);
  assert.throws(() => ini(doc('colors-dark', 'foreground', 'ffffff', 'note\nshell=sh')), /comment/);
});
