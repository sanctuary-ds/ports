// Every port, in the order ports.json lists them. A port is added here, not found by scanning
// folders, so the list is typed and the order does not depend on the file system.

import type { Port } from '../src/port.ts';
import { foot } from './foot/template.ts';
import { mango } from './mango/template.ts';
import { waybar } from './waybar/template.ts';

export const ports: readonly Port[] = [foot, mango, waybar];
