// ports.json: the list of ports and their files, for the site.

import type { FlavorId, PigmentId } from '@sanctuary-ds/tokens/palette';

import type { Category, GeneratedFile, Port, PortContext } from './port.ts';

export interface ManifestPort {
  id: string;
  name: string;
  homepage: string;
  category: Category;
  minVersion: string;
  /** One theme per flavor, as a path from the repository root. */
  themes: Record<FlavorId, string>;
  /** The accent layer, empty for a port that has none. */
  accents: { flavor?: FlavorId; pigment: PigmentId; path: string }[];
}

/**
 * Leaves out this repository's own version on purpose: the release pull request raises it,
 * and the check would then fail on that pull request. The release tag says which version it is.
 */
export interface Manifest {
  palette: PortContext['palette'];
  ports: ManifestPort[];
}

export function manifest(ctx: PortContext, rendered: readonly (readonly [Port, readonly GeneratedFile[]])[]): Manifest {
  return {
    palette: ctx.palette,
    ports: rendered.map(([port, files]) => {
      const at = (file: GeneratedFile) => `apps/${port.id}/${file.path}`;
      const themes = Object.fromEntries(
        ctx.flavors.map((flavor) => {
          const theme = files.find((file) => file.flavor === flavor.id && file.pigment === undefined);
          if (!theme) throw new Error(`${port.id} has no theme for ${flavor.id}`);
          return [flavor.id, at(theme)];
        }),
      ) as Record<FlavorId, string>;
      const accents = files
        .filter((file) => file.pigment !== undefined)
        .map((file) => ({ ...(file.flavor && { flavor: file.flavor }), pigment: file.pigment as PigmentId, path: at(file) }));
      const { id, name, homepage, category, minVersion } = port;
      return { id, name, homepage, category, minVersion, themes, accents };
    }),
  };
}
