import { getAction } from '../../data/actions';
import type { ActionDefinition } from '../../types/actions';
import type { RemapConfig } from '../../types/config';
import type { KeyboardProfile, KeyId } from '../../types/keyboard';

export interface ResolvedMapping {
  key: KeyId;
  action: ActionDefinition;
}

export interface ExportPlan {
  base: ResolvedMapping[];
  fn: ResolvedMapping[];
  fnTrigger: KeyId | null;
  warnings: string[];
}

/**
 * Normalizes the user config into what actually gets exported:
 * - keys sorted in physical order (stable, readable output);
 * - hardware-only keys (firmware Fn), unknown keys and unknown actions dropped;
 * - the virtual Fn key cannot also carry a base-layer action;
 * - Fn-layer mappings are dropped when no virtual Fn key is defined.
 *
 * Native shortcuts of the keyboard are never exported: the firmware already
 * provides them through the hardware Fn key.
 */
export function buildExportPlan(config: RemapConfig, profile: KeyboardProfile): ExportPlan {
  const warnings: string[] = [];
  const order = new Map(profile.keys.map((k, i) => [k.id, i]));
  const remappable = new Set(profile.keys.filter((k) => !k.hardwareOnly).map((k) => k.id));

  const resolve = (layer: 'base' | 'fn'): ResolvedMapping[] =>
    Object.entries(config.layers[layer])
      .filter(([key]) => remappable.has(key) && key !== config.fnTrigger)
      .map(([key, id]) => ({ key, action: getAction(id) }))
      .filter((m): m is ResolvedMapping => m.action !== undefined)
      .sort((a, b) => order.get(a.key)! - order.get(b.key)!);

  const fnTrigger =
    config.fnTrigger && remappable.has(config.fnTrigger) ? config.fnTrigger : null;
  let fn = resolve('fn');
  if (!fnTrigger && fn.length > 0) {
    warnings.push(
      `${fn.length} raccourci(s) de la couche Fn ignoré(s) : aucune touche Fn virtuelle n'est définie.`,
    );
    fn = [];
  }

  return { base: resolve('base'), fn, fnTrigger, warnings };
}

export const GENERATOR_NAME = 'Keyboard Remapper';
