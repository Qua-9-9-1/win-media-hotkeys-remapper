import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { ExportFormat } from './CodePreview';
import { Button } from './ui';

type Platform = 'windows' | 'linux';

const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-cyan-200">{children}</code>
);
const Link = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
    {children}
  </a>
);

const STEPS: Record<ExportFormat, Record<Platform, Array<{ title: string; body: ReactNode }>>> = {
  kanata: {
    windows: [
      { title: 'Télécharger Kanata', body: <>Récupérez <Code>kanata.exe</Code> sur la <Link href="https://github.com/jtroo/kanata/releases">page des releases</Link>. Si votre config verrouille le PC, lance la calculatrice ou met en veille, prenez la variante <Code>kanata_cmd_allowed.exe</Code>.</> },
      { title: 'Placer le fichier', body: <>Mettez le fichier <Code>.kbd</Code> téléchargé dans le même dossier que l'exécutable.</> },
      { title: 'Lancer', body: <>Ouvrez un terminal dans ce dossier et lancez <Code>.\kanata.exe --cfg kanata-xxx.kbd</Code>. Pour un démarrage automatique, placez un raccourci de cette commande dans <Code>shell:startup</Code> (Win + R).</> },
    ],
    linux: [
      { title: 'Installer Kanata', body: <>Téléchargez le binaire sur la <Link href="https://github.com/jtroo/kanata/releases">page des releases</Link> ou lancez <Code>cargo install kanata</Code>.</> },
      { title: 'Donner les permissions', body: <>Ajoutez votre utilisateur aux groupes <Code>input</Code> et <Code>uinput</Code> et chargez le module <Code>uinput</Code> (voir le <Link href="https://github.com/jtroo/kanata/blob/main/docs/setup-linux.md">guide Linux</Link>), puis reconnectez-vous.</> },
      { title: 'Lancer', body: <>Exécutez <Code>kanata --cfg kanata-xxx.kbd</Code>. Pour un lancement au démarrage, créez un service <Code>systemd --user</Code>.</> },
    ],
  },
  ahk: {
    windows: [
      { title: 'Installer AutoHotkey v2', body: <>Téléchargez et installez la version 2 depuis <Link href="https://www.autohotkey.com/">autohotkey.com</Link>.</> },
      { title: 'Lancer le script', body: <>Double-cliquez sur le fichier <Code>.ahk</Code> téléchargé : une icône « H » verte apparaît dans la zone de notification.</> },
      { title: 'Démarrage automatique', body: <>Appuyez sur Win + R, tapez <Code>shell:startup</Code> et placez-y un raccourci vers le script.</> },
    ],
    linux: [
      { title: 'AutoHotkey est réservé à Windows', body: <>Sous Linux, utilisez l'onglet <strong>Kanata .kbd</strong> : il produit une configuration équivalente.</> },
    ],
  },
};

export function HelpModal({ format, onClose }: { format: ExportFormat; onClose: () => void }) {
  const [platform, setPlatform] = useState<Platform>('windows');
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // Guard: StrictMode runs effects twice and showModal() throws if already open.
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-slate-700 bg-slate-900 p-0 text-slate-200 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-3">
        <h2 className="font-semibold">
          Utiliser le fichier {format === 'kanata' ? 'Kanata (.kbd)' : 'AutoHotkey (.ahk)'}
        </h2>
        <Button variant="ghost" className="ml-auto px-1.5" onClick={onClose} aria-label="Fermer">
          <X size={16} />
        </Button>
      </div>
      <div className="p-5">
        <div role="tablist" className="mb-4 inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1">
          {(['windows', 'linux'] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={platform === p}
              onClick={() => setPlatform(p)}
              className={`rounded-md px-3 py-1 text-sm ${platform === p ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {p === 'windows' ? 'Windows' : 'Linux'}
            </button>
          ))}
        </div>
        <ol className="space-y-4">
          {STEPS[format][platform].map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-semibold text-cyan-300">
                {i + 1}
              </span>
              <div>
                <h3 className="font-medium text-slate-100">{s.title}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </dialog>
  );
}
