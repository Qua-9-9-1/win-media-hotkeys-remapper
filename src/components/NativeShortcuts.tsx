import { Cpu, ExternalLink } from 'lucide-react';
import type { Confidence, KeyboardProfile, KeyId, LayerId, LayoutId } from '../types/keyboard';
import { getAction } from '../data/actions';
import { keyLegend } from '../core/layouts';
import { Badge } from './ui';

const CONFIDENCE: Record<Confidence, { tone: 'emerald' | 'amber' | 'slate'; label: string }> = {
  high: { tone: 'emerald', label: 'Vérifié (manuel officiel)' },
  medium: { tone: 'amber', label: 'Partiellement vérifié' },
  low: { tone: 'slate', label: 'Non vérifié' },
};

/** Shortcuts the keyboard already provides in hardware, as clickable chips. */
export function NativeShortcuts({ profile, layout, onShow }: {
  profile: KeyboardProfile;
  layout: LayoutId;
  onShow: (layer: LayerId, key: KeyId) => void;
}) {
  const sources = profile.sources ?? [];
  if (profile.nativeShortcuts.length === 0 && sources.length === 0) return null;
  const confidence = CONFIDENCE[profile.confidence ?? 'low'];

  return (
    <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-amber-200">
          <Cpu size={13} />
          {profile.nativeShortcuts.length > 0
            ? `Déjà intégré au ${profile.name} (géré par le clavier, rien à installer)`
            : `Le ${profile.name} n'a pas de raccourci intégré.`}
        </p>
        <Badge tone={confidence.tone}>{confidence.label}</Badge>
      </div>
      {profile.nativeShortcuts.length > 0 && (
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
                {/* Dedicated keys (base layer) are fully described by their icon. */}
                {s.layer === 'fn' && (
                  <kbd className="font-mono text-amber-300">
                    Fn + {profile.keys.find((k) => k.id === s.key)?.label ?? keyLegend(s.key, layout).main}
                  </kbd>
                )}
                <a.icon size={13} className="text-amber-300" />
                {a.label}
              </button>
            );
          })}
        </div>
      )}
      {(sources.length > 0 || profile.notes) && (
        <div className="space-y-1 text-xs text-slate-400">
          {profile.notes && <p>{profile.notes}</p>}
          {sources.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Sources :</span>
              {sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-300 underline-offset-2 hover:underline"
                >
                  {s.label} <ExternalLink size={11} />
                </a>
              ))}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
