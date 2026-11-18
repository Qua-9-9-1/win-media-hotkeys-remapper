import type { GeometryDefinition, KeyId, PhysicalKey, PhysicalStandard } from '../types/keyboard';

type Row = Array<[KeyId, number, number?]>; // [id, x, width]

const cluster = (ids: KeyId[], x0: number): Row => ids.map((id, i) => [id, x0 + i]);
const run = (prefix: string, chars: string, x0: number): Row =>
  chars.split('').map((c, i) => [`${prefix}${c}`, x0 + i]);

/** Standard full-size keyboard (ISO 105 keys / ANSI 104 keys). */
function fullsize(standard: PhysicalStandard, rightOfAltGr: KeyId): PhysicalKey[] {
  const iso = standard === 'ISO';
  const keys: PhysicalKey[] = [];
  const push = (y: number, row: Row) =>
    row.forEach(([id, x, w = 1]) => keys.push({ id, x, y, w, h: 1, shape: 'rect' }));

  // Function row
  push(0, [
    ['Escape', 0],
    ...cluster(['F1', 'F2', 'F3', 'F4'], 2),
    ...cluster(['F5', 'F6', 'F7', 'F8'], 6.5),
    ...cluster(['F9', 'F10', 'F11', 'F12'], 11),
    ...cluster(['PrintScreen', 'ScrollLock', 'Pause'], 15.25),
  ]);

  // Number row
  push(1.5, [
    ['Backquote', 0],
    ...run('Digit', '1234567890', 1),
    ['Minus', 11],
    ['Equal', 12],
    ['Backspace', 13, 2],
    ...cluster(['Insert', 'Home', 'PageUp'], 15.25),
    ...cluster(['NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract'], 18.5),
  ]);

  // Top letter row
  push(2.5, [
    ['Tab', 0, 1.5],
    ...run('Key', 'QWERTYUIOP', 1.5),
    ['BracketLeft', 11.5],
    ['BracketRight', 12.5],
    ...(iso ? [] : ([['Backslash', 13.5, 1.5]] as Row)),
    ...cluster(['Delete', 'End', 'PageDown'], 15.25),
    ...cluster(['Numpad7', 'Numpad8', 'Numpad9'], 18.5),
  ]);
  if (iso) keys.push({ id: 'Enter', x: 13.5, y: 2.5, w: 1.5, h: 2, shape: 'iso-enter' });
  keys.push({ id: 'NumpadAdd', x: 21.5, y: 2.5, w: 1, h: 2, shape: 'rect' });

  // Home row
  push(3.5, [
    ['CapsLock', 0, 1.75],
    ...run('Key', 'ASDFGHJKL', 1.75),
    ['Semicolon', 10.75],
    ['Quote', 11.75],
    ...(iso ? ([['Backslash', 12.75]] as Row) : ([['Enter', 12.75, 2.25]] as Row)),
    ...cluster(['Numpad4', 'Numpad5', 'Numpad6'], 18.5),
  ]);

  // Bottom letter row
  push(4.5, [
    ...(iso
      ? ([['ShiftLeft', 0, 1.25], ['IntlBackslash', 1.25]] as Row)
      : ([['ShiftLeft', 0, 2.25]] as Row)),
    ...run('Key', 'ZXCVBNM', 2.25),
    ['Comma', 9.25],
    ['Period', 10.25],
    ['Slash', 11.25],
    ['ShiftRight', 12.25, 2.75],
    ['ArrowUp', 16.25],
    ...cluster(['Numpad1', 'Numpad2', 'Numpad3'], 18.5),
  ]);
  keys.push({ id: 'NumpadEnter', x: 21.5, y: 4.5, w: 1, h: 2, shape: 'rect' });

  // Modifier row
  push(5.5, [
    ['ControlLeft', 0, 1.25],
    ['MetaLeft', 1.25, 1.25],
    ['AltLeft', 2.5, 1.25],
    ['Space', 3.75, 6.25],
    ['AltRight', 10, 1.25],
    [rightOfAltGr, 11.25, 1.25],
    ['ContextMenu', 12.5, 1.25],
    ['ControlRight', 13.75, 1.25],
    ...cluster(['ArrowLeft', 'ArrowDown', 'ArrowRight'], 15.25),
    ['Numpad0', 18.5, 2],
    ['NumpadDecimal', 20.5],
  ]);

  return keys.map((k) => (k.id === 'Fn' ? { ...k, hardwareOnly: true } : k));
}

export function buildGeometry(def: GeometryDefinition): PhysicalKey[] {
  if (def.template === 'fullsize') return fullsize(def.standard, def.rightOfAltGr);
  return def.keys.map((k) => ({
    ...k,
    h: k.h ?? 1,
    shape: k.shape ?? 'rect',
    hardwareOnly: k.hardwareOnly ?? k.id === 'Fn',
  }));
}

export function boundingBox(keys: PhysicalKey[]): { width: number; height: number } {
  return {
    width: Math.max(...keys.map((k) => k.x + k.w)),
    height: Math.max(...keys.map((k) => k.y + k.h)),
  };
}
