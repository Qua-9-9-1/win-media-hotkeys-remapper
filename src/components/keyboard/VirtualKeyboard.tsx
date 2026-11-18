import { useEffect, useRef, useState } from 'react';
import type { RemapConfig } from '../../types/config';
import type { KeyboardProfile, KeyId, LayerId } from '../../types/keyboard';
import { getAction } from '../../data/actions';
import { keyLegend } from '../../core/layouts';
import { KeyCap } from './KeyCap';

/** Unit size (px) adapted to the available width. */
function useUnit(widthInUnits: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [unit, setUnit] = useState(40);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const u = Math.floor(entry.contentRect.width / widthInUnits);
      setUnit(Math.min(56, Math.max(26, u)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [widthInUnits]);
  return { ref, unit };
}

export function VirtualKeyboard({ profile, config, layer, selectedKey, pressedKeys, onSelect, onAssign }: {
  profile: KeyboardProfile;
  config: RemapConfig;
  layer: LayerId;
  selectedKey: KeyId | null;
  pressedKeys: ReadonlySet<KeyId>;
  onSelect: (key: KeyId) => void;
  onAssign: (key: KeyId, actionId: string) => void;
}) {
  const { ref, unit } = useUnit(profile.width + 0.5);
  const natives = new Map(
    profile.nativeShortcuts.filter((s) => s.layer === layer).map((s) => [s.key, getAction(s.action)]),
  );

  return (
    <div ref={ref} className="w-full overflow-x-auto pb-1">
      <div
        className="relative mx-auto rounded-2xl bg-slate-950/80 ring-1 ring-slate-800"
        style={{
          width: profile.width * unit + unit * 0.5,
          height: profile.height * unit + unit * 0.5,
          padding: unit * 0.25,
        }}
      >
        <div className="relative" style={{ width: profile.width * unit, height: profile.height * unit }}>
          {profile.keys.map((k) => (
            <KeyCap
              key={k.id}
              k={k}
              unit={unit}
              state={{
                legend: keyLegend(k.id, profile.layout),
                custom: getAction(config.layers[layer][k.id]),
                native: natives.get(k.id) ?? undefined,
                isFnTrigger: config.fnTrigger === k.id,
                fnLayer: layer === 'fn',
                selected: selectedKey === k.id,
                pressed: pressedKeys.has(k.id),
              }}
              onSelect={() => onSelect(k.id)}
              onDropAction={(id) => onAssign(k.id, id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
