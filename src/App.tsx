import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Keyboard, RotateCcw } from 'lucide-react';
import type { KeyId, LayerId, LayoutId } from './types/keyboard';
import { getProfile } from './data/keyboards';
import { getAction } from './data/actions';
import { keyLegend, matchLayout } from './core/layouts';
import { detectLayoutFromApi, detectOs, guessLayoutFromLanguage } from './core/detection';
import { configReducer, hasSavedConfig, initialConfig, loadConfig, saveConfig } from './state/configReducer';
import { VirtualKeyboard } from './components/keyboard/VirtualKeyboard';
import { LayerTabs, Legend } from './components/LayerTabs';
import { KeyInspector } from './components/KeyInspector';
import { FnSettings } from './components/FnSettings';
import { ActionLibrary } from './components/ActionLibrary';
import { MigrationPanel } from './components/MigrationPanel';
import { CodePreview, type ExportFormat } from './components/CodePreview';
import { HelpModal } from './components/HelpModal';
import { DetectionBar, type LayoutSource } from './components/DetectionBar';
import { NativeShortcuts } from './components/NativeShortcuts';
import { Button } from './components/ui';
import { KEY_CODES } from './core/keycodes';

const detectedOs = detectOs();
const defaultTargetOs = detectedOs === 'linux' ? 'linux' : 'windows';

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

export default function App() {
  const [isFirstVisit] = useState(() => !hasSavedConfig());
  const [config, dispatch] = useReducer(configReducer, defaultTargetOs, loadConfig);
  const [layer, setLayer] = useState<LayerId>('base');
  const [selectedKey, setSelectedKey] = useState<KeyId | null>(null);
  const [pressed, setPressed] = useState<ReadonlySet<KeyId>>(new Set());
  const [detectedLayout, setDetectedLayout] = useState<LayoutId>(guessLayoutFromLanguage);
  const [layoutSource, setLayoutSource] = useState<LayoutSource>('language');
  const [help, setHelp] = useState<ExportFormat | null>(null);
  const layoutSourceRef = useRef(layoutSource);
  layoutSourceRef.current = layoutSource;

  const profile = getProfile(config.profileId);
  const layout = config.layout === 'auto' ? detectedLayout : config.layout;

  useEffect(() => saveConfig(config), [config]);

  // Layout detection through the Keyboard Map API, when available.
  useEffect(() => {
    detectLayoutFromApi(guessLayoutFromLanguage()).then((l) => {
      if (!l) return;
      setDetectedLayout(l);
      setLayoutSource('api');
      // US users usually have an ANSI keyboard (no key next to left Shift).
      if (isFirstVisit && l === 'us-qwerty') dispatch({ type: 'setProfile', profileId: 'generic-ansi-us' });
    });
  }, [isFirstVisit]);

  // Physical keystrokes: live highlight, key selection, layout detection fallback.
  useEffect(() => {
    const observed = new Map<string, string>();
    const preferred = guessLayoutFromLanguage();
    const down = (e: KeyboardEvent) => {
      // Learn from typed characters (ignoring Ctrl/Alt combos) until the API answered.
      if (layoutSourceRef.current !== 'api' && !e.ctrlKey && !e.altKey && !e.metaKey && Array.from(e.key).length === 1) {
        observed.set(e.code, e.key);
        const l = matchLayout(observed, preferred);
        if (l) {
          setDetectedLayout(l);
          setLayoutSource('keystroke');
        }
      }
      if (!KEY_CODES[e.code]) return;
      setPressed((p) => new Set(p).add(e.code));
      if (!isTyping(e.target) && !e.repeat) setSelectedKey(e.code);
    };
    const up = (e: KeyboardEvent) =>
      setPressed((p) => {
        const n = new Set(p);
        n.delete(e.code);
        return n;
      });
    const reset = () => setPressed(new Set());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', reset);
    };
  }, []);

  const counts = useMemo(
    () => ({
      base: Object.keys(config.layers.base).length,
      fn: Object.keys(config.layers.fn).length,
    }),
    [config.layers],
  );

  const selected = profile.keys.find((k) => k.id === selectedKey);
  const canAssign = !!selected && !selected.hardwareOnly && selected.id !== config.fnTrigger;
  const targetLabel = selected
    ? `${layer === 'fn' ? 'Fn + ' : ''}${keyLegend(selected.id, layout).main || 'Espace'}`
    : '';

  const assign = (key: KeyId, actionId: string) => {
    dispatch({ type: 'assign', layer, key, actionId });
    setSelectedKey(key);
  };

  const fnHint = config.fnTrigger
    ? `Fn virtuelle : ${KEY_CODES[config.fnTrigger]?.label ?? config.fnTrigger} (maintenir)`
    : profile.nativeShortcuts.length > 0
      ? 'Les raccourcis natifs du clavier sont affichés en ambre.'
      : 'Aucune touche Fn virtuelle définie.';

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
      <header className="mb-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
            <Keyboard size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Keyboard Remapper</h1>
            <p className="text-xs text-slate-400">
              Recréez vos raccourcis sur n'importe quel clavier · export Kanata & AutoHotkey v2 · 100 % dans le navigateur
            </p>
          </div>
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => {
              if (confirm('Effacer toute la configuration ?')) {
                dispatch({ type: 'replace', config: { ...initialConfig(config.targetOs), profileId: config.profileId } });
                setSelectedKey(null);
              }
            }}
          >
            <RotateCcw size={15} /> Réinitialiser
          </Button>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <DetectionBar
            os={detectedOs}
            detectedLayout={detectedLayout}
            layoutSource={layoutSource}
            layoutSetting={config.layout}
            onLayout={(l) => dispatch({ type: 'setLayout', layout: l })}
            profile={profile}
            onProfile={(id) => {
              dispatch({ type: 'setProfile', profileId: id });
              setSelectedKey(null);
            }}
          />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-5">
          <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <LayerTabs layer={layer} onChange={setLayer} counts={counts} fnHint={fnHint} />
            <VirtualKeyboard
              profile={profile}
              layout={layout}
              config={config}
              layer={layer}
              selectedKey={selectedKey}
              pressedKeys={pressed}
              onSelect={(k) => setSelectedKey((s) => (s === k ? null : k))}
              onAssign={assign}
            />
            <Legend />
            <NativeShortcuts
              profile={profile}
              layout={layout}
              onShow={(l, key) => {
                setLayer(l);
                setSelectedKey(key);
              }}
            />
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <KeyInspector
              profile={profile}
              layout={layout}
              config={config}
              layer={layer}
              selectedKey={selectedKey}
              onClear={(key) => dispatch({ type: 'clear', layer, key })}
              onSetFnTrigger={(key) => {
                dispatch({ type: 'setFnTrigger', key });
                if (key) setLayer('fn');
              }}
              onDeselect={() => setSelectedKey(null)}
            />
            <FnSettings
              profile={profile}
              config={config}
              onSetTrigger={(key) => dispatch({ type: 'setFnTrigger', key })}
              onSetPassthrough={(value) => dispatch({ type: 'setFnTapPassthrough', value })}
            />
          </div>

          <CodePreview
            profile={profile}
            config={config}
            onTargetOs={(os) => dispatch({ type: 'setTargetOs', os })}
            onHelp={setHelp}
          />
        </main>

        <aside className="space-y-5">
          <ActionLibrary
            canAssign={canAssign}
            targetLabel={targetLabel}
            onPick={(id) => {
              if (selectedKey && getAction(id)) assign(selectedKey, id);
            }}
          />
          <MigrationPanel
            profile={profile}
            layout={layout}
            config={config}
            onApply={(c) => {
              dispatch({ type: 'replace', config: c });
              setLayer('fn');
            }}
          />
        </aside>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-500">
        Aucune donnée ne quitte votre navigateur. Configuration sauvegardée localement.
      </footer>

      {help && <HelpModal format={help} onClose={() => setHelp(null)} />}
    </div>
  );
}
