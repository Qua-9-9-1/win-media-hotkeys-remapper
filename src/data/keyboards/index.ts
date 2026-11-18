import type { KeyboardProfile, KeyboardProfileDefinition } from '../../types/keyboard';
import { boundingBox, buildGeometry } from '../../core/geometry';

/**
 * Every `*.json` file in this folder is a keyboard profile.
 * To add a keyboard, drop a new JSON file here: no code change needed.
 */
const modules = import.meta.glob<KeyboardProfileDefinition>('./*.json', {
  eager: true,
  import: 'default',
});

export function resolveProfile(def: KeyboardProfileDefinition): KeyboardProfile {
  const keys = buildGeometry(def.geometry);
  return {
    ...def,
    standard: def.geometry.standard,
    keys,
    hid: (def.hid ?? []).map((h) => ({
      vendorId: parseInt(h.vendorId, 16),
      productId: parseInt(h.productId, 16),
    })),
    ...boundingBox(keys),
  };
}

const ORDER = ['logitech-k120-fr', 'dell-kb216-fr', 'generic-iso-fr', 'generic-ansi-us'];

export const KEYBOARDS: KeyboardProfile[] = Object.values(modules)
  .map(resolveProfile)
  .sort((a, b) => {
    const ia = ORDER.indexOf(a.id);
    const ib = ORDER.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.name.localeCompare(b.name);
  });

export const DEFAULT_PROFILE_ID = 'logitech-k120-fr';

export function getProfile(id: string): KeyboardProfile {
  return KEYBOARDS.find((k) => k.id === id) ?? KEYBOARDS[0];
}
