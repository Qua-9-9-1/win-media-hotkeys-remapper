import { Cpu } from 'lucide-react';
import type { KeyboardProfile, KeyId, LayerId, LayoutId } from '../types/keyboard';
import { getAction } from '../data/actions';
import { keyLegend } from '../core/layouts';

/** Shortcuts the keyboard already provides in hardware, as clickable chips. */
export function NativeShortcuts({ profile, layout, onShow }: {
  profile: KeyboardProfile;
  layout: LayoutId;
  onShow: (layer: LayerId, key: KeyId) => void;
}) {
  if (profile.nativeShortcuts.length === 0) return null;
  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-200">
        <Cpu size={13} /> Déjà intégré au {profile.name} (géré par le clavier, rien à installer)
      </p>
      <div className="flex flex-wrap gap-1.5">
        {profile.nativeShortcuts.map((s) => {
          const a = getAction(s.action);
          if (!a) return null;
          return (
            <button
              key={`${s.layer}-${s.key}`}
              type="button"
              onClick={() => onShow(s.layer, s.key)}
              title={`Afficher sur le clavier : ${a.label}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-slate-900/80 px-2 py-1 text-xs text-slate-200 hover:border-amber-400/70"
            >
              <kbd className="font-mono text-amber-300">
                {s.layer === 'fn' ? 'Fn + ' : ''}
                {keyLegend(s.key, layout).main}
              </kbd>
              <a.icon size={13} className="text-amber-300" />
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
