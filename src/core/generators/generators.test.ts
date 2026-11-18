import { describe, expect, it } from 'vitest';
import { getProfile, KEYBOARDS } from '../../data/keyboards';
import { initialConfig } from '../../state/configReducer';
import type { RemapConfig } from '../../types/config';
import { migrateShortcuts } from '../migration';
import { generateAhk } from './ahk';
import { generateKanata } from './kanata';

const k120 = getProfile('logitech-k120-fr');
const dell = getProfile('dell-kb216-fr');

const withFn = (): RemapConfig => ({
  ...initialConfig('windows'),
  fnTrigger: 'CapsLock',
  layers: {
    base: { KeyQ: 'key.home' },
    fn: { F10: 'media.prev', F11: 'media.playPause', F12: 'media.next', KeyC: 'sys.calculator' },
  },
});

describe('profiles', () => {
  it('loads every JSON profile with consistent geometry', () => {
    expect(KEYBOARDS.map((k) => k.id)).toEqual([
      'logitech-k120-fr',
      'dell-kb216-fr',
      'generic-iso-fr',
      'generic-ansi-us',
    ]);
    expect(k120.keys).toHaveLength(105);
    expect(getProfile('generic-ansi-us').keys).toHaveLength(104);
    expect(dell.keys.find((k) => k.id === 'Fn')?.hardwareOnly).toBe(true);
    expect(dell.keys.some((k) => k.id === 'MetaRight')).toBe(false);
    for (const p of KEYBOARDS) expect(new Set(p.keys.map((k) => k.id)).size).toBe(p.keys.length);
  });
});

describe('generateKanata', () => {
  it('builds defsrc, a base layer and a held Fn layer', () => {
    const out = generateKanata(withFn(), k120);
    expect(out).toContain('process-unmapped-keys yes');
    expect(out).toContain('danger-enable-cmd yes');
    expect(out).toMatch(/fn \(tap-hold 200 200 caps \(layer-while-held fn\)\)/);
    // Keys follow the physical order: F row, then Q (top row), CapsLock, C.
    expect(out).toMatch(/\(defsrc\n\s+f10\s+f11\s+f12\s+q\s+caps\s+c\n\)/);
    expect(out).toMatch(/\(deflayer base\n\s+_\s+_\s+_\s+home\s+@fn\s+_\n\)/);
    expect(out).toMatch(/\(deflayer fn\n\s+prev\s+pp\s+next\s+_\s+_\s+\(cmd calc\.exe\)\n\)/);
  });

  it('uses per-OS outputs and drops the Fn layer without trigger', () => {
    const config = { ...withFn(), targetOs: 'linux' as const, fnTrigger: null };
    const out = generateKanata(config, k120);
    expect(out).not.toContain('deflayer fn');
    expect(out).toContain('ignoré');
    const linux = generateKanata({ ...withFn(), targetOs: 'linux' }, k120);
    expect(linux).toContain('(cmd gnome-calculator)');
  });

  it('skips actions without Kanata equivalent with a warning', () => {
    const config = { ...initialConfig(), layers: { base: { F5: 'media.stop', F6: 'app.mail' }, fn: {} } };
    const out = generateKanata(config, k120);
    expect(out).toContain('« Stop » ignoré');
    expect(out).toMatch(/\(defsrc\n\s+f6\n\)/);
    expect(out).not.toContain('danger-enable-cmd');
    expect(generateAhk(config, k120)).toContain('F5::Send "{Media_Stop}"');
  });

  it('produces a valid no-op file when nothing is mapped', () => {
    expect(generateKanata(initialConfig(), k120)).toContain('(defsrc esc)');
  });
});

describe('generateAhk', () => {
  it('generates scan-code hotkeys and a #HotIf Fn layer', () => {
    const out = generateAhk(withFn(), k120);
    expect(out).toContain('#Requires AutoHotkey v2.0');
    expect(out).toContain('SC010::Home'); // KeyQ (A on AZERTY)
    expect(out).toContain('*CapsLock:: {');
    expect(out).toContain('SetCapsLockState !GetKeyState("CapsLock", "T")');
    expect(out).toContain('#HotIf GetKeyState("CapsLock", "P")');
    expect(out).toContain('F10::Send "{Media_Prev}"');
    expect(out).toContain('SC02E::Run "calc.exe"');
  });

  it('disables the trigger when tap passthrough is off', () => {
    expect(generateAhk({ ...withFn(), fnTapPassthrough: false }, k120)).toContain('*CapsLock::return');
  });
});

describe('migrateShortcuts', () => {
  it('imports the Dell KB216 media shortcuts onto the K120', () => {
    const r = migrateShortcuts(initialConfig(), dell, k120);
    expect(r.added).toBe(6);
    expect(r.enabledFnTrigger).toBe(true);
    expect(r.config.fnTrigger).toBe('CapsLock');
    expect(r.config.layers.fn).toMatchObject({ F10: 'media.prev', F11: 'media.playPause', F12: 'media.next' });
  });

  it('keeps user mappings and skips what the target already has natively', () => {
    const base = { ...initialConfig(), fnTrigger: 'ScrollLock', layers: { base: {}, fn: { F10: 'prod.copy' } } };
    const r = migrateShortcuts(base, dell, k120);
    expect(r.skippedExisting).toBe(1);
    expect(r.config.layers.fn.F10).toBe('prod.copy');
    expect(r.config.fnTrigger).toBe('ScrollLock');
    expect(migrateShortcuts(initialConfig(), dell, dell).skippedNative).toBe(6);
  });

  it('never imports nor exports firmware-only features like Fn Lock', () => {
    const r = migrateShortcuts(initialConfig(), dell, k120);
    expect(r.skippedUnsupported).toBe(1);
    expect(r.config.layers.fn.Escape).toBeUndefined();
    const forced = { ...withFn(), layers: { base: {}, fn: { Escape: 'hw.fnLock' } } };
    expect(generateKanata(forced, k120)).not.toContain('esc');
  });
});
