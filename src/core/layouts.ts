import type { KeyId, LayoutId } from '../types/keyboard';
import { KEY_CODES } from './keycodes';

/** Legends of character keys: [main, shifted] (shifted is optional). */
type Legends = Record<KeyId, [string, string?]>;

const letterRow = (codes: string, chars: string): Legends =>
  Object.fromEntries(codes.split('').map((c, i) => [`Key${c}`, [chars[i].toUpperCase()]]));

const US_QWERTY: Legends = {
  Backquote: ['`', '~'],
  Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'], Digit4: ['4', '$'],
  Digit5: ['5', '%'], Digit6: ['6', '^'], Digit7: ['7', '&'], Digit8: ['8', '*'],
  Digit9: ['9', '('], Digit0: ['0', ')'],
  Minus: ['-', '_'], Equal: ['=', '+'],
  BracketLeft: ['[', '{'], BracketRight: [']', '}'], Backslash: ['\\', '|'],
  Semicolon: [';', ':'], Quote: ["'", '"'],
  IntlBackslash: ['\\', '|'],
  Comma: [',', '<'], Period: ['.', '>'], Slash: ['/', '?'],
  ...letterRow('QWERTYUIOPASDFGHJKLZXCVBNM', 'qwertyuiopasdfghjklzxcvbnm'),
};

const FR_AZERTY: Legends = {
  Backquote: ['²'],
  Digit1: ['&', '1'], Digit2: ['é', '2'], Digit3: ['"', '3'], Digit4: ["'", '4'],
  Digit5: ['(', '5'], Digit6: ['-', '6'], Digit7: ['è', '7'], Digit8: ['_', '8'],
  Digit9: ['ç', '9'], Digit0: ['à', '0'],
  Minus: [')', '°'], Equal: ['=', '+'],
  BracketLeft: ['^', '¨'], BracketRight: ['$', '£'], Backslash: ['*', 'µ'],
  // Physical QWERTY positions → AZERTY letters.
  ...letterRow('QWERTYUIOPASDFGHJKLZXCVBN', 'azertyuiopqsdfghjklwxcvbn'),
  Semicolon: ['M'], Quote: ['ù', '%'],
  IntlBackslash: ['<', '>'],
  KeyM: [',', '?'], Comma: [';', '.'], Period: [':', '/'], Slash: ['!', '§'],
};

const LAYOUTS: Record<LayoutId, Legends> = {
  'us-qwerty': US_QWERTY,
  'fr-azerty': FR_AZERTY,
};

export const LAYOUT_NAMES: Record<LayoutId, string> = {
  'fr-azerty': 'AZERTY (FR)',
  'us-qwerty': 'QWERTY (US)',
};

export interface KeyLegend {
  main: string;
  shifted?: string;
}

export function keyLegend(id: KeyId, layout: LayoutId): KeyLegend {
  const legend = LAYOUTS[layout][id];
  if (legend) return { main: legend[0], shifted: legend[1] };
  return { main: KEY_CODES[id]?.label ?? id };
}
