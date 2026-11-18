import {
  Activity,
  ArrowDownToLine,
  ArrowUpToLine,
  Ban,
  Calculator,
  Camera,
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  ClipboardPaste,
  Copy,
  Delete,
  Lock,
  LockKeyhole,
  Moon,
  Play,
  Printer,
  SkipBack,
  SkipForward,
  Undo2,
  Volume1,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  Keyboard,
} from 'lucide-react';
import type { ActionCategory, ActionDefinition } from '../types/actions';

export const CATEGORY_LABELS: Record<ActionCategory, string> = {
  media: 'Multimédia & Audio',
  productivity: 'Navigation & Productivité',
  system: 'Système & Fenêtres',
  keys: 'Touches standard',
};

export const ACTIONS: ActionDefinition[] = [
  // ── Multimédia & Audio ──────────────────────────────────────────────
  { id: 'media.playPause', category: 'media', label: 'Lecture / Pause', short: 'Play', icon: Play,
    kanata: 'pp', ahk: { kind: 'send', keys: '{Media_Play_Pause}' } },
  { id: 'media.next', category: 'media', label: 'Piste suivante', short: 'Suiv.', icon: SkipForward,
    kanata: 'next', ahk: { kind: 'send', keys: '{Media_Next}' } },
  { id: 'media.prev', category: 'media', label: 'Piste précédente', short: 'Préc.', icon: SkipBack,
    kanata: 'prev', ahk: { kind: 'send', keys: '{Media_Prev}' } },
  { id: 'media.volUp', category: 'media', label: 'Volume +', short: 'Vol +', icon: Volume2,
    kanata: 'volu', ahk: { kind: 'send', keys: '{Volume_Up}' } },
  { id: 'media.volDown', category: 'media', label: 'Volume −', short: 'Vol −', icon: Volume1,
    kanata: 'vold', ahk: { kind: 'send', keys: '{Volume_Down}' } },
  { id: 'media.mute', category: 'media', label: 'Muet', short: 'Muet', icon: VolumeX,
    kanata: 'mute', ahk: { kind: 'send', keys: '{Volume_Mute}' } },

  // ── Navigation & Productivité ───────────────────────────────────────
  { id: 'prod.copy', category: 'productivity', label: 'Copier', short: 'Copier', icon: Copy,
    kanata: 'C-c', ahk: { kind: 'send', keys: '^c' } },
  { id: 'prod.paste', category: 'productivity', label: 'Coller', short: 'Coller', icon: ClipboardPaste,
    kanata: 'C-v', ahk: { kind: 'send', keys: '^v' } },
  { id: 'prod.undo', category: 'productivity', label: 'Annuler', short: 'Annul.', icon: Undo2,
    kanata: 'C-z', ahk: { kind: 'send', keys: '^z' } },
  { id: 'prod.nextTab', category: 'productivity', label: 'Onglet suivant', short: 'Ong. →', icon: ChevronRight,
    kanata: 'C-tab', ahk: { kind: 'send', keys: '^{Tab}' } },
  { id: 'prod.prevTab', category: 'productivity', label: 'Onglet précédent', short: '← Ong.', icon: ChevronLeft,
    kanata: 'C-S-tab', ahk: { kind: 'send', keys: '^+{Tab}' } },
  { id: 'prod.desktopLeft', category: 'productivity', label: 'Bureau virtuel gauche', short: '← Bur.', icon: ArrowLeft,
    kanata: { windows: 'C-M-left', linux: 'M-pgup' }, ahk: { kind: 'send', keys: '^#{Left}' } },
  { id: 'prod.desktopRight', category: 'productivity', label: 'Bureau virtuel droite', short: 'Bur. →', icon: ArrowRight,
    kanata: { windows: 'C-M-rght', linux: 'M-pgdn' }, ahk: { kind: 'send', keys: '^#{Right}' } },
  { id: 'prod.screenshot', category: 'productivity', label: "Capture d'écran (zone)", short: 'Capt.', icon: Camera,
    kanata: { windows: 'M-S-s', linux: 'prnt' }, ahk: { kind: 'send', keys: '#+s' } },

  // ── Système & Fenêtres ──────────────────────────────────────────────
  // Win+L cannot be simulated on Windows (secure shortcut): call the API instead.
  { id: 'sys.lock', category: 'system', label: 'Verrouiller le PC', short: 'Verr.', icon: Lock,
    kanata: { windows: '(cmd rundll32.exe user32.dll,LockWorkStation)', linux: '(cmd loginctl lock-session)' },
    kanataCmd: true, ahk: { kind: 'code', code: 'DllCall("LockWorkStation")' } },
  { id: 'sys.taskManager', category: 'system', label: 'Gestionnaire des tâches', short: 'Tâches', icon: Activity,
    kanata: { windows: 'C-S-esc', linux: '(cmd gnome-system-monitor)' },
    ahk: { kind: 'send', keys: '^+{Esc}' } },
  { id: 'sys.calculator', category: 'system', label: 'Calculatrice', short: 'Calc', icon: Calculator,
    kanata: { windows: '(cmd calc.exe)', linux: '(cmd gnome-calculator)' },
    kanataCmd: true, ahk: { kind: 'code', code: 'Run "calc.exe"' } },
  { id: 'sys.sleep', category: 'system', label: 'Mise en veille', short: 'Veille', icon: Moon,
    kanata: { windows: '(cmd rundll32.exe powrprof.dll,SetSuspendState 0,1,0)', linux: '(cmd systemctl suspend)' },
    kanataCmd: true,
    ahk: { kind: 'code', code: 'DllCall("PowrProf\\SetSuspendState", "Int", 0, "Int", 0, "Int", 0)' } },

  // ── Touches standard (utile pour remapper la couche principale) ────
  { id: 'key.home', category: 'keys', label: 'Début (Home)', short: 'Début', icon: ArrowUpToLine,
    kanata: 'home', ahk: { kind: 'remap', target: 'Home' } },
  { id: 'key.end', category: 'keys', label: 'Fin (End)', short: 'Fin', icon: ArrowDownToLine,
    kanata: 'end', ahk: { kind: 'remap', target: 'End' } },
  { id: 'key.pgup', category: 'keys', label: 'Page précédente', short: 'Pg ↑', icon: ChevronsUp,
    kanata: 'pgup', ahk: { kind: 'remap', target: 'PgUp' } },
  { id: 'key.pgdn', category: 'keys', label: 'Page suivante', short: 'Pg ↓', icon: ChevronsDown,
    kanata: 'pgdn', ahk: { kind: 'remap', target: 'PgDn' } },
  { id: 'key.delete', category: 'keys', label: 'Suppr', short: 'Suppr', icon: Delete,
    kanata: 'del', ahk: { kind: 'remap', target: 'Delete' } },
  { id: 'key.printScreen', category: 'keys', label: 'Impr. écran', short: 'Impr', icon: Printer,
    kanata: 'prnt', ahk: { kind: 'remap', target: 'PrintScreen' } },
  { id: 'key.esc', category: 'keys', label: 'Échap', short: 'Échap', icon: Keyboard,
    kanata: 'esc', ahk: { kind: 'remap', target: 'Esc' } },
  { id: 'key.disable', category: 'keys', label: 'Désactiver la touche', short: '⊘', icon: Ban,
    kanata: 'XX', ahk: { kind: 'code', code: 'return' } },

  // ── Fonctions matérielles (affichage seulement, jamais exportées) ──
  { id: 'hw.fnLock', category: 'system', label: 'Fn Lock (inverse F1-F12 et multimédia)', short: 'Fn Lock',
    icon: LockKeyhole, nativeOnly: true, kanata: '_', ahk: { kind: 'code', code: 'return' } },
];

const BY_ID = new Map(ACTIONS.map((a) => [a.id, a]));

export function getAction(id: string | undefined): ActionDefinition | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function actionsByCategory(): Array<[ActionCategory, ActionDefinition[]]> {
  return (Object.keys(CATEGORY_LABELS) as ActionCategory[]).map((c) => [
    c,
    ACTIONS.filter((a) => a.category === c && !a.nativeOnly),
  ]);
}
