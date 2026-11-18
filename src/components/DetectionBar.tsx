import { useState } from 'react';
import { Keyboard, Laptop, Usb } from 'lucide-react';
import type { KeyboardProfile, LayoutId } from '../types/keyboard';
import { KEYBOARDS } from '../data/keyboards';
import { LAYOUT_NAMES } from '../core/layouts';
import { detectWithWebHid, formatHidId, isWebHidSupported, type DetectedOs } from '../core/detection';
import { Badge, Button, selectClass } from './ui';

const OS_NAMES: Record<DetectedOs, string> = {
  windows: 'Windows',
  linux: 'Linux',
  macos: 'macOS',
  unknown: 'OS inconnu',
};

export function DetectionBar({ os, layout, layoutSource, profile, onProfile }: {
  os: DetectedOs;
  layout: LayoutId;
  layoutSource: 'api' | 'keystroke' | 'language';
  profile: KeyboardProfile;
  onProfile: (id: string) => void;
}) {
  const [hidMessage, setHidMessage] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const runHid = async () => {
    setBusy(true);
    const r = await detectWithWebHid(KEYBOARDS);
    setBusy(false);
    switch (r.status) {
      case 'matched':
        onProfile(r.profile.id);
        setHidMessage({ tone: 'ok', text: `Détecté : ${r.profile.name} (${formatHidId(r.device)})` });
        break;
      case 'unknown':
        setHidMessage({
          tone: 'warn',
          text: `« ${r.device.productName || 'Périphérique'} » (${formatHidId(r.device)}) n'est pas encore dans la base : choisissez le modèle le plus proche.`,
        });
        break;
      case 'cancelled':
        setHidMessage(null);
        break;
      case 'unsupported':
        setHidMessage({ tone: 'warn', text: 'WebHID non disponible dans ce navigateur : sélectionnez votre modèle.' });
        break;
      case 'error':
        setHidMessage({ tone: 'warn', text: `Détection impossible (${r.message}) : sélectionnez votre modèle.` });
        break;
    }
  };

  const mismatch = layout !== profile.layout && layoutSource !== 'language';

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>
          <Laptop size={12} /> {OS_NAMES[os]}
        </Badge>
        <Badge tone={layoutSource === 'language' ? 'slate' : 'emerald'}>
          <Keyboard size={12} /> {LAYOUT_NAMES[layout]}
          <span className="font-normal opacity-70">
            {layoutSource === 'language' ? '(supposée, tapez une lettre pour confirmer)' : '(détectée)'}
          </span>
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Mon clavier :
          <select className={selectClass} value={profile.id} onChange={(e) => onProfile(e.target.value)}>
            {KEYBOARDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name} · {k.standard} {LAYOUT_NAMES[k.layout]}
              </option>
            ))}
          </select>
        </label>
        <Button
          onClick={runHid}
          disabled={busy || !isWebHidSupported()}
          title={isWebHidSupported() ? 'Identifier le clavier via WebHID' : 'WebHID non supporté (Chrome/Edge requis)'}
        >
          <Usb size={15} /> {busy ? 'Détection…' : 'Détecter (USB)'}
        </Button>
      </div>
      {(hidMessage || mismatch) && (
        <div className="w-full space-y-1 text-xs">
          {hidMessage && (
            <p className={hidMessage.tone === 'ok' ? 'text-emerald-300' : 'text-amber-300'}>{hidMessage.text}</p>
          )}
          {mismatch && (
            <p className="text-amber-300">
              Votre système est en {LAYOUT_NAMES[layout]} mais le modèle sélectionné est imprimé en{' '}
              {LAYOUT_NAMES[profile.layout]}. Les remappages restent valides (ils visent des positions physiques).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
