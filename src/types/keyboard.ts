/**
 * Physical key identifier.
 *
 * Uses the W3C `KeyboardEvent.code` vocabulary (e.g. `KeyQ`, `CapsLock`,
 * `IntlBackslash`). Those names describe the physical *position* of a key,
 * independently of the OS layout, which is exactly what low-level remappers
 * (Kanata, AutoHotkey scan codes) work with. It also lets us highlight keys
 * live from browser keyboard events.
 *
 * `Fn` is a pseudo-code for the hardware Fn key: it is handled by the
 * keyboard firmware and is never visible to the OS, so it cannot be remapped.
 */
export type KeyId = string;

/** Physical standard: ISO has the extra key next to left Shift and a tall Enter. */
export type PhysicalStandard = 'ISO' | 'ANSI';

/** Logical (regional) layout used to print legends on the virtual keyboard. */
export type LayoutId =
  | 'us-qwerty'
  | 'uk-qwerty'
  | 'fr-azerty'
  | 'be-azerty'
  | 'ch-qwertz'
  | 'de-qwertz'
  | 'es-qwerty'
  | 'it-qwerty'
  | 'pt-qwerty'
  | 'nordic-qwerty';

/** Special key shapes that cannot be drawn as a simple rectangle. */
export type KeyShape = 'rect' | 'iso-enter';

/** One key as drawn on the virtual keyboard. Units are "u" (1u = standard key). */
export interface PhysicalKey {
  id: KeyId;
  x: number;
  y: number;
  w: number;
  h: number;
  shape: KeyShape;
  /** Handled by the firmware (e.g. hardware Fn): shown but never remappable. */
  hardwareOnly?: boolean;
}

export type LayerId = 'base' | 'fn';

/** A shortcut that the keyboard already provides in hardware. */
export interface NativeShortcut {
  layer: LayerId;
  key: KeyId;
  action: string;
}

export interface HidIdentifier {
  vendorId: number;
  productId: number;
}

/**
 * Geometry description stored in the JSON profiles.
 * `fullsize` is generated from a template (105 keys ISO / 104 keys ANSI);
 * `custom` lets a profile describe any exotic keyboard key by key.
 */
export type GeometryDefinition =
  | {
      template: 'fullsize';
      standard: PhysicalStandard;
      /** Which key sits between AltGr and Menu on the bottom row. */
      rightOfAltGr: 'MetaRight' | 'Fn';
    }
  | {
      template: 'custom';
      standard: PhysicalStandard;
      keys: Array<Omit<PhysicalKey, 'shape' | 'h'> & Partial<Pick<PhysicalKey, 'shape' | 'h'>>>;
    };

/** Raw keyboard profile, as written in `src/data/keyboards/*.json`. */
export interface KeyboardProfileDefinition {
  id: string;
  name: string;
  vendor: string;
  layout: LayoutId;
  geometry: GeometryDefinition;
  hasFnKey: boolean;
  hid?: Array<{ vendorId: string; productId: string }>;
  nativeShortcuts: NativeShortcut[];
  notes?: string;
}

/** Resolved profile used by the application. */
export interface KeyboardProfile extends Omit<KeyboardProfileDefinition, 'geometry' | 'hid'> {
  standard: PhysicalStandard;
  keys: PhysicalKey[];
  hid: HidIdentifier[];
  /** Bounding box in units, for rendering. */
  width: number;
  height: number;
}
