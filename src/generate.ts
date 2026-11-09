// Writes every port's files, or with --check, fails when the committed files differ from them.
//
// The generator owns the themes/ and accents/ folders of every application, and ports.json:
// a file there that it no longer writes is stale, and writing removes it.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ports } from '../apps/index.ts';
import { context } from './context.ts';
import { manifest } from './manifest.ts';
import type { Port, PortContext } from './port.ts';

const OWNED = ['themes', 'accents'];
/** Lowercase names under themes/ or accents/, so a template cannot write anywhere else. */
const PATH = /^(themes|accents)(\/[a-z0-9][a-z0-9-]*(\.[a-z0-9]+)?)+$/;

/** Every generated file, by its path from the repository root. */
export function render(ctx: PortContext = context(), list: readonly Port[] = ports): Map<string, string> {
  const files = new Map<string, string>();
  const rendered = list.map((port) => {
    const generated = port.files(ctx);
    for (const file of generated) {
      if (!PATH.test(file.path)) throw new Error(`${port.id} writes outside its themes and accents: ${file.path}`);
      const path = `apps/${port.id}/${file.path}`;
      if (files.has(path)) throw new Error(`${port.id} writes ${file.path} twice`);
      files.set(path, file.contents);
    }
    return [port, generated] as const;
  });
  files.set('ports.json', `${JSON.stringify(manifest(ctx, rendered), null, 2)}\n`);
  return files;
}

/** The files under the folders the generator owns, as they are on disk. */
function existing(root: string): string[] {
  const apps = join(root, 'apps');
  if (!existsSync(apps)) return [];
  return readdirSync(apps, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((app) =>
      OWNED.map((folder) => join(apps, app.name, folder))
        .filter((folder) => existsSync(folder))
        .flatMap((folder) => readdirSync(folder, { recursive: true, withFileTypes: true }))
        .filter((entry) => entry.isFile())
        .map((entry) => relative(root, join(entry.parentPath, entry.name)).split(sep).join('/')),
    )
    .sort();
}

/** What differs between the files on disk and the generated ones, one line per file. */
export function compare(root: string, files: ReadonlyMap<string, string>): string[] {
  const problems: string[] = [];
  for (const [path, contents] of files) {
    const target = join(root, path);
    if (!existsSync(target)) problems.push(`missing: ${path}`);
    else if (readFileSync(target, 'utf8') !== contents) problems.push(`changed: ${path}`);
  }
  for (const path of existing(root)) if (!files.has(path)) problems.push(`stale: ${path}`);
  return problems;
}

export function write(root: string, files: ReadonlyMap<string, string>): void {
  for (const path of existing(root)) if (!files.has(path)) rmSync(join(root, path));
  for (const [path, contents] of files) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
}

if (import.meta.main) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const files = render();
  if (process.argv.includes('--check')) {
    const problems = compare(root, files);
    if (problems.length > 0) {
      console.error(`The generated files differ from the templates. Run \`pnpm run generate\` and commit the result.\n${problems.map((line) => `  ${line}`).join('\n')}`);
      process.exitCode = 1;
    } else {
      console.log(`${files.size} generated files are up to date.`);
    }
  } else {
    write(root, files);
    console.log(`Wrote ${files.size} files.`);
  }
}
