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
    formFactor: def.geometry.template,
    keys,
    hid: (def.hid ?? []).map((h) => ({
      vendorId: parseInt(h.vendorId, 16),
      productId: parseInt(h.productId, 16),
    })),
    ...boundingBox(keys),
  };
}

export const GENERIC_VENDOR = 'Générique';

/** Sorted by vendor then name; generic templates last. */
export const KEYBOARDS: KeyboardProfile[] = Object.values(modules)
  .map(resolveProfile)
  .sort(
    (a, b) =>
      Number(a.vendor === GENERIC_VENDOR) - Number(b.vendor === GENERIC_VENDOR) ||
      a.vendor.localeCompare(b.vendor) ||
      a.name.localeCompare(b.name, undefined, { numeric: true }),
  );

/** Profiles grouped by vendor, for `<optgroup>` menus. */
export function keyboardsByVendor(): Array<[string, KeyboardProfile[]]> {
  const groups = new Map<string, KeyboardProfile[]>();
  for (const k of KEYBOARDS) groups.set(k.vendor, [...(groups.get(k.vendor) ?? []), k]);
  return [...groups];
}

export const DEFAULT_PROFILE_ID = 'logitech-k120-fr';

export function getProfile(id: string): KeyboardProfile {
  return KEYBOARDS.find((k) => k.id === id) ?? KEYBOARDS[0];
}
