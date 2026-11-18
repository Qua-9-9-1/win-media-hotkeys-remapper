import type { KeyId, LayoutId } from '../types/keyboard';
import { KEY_CODES } from './keycodes';

/**
 * Character keys, row by row, in physical order. Each layout below gives one
 * string per row (one character per key) for the unshifted and shifted levels.
 */
const ROWS: KeyId[][] = [
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'],
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Backslash'],
  ['IntlBackslash', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'],
];

interface LayoutDefinition {
  name: string;
  /** Unshifted characters, one string per row of `ROWS`. */
  base: [string, string, string, string];
  /** Shifted characters (a space means "no shifted legend"). */
  shift: [string, string, string, string];
}

/** Common "southern European" bottom row (ES, IT, PT, Nordic, DE-style). */
const EU_ROW3: [string, string] = ['<zxcvbnm,.-', '>ZXCVBNM;:_'];

const DEFINITIONS: Record<LayoutId, LayoutDefinition> = {
  'us-qwerty': {
    name: 'QWERTY US',
    base: ['`1234567890-=', 'qwertyuiop[]', "asdfghjkl;'\\", '\\zxcvbnm,./'],
    shift: ['~!@#$%^&*()_+', 'QWERTYUIOP{}', 'ASDFGHJKL:"|', '|ZXCVBNM<>?'],
  },
  'uk-qwerty': {
    name: 'QWERTY UK',
    base: ['`1234567890-=', 'qwertyuiop[]', "asdfghjkl;'#", '\\zxcvbnm,./'],
    shift: ['¬!"£$%^&*()_+', 'QWERTYUIOP{}', 'ASDFGHJKL:@~', '|ZXCVBNM<>?'],
  },
  'fr-azerty': {
    name: 'AZERTY France',
    base: ['²&é"\'(-è_çà)=', 'azertyuiop^$', 'qsdfghjklmù*', '<wxcvbn,;:!'],
    shift: [' 1234567890°+', 'AZERTYUIOP¨£', 'QSDFGHJKLM%µ', '>WXCVBN?./§'],
  },
  'be-azerty': {
    name: 'AZERTY Belgique',
    base: ['²&é"\'(§è!çà)-', 'azertyuiop^$', 'qsdfghjklmùµ', '<wxcvbn,;:='],
    shift: ['³1234567890°_', 'AZERTYUIOP¨*', 'QSDFGHJKLM%£', '>WXCVBN?./+'],
  },
  'ch-qwertz': {
    name: 'QWERTZ Suisse',
    base: ["§1234567890'^", 'qwertzuiopü¨', 'asdfghjklöä$', '<yxcvbnm,.-'],
    shift: ['°+"*ç%&/()=?`', 'QWERTZUIOPè!', 'ASDFGHJKLéà£', '>YXCVBNM;:_'],
  },
  'de-qwertz': {
    name: 'QWERTZ Allemagne',
    base: ['^1234567890ß´', 'qwertzuiopü+', 'asdfghjklöä#', '<yxcvbnm,.-'],
    shift: ['°!"§$%&/()=?`', 'QWERTZUIOPÜ*', "ASDFGHJKLÖÄ'", '>YXCVBNM;:_'],
  },
  'es-qwerty': {
    name: 'QWERTY Espagne',
    base: ["º1234567890'¡", 'qwertyuiop`+', 'asdfghjklñ´ç', EU_ROW3[0]],
    shift: ['ª!"·$%&/()=?¿', 'QWERTYUIOP^*', 'ASDFGHJKLÑ¨Ç', EU_ROW3[1]],
  },
  'it-qwerty': {
    name: 'QWERTY Italie',
    base: ["\\1234567890'ì", 'qwertyuiopè+', 'asdfghjklòàù', EU_ROW3[0]],
    shift: ['|!"£$%&/()=?^', 'QWERTYUIOPé*', 'ASDFGHJKLç°§', EU_ROW3[1]],
  },
  'pt-qwerty': {
    name: 'QWERTY Portugal',
    base: ["\\1234567890'«", 'qwertyuiop+´', 'asdfghjklçº~', EU_ROW3[0]],
    shift: ['|!"#$%&/()=?»', 'QWERTYUIOP*`', 'ASDFGHJKLÇª^', EU_ROW3[1]],
  },
  'nordic-qwerty': {
    name: 'QWERTY nordique (SE/FI/NO/DK)',
    base: ['§1234567890+´', 'qwertyuiopå¨', "asdfghjklöä'", EU_ROW3[0]],
    shift: ['½!"#¤%&/()=?`', 'QWERTYUIOPÅ^', 'ASDFGHJKLÖÄ*', EU_ROW3[1]],
  },
};

type Legends = Map<KeyId, { main: string; shifted?: string }>;

function buildLegends(def: LayoutDefinition): Legends {
  const map: Legends = new Map();
  ROWS.forEach((codes, r) => {
    const base = Array.from(def.base[r]);
    const shift = Array.from(def.shift[r]);
    if (base.length !== codes.length || shift.length !== codes.length) {
      throw new Error(`Layout "${def.name}": row ${r} must have ${codes.length} characters`);
    }
    codes.forEach((code, i) => {
      const main = base[i];
      const shifted = shift[i] === ' ' ? undefined : shift[i];
      // Letter keys are printed with the capital letter only, like real keycaps.
      const isLetter = main.toUpperCase() !== main.toLowerCase() && shifted === main.toUpperCase();
      map.set(code, isLetter ? { main: shifted } : { main, shifted });
    });
  });
  return map;
}

const LEGENDS = Object.fromEntries(
  Object.entries(DEFINITIONS).map(([id, def]) => [id, buildLegends(def)]),
) as Record<LayoutId, Legends>;

export const LAYOUT_IDS = Object.keys(DEFINITIONS) as LayoutId[];

export const LAYOUT_NAMES = Object.fromEntries(
  Object.entries(DEFINITIONS).map(([id, def]) => [id, def.name]),
) as Record<LayoutId, string>;

export interface KeyLegend {
  main: string;
  shifted?: string;
}

export function keyLegend(id: KeyId, layout: LayoutId): KeyLegend {
  return LEGENDS[layout].get(id) ?? { main: KEY_CODES[id]?.label ?? id };
}

/** Unshifted character produced by a key in a layout (lowercase), if any. */
export function layoutChar(id: KeyId, layout: LayoutId): string | undefined {
  const def = DEFINITIONS[layout];
  for (let r = 0; r < ROWS.length; r++) {
    const i = ROWS[r].indexOf(id);
    if (i >= 0) return Array.from(def.base[r])[i];
  }
  return undefined;
}

/**
 * Finds the layout that best explains observed (physical code → character)
 * pairs, from a real keystroke or the Keyboard Map API. Ties are broken by
 * `preferred` (usually the guess from the browser language).
 */
export function matchLayout(observed: Map<KeyId, string>, preferred: LayoutId): LayoutId | null {
  if (observed.size === 0) return null;
  let best: LayoutId | null = null;
  let bestScore = 0;
  for (const id of [preferred, ...LAYOUT_IDS.filter((l) => l !== preferred)]) {
    let score = 0;
    for (const [code, char] of observed) {
      const expected = layoutChar(code, id);
      if (expected === undefined) continue;
      score += expected === char.toLowerCase() ? 1 : -1;
    }
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return best;
}
