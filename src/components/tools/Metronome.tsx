'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { MetronomeEngine, type Subdivision } from '@/lib/tools/metronome-engine';

const TIME_SIGS = [
  { beats: 2, label: '2/4' },
  { beats: 3, label: '3/4' },
  { beats: 4, label: '4/4' },
  { beats: 5, label: '5/4' },
  { beats: 6, label: '6/8' },
  { beats: 7, label: '7/8' },
];

const SUBDIVISIONS: { value: Subdivision; label: string }[] = [
  { value: 'quarter', label: 'Semiminima' },
  { value: 'eighth', label: 'Colcheia' },
  { value: 'sixteenth', label: 'Semicolcheia' },
  { value: 'triplet', label: 'Triole' },
];

const TEMPO_PRESETS = [
  { label: 'Largo', bpm: 50 },
  { label: 'Adagio', bpm: 72 },
  { label: 'Andante', bpm: 92 },
  { label: 'Moderato', bpm: 114 },
  { label: 'Allegro', bpm: 144 },
  { label: 'Presto', bpm: 184 },
  { label: 'Prestissimo', bpm: 220 },
];

const STORAGE_KEY = 'cifratom-metronome';

interface SavedConfig {
  bpm: number;
  beats: number;
  volume: number;
  subdivision: Subdivision;
}

function loadConfig(): SavedConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedConfig;
  } catch {
    return null;
  }
}

function saveConfig(cfg: SavedConfig) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}

export function Metronome() {
  const saved = loadConfig();
  const [bpm, setBpm] = useState(saved?.bpm ?? 100);
  const [beats, setBeats] = useState(saved?.beats ?? 4);
  const [volume, setVolume] = useState(saved?.volume ?? 0.7);
  const [muted, setMuted] = useState(false);
  const [subdivision, setSubdivision] = useState<Subdivision>(saved?.subdivision ?? 'quarter');
  const [running, setRunning] = useState(false);
  const [activeBeat, setActiveBeat] = useState(-1);
  const engine = useRef<MetronomeEngine | null>(null);
  const beatDisplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initRef = useRef({ bpm, beats, volume, subdivision });

  useEffect(() => {
    const init = initRef.current;
    engine.current = new MetronomeEngine(init.bpm, init.beats);
    engine.current.setVolume(init.volume);
    engine.current.setSubdivision(init.subdivision);
    return () => {
      engine.current?.destroy();
      if (beatDisplayRef.current) clearInterval(beatDisplayRef.current);
    };
  }, []);

  useEffect(() => {
    engine.current?.setBpm(bpm);
    saveConfig({ bpm, beats, volume, subdivision });
  }, [bpm, beats, volume, subdivision]);

  useEffect(() => {
    engine.current?.setBeatsPerBar(beats);
  }, [beats]);

  useEffect(() => {
    engine.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    engine.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    engine.current?.setSubdivision(subdivision);
  }, [subdivision]);

  const toggle = useCallback(async () => {
    if (!engine.current) return;
    if (running) {
      engine.current.stop();
      setRunning(false);
      setActiveBeat(-1);
      if (beatDisplayRef.current) {
        clearInterval(beatDisplayRef.current);
        beatDisplayRef.current = null;
      }
    } else {
      await engine.current.start();
      setRunning(true);
      beatDisplayRef.current = setInterval(() => {
        setActiveBeat(engine.current?.currentBeat ?? -1);
      }, 50);
    }
  }, [running]);

  const handleTap = useCallback(() => {
    if (!engine.current) return;
    const result = engine.current.tapTempo();
    if (result !== null) setBpm(result);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleTap();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setBpm((b) => Math.min(240, b + (e.shiftKey ? 10 : 1)));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setBpm((b) => Math.max(40, b - (e.shiftKey ? 10 : 1)));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, handleTap]);

  return (
    <Card className="mx-auto max-w-md space-y-6 p-6">
      <div className="text-center">
        <p className="font-mono text-xs uppercase text-neutral-500">BPM</p>
        <p className="font-chakra text-5xl font-bold text-primary-400">{bpm}</p>
      </div>

      <div className="flex justify-center gap-1.5 flex-wrap">
        {TEMPO_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setBpm(p.bpm)}
            className="rounded border border-stroke-200 px-2 py-0.5 text-[10px] text-neutral-500 hover:border-primary-400 hover:text-primary-300"
          >
            {p.label}
          </button>
        ))}
      </div>

      <input
        type="range"
        min={40}
        max={240}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className="w-full accent-primary-400"
        aria-label="BPM"
      />

      <div className="flex justify-center gap-2 flex-wrap">
        {TIME_SIGS.map((ts) => (
          <button
            key={ts.label}
            type="button"
            onClick={() => setBeats(ts.beats)}
            className={`rounded-lg border px-3 py-1 text-xs ${beats === ts.beats ? 'border-primary-500 text-primary-300' : 'border-stroke-200'}`}
          >
            {ts.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2 flex-wrap">
        {SUBDIVISIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSubdivision(s.value)}
            className={`rounded-lg border px-3 py-1 text-xs ${subdivision === s.value ? 'border-primary-500 text-primary-300' : 'border-stroke-200'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-1">
        {Array.from({ length: beats }).map((_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full transition-colors duration-100 ${
              activeBeat === i
                ? i === 0
                  ? 'bg-primary-400 scale-125'
                  : 'bg-primary-300'
                : 'bg-secondary-800'
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setBpm((b) => Math.max(40, b - 1))}
          className="rounded-lg border border-stroke-200 px-3 py-2 text-sm"
        >
          -1
        </button>
        <button
          type="button"
          onClick={toggle}
          className="rounded-xl bg-primary-400 px-8 py-2.5 text-sm font-semibold text-secondary-950"
        >
          {running ? 'Parar' : 'Iniciar'}
        </button>
        <button
          type="button"
          onClick={() => setBpm((b) => Math.min(240, b + 1))}
          className="rounded-lg border border-stroke-200 px-3 py-2 text-sm"
        >
          +1
        </button>
        <button
          type="button"
          onClick={handleTap}
          className="rounded-lg border border-stroke-200 px-3 py-2 text-sm"
        >
          Tap
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="rounded-lg border border-stroke-200 px-2 py-1 text-xs"
        >
          {muted ? 'Som' : 'Mudo'}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          className="flex-1 accent-primary-400"
          aria-label="Volume"
        />
      </div>

      <p className="text-center text-[10px] text-neutral-500">
        Espaco: play/stop · T: tap · Setas: BPM · Shift+Setas: +/-10
      </p>
    </Card>
  );
}
