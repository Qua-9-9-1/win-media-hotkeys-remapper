/**
 * Physical key identifier.
 *
 * Uses the W3C `KeyboardEvent.code` vocabulary (e.g. `KeyQ`, `CapsLock`,
 * `IntlBackslash`, `MediaPlayPause`). Those names describe the physical
 * *position* of a key, independently of the OS layout, which is exactly what
 * low-level remappers (Kanata, AutoHotkey scan codes) work with. It also lets
 * us highlight keys live from browser keyboard events.
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
  /** Custom legend, for keys that have no standard label (e.g. a vendor key). */
  label?: string;
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

/** Form factors generated from templates (see `core/geometry.ts`). */
export type FormFactor = 'fullsize' | 'tkl' | '75';

/** A key placed by hand, in units. `h` defaults to 1 and `shape` to `rect`. */
export type KeyPlacement = Omit<PhysicalKey, 'shape' | 'h'> & Partial<Pick<PhysicalKey, 'shape' | 'h'>>;

/**
 * Geometry description stored in the JSON profiles.
 * Templates cover the common form factors; options adapt them to a model.
 * `custom` lets a profile describe any exotic keyboard key by key.
 */
export type GeometryDefinition =
  | {
      template: FormFactor;
      standard: PhysicalStandard;
      /** Modifiers left of the space bar (default: Ctrl, Win, Alt). */
      leftMods?: KeyId[];
      /** Modifiers right of the space bar (default depends on the template). */
      rightMods?: KeyId[];
      /** Shorthand for the classic full-size row: AltGr, <this>, Menu, Ctrl. */
      rightOfAltGr?: 'MetaRight' | 'Fn';
      /** Template keys absent on this model. */
      omit?: KeyId[];
      /** Moves the whole template down, to make room for a row of extra keys. */
      offsetY?: number;
      /** Moves the whole template right, to make room for a column (e.g. macro keys). */
      offsetX?: number;
      /** Extra keys (media keys, launchers...) placed by hand. */
      extraKeys?: KeyPlacement[];
    }
  | {
      template: 'custom';
      standard: PhysicalStandard;
      keys: KeyPlacement[];
    };

/** How much the native shortcuts of a profile can be trusted. */
export type Confidence = 'high' | 'medium' | 'low';

export interface SourceLink {
  label: string;
  url: string;
}

/** Raw keyboard profile, as written in `src/data/keyboards/*.json`. */
export interface KeyboardProfileDefinition {
  id: string;
  name: string;
  vendor: string;
  /** Legends printed on the model sold in the most common variant. */
  layout: LayoutId;
  geometry: GeometryDefinition;
  hasFnKey: boolean;
  hid?: Array<{ vendorId: string; productId: string }>;
  nativeShortcuts: NativeShortcut[];
  /** Where the native shortcuts come from (official manual first). */
  sources?: SourceLink[];
  confidence?: Confidence;
  notes?: string;
}

/** Resolved profile used by the application. */
export interface KeyboardProfile extends Omit<KeyboardProfileDefinition, 'geometry' | 'hid'> {
  standard: PhysicalStandard;
  formFactor: FormFactor | 'custom';
  keys: PhysicalKey[];
  hid: HidIdentifier[];
  /** Bounding box in units, for rendering. */
  width: number;
  height: number;
}
