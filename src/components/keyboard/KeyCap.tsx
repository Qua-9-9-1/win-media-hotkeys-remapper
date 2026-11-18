import { useState, type DragEvent } from 'react';
import type { ActionDefinition } from '../../types/actions';
import type { PhysicalKey } from '../../types/keyboard';
import type { KeyLegend } from '../../core/layouts';

export const ACTION_DRAG_TYPE = 'application/x-remapper-action';

export interface KeyCapState {
  legend: KeyLegend;
  /** Custom action assigned by the user on the active layer. */
  custom?: ActionDefinition;
  /** Native (firmware) shortcut on the active layer. */
  native?: ActionDefinition;
  /** On the base layer: native Fn shortcut, printed as a small secondary legend. */
  nativeFn?: ActionDefinition;
  isFnTrigger: boolean;
  /** Active layer is Fn: keys without anything are dimmed. */
  fnLayer: boolean;
  selected: boolean;
  pressed: boolean;
}

const ISO_ENTER_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 16.67% 100%, 16.67% 50%, 0 50%)';

export function KeyCap({ k, unit, state, onSelect, onDropAction }: {
  k: PhysicalKey;
  unit: number;
  state: KeyCapState;
  onSelect: () => void;
  onDropAction: (actionId: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const gap = Math.max(2, unit * 0.08);
  const shown = state.custom ?? state.native;
  const Icon = shown?.icon;
  const fontSize = Math.max(8, unit * 0.24);

  let tone: string;
  if (k.hardwareOnly) {
    tone = 'border-amber-500/50 bg-amber-500/10 text-amber-300 border-dashed';
  } else if (state.isFnTrigger) {
    tone = 'border-violet-400 bg-violet-500/25 text-violet-100';
  } else if (state.custom) {
    tone = 'border-cyan-400/80 bg-cyan-500/15 text-cyan-100';
  } else if (state.native) {
    tone = 'border-amber-400/70 bg-amber-500/10 text-amber-200';
  } else if (state.fnLayer) {
    tone = 'border-slate-800 bg-slate-900 text-slate-600';
  } else {
    tone = 'border-slate-700 bg-slate-800 text-slate-300';
  }

  const ring = state.selected
    ? 'ring-2 ring-white/90 z-10'
    : dragOver
      ? 'ring-2 ring-cyan-300 z-10'
      : '';
  const pressed = state.pressed ? 'translate-y-px brightness-150' : '';

  const allowDrop = !k.hardwareOnly && !state.isFnTrigger;
  const onDragOver = (e: DragEvent) => {
    if (!allowDrop || !e.dataTransfer.types.includes(ACTION_DRAG_TYPE)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };
  const onDrop = (e: DragEvent) => {
    setDragOver(false);
    const id = e.dataTransfer.getData(ACTION_DRAG_TYPE);
    if (id && allowDrop) {
      e.preventDefault();
      onDropAction(id);
    }
  };

  const title = [
    state.legend.main || k.id,
    k.hardwareOnly && 'Touche Fn matérielle (gérée par le clavier, non remappable)',
    state.isFnTrigger && 'Touche Fn virtuelle',
    state.custom && `Personnalisé : ${state.custom.label}`,
    state.native && `Natif : ${state.native.label}`,
    state.nativeFn && `Natif avec Fn : ${state.nativeFn.label}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={state.selected}
      onClick={onSelect}
      onDragOver={onDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`absolute flex flex-col overflow-hidden rounded-md border text-left leading-tight shadow-sm shadow-black/40 transition-[transform,filter,box-shadow] duration-75 hover:brightness-125 focus-visible:outline-2 focus-visible:outline-cyan-300 ${tone} ${ring} ${pressed}`}
      style={{
        left: k.x * unit,
        top: k.y * unit,
        width: k.w * unit - gap,
        height: k.h * unit - gap,
        clipPath: k.shape === 'iso-enter' ? ISO_ENTER_CLIP : undefined,
        borderRadius: k.shape === 'iso-enter' ? 4 : undefined,
        fontSize,
        padding: Math.max(2, unit * 0.08),
      }}
    >
      {shown && Icon ? (
        <>
          <span className="truncate opacity-60" style={{ fontSize: fontSize * 0.85 }}>
            {state.legend.main}
          </span>
          <span className="mt-auto flex min-w-0 flex-col items-center gap-0.5 self-center">
            <Icon size={Math.max(10, unit * 0.32)} strokeWidth={2.2} />
            {unit >= 34 && <span className="truncate font-semibold">{shown.short}</span>}
          </span>
          {state.custom && state.native && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" title="Le raccourci natif reste disponible avec la touche Fn matérielle" />
          )}
        </>
      ) : (
        <>
          {state.legend.shifted && <span className="opacity-60">{state.legend.shifted}</span>}
          <span className={state.legend.main.length <= 2 ? 'font-medium' : ''}>
            {state.isFnTrigger ? (
              <span className="font-bold">Fn ✦</span>
            ) : (
              state.legend.main
            )}
          </span>
          {state.isFnTrigger && <span className="mt-auto truncate opacity-70">{state.legend.main}</span>}
        </>
      )}
      {state.nativeFn && !state.custom && (
        <state.nativeFn.icon
          size={Math.max(9, unit * 0.26)}
          strokeWidth={2.2}
          className="absolute right-[12%] bottom-[12%] text-amber-400"
          aria-hidden
        />
      )}
    </button>
  );
}
