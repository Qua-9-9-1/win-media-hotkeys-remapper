import { Info, MousePointerClick, Sparkles, Trash2, X } from 'lucide-react';
import type { RemapConfig } from '../types/config';
import type { KeyboardProfile, KeyId, LayerId, LayoutId } from '../types/keyboard';
import { getAction } from '../data/actions';
import { keyLegend } from '../core/layouts';
import { KEY_CODES } from '../core/keycodes';
import { Badge, Button, Card } from './ui';

export function KeyInspector({ profile, layout, config, layer, selectedKey, onClear, onSetFnTrigger, onDeselect }: {
  profile: KeyboardProfile;
  layout: LayoutId;
  config: RemapConfig;
  layer: LayerId;
  selectedKey: KeyId | null;
  onClear: (key: KeyId) => void;
  onSetFnTrigger: (key: KeyId | null) => void;
  onDeselect: () => void;
}) {
  if (!selectedKey) {
    return (
      <Card title="Touche sélectionnée" icon={<MousePointerClick size={16} />}>
        <p className="text-sm text-slate-400">
          Cliquez sur une touche du clavier virtuel (ou appuyez sur une touche de votre clavier
          physique), puis choisissez une action dans la bibliothèque. Vous pouvez aussi glisser
          une action directement sur une touche.
        </p>
      </Card>
    );
  }

  const key = profile.keys.find((k) => k.id === selectedKey);
  const legend = keyLegend(selectedKey, layout);
  const custom = getAction(config.layers[layer][selectedKey]);
  const native = getAction(
    profile.nativeShortcuts.find((s) => s.layer === layer && s.key === selectedKey)?.action,
  );
  const isTrigger = config.fnTrigger === selectedKey;
  const layerName = layer === 'base' ? 'couche principale' : 'couche Fn';

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          Touche <kbd className="rounded border border-slate-600 bg-slate-800 px-1.5 font-mono text-xs">{legend.main || 'Espace'}</kbd>
          <span className="font-mono text-xs font-normal text-slate-500">{selectedKey}</span>
        </span>
      }
      actions={
        <Button variant="ghost" className="px-1.5" onClick={onDeselect} aria-label="Désélectionner">
          <X size={15} />
        </Button>
      }
    >
      <div className="space-y-3 text-sm">
        {key?.hardwareOnly ? (
          <p className="flex gap-2 text-amber-200">
            <Info size={16} className="mt-0.5 shrink-0" />
            Touche Fn matérielle : elle est gérée directement par le clavier et n'est jamais vue
            par le système. Elle ne peut pas être remappée, mais ses raccourcis natifs sont visibles
            dans l'onglet « Couche Fn ».
          </p>
        ) : (
          <>
            {isTrigger && (
              <p className="flex items-center gap-2 text-violet-200">
                <Sparkles size={16} /> Cette touche est votre <strong>Fn virtuelle</strong>.
              </p>
            )}
            {native && (
              <div className="flex items-center gap-2">
                <Badge tone="amber">Natif</Badge>
                <native.icon size={15} className="text-amber-300" />
                <span>{native.label}</span>
                <span className="text-xs text-slate-500">(via la touche Fn matérielle)</span>
              </div>
            )}
            {custom ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="cyan">Personnalisé</Badge>
                <custom.icon size={15} className="text-cyan-300" />
                <span>{custom.label}</span>
                <Button variant="danger" className="ml-auto" onClick={() => onClear(selectedKey)}>
                  <Trash2 size={14} /> Retirer
                </Button>
              </div>
            ) : (
              !isTrigger && (
                <p className="text-slate-400">
                  Aucune action personnalisée sur la {layerName}. Choisissez-en une dans la
                  bibliothèque à droite.
                </p>
              )
            )}
            {layer === 'fn' && !config.fnTrigger && (
              <p className="text-xs text-amber-300">
                Définissez une touche Fn virtuelle pour que les raccourcis de cette couche soient exportés.
              </p>
            )}
            <div className="border-t border-slate-800 pt-3">
              {isTrigger ? (
                <Button onClick={() => onSetFnTrigger(null)}>Ne plus utiliser comme Fn virtuelle</Button>
              ) : (
                <Button onClick={() => onSetFnTrigger(selectedKey)}>
                  <Sparkles size={14} /> Utiliser « {KEY_CODES[selectedKey]?.label ?? legend.main} » comme Fn virtuelle
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
