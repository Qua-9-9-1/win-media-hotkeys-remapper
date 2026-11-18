import type { TargetOs } from '../types/actions';
import type { RemapConfig } from '../types/config';
import type { KeyId, LayerId } from '../types/keyboard';
import { DEFAULT_PROFILE_ID, KEYBOARDS } from '../data/keyboards';

export type ConfigAction =
  | { type: 'setProfile'; profileId: string }
  | { type: 'setTargetOs'; os: TargetOs }
  | { type: 'assign'; layer: LayerId; key: KeyId; actionId: string }
  | { type: 'clear'; layer: LayerId; key: KeyId }
  | { type: 'clearLayer'; layer: LayerId }
  | { type: 'setFnTrigger'; key: KeyId | null }
  | { type: 'setFnTapPassthrough'; value: boolean }
  | { type: 'replace'; config: RemapConfig };

export function initialConfig(targetOs: TargetOs = 'windows'): RemapConfig {
  return {
    profileId: DEFAULT_PROFILE_ID,
    targetOs,
    fnTrigger: null,
    fnTapPassthrough: true,
    layers: { base: {}, fn: {} },
  };
}

const without = (map: Partial<Record<KeyId, string>>, key: KeyId) => {
  const next = { ...map };
  delete next[key];
  return next;
};

export function configReducer(state: RemapConfig, action: ConfigAction): RemapConfig {
  switch (action.type) {
    case 'setProfile':
      return { ...state, profileId: action.profileId };
    case 'setTargetOs':
      return { ...state, targetOs: action.os };
    case 'assign': {
      // The virtual Fn key is reserved: assigning a base action to it frees it.
      const freesTrigger = action.layer === 'base' && action.key === state.fnTrigger;
      return {
        ...state,
        fnTrigger: freesTrigger ? null : state.fnTrigger,
        layers: {
          ...state.layers,
          [action.layer]: { ...state.layers[action.layer], [action.key]: action.actionId },
        },
      };
    }
    case 'clear':
      return {
        ...state,
        layers: { ...state.layers, [action.layer]: without(state.layers[action.layer], action.key) },
      };
    case 'clearLayer':
      return { ...state, layers: { ...state.layers, [action.layer]: {} } };
    case 'setFnTrigger':
      return {
        ...state,
        fnTrigger: action.key,
        layers: action.key
          ? {
              base: without(state.layers.base, action.key),
              fn: without(state.layers.fn, action.key),
            }
          : state.layers,
      };
    case 'setFnTapPassthrough':
      return { ...state, fnTapPassthrough: action.value };
    case 'replace':
      return action.config;
  }
}

const STORAGE_KEY = 'keyboard-remapper:config:v1';

export function loadConfig(fallbackOs: TargetOs): RemapConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialConfig(fallbackOs);
    const parsed = JSON.parse(raw) as Partial<RemapConfig>;
    const base = initialConfig(fallbackOs);
    const merged: RemapConfig = {
      ...base,
      ...parsed,
      layers: { base: parsed.layers?.base ?? {}, fn: parsed.layers?.fn ?? {} },
    };
    if (!KEYBOARDS.some((k) => k.id === merged.profileId)) merged.profileId = base.profileId;
    return merged;
  } catch {
    return initialConfig(fallbackOs);
  }
}

export function saveConfig(config: RemapConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage unavailable (private mode...): the app keeps working in memory.
  }
}

export function hasSavedConfig(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
