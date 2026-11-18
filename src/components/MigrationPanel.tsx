import { useState } from 'react';
import { ArrowRight, Import } from 'lucide-react';
import type { RemapConfig } from '../types/config';
import type { KeyboardProfile, LayoutId } from '../types/keyboard';
import { KEYBOARDS } from '../data/keyboards';
import { getAction } from '../data/actions';
import { keyLegend } from '../core/layouts';
import { migrateShortcuts } from '../core/migration';
import { Button, Card, selectClass } from './ui';

export function MigrationPanel({ profile, layout, config, onApply }: {
  profile: KeyboardProfile;
  layout: LayoutId;
  config: RemapConfig;
  onApply: (config: RemapConfig) => void;
}) {
  const sources = KEYBOARDS.filter((k) => k.id !== profile.id && k.nativeShortcuts.length > 0);
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const source = sources.find((s) => s.id === sourceId) ?? sources[0];

  if (!source) {
    return null;
  }

  const apply = () => {
    const r = migrateShortcuts(config, source, profile);
    onApply(r.config);
    const parts = [`${r.added} raccourci(s) importé(s)`];
    if (r.skippedNative) parts.push(`${r.skippedNative} déjà natif(s)`);
    if (r.skippedExisting) parts.push(`${r.skippedExisting} touche(s) déjà personnalisée(s), conservée(s)`);
    if (r.enabledFnTrigger) parts.push('Verr. Maj définie comme touche Fn virtuelle');
    setMessage(parts.join(' · ') + '.');
  };

  return (
    <Card title="Importer les raccourcis d'un autre clavier" icon={<Import size={16} />}>
      <div className="space-y-3 text-sm">
        <select
          className={`${selectClass} w-full`}
          value={source.id}
          onChange={(e) => {
            setSourceId(e.target.value);
            setMessage(null);
          }}
        >
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <ul className="space-y-1 rounded-lg border border-slate-800 bg-slate-950/50 p-2 text-xs">
          {source.nativeShortcuts.map((s) => {
            const a = getAction(s.action);
            if (!a) return null;
            return (
              <li key={`${s.layer}-${s.key}`} className="flex items-center gap-2 text-slate-300">
                <span className="w-16 font-mono text-slate-500">
                  {s.layer === 'fn' ? 'Fn + ' : ''}
                  {keyLegend(s.key, layout).main}
                </span>
                <ArrowRight size={12} className="text-slate-600" />
                <a.icon size={13} className="text-amber-300" />
                {a.label}
              </li>
            );
          })}
        </ul>
        <Button variant="primary" className="w-full" onClick={apply}>
          Appliquer les raccourcis du {source.name} sur mon {profile.name}
        </Button>
        {message && <p className="text-xs text-emerald-300">{message}</p>}
      </div>
    </Card>
  );
}
