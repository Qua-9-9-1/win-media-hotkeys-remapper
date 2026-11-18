import { describe, expect, it } from 'vitest';
import { getProfile, KEYBOARDS } from '.';
import { getAction } from '../actions';
import { KEY_CODES } from '../../core/keycodes';
import { buildGeometry } from '../../core/geometry';

describe('keyboard profiles', () => {
  it.each(KEYBOARDS.map((k) => [k.id, k] as const))('%s is consistent', (_, p) => {
    const ids = new Set(p.keys.map((k) => k.id));
    expect(ids.size).toBe(p.keys.length);
    for (const k of p.keys) expect(KEY_CODES[k.id], `unknown key ${k.id}`).toBeDefined();
    expect(ids.has('Fn')).toBe(p.hasFnKey);
    for (const s of p.nativeShortcuts) {
      expect(ids.has(s.key), `native shortcut on missing key ${s.key}`).toBe(true);
      expect(getAction(s.action), `unknown action ${s.action}`).toBeDefined();
      if (s.layer === 'fn') expect(p.hasFnKey).toBe(true);
    }
    // Profiles with native shortcuts must say where they come from.
    if (p.nativeShortcuts.length > 0) expect(p.sources?.length).toBeGreaterThan(0);
    // No overlapping keys.
    for (const a of p.keys)
      for (const b of p.keys)
        if (a !== b && a.y === b.y) expect(a.x + a.w <= b.x + 1e-9 || b.x + b.w <= a.x + 1e-9, `${a.id}/${b.id}`).toBe(true);
  });

  it('builds the standard templates', () => {
    const count = (template: 'fullsize' | 'tkl' | '75', standard: 'ISO' | 'ANSI') =>
      buildGeometry({ template, standard }).length;
    expect(count('fullsize', 'ISO')).toBe(105);
    expect(count('fullsize', 'ANSI')).toBe(104);
    expect(count('tkl', 'ISO')).toBe(88);
    expect(count('tkl', 'ANSI')).toBe(87);
    expect(count('75', 'ISO')).toBe(85);
    expect(getProfile('dell-kb216-fr').keys.find((k) => k.id === 'Fn')?.hardwareOnly).toBe(true);
  });
});
