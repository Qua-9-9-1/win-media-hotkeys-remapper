import type { FormFactor, GeometryDefinition, KeyId, PhysicalKey, PhysicalStandard } from '../types/keyboard';
import { isHardwareOnly } from './keycodes';

type Row = Array<[KeyId, number, number?]>; // [id, x, width]

const cluster = (ids: KeyId[], x0: number): Row => ids.map((id, i) => [id, x0 + i]);
const run = (prefix: string, chars: string, x0: number): Row =>
  chars.split('').map((c, i) => [`${prefix}${c}`, x0 + i]);

class Builder {
  keys: PhysicalKey[] = [];
  row(y: number, row: Row) {
    row.forEach(([id, x, w = 1]) => this.keys.push({ id, x, y, w, h: 1, shape: 'rect' }));
  }
  key(k: Partial<PhysicalKey> & Pick<PhysicalKey, 'id' | 'x' | 'y'>) {
    this.keys.push({ w: 1, h: 1, shape: 'rect', ...k });
  }
}

/** Splits `width` units equally between `ids`, starting at `x0`. */
const spread = (ids: KeyId[], x0: number, width: number): Row =>
  ids.map((id, i) => [id, x0 + (i * width) / ids.length, width / ids.length]);

/**
 * The alphanumeric block (number row → bottom modifier row), 15u wide,
 * shared by every template. `rShiftW` lets compact boards shorten right Shift.
 */
function alphaBlock(b: Builder, y: number, iso: boolean, opts: {
  rShiftW: number;
  leftMods: KeyId[];
  rightMods: KeyId[];
  bottomWidth: number;
}) {
  b.row(y, [['Backquote', 0], ...run('Digit', '1234567890', 1), ['Minus', 11], ['Equal', 12], ['Backspace', 13, 2]]);
  b.row(y + 1, [
    ['Tab', 0, 1.5],
    ...run('Key', 'QWERTYUIOP', 1.5),
    ['BracketLeft', 11.5],
    ['BracketRight', 12.5],
    ...(iso ? [] : ([['Backslash', 13.5, 1.5]] as Row)),
  ]);
  if (iso) b.key({ id: 'Enter', x: 13.5, y: y + 1, w: 1.5, h: 2, shape: 'iso-enter' });
  b.row(y + 2, [
    ['CapsLock', 0, 1.75],
    ...run('Key', 'ASDFGHJKL', 1.75),
    ['Semicolon', 10.75],
    ['Quote', 11.75],
    ...(iso ? ([['Backslash', 12.75]] as Row) : ([['Enter', 12.75, 2.25]] as Row)),
  ]);
  b.row(y + 3, [
    ...(iso ? ([['ShiftLeft', 0, 1.25], ['IntlBackslash', 1.25]] as Row) : ([['ShiftLeft', 0, 2.25]] as Row)),
    ...run('Key', 'ZXCVBNM', 2.25),
    ['Comma', 9.25],
    ['Period', 10.25],
    ['Slash', 11.25],
    ['ShiftRight', 12.25, opts.rShiftW],
  ]);
  const spaceW = 6.25;
  const rightW = opts.bottomWidth - 3.75 - spaceW;
  b.row(y + 4, [
    ...spread(opts.leftMods, 0, 3.75),
    ['Space', 3.75, spaceW],
    ...spread(opts.rightMods, 3.75 + spaceW, rightW),
  ]);
}

const DEFAULT_LEFT: KeyId[] = ['ControlLeft', 'MetaLeft', 'AltLeft'];

function fullsizeOrTkl(b: Builder, iso: boolean, numpad: boolean, leftMods: KeyId[], rightMods: KeyId[]) {
  b.row(0, [
    ['Escape', 0],
    ...cluster(['F1', 'F2', 'F3', 'F4'], 2),
    ...cluster(['F5', 'F6', 'F7', 'F8'], 6.5),
    ...cluster(['F9', 'F10', 'F11', 'F12'], 11),
    ...cluster(['PrintScreen', 'ScrollLock', 'Pause'], 15.25),
  ]);
  alphaBlock(b, 1.5, iso, { rShiftW: 2.75, leftMods, rightMods, bottomWidth: 15 });
  b.row(1.5, cluster(['Insert', 'Home', 'PageUp'], 15.25));
  b.row(2.5, cluster(['Delete', 'End', 'PageDown'], 15.25));
  b.row(4.5, [['ArrowUp', 16.25]]);
  b.row(5.5, cluster(['ArrowLeft', 'ArrowDown', 'ArrowRight'], 15.25));
  if (!numpad) return;
  b.row(1.5, cluster(['NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract'], 18.5));
  b.row(2.5, cluster(['Numpad7', 'Numpad8', 'Numpad9'], 18.5));
  b.key({ id: 'NumpadAdd', x: 21.5, y: 2.5, h: 2 });
  b.row(3.5, cluster(['Numpad4', 'Numpad5', 'Numpad6'], 18.5));
  b.row(4.5, cluster(['Numpad1', 'Numpad2', 'Numpad3'], 18.5));
  b.key({ id: 'NumpadEnter', x: 21.5, y: 4.5, h: 2 });
  b.row(5.5, [['Numpad0', 18.5, 2], ['NumpadDecimal', 20.5]]);
}

/** Compact 75 %: contiguous F row, a right-hand column instead of the nav cluster. */
function compact75(b: Builder, iso: boolean, leftMods: KeyId[], rightMods: KeyId[]) {
  b.row(0, [['Escape', 0], ...cluster(['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'], 1),
    ['PrintScreen', 13], ['Insert', 14], ['Delete', 15]]);
  alphaBlock(b, 1, iso, { rShiftW: 1.75, leftMods, rightMods, bottomWidth: 13 });
  b.row(1, [['Home', 15]]);
  b.row(2, [['PageUp', 15]]);
  b.row(3, [['PageDown', 15]]);
  b.row(4, [['ArrowUp', 14], ['End', 15]]);
  b.row(5, cluster(['ArrowLeft', 'ArrowDown', 'ArrowRight'], 13));
}

function fromTemplate(
  template: FormFactor,
  standard: PhysicalStandard,
  leftMods: KeyId[] | undefined,
  rightMods: KeyId[] | undefined,
): PhysicalKey[] {
  const b = new Builder();
  const iso = standard === 'ISO';
  if (template === '75') {
    compact75(b, iso, leftMods ?? DEFAULT_LEFT, rightMods ?? ['AltRight', 'Fn', 'ControlRight']);
  } else {
    const right = rightMods ?? ['AltRight', 'MetaRight', 'ContextMenu', 'ControlRight'];
    fullsizeOrTkl(b, iso, template === 'fullsize', leftMods ?? DEFAULT_LEFT, right);
  }
  return b.keys;
}

export function buildGeometry(def: GeometryDefinition): PhysicalKey[] {
  let keys: PhysicalKey[];
  if (def.template === 'custom') {
    keys = def.keys.map((k) => ({ ...k, h: k.h ?? 1, shape: k.shape ?? 'rect' }));
  } else {
    const rightMods =
      def.rightMods ?? (def.rightOfAltGr ? ['AltRight', def.rightOfAltGr, 'ContextMenu', 'ControlRight'] : undefined);
    const omit = new Set(def.omit ?? []);
    const dx = def.offsetX ?? 0;
    const dy = def.offsetY ?? 0;
    keys = fromTemplate(def.template, def.standard, def.leftMods, rightMods)
      .filter((k) => !omit.has(k.id))
      .map((k) => ({ ...k, x: k.x + dx, y: k.y + dy }));
    for (const k of def.extraKeys ?? []) keys.push({ ...k, h: k.h ?? 1, shape: k.shape ?? 'rect' });
  }
  const ids = new Set<KeyId>();
  for (const k of keys) {
    if (ids.has(k.id)) throw new Error(`Duplicate key "${k.id}" in geometry`);
    ids.add(k.id);
  }
  return keys.map((k) => (isHardwareOnly(k.id) ? { ...k, hardwareOnly: true } : k));
}

export function boundingBox(keys: PhysicalKey[]): { width: number; height: number } {
  return {
    width: Math.max(...keys.map((k) => k.x + k.w)),
    height: Math.max(...keys.map((k) => k.y + k.h)),
  };
}
