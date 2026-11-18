import type { TargetOs } from '../types/actions';
import type { KeyboardProfile, LayoutId } from '../types/keyboard';

export type DetectedOs = TargetOs | 'macos' | 'unknown';

export function detectOs(): DetectedOs {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = (nav.userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase();
  if (p.includes('win')) return 'windows';
  if (p.includes('mac')) return 'macos';
  if (p.includes('linux') || p.includes('x11') || p.includes('cros')) return 'linux';
  return 'unknown';
}

type LayoutMap = { get(code: string): string | undefined };
type KeyboardApi = { getLayoutMap(): Promise<LayoutMap> };

/**
 * Uses the Keyboard Map API (Chromium) to read which character the `KeyQ`
 * position produces. Returns `null` when the API is unavailable.
 */
export async function detectLayoutFromApi(): Promise<LayoutId | null> {
  const kb = (navigator as Navigator & { keyboard?: KeyboardApi }).keyboard;
  if (!kb?.getLayoutMap) return null;
  try {
    const map = await kb.getLayoutMap();
    return layoutFromKey('KeyQ', map.get('KeyQ') ?? '');
  } catch {
    return null;
  }
}

/** Infers the layout from one keystroke (physical code + produced character). */
export function layoutFromKey(code: string, key: string): LayoutId | null {
  const k = key.toLowerCase();
  if (code === 'KeyQ') return k === 'a' ? 'fr-azerty' : k === 'q' ? 'us-qwerty' : null;
  if (code === 'KeyA') return k === 'q' ? 'fr-azerty' : k === 'a' ? 'us-qwerty' : null;
  if (code === 'KeyW') return k === 'z' ? 'fr-azerty' : k === 'w' ? 'us-qwerty' : null;
  if (code === 'KeyZ') return k === 'w' ? 'fr-azerty' : k === 'z' ? 'us-qwerty' : null;
  if (code === 'Semicolon') return k === 'm' ? 'fr-azerty' : k === ';' ? 'us-qwerty' : null;
  return null;
}

/** Weak guess from browser language, used only before any other signal. */
export function guessLayoutFromLanguage(): LayoutId {
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr-azerty' : 'us-qwerty';
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
