import type { ActionDefinition, TargetOs } from '../../types/actions';
import type { RemapConfig } from '../../types/config';
import type { KeyboardProfile, KeyId } from '../../types/keyboard';
import { keyInfo } from '../keycodes';
import { buildExportPlan, GENERATOR_NAME, type ResolvedMapping } from './shared';

const FN_ALIAS = 'fn';
const TAP_HOLD_MS = 200;

/** Kanata action string, or `null` when Kanata has no equivalent on this OS. */
export function kanataAction(action: ActionDefinition, os: TargetOs): string | null {
  if (action.kanata === undefined) return null;
  return typeof action.kanata === 'string' ? action.kanata : action.kanata[os];
}

/** Lays out `cells` in columns so defsrc and deflayer line up visually. */
function aligned(cells: string[], widths: number[], indent = '  '): string {
  return indent + cells.map((c, i) => c.padEnd(widths[i])).join(' ').trimEnd();
}

export function generateKanata(config: RemapConfig, profile: KeyboardProfile): string {
  const plan = buildExportPlan(config, profile);
  const os = config.targetOs;
  const lines: string[] = [
    `;; Configuration Kanata générée par ${GENERATOR_NAME}`,
    `;; Clavier : ${profile.name} (${profile.standard}) · Cible : ${os === 'windows' ? 'Windows' : 'Linux'}`,
    ';; Documentation : https://github.com/jtroo/kanata',
    '',
  ];
  const warnings = [...plan.warnings];
  const exportable = (maps: ResolvedMapping[]) =>
    new Map(
      maps.flatMap((m): Array<[KeyId, string]> => {
        const out = kanataAction(m.action, os);
        if (!keyInfo(m.key).kanata) {
          warnings.push(`Touche ${m.key} ignorée : Kanata ne sait pas l'intercepter.`);
          return [];
        }
        if (out === null) {
          warnings.push(`« ${m.action.label} » ignoré : pas d'équivalent Kanata sous ${os === 'windows' ? 'Windows' : 'Linux'}.`);
          return [];
        }
        return [[m.key, out]];
      }),
    );
  const baseMap = exportable(plan.base);
  const fnMap = exportable(plan.fn);
  warnings.forEach((w) => lines.push(`;; ⚠ ${w}`));
  const order = new Map(profile.keys.map((k, i) => [k.id, i]));

  const used = new Set<KeyId>([...baseMap.keys(), ...fnMap.keys()]);
  if (plan.fnTrigger) used.add(plan.fnTrigger);
  const keys = [...used].sort((a, b) => order.get(a)! - order.get(b)!);

  if (keys.length === 0) {
    lines.push(
      ';; Aucune touche remappée pour l\'instant : ce fichier ne change rien.',
      '',
      '(defcfg process-unmapped-keys yes)',
      '(defsrc esc)',
      '(deflayer base _)',
    );
    return lines.join('\n') + '\n';
  }

  const needsCmd = [...baseMap.values(), ...fnMap.values()].some((v) => v.startsWith('(cmd'));
  lines.push('(defcfg', '  ;; Les touches non listées dans defsrc gardent leur comportement normal.', '  process-unmapped-keys yes');
  if (needsCmd) {
    lines.push(
      '  ;; Requis pour lancer des programmes (verrouillage, calculatrice, veille).',
      '  ;; Utilisez un binaire Kanata compilé avec la fonctionnalité "cmd" (ex: kanata_cmd_allowed.exe).',
      '  danger-enable-cmd yes',
    );
  }
  lines.push(')', '');

  if (plan.fnTrigger) {
    const tap = keyInfo(plan.fnTrigger).kanata;
    const hold = `(layer-while-held ${FN_ALIAS})`;
    lines.push(
      '(defalias',
      config.fnTapPassthrough
        ? `  ;; Maintenir ${tap} = couche Fn, appui bref = ${tap} normal.\n  ${FN_ALIAS} (tap-hold ${TAP_HOLD_MS} ${TAP_HOLD_MS} ${tap} ${hold})`
        : `  ;; Maintenir ${tap} = couche Fn (sa fonction d'origine est désactivée).\n  ${FN_ALIAS} ${hold}`,
      ')',
      '',
    );
  }

  const src = keys.map((k) => keyInfo(k).kanata);
  const base = keys.map((k) => (k === plan.fnTrigger ? `@${FN_ALIAS}` : (baseMap.get(k) ?? '_')));
  const fn = keys.map((k) => fnMap.get(k) ?? '_');
  const rows = plan.fnTrigger ? [src, base, fn] : [src, base];
  const widths = keys.map((_, i) => Math.max(...rows.map((r) => r[i].length)));

  lines.push('(defsrc', aligned(src, widths), ')', '');
  lines.push('(deflayer base', aligned(base, widths), ')');
  if (plan.fnTrigger) {
    lines.push('', `;; Couche active tant que la touche Fn virtuelle est maintenue.`);
    lines.push(`(deflayer ${FN_ALIAS}`, aligned(fn, widths), ')');
  }
  return lines.join('\n') + '\n';
}
