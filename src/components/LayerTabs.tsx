import { Keyboard, Layers } from 'lucide-react';
import type { LayerId } from '../types/keyboard';

export function LayerTabs({ layer, onChange, counts, fnHint }: {
  layer: LayerId;
  onChange: (layer: LayerId) => void;
  counts: Record<LayerId, number>;
  fnHint: string;
}) {
  const tabs: Array<{ id: LayerId; label: string; icon: typeof Keyboard }> = [
    { id: 'base', label: 'Couche principale', icon: Keyboard },
    { id: 'fn', label: 'Couche Fn / Raccourcis', icon: Layers },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="tablist" className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={layer === t.id}
            onClick={() => onChange(t.id)}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
              layer === t.id
                ? t.id === 'fn'
                  ? 'bg-violet-500/20 text-violet-100'
                  : 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.icon size={15} />
            {t.label}
            {counts[t.id] > 0 && (
              <span className="rounded bg-cyan-500/20 px-1.5 text-xs text-cyan-300">{counts[t.id]}</span>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400">{fnHint}</p>
    </div>
  );
}

export function Legend() {
  const item = (cls: string, label: string) => (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm border ${cls}`} />
      {label}
    </span>
  );
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
      {item('border-cyan-400 bg-cyan-500/20', 'Personnalisé')}
      {item('border-amber-400 bg-amber-500/15', 'Natif du clavier')}
      {item('border-violet-400 bg-violet-500/30', 'Touche Fn virtuelle')}
      {item('border-dashed border-amber-500/60 bg-amber-500/10', 'Fn matérielle')}
    </div>
  );
}
