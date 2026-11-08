// What a port is: an application, and the files its template writes for every flavor.

import type { ColorName, FlavorId, PigmentId, Scheme } from '@sanctuary-ds/tokens/palette';

import type { Hex } from './color.ts';

/** One flavor, as a template reads it. */
export interface FlavorContext {
  id: FlavorId;
  name: string;
  hour: string;
  scheme: Scheme;
  /** The flavor's default accent. */
  accent: PigmentId;
  /** A color of the flavor. A name the palette does not have fails the type check. */
  color(name: ColorName): Hex;
}

export interface PortContext {
  flavors: readonly FlavorContext[];
  /** The palette package the themes are generated from. */
  palette: { name: string; version: string };
}

export interface GeneratedFile {
  /** Relative to the port's folder, under `themes/` or `accents/`. */
  path: string;
  contents: string;
  /** The flavor the file themes; set on every theme and on an accent layer made for one flavor. */
  flavor?: FlavorId;
  /** The pigment an accent layer selects. */
  pigment?: PigmentId;
}

export type Category = 'terminal' | 'window-manager' | 'status-bar';

export interface Port {
  /** The folder under apps/, and the id in ports.json. */
  id: string;
  name: string;
  homepage: string;
  category: Category;
  /** The oldest version of the application the themes work with. */
  minVersion: string;
  files(ctx: PortContext): GeneratedFile[];
}

/** The comment every theme starts with. */
export function notice(port: Port, flavor: FlavorContext, ctx: PortContext): string[] {
  return [
    `Sanctuary ${flavor.name} (${flavor.hour}) for ${port.name}`,
    `Generated from ${ctx.palette.name} ${ctx.palette.version} by https://github.com/sanctuary-ds/ports`,
    `Do not edit: change apps/${port.id}/template.ts and regenerate.`,
  ];
}
