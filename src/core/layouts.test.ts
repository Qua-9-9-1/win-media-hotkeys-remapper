import { describe, expect, it } from 'vitest';
import { keyLegend, LAYOUT_IDS, matchLayout } from './layouts';
import { layoutFromKey, layoutFromLocale } from './detection';

describe('layouts', () => {
  it('defines legends for every layout', () => {
    expect(LAYOUT_IDS.length).toBeGreaterThanOrEqual(10);
    expect(keyLegend('KeyQ', 'fr-azerty')).toEqual({ main: 'A' });
    expect(keyLegend('KeyY', 'de-qwertz')).toEqual({ main: 'Z' });
    expect(keyLegend('Digit2', 'fr-azerty')).toEqual({ main: 'é', shifted: '2' });
    expect(keyLegend('Backquote', 'fr-azerty')).toEqual({ main: '²', shifted: undefined });
    expect(keyLegend('CapsLock', 'us-qwerty').main).toBe('Verr. Maj');
  });

  it('matches observed characters to the right layout', () => {
    const be = new Map([['Digit6', '§'], ['KeyQ', 'a'], ['Slash', '=']]);
    expect(matchLayout(be, 'fr-azerty')).toBe('be-azerty');
    expect(matchLayout(new Map([['KeyY', 'z']]), 'us-qwerty')).toBe('ch-qwertz');
    expect(matchLayout(new Map([['KeyY', 'z']]), 'de-qwertz')).toBe('de-qwertz');
    expect(layoutFromKey('KeyQ', 'q', 'uk-qwerty')).toBe('uk-qwerty');
    expect(layoutFromKey('KeyQ', 'a', 'us-qwerty')).toBe('fr-azerty');
    expect(layoutFromKey('ShiftLeft', 'Shift', 'us-qwerty')).toBeNull();
  });

  it('maps locales by region first', () => {
    expect(layoutFromLocale('fr-FR')).toBe('fr-azerty');
    expect(layoutFromLocale('fr')).toBe('fr-azerty');
    expect(layoutFromLocale('fr-BE')).toBe('be-azerty');
    expect(layoutFromLocale('fr-CH')).toBe('ch-qwertz');
    expect(layoutFromLocale('fr-CA')).toBe('us-qwerty');
    expect(layoutFromLocale('en-GB')).toBe('uk-qwerty');
    expect(layoutFromLocale('en-US')).toBe('us-qwerty');
    expect(layoutFromLocale('de-AT')).toBe('de-qwertz');
    expect(layoutFromLocale('sv-SE')).toBe('nordic-qwerty');
    expect(layoutFromLocale('ja-JP')).toBeNull();
  });
});
