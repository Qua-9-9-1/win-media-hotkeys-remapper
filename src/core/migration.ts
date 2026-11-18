import type { RemapConfig } from '../types/config';
import type { KeyboardProfile, LayerId } from '../types/keyboard';
import { getAction } from '../data/actions';

export interface MigrationResult {
  config: RemapConfig;
  added: number;
  skippedNative: number;
  skippedExisting: number;
  /** Firmware-only features that a software remapper cannot reproduce. */
  skippedUnsupported: number;
  /** Virtual Fn key auto-enabled because the source shortcuts need one. */
  enabledFnTrigger: boolean;
}

/**
 * Copies the native shortcuts of `source` onto the current keyboard as custom
 * mappings. Shortcuts the target already provides natively, and keys the user
 * already customized, are left untouched.
 */
export function migrateShortcuts(
  config: RemapConfig,
  source: KeyboardProfile,
  target: KeyboardProfile,
  filter: (actionId: string) => boolean = () => true,
): MigrationResult {
  const targetKeys = new Set(target.keys.filter((k) => !k.hardwareOnly).map((k) => k.id));
  const nativeActions = new Set(target.nativeShortcuts.map((s) => s.action));
  const layers: Record<LayerId, Record<string, string | undefined>> = {
    base: { ...config.layers.base },
    fn: { ...config.layers.fn },
  };
  let added = 0;
  let skippedNative = 0;
  let skippedExisting = 0;
  let skippedUnsupported = 0;

  for (const s of source.nativeShortcuts) {
    const action = getAction(s.action);
    if (!filter(s.action) || !action || !targetKeys.has(s.key)) continue;
    // Firmware-only features (Fn Lock...) cannot be reproduced by a remapper.
    if (action.nativeOnly) {
      skippedUnsupported++;
      continue;
    }
    // The target keyboard already offers this action natively: nothing is missing.
    if (nativeActions.has(s.action)) {
      skippedNative++;
      continue;
    }
    if (layers[s.layer][s.key]) {
      skippedExisting++;
      continue;
    }
    layers[s.layer][s.key] = s.action;
    added++;
  }

  const needsFn = added > 0 && Object.keys(layers.fn).length > 0 && !config.fnTrigger;
  return {
    config: { ...config, layers, fnTrigger: needsFn ? 'CapsLock' : config.fnTrigger },
    added,
    skippedNative,
    skippedExisting,
    skippedUnsupported,
    enabledFnTrigger: needsFn,
  };
}
