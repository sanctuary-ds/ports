// Reads the installed palette into the shape templates use.

import palettePackage from '@sanctuary-ds/tokens/package.json' with { type: 'json' };
import { flavors, type FlavorId } from '@sanctuary-ds/tokens/palette';

import { hex } from './color.ts';
import type { PortContext } from './port.ts';

export function context(): PortContext {
  return {
    palette: { name: palettePackage.name, version: palettePackage.version },
    flavors: (Object.keys(flavors) as FlavorId[]).map((id) => {
      const flavor = flavors[id];
      return {
        id,
        name: flavor.name,
        hour: flavor.hour,
        scheme: flavor.scheme,
        accent: flavor.accent,
        // Every color is checked as it is read, so a palette that changed its format fails here.
        color: (name) => hex(flavor.colors[name].hex),
      };
    }),
  };
}
