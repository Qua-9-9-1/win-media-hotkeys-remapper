import { useMemo, useState } from 'react';
import { Check, CircleHelp, Code, Copy, Download } from 'lucide-react';
import type { TargetOs } from '../types/actions';
import type { RemapConfig } from '../types/config';
import type { KeyboardProfile } from '../types/keyboard';
import { generateKanata } from '../core/generators/kanata';
import { generateAhk } from '../core/generators/ahk';
import { downloadText } from '../utils/download';
import { Button, Card } from './ui';

export type ExportFormat = 'kanata' | 'ahk';

export function CodePreview({ profile, config, onTargetOs, onHelp }: {
  profile: KeyboardProfile;
  config: RemapConfig;
  onTargetOs: (os: TargetOs) => void;
  onHelp: (format: ExportFormat) => void;
}) {
  const [format, setFormat] = useState<ExportFormat>('kanata');
  const [copied, setCopied] = useState(false);

  const code = useMemo(
    () => (format === 'kanata' ? generateKanata(config, profile) : generateAhk(config, profile)),
    [format, config, profile],
  );
  const filename = format === 'kanata' ? `kanata-${profile.id}.kbd` : `remap-${profile.id}.ahk`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied: the user can still select the text or download.
    }
  };

  const tab = (id: ExportFormat, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={format === id}
      onClick={() => setFormat(id)}
      className={`rounded-md px-3 py-1 font-mono text-xs transition-colors ${
        format === id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Card
      title="Fichier généré"
      icon={<Code size={16} />}
      actions={
        <Button variant="ghost" onClick={() => onHelp(format)}>
          <CircleHelp size={15} /> Comment l'utiliser ?
        </Button>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div role="tablist" className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1">
          {tab('kanata', 'Kanata .kbd')}
          {tab('ahk', 'AutoHotkey v2 .ahk')}
        </div>
        {format === 'kanata' && (
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            Système cible :
            {(['windows', 'linux'] as const).map((os) => (
              <label key={os} className="inline-flex items-center gap-1 text-slate-300">
                <input
                  type="radio"
                  name="target-os"
                  className="accent-cyan-400"
                  checked={config.targetOs === os}
                  onChange={() => onTargetOs(os)}
                />
                {os === 'windows' ? 'Windows' : 'Linux'}
              </label>
            ))}
          </div>
        )}
        {format === 'ahk' && <span className="text-xs text-slate-400">Windows uniquement</span>}
        <div className="ml-auto flex gap-2">
          <Button onClick={copy}>
            {copied ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} />}
            {copied ? 'Copié' : 'Copier'}
          </Button>
          <Button variant="primary" onClick={() => downloadText(filename, code)}>
            <Download size={15} /> Télécharger {filename.slice(filename.lastIndexOf('.'))}
          </Button>
        </div>
      </div>
      <pre className="max-h-96 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
        <code>{code}</code>
      </pre>
    </Card>
  );
}
