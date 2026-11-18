import type { TargetOs } from '../types/actions';
import type { KeyboardProfile, LayoutId } from '../types/keyboard';
import { matchLayout } from './layouts';

export type DetectedOs = TargetOs | 'macos' | 'unknown';

export function detectOs(): DetectedOs {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = (nav.userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase();
  if (p.includes('win')) return 'windows';
  if (p.includes('mac')) return 'macos';
  if (p.includes('linux') || p.includes('x11') || p.includes('cros')) return 'linux';
  return 'unknown';
}

type LayoutMap = { forEach(cb: (value: string, key: string) => void): void };
type KeyboardApi = { getLayoutMap(): Promise<LayoutMap> };

/**
 * Reads the real OS layout through the Keyboard Map API (Chromium only) and
 * matches it against the known layouts. Returns `null` when unavailable.
 */
export async function detectLayoutFromApi(preferred = guessLayoutFromLanguage()): Promise<LayoutId | null> {
  const kb = (navigator as Navigator & { keyboard?: KeyboardApi }).keyboard;
  if (!kb?.getLayoutMap) return null;
  try {
    const map = await kb.getLayoutMap();
    const observed = new Map<string, string>();
    map.forEach((value, code) => observed.set(code, value));
    return matchLayout(observed, preferred);
  } catch {
    return null;
  }
}

/**
 * Most likely layout for a BCP 47 locale ("fr-BE", "de-CH", "en-GB"...).
 * Region wins over language: French speakers in Belgium or Switzerland do not
 * use the French AZERTY.
 */
export function layoutFromLocale(locale: string): LayoutId | null {
  const [lang, ...rest] = locale.toLowerCase().split('-');
  const region = rest.find((p) => p.length === 2);
  if (region === 'be') return 'be-azerty';
  if (region === 'ch' || region === 'li') return 'ch-qwertz';
  if (region === 'gb' || region === 'ie') return 'uk-qwerty';
  if (lang === 'fr') return region && region !== 'fr' && region !== 'lu' && region !== 'mc' ? 'us-qwerty' : 'fr-azerty';
  if (lang === 'de') return 'de-qwertz';
  if (lang === 'es' || lang === 'ca' || lang === 'gl' || lang === 'eu') return 'es-qwerty';
  if (lang === 'it') return 'it-qwerty';
  if (lang === 'pt') return region === 'br' ? 'us-qwerty' : 'pt-qwerty';
  if (['sv', 'fi', 'nb', 'nn', 'no', 'da'].includes(lang)) return 'nordic-qwerty';
  if (lang === 'nl') return 'us-qwerty';
  if (lang === 'en') return 'us-qwerty';
  return null;
}

/** Infers the layout from one keystroke (physical code + produced character). */
export function layoutFromKey(code: string, key: string, preferred = guessLayoutFromLanguage()): LayoutId | null {
  if (Array.from(key).length !== 1) return null;
  return matchLayout(new Map([[code, key]]), preferred);
}

/** Guess from the browser languages, used until a stronger signal arrives. */
export function guessLayoutFromLanguage(): LayoutId {
  for (const l of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const layout = layoutFromLocale(l);
    if (layout) return layout;
  }
  return 'us-qwerty';
}

// ── WebHID ───────────────────────────────────────────────────────────────

interface HidDeviceLike {
  vendorId: number;
  productId: number;
  productName: string;
}
type HidApi = { requestDevice(o: { filters: object[] }): Promise<HidDeviceLike[]> };

export function isWebHidSupported(): boolean {
  return 'hid' in navigator;
}

export type HidResult =
  | { status: 'matched'; profile: KeyboardProfile; device: HidDeviceLike }
  | { status: 'unknown'; device: HidDeviceLike }
  | { status: 'cancelled' }
  | { status: 'unsupported' }
  | { status: 'error'; message: string };

const hex = (n: number) => `0x${n.toString(16).padStart(4, '0')}`;
export const formatHidId = (d: HidDeviceLike) => `${hex(d.vendorId)}:${hex(d.productId)}`;

/**
 * Asks the user to pick their keyboard through the browser's WebHID chooser and
 * matches its vendor/product IDs against the known profiles.
 *
 * Note: browsers hide pure keyboard interfaces from WebHID for security; many
 * keyboards still show up through a secondary interface (media keys, LEDs).
 */
export async function detectWithWebHid(profiles: KeyboardProfile[]): Promise<HidResult> {
  const hid = (navigator as Navigator & { hid?: HidApi }).hid;
  if (!hid) return { status: 'unsupported' };
  const vendors = [...new Set(profiles.flatMap((p) => p.hid.map((h) => h.vendorId)))];
  try {
    const devices = await hid.requestDevice({
      filters: [
        ...vendors.map((vendorId) => ({ vendorId })),
        { usagePage: 0x01, usage: 0x06 }, // Generic Desktop / Keyboard
        { usagePage: 0x0c }, // Consumer (media keys)
      ],
    });
    const device = devices[0];
    if (!device) return { status: 'cancelled' };
    const profile = profiles.find((p) =>
      p.hid.some((h) => h.vendorId === device.vendorId && h.productId === device.productId),
    );
    return profile ? { status: 'matched', profile, device } : { status: 'unknown', device };
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : String(e) };
  }
}
