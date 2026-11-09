// The INI dialect foot reads: `# ` comments, `[section]` headers and `key=value` lines.

export interface IniSection {
  name: string;
  entries: readonly (readonly [key: string, value: string])[];
}

export interface IniDocument {
  comments: readonly string[];
  sections: readonly IniSection[];
}

const NAME = /^[a-z0-9][a-z0-9-]*$/;
const LINE = /^[^\r\n]*$/;

function check(kind: string, text: string, pattern: RegExp): string {
  if (!pattern.test(text)) throw new TypeError(`Invalid INI ${kind}: ${JSON.stringify(text)}`);
  return text;
}

/** Writes the document. A name or value that could start a new line or section throws. */
export function ini(doc: IniDocument): string {
  const head = doc.comments.map((comment) => `# ${check('comment', comment, LINE)}`).join('\n');
  const sections = doc.sections.map((section) =>
    [
      `[${check('section', section.name, NAME)}]`,
      ...section.entries.map(([key, value]) => `${check('key', key, NAME)}=${check('value', value, LINE)}`),
    ].join('\n'),
  );
  return `${[head, ...sections].join('\n\n')}\n`;
}
