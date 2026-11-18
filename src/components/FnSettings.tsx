import { Sparkles } from 'lucide-react';
import type { RemapConfig } from '../types/config';
import type { KeyboardProfile, KeyId } from '../types/keyboard';
import { FN_TRIGGER_CANDIDATES, KEY_CODES } from '../core/keycodes';
import { Card, selectClass } from './ui';

export function FnSettings({ profile, config, onSetTrigger, onSetPassthrough }: {
  profile: KeyboardProfile;
  config: RemapConfig;
  onSetTrigger: (key: KeyId | null) => void;
  onSetPassthrough: (value: boolean) => void;
}) {
  const present = new Set(profile.keys.map((k) => k.id));
  const candidates = FN_TRIGGER_CANDIDATES.filter((k) => present.has(k));
  // Keep a trigger chosen from the keyboard (any key) selectable in the list.
  if (config.fnTrigger && !candidates.includes(config.fnTrigger)) candidates.unshift(config.fnTrigger);

  return (
    <Card title="Touche Fn virtuelle" icon={<Sparkles size={16} />}>
      <div className="space-y-3 text-sm">
        <p className="text-slate-400">
          {profile.hasFnKey
            ? 'La touche Fn matérielle est invisible pour le système : choisissez une autre touche pour vos raccourcis personnalisés.'
            : "Ce clavier n'a pas de touche Fn : transformez une touche peu utilisée en touche Fn maintenue."}
        </p>
        <label className="flex flex-wrap items-center gap-2">
          <span className="text-slate-300">Touche :</span>
          <select
            className={selectClass}
            value={config.fnTrigger ?? ''}
            onChange={(e) => onSetTrigger(e.target.value || null)}
          >
            <option value="">Aucune</option>
            {candidates.map((k) => (
              <option key={k} value={k}>
                {KEY_CODES[k]?.label ?? k}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-start gap-2 text-slate-300">
          <input
            type="checkbox"
            className="mt-0.5 accent-violet-400"
            checked={config.fnTapPassthrough}
            disabled={!config.fnTrigger}
            onChange={(e) => onSetPassthrough(e.target.checked)}
          />
          <span>
            Conserver la fonction d'origine sur un appui bref
            <span className="block text-xs text-slate-500">
              Maintenir = couche Fn · taper seul = fonction normale (ex : Verr. Maj).
            </span>
          </span>
        </label>
      </div>
    </Card>
  );
}
