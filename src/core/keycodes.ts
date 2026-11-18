import type { KeyId } from '../types/keyboard';

/**
 * Translation table for every physical key we know about.
 *
 * - `kanata`: Kanata key name (Kanata names keys by their US-QWERTY position,
 *   so it is layout-independent like `KeyboardEvent.code`).
 * - `ahk`: AutoHotkey v2 key name. Character keys use scan codes (`SCxxx`)
 *   so the generated script works whatever the Windows layout is.
 * - `label`: legend for non-character keys (character legends come from
 *   `layouts.ts`).
 */
export interface KeyCodeInfo {
  kanata: string;
  ahk: string;
  label?: string;
}

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// Set-1 scan codes of letter keys, in alphabetical order.
const letterScanCodes = [
  0x1e, 0x30, 0x2e, 0x20, 0x12, 0x21, 0x22, 0x23, 0x17, 0x24, 0x25, 0x26, 0x32,
  0x31, 0x18, 0x19, 0x10, 0x13, 0x1f, 0x14, 0x16, 0x2f, 0x11, 0x2d, 0x15, 0x2c,
];

const sc = (n: number) => `SC${n.toString(16).toUpperCase().padStart(3, '0')}`;

const table: Record<KeyId, KeyCodeInfo> = {
  Escape: { kanata: 'esc', ahk: 'Esc', label: 'Échap' },
  Backquote: { kanata: 'grv', ahk: sc(0x29) },
  Minus: { kanata: '-', ahk: sc(0x0c) },
  Equal: { kanata: '=', ahk: sc(0x0d) },
  Backspace: { kanata: 'bspc', ahk: 'Backspace', label: '⟵' },
  Tab: { kanata: 'tab', ahk: 'Tab', label: 'Tab ↹' },
  BracketLeft: { kanata: '[', ahk: sc(0x1a) },
  BracketRight: { kanata: ']', ahk: sc(0x1b) },
  Backslash: { kanata: '\\', ahk: sc(0x2b) },
  CapsLock: { kanata: 'caps', ahk: 'CapsLock', label: 'Verr. Maj' },
  Semicolon: { kanata: ';', ahk: sc(0x27) },
  Quote: { kanata: "'", ahk: sc(0x28) },
  Enter: { kanata: 'ret', ahk: 'Enter', label: 'Entrée' },
  ShiftLeft: { kanata: 'lsft', ahk: 'LShift', label: 'Maj ⇧' },
  IntlBackslash: { kanata: '102d', ahk: sc(0x56) },
  Comma: { kanata: ',', ahk: sc(0x33) },
  Period: { kanata: '.', ahk: sc(0x34) },
  Slash: { kanata: '/', ahk: sc(0x35) },
  ShiftRight: { kanata: 'rsft', ahk: 'RShift', label: 'Maj ⇧' },
  ControlLeft: { kanata: 'lctl', ahk: 'LCtrl', label: 'Ctrl' },
  MetaLeft: { kanata: 'lmet', ahk: 'LWin', label: 'Win' },
  AltLeft: { kanata: 'lalt', ahk: 'LAlt', label: 'Alt' },
  Space: { kanata: 'spc', ahk: 'Space', label: '' },
  AltRight: { kanata: 'ralt', ahk: 'RAlt', label: 'Alt Gr' },
  MetaRight: { kanata: 'rmet', ahk: 'RWin', label: 'Win' },
  ContextMenu: { kanata: 'menu', ahk: 'AppsKey', label: 'Menu' },
  ControlRight: { kanata: 'rctl', ahk: 'RCtrl', label: 'Ctrl' },
  PrintScreen: { kanata: 'prnt', ahk: 'PrintScreen', label: 'Impr' },
  ScrollLock: { kanata: 'slck', ahk: 'ScrollLock', label: 'Arrêt défil' },
  Pause: { kanata: 'pause', ahk: 'Pause', label: 'Pause' },
  Insert: { kanata: 'ins', ahk: 'Insert', label: 'Inser' },
  Home: { kanata: 'home', ahk: 'Home', label: '↖' },
  PageUp: { kanata: 'pgup', ahk: 'PgUp', label: 'Pg ↑' },
  Delete: { kanata: 'del', ahk: 'Delete', label: 'Suppr' },
  End: { kanata: 'end', ahk: 'End', label: 'Fin' },
  PageDown: { kanata: 'pgdn', ahk: 'PgDn', label: 'Pg ↓' },
  ArrowUp: { kanata: 'up', ahk: 'Up', label: '↑' },
  ArrowLeft: { kanata: 'left', ahk: 'Left', label: '←' },
  ArrowDown: { kanata: 'down', ahk: 'Down', label: '↓' },
  ArrowRight: { kanata: 'rght', ahk: 'Right', label: '→' },
  NumLock: { kanata: 'nlck', ahk: 'NumLock', label: 'Verr Num' },
  NumpadDivide: { kanata: 'kp/', ahk: 'NumpadDiv', label: '/' },
  NumpadMultiply: { kanata: 'kp*', ahk: 'NumpadMult', label: '*' },
  NumpadSubtract: { kanata: 'kp-', ahk: 'NumpadSub', label: '−' },
  NumpadAdd: { kanata: 'kp+', ahk: 'NumpadAdd', label: '+' },
  NumpadEnter: { kanata: 'kprt', ahk: 'NumpadEnter', label: 'Entrée' },
  NumpadDecimal: { kanata: 'kp.', ahk: 'NumpadDot', label: '.' },
  Fn: { kanata: '', ahk: '', label: 'Fn' },
  // Second hardware Fn key, on keyboards that have one on each side.
  FnLeft: { kanata: '', ahk: '', label: 'Fn' },

  // Dedicated media / launcher keys found on many office keyboards.
  // Kanata names checked in kanata/parser/src/keys/mod.rs; empty = not interceptable.
  MediaPlayPause: { kanata: 'pp', ahk: 'Media_Play_Pause', label: '⏯' },
  MediaTrackNext: { kanata: 'next', ahk: 'Media_Next', label: '⏭' },
  MediaTrackPrevious: { kanata: 'prev', ahk: 'Media_Prev', label: '⏮' },
  MediaStop: { kanata: '', ahk: 'Media_Stop', label: '⏹' },
  AudioVolumeMute: { kanata: 'mute', ahk: 'Volume_Mute', label: '🔇' },
  AudioVolumeDown: { kanata: 'vold', ahk: 'Volume_Down', label: '🔉' },
  AudioVolumeUp: { kanata: 'volu', ahk: 'Volume_Up', label: '🔊' },
  LaunchMail: { kanata: 'mail', ahk: 'Launch_Mail', label: '✉' },
  LaunchApp2: { kanata: 'calc', ahk: 'Launch_App2', label: 'Calc' },
  BrowserHome: { kanata: 'hmpg', ahk: 'Browser_Home', label: '⌂' },
  BrowserSearch: { kanata: '', ahk: 'Browser_Search', label: '🔍' },
  MediaSelect: { kanata: '', ahk: 'Launch_Media', label: '♫' },
  LaunchApp1: { kanata: '', ahk: 'Launch_App1', label: 'PC' },
  // Vendor keys without a portable/documented scan code: displayed, never remappable.
  ZoomIn: { kanata: '', ahk: '', label: 'Zoom +' },
  ZoomOut: { kanata: '', ahk: '', label: 'Zoom −' },
  PcLock: { kanata: '', ahk: '', label: '🔒' },
  ScreenshotKey: { kanata: '', ahk: '', label: '📷' },
  CortanaKey: { kanata: '', ahk: '', label: '◯' },
  BacklightKey: { kanata: '', ahk: '', label: '💡' },
  WinLockKey: { kanata: '', ahk: '', label: 'Win 🔒' },
  MacroRecord: { kanata: '', ahk: '', label: 'M' },
  // Kanata only knows `sleep` on Linux: treated as not interceptable to stay portable.
  Sleep: { kanata: '', ahk: 'Sleep', label: '☾' },
};

for (let i = 1; i <= 12; i++) {
  table[`F${i}`] = { kanata: `f${i}`, ahk: `F${i}`, label: `F${i}` };
}
for (let i = 0; i <= 9; i++) {
  // Digit1..Digit9 = scan codes 0x02..0x0A, Digit0 = 0x0B.
  table[`Digit${i}`] = { kanata: String(i), ahk: sc(i === 0 ? 0x0b : i + 1) };
  table[`Numpad${i}`] = { kanata: `kp${i}`, ahk: `Numpad${i}`, label: String(i) };
}
for (let i = 1; i <= 6; i++) table[`G${i}`] = { kanata: '', ahk: '', label: `G${i}` };
letters.split('').forEach((l, i) => {
  table[`Key${l}`] = { kanata: l.toLowerCase(), ahk: sc(letterScanCodes[i]) };
});

export const KEY_CODES: Readonly<Record<KeyId, KeyCodeInfo>> = table;

/**
 * Keys that neither Kanata nor AutoHotkey can intercept (hardware Fn, vendor
 * keys handled by the firmware...). They are drawn but never remappable.
 */
export function isHardwareOnly(id: KeyId): boolean {
  const info = KEY_CODES[id];
  return !!info && !info.kanata && !info.ahk;
}

export function keyInfo(id: KeyId): KeyCodeInfo {
  const info = KEY_CODES[id];
  if (!info) throw new Error(`Unknown key id: ${id}`);
  return info;
}

/** Keys that make good "virtual Fn" candidates (rarely used on their own). */
export const FN_TRIGGER_CANDIDATES: KeyId[] = [
  'CapsLock',
  'ContextMenu',
  'ScrollLock',
  'Pause',
  'ControlRight',
  'MetaRight',
  'Insert',
];
