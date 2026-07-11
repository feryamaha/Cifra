'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { TUNING_LIST, TUNINGS } from '@/data/music/tunings.data';
import { detectPitch, frequencyToNote } from '@/lib/tools/pitch-detect';

const SMOOTH_SIZE = 8;

export function Tuner() {
  const [active, setActive] = useState(false);
  const [note, setNote] = useState<string>('--');
  const [cents, setCents] = useState(0);
  const [hz, setHz] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [tuningId, setTuningId] = useState('standard');
  const [targetString, setTargetString] = useState<number | null>(null);
  const raf = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const smoothBufRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
      const tracks = streamRef.current?.getTracks() ?? [];
      for (const t of tracks) t.stop();
      void ctxRef.current?.close();
    };
  }, []);

  const start = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      smoothBufRef.current = [];
      setActive(true);

      const tick = () => {
        analyser.getFloatTimeDomainData(buf);
        const pitch = detectPitch(buf, ctx.sampleRate);
        if (pitch && pitch > 50 && pitch < 1500) {
          const sb = smoothBufRef.current;
          sb.push(pitch);
          if (sb.length > SMOOTH_SIZE) sb.shift();
          const avg = sb.reduce((a, b) => a + b, 0) / sb.length;
          const n = frequencyToNote(avg);
          setNote(`${n.name}${n.octave}`);
          setCents(n.cents);
          setHz(Math.round(avg * 10) / 10);
        }
        raf.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setError('Microfone negado ou indisponivel. Permita o acesso no navegador.');
      setActive(false);
    }
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const tracks = streamRef.current?.getTracks() ?? [];
    for (const t of tracks) t.stop();
    streamRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    setActive(false);
    setNote('--');
    setCents(0);
    setHz(null);
  }, []);

  const tuning = TUNINGS[tuningId] ?? TUNINGS.standard;

  const centsPercent = Math.min(100, Math.max(0, 50 + cents / 2));
  const isTuned = Math.abs(cents) < 5;
  const barColor = isTuned ? 'bg-green-500' : 'bg-red-400';

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <div className="rounded-lg bg-secondary-800 p-3 text-xs text-neutral-500">
        <p className="font-semibold text-neutral-400">Como usar:</p>
        <ol className="mt-1 list-inside list-decimal space-y-0.5">
          <li>Permita o acesso ao microfone</li>
          <li>Toque uma corda do seu instrumento</li>
          <li>Ajuste ate o indicador ficar no centro verde</li>
        </ol>
      </div>

      <label className="block text-xs text-neutral-500">
        Afinacao de referencia
        <select
          value={tuningId}
          onChange={(e) => setTuningId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2 text-sm"
        >
          {TUNING_LIST.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap justify-center gap-1.5">
        {tuning.stringNames.map((n, i) => (
          <button
            key={`str-${i}`}
            type="button"
            onClick={() => setTargetString(i)}
            className={`rounded border px-2 py-1 text-xs ${targetString === i ? 'border-primary-500 text-primary-300' : 'border-stroke-200 text-neutral-500'}`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="text-center">
        <p className="font-chakra text-5xl font-bold text-primary-400">{note}</p>
        <p className="mt-2 text-sm text-neutral-600">
          {hz != null ? `${hz} Hz` : '--'} · {cents > 0 ? `+${cents}` : cents} cents
        </p>
        <div className="mx-auto mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-secondary-800">
          <div
            className={`h-full transition-all duration-150 ${barColor}`}
            style={{ width: `${centsPercent}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-neutral-500">
          {isTuned ? 'Afinado' : cents < -5 ? 'Grave' : cents > 5 ? 'Agudo' : 'Afinado'}
        </p>
      </div>

      {error && <p className="text-center text-sm text-auxiliary-danger-default">{error}</p>}

      <button
        type="button"
        onClick={() => (active ? stop() : start())}
        className="w-full rounded-xl bg-primary-400 py-2.5 text-sm font-semibold text-secondary-950"
      >
        {active ? 'Parar' : 'Iniciar microfone'}
      </button>
    </Card>
  );
}
