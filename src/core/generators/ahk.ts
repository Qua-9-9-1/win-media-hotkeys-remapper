import type { ActionDefinition } from '../../types/actions';
import type { RemapConfig } from '../../types/config';
import type { KeyboardProfile, KeyId } from '../../types/keyboard';
import { keyInfo } from '../keycodes';
import { buildExportPlan, GENERATOR_NAME, type ResolvedMapping } from './shared';

/** Escapes a string for an AHK v2 double-quoted literal. */
const ahkString = (s: string) => `"${s.replace(/`/g, '``').replace(/"/g, '`"')}"`;

export function ahkHotkey(key: KeyId, action: ActionDefinition): string {
  const k = keyInfo(key).ahk;
  const label = `  ; ${action.label}`;
  if (!action.ahk || !k) {
    return `; ⚠ ${key} → « ${action.label} » ignoré : pas d'équivalent AutoHotkey.`;
  }
  switch (action.ahk.kind) {
    case 'remap':
      return `${k}::${action.ahk.target}${label}`;
    case 'send':
      return `${k}::Send ${ahkString(action.ahk.keys)}${label}`;
    case 'code':
      return `${k}::${action.ahk.code}${label}`;
  }
}

const LOCK_KEYS: Record<string, string> = {
  CapsLock: 'SetCapsLockState',
  ScrollLock: 'SetScrollLockState',
  NumLock: 'SetNumLockState',
};

/** Hotkey that turns the trigger key into a "virtual Fn" modifier. */
function fnTriggerBlock(trigger: KeyId, tapPassthrough: boolean): string[] {
  const k = keyInfo(trigger).ahk;
  if (!tapPassthrough) {
    return [`; ${k} sert uniquement de touche Fn virtuelle (sa fonction d'origine est désactivée).`, `*${k}::return`];
  }
  const restore = LOCK_KEYS[k]
    ? `${LOCK_KEYS[k]} !GetKeyState(${ahkString(k)}, "T")`
    : `Send "{Blind}{${k}}"`;
  return [
    `; Maintenir ${k} = couche Fn ; appui bref seul = ${k} normal.`,
    `*${k}:: {`,
    `    KeyWait ${ahkString(k)}`,
    `    if (A_PriorKey = ${ahkString(k)})`,
    `        ${restore}`,
    '}',
  ];
}

export function generateAhk(config: RemapConfig, profile: KeyboardProfile): string {
  const plan = buildExportPlan(config, profile);
  const lines: string[] = [
    `; Script AutoHotkey v2 généré par ${GENERATOR_NAME}`,
    `; Clavier : ${profile.name} (${profile.standard})`,
    '; Les touches caractères sont désignées par scan code (SCxxx) : le script',
    '; fonctionne quelle que soit la disposition Windows (AZERTY, QWERTY...).',
    '',
    '#Requires AutoHotkey v2.0',
    '#SingleInstance Force',
    'InstallKeybdHook',
    '',
  ];
  plan.warnings.forEach((w) => lines.push(`; ⚠ ${w}`));
  if (config.targetOs !== 'windows') {
    lines.push('; ⚠ AutoHotkey ne fonctionne que sous Windows : utilisez le fichier Kanata sous Linux.', '');
  }

  const section = (title: string, maps: ResolvedMapping[]) => {
    if (maps.length === 0) return;
    lines.push(`; ── ${title} ${'─'.repeat(Math.max(0, 60 - title.length))}`);
    maps.forEach((m) => lines.push(ahkHotkey(m.key, m.action)));
    lines.push('');
  };

  section('Couche principale', plan.base);

  if (plan.fnTrigger) {
    const k = keyInfo(plan.fnTrigger).ahk;
    lines.push(`; ── Touche Fn virtuelle ${'─'.repeat(39)}`);
    lines.push(...fnTriggerBlock(plan.fnTrigger, config.fnTapPassthrough), '');
    if (plan.fn.length > 0) {
      lines.push(`#HotIf GetKeyState(${ahkString(k)}, "P")`);
      section(`Couche Fn (${k} maintenue)`, plan.fn);
      lines.push('#HotIf', '');
    }
  }

  if (plan.base.length === 0 && plan.fn.length === 0 && !plan.fnTrigger) {
    lines.push("; Aucune touche remappée pour l'instant : ce script ne change rien.", '');
  }
  return lines.join('\n');
}
