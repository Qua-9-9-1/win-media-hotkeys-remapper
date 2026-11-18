import type { TargetOs } from './actions';
import type { KeyId, LayerId } from './keyboard';

/** Map of physical key → action id for one layer. */
export type LayerMapping = Partial<Record<KeyId, string>>;

/** Everything the user configured. Serializable (stored in localStorage). */
export interface RemapConfig {
  profileId: string;
  targetOs: TargetOs;
  /** Key held to activate the Fn layer (virtual Fn). `null` = none. */
  fnTrigger: KeyId | null;
  /** When true, tapping the virtual Fn key still sends its original function. */
  fnTapPassthrough: boolean;
  layers: Record<LayerId, LayerMapping>;
}
