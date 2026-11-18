import { useState } from 'react';
import { Keyboard, Laptop, Usb } from 'lucide-react';
import type { KeyboardProfile, LayoutId } from '../types/keyboard';
import { KEYBOARDS } from '../data/keyboards';
import { LAYOUT_IDS, LAYOUT_NAMES } from '../core/layouts';
import { detectWithWebHid, formatHidId, isWebHidSupported, type DetectedOs } from '../core/detection';
import { Badge, Button, selectClass } from './ui';

const OS_NAMES: Record<DetectedOs, string> = {
  windows: 'Windows',
  linux: 'Linux',
  macos: 'macOS',
  unknown: 'OS inconnu',
};

export type LayoutSource = 'api' | 'keystroke' | 'language';

const SOURCE_LABELS: Record<LayoutSource, string> = {
  api: 'détectée',
  keystroke: 'détectée à la frappe',
  language: "d'après la région, tapez une lettre pour confirmer",
};

export function DetectionBar({ os, detectedLayout, layoutSource, layoutSetting, onLayout, profile, onProfile }: {
  os: DetectedOs;
  detectedLayout: LayoutId;
  layoutSource: LayoutSource;
  layoutSetting: LayoutId | 'auto';
  onLayout: (layout: LayoutId | 'auto') => void;
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

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>
          <Laptop size={12} /> {OS_NAMES[os]}
        </Badge>
        <Badge tone={layoutSource === 'language' ? 'slate' : 'emerald'}>
          <Keyboard size={12} /> {LAYOUT_NAMES[detectedLayout]}
          <span className="font-normal opacity-70">({SOURCE_LABELS[layoutSource]})</span>
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Disposition :
          <select
            className={selectClass}
            value={layoutSetting}
            onChange={(e) => onLayout(e.target.value as LayoutId | 'auto')}
          >
            <option value="auto">Auto · {LAYOUT_NAMES[detectedLayout]}</option>
            {LAYOUT_IDS.map((id) => (
              <option key={id} value={id}>
                {LAYOUT_NAMES[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Mon clavier :
          <select className={selectClass} value={profile.id} onChange={(e) => onProfile(e.target.value)}>
            {KEYBOARDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name} · {k.standard}
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
      {hidMessage && (
        <p className={`w-full text-xs ${hidMessage.tone === 'ok' ? 'text-emerald-300' : 'text-amber-300'}`}>
          {hidMessage.text}
        </p>
      )}
    </div>
  );
}
