'use client';

/**
 * Afinador (SPEC_010 rodada 4): medidor de ARCO semicircular, padrão dos
 * afinadores web/clip-on. Segmentos acendem do centro para ♭ (grave, esquerda)
 * ou ♯ (agudo, direita); tudo verde no centro = afinado (|cents| <= 5).
 * Precisão numérica em cents visível. Motor de detecção: autocorrelação com
 * suavização (SPEC_007 C1), inalterado.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { TUNING_LIST, TUNINGS } from '@/data/music/tunings.data';
import { createPitchEngine, frequencyToNote, type PitchEngine } from '@/lib/tools/pitch-detect';

const FFT_SIZE = 2048;
const SMOOTH_SIZE = 6; // mediana das últimas N leituras aceitas
const SEGMENTS = 21; // -50..+50 cents, 5 cents por segmento
const IN_TUNE_CENTS = 5;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function GaugeArc({ cents, hasSignal }: { cents: number; hasSignal: boolean }) {
  const cx = 160;
  const cy = 150;
  const rInner = 100;
  const rOuter = 128;
  const center = (SEGMENTS - 1) / 2;
  const clamped = Math.max(-50, Math.min(50, cents));
  const activeIdx = Math.round(((clamped + 50) / 100) * (SEGMENTS - 1));
  const inTune = hasSignal && Math.abs(clamped) <= IN_TUNE_CENTS;

  const segs = Array.from({ length: SEGMENTS }, (_, i) => {
    const angle = Math.PI - (i / (SEGMENTS - 1)) * Math.PI; // 180° → 0°
    const x1 = cx + rInner * Math.cos(angle);
    const y1 = cy - rInner * Math.sin(angle);
    const x2 = cx + rOuter * Math.cos(angle);
    const y2 = cy - rOuter * Math.sin(angle);
    const lit =
      hasSignal &&
      (i === center ||
        (activeIdx > center && i > center && i <= activeIdx) ||
        (activeIdx < center && i < center && i >= activeIdx));
    const color = !lit
      ? 'var(--gauge-off, #3a3632)'
      : inTune
        ? 'var(--gauge-ok, #4ade80)'
        : Math.abs(i - center) > 6
          ? 'var(--gauge-far, #f08a7a)'
          : 'var(--gauge-near, #f2ab3c)';
    return { x1, y1, x2, y2, color, key: i };
  });

  return (
    <svg
      viewBox="0 0 320 170"
      className="mx-auto w-full max-w-sm"
      role="img"
      aria-label={
        hasSignal
          ? inTune
            ? 'Afinado'
            : clamped < 0
              ? `${Math.abs(Math.round(clamped))} cents abaixo (grave)`
              : `${Math.round(clamped)} cents acima (agudo)`
          : 'Sem sinal'
      }
    >
      {/* marcador central (alvo) */}
      <polygon
        points="160,4 152,16 168,16"
        fill={inTune ? 'var(--gauge-ok, #4ade80)' : 'var(--gauge-off, #6b6560)'}
      />
      {segs.map((s) => (
        <line
          key={s.key}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={s.color}
          strokeWidth={9}
          strokeLinecap="round"
        />
      ))}
      <text x="24" y="140" fill="#8a8378" fontSize="26" fontFamily="serif">
        ♭
      </text>
      <text x="284" y="140" fill="#8a8378" fontSize="26" fontFamily="serif">
        ♯
      </text>
    </svg>
  );
}

export function Tuner() {
  const [active, setActive] = useState(false);
  const [note, setNote] = useState<string>('');
  const [cents, setCents] = useState(0);
  const [hz, setHz] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [hasSignal, setHasSignal] = useState(false);
  const [error, setError] = useState('');
  const [tuningId, setTuningId] = useState('standard');
  const [targetString, setTargetString] = useState<number | null>(null);
  const raf = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const engineRef = useRef<PitchEngine | null>(null);
  const smoothBufRef = useRef<number[]>([]);
  const lastPitchAtRef = useRef(0);
  const stableMidiRef = useRef<{ midi: number; count: number }>({ midi: -1, count: 0 });

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
      analyser.fftSize = FFT_SIZE;
      source.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      engineRef.current = createPitchEngine(analyser.fftSize);
      smoothBufRef.current = [];
      stableMidiRef.current = { midi: -1, count: 0 };
      setActive(true);

      const tick = () => {
        analyser.getFloatTimeDomainData(buf);
        // nível do sinal (dots) via RMS
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        setLevel(Math.min(5, Math.floor(rms * 55)));

        const reading = engineRef.current?.detect(buf, ctx.sampleRate) ?? null;
        const now = performance.now();

        if (reading) {
          const rawNote = frequencyToNote(reading.pitch);
          // Travamento de nota: só assume a nota depois de 2 leituras seguidas
          // do mesmo semitom (evita saltar de oitava/harmônico num frame ruim).
          const st = stableMidiRef.current;
          if (rawNote.midi === st.midi) st.count += 1;
          else stableMidiRef.current = { midi: rawNote.midi, count: 1 };

          if (stableMidiRef.current.count >= 2) {
            const sb = smoothBufRef.current;
            sb.push(reading.pitch);
            if (sb.length > SMOOTH_SIZE) sb.shift();
            // mediana (não média): imune a um outlier isolado
            const med = median(sb);
            const n = frequencyToNote(med);
            lastPitchAtRef.current = now;
            setNote(`${n.name}${n.octave}`);
            setCents(n.cents);
            setHz(Math.round(med * 10) / 10);
            setHasSignal(true);
          }
        } else if (now - lastPitchAtRef.current > 500) {
          // sem pitch limpo: apaga o medidor em vez de "dançar" com ruído
          setHasSignal(false);
          smoothBufRef.current = [];
          stableMidiRef.current = { midi: -1, count: 0 };
        }
        raf.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setError('Microfone negado ou indisponível. Permita o acesso no navegador.');
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
    engineRef.current = null;
    setActive(false);
    setNote('');
    setCents(0);
    setHz(null);
    setLevel(0);
    setHasSignal(false);
  }, []);

  const tuning = TUNINGS[tuningId] ?? TUNINGS.standard;
  const inTune = hasSignal && Math.abs(cents) <= IN_TUNE_CENTS;

  return (
    <Card className="mx-auto max-w-md space-y-5 p-6">
      <div className="relative">
        <GaugeArc cents={cents} hasSignal={active && hasSignal} />
        {/* nota detectada no centro do arco */}
        <div className="pointer-events-none absolute inset-x-0 top-16 text-center">
          <p
            className={`font-chakra text-4xl font-bold ${inTune ? 'text-auxiliary-success-default' : 'text-neutral-900'}`}
          >
            {active && hasSignal ? note : '·'}
          </p>
          {active && hasSignal && (
            <p className="mt-1 font-mono text-xs tabular-nums text-neutral-500">
              {cents > 0 ? `+${cents}` : cents} cents · {hz ?? '--'} Hz
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-neutral-600" aria-live="polite">
        {!active
          ? 'Pressione o microfone para começar a afinar'
          : !hasSignal
            ? 'Toque uma corda do seu violão'
            : inTune
              ? 'Afinado!'
              : cents < 0
                ? 'Grave: aperte a corda'
                : 'Agudo: afrouxe a corda'}
      </p>

      {/* botão do microfone + nível do sinal */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => (active ? stop() : void start())}
          aria-label={active ? 'Parar microfone' : 'Iniciar microfone'}
          aria-pressed={active}
          className={`flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${
            active
              ? 'border-primary-500 bg-primary-400 text-secondary-950'
              : 'border-stroke-200 bg-secondary-800 text-neutral-600 hover:border-primary-500 hover:text-primary-300'
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
            <line x1="12" y1="18" x2="12" y2="22" />
            {!active && <line x1="4" y1="4" x2="20" y2="20" />}
          </svg>
        </button>
        <div className="flex items-end gap-1" aria-hidden title={`Nível do sinal: ${level}/5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`w-1.5 rounded-full transition-colors ${
                level >= n ? 'bg-primary-400' : 'bg-stroke-200'
              }`}
              style={{ height: `${6 + n * 4}px` }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-center text-sm text-auxiliary-danger-default">{error}</p>}

      <label className="block text-xs text-neutral-500">
        Afinação de referência
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
            onClick={() => setTargetString(targetString === i ? null : i)}
            aria-pressed={targetString === i}
            className={`rounded border px-2.5 py-1 font-mono text-xs ${targetString === i ? 'border-primary-500 bg-primary-950 text-primary-300' : 'border-stroke-200 text-neutral-500 hover:border-primary-700'}`}
          >
            {n}
          </button>
        ))}
      </div>
    </Card>
  );
}
