import type { LucideIcon } from 'lucide-react';

export type TargetOs = 'windows' | 'linux';

export type ActionCategory = 'media' | 'productivity' | 'system' | 'keys';

/**
 * Kanata output for an action. Either a plain Kanata action string
 * (`pp`, `C-c`, `(cmd calc.exe)`...) or one string per OS.
 */
export type KanataOutput = string | Record<TargetOs, string>;

/** AutoHotkey v2 output (Windows only). */
export type AhkOutput =
  /** `Send "<keys>"` */
  | { kind: 'send'; keys: string }
  /** Plain AHK remap `key::target` (keeps modifiers working). */
  | { kind: 'remap'; target: string }
  /** Any single-line AHK v2 expression, e.g. `Run "calc.exe"`. */
  | { kind: 'code'; code: string };

export interface ActionDefinition {
  id: string;
  category: ActionCategory;
  label: string;
  /** Very short label printed on the virtual key (keep under ~8 chars). */
  short: string;
  icon: LucideIcon;
  kanata: KanataOutput;
  ahk: AhkOutput;
  /** True when the Kanata output runs a program (needs `danger-enable-cmd`). */
  kanataCmd?: boolean;
  /**
   * Firmware-only feature (e.g. Fn Lock): shown on keyboards that have it,
   * never offered in the library nor exported.
   */
  nativeOnly?: boolean;
}
