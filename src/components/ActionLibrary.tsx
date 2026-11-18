import { useState } from 'react';
import { ChevronDown, Library, Search } from 'lucide-react';
import { actionsByCategory, CATEGORY_LABELS } from '../data/actions';
import type { ActionCategory } from '../types/actions';
import { ACTION_DRAG_TYPE } from './keyboard/KeyCap';
import { Card } from './ui';

export function ActionLibrary({ canAssign, targetLabel, onPick }: {
  canAssign: boolean;
  targetLabel: string;
  onPick: (actionId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Partial<Record<ActionCategory, boolean>>>({});
  const q = query.trim().toLowerCase();

  return (
    <Card title="Bibliothèque d'actions" icon={<Library size={16} />}>
      <p className="mb-3 text-xs text-slate-400">
        {canAssign ? (
          <>Clic = assigner à <span className="font-semibold text-cyan-300">{targetLabel}</span>. Ou glissez sur une touche.</>
        ) : (
          'Sélectionnez une touche, ou glissez une action sur le clavier.'
        )}
      </p>
      <label className="relative mb-3 block">
        <Search size={14} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une action…"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 pr-2 pl-8 text-sm placeholder:text-slate-500 focus:outline-2 focus:outline-cyan-400"
        />
      </label>
      <div className="space-y-3">
        {actionsByCategory().map(([cat, actions]) => {
          const visible = actions.filter((a) => !q || a.label.toLowerCase().includes(q));
          if (visible.length === 0) return null;
          const isCollapsed = collapsed[cat] && !q;
          return (
            <div key={cat}>
              <button
                type="button"
                onClick={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))}
                className="mb-1.5 flex w-full items-center gap-1 text-xs font-semibold tracking-wide text-slate-400 uppercase hover:text-slate-200"
              >
                <ChevronDown size={14} className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                {CATEGORY_LABELS[cat]}
              </button>
              {!isCollapsed && (
                <div className="grid grid-cols-2 gap-1.5">
                  {visible.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(ACTION_DRAG_TYPE, a.id);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => canAssign && onPick(a.id)}
                      title={a.label}
                      className={`flex cursor-grab items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800/70 px-2 py-1.5 text-left text-xs text-slate-200 transition-colors active:cursor-grabbing ${
                        canAssign ? 'hover:border-cyan-400/60 hover:bg-cyan-500/10' : 'hover:border-slate-600'
                      }`}
                    >
                      <a.icon size={15} className="shrink-0 text-cyan-300" />
                      <span className="truncate">{a.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
