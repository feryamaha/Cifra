/**
 * Diagrama de acorde em SVG puro, sem lib externa.
 * Recebe um Voicing calculado (lib/music/voicing.ts) e desenha:
 * cordas, trastes, pestana/nut, barre, bolinhas com dedos, X e O.
 */

import { cn } from '@/lib/utils';
import type { ChordDiagramProps, ChordDiagramSize } from '@/types/ui/chord-diagram.types';

const SIZE_CONFIG: Record<
  ChordDiagramSize,
  { w: number; h: number; left: number; top: number; fretGap: number; dotR: number; font: number }
> = {
  sm: { w: 112, h: 140, left: 16, top: 30, fretGap: 20, dotR: 5.5, font: 10 },
  md: { w: 160, h: 190, left: 24, top: 40, fretGap: 28, dotR: 7, font: 12 },
  lg: { w: 200, h: 230, left: 28, top: 44, fretGap: 34, dotR: 8.5, font: 14 },
};

const NUM_FRETS = 4;

export function ChordDiagram({
  voicing,
  tuning,
  label,
  size = 'md',
  showFingers = true,
  className,
}: ChordDiagramProps) {
  const cfg = SIZE_CONFIG[size];
  const { w: W, h: H, left: LEFT, top: TOP, fretGap: FRET_GAP, dotR, font } = cfg;
  const STRING_GAP = (W - LEFT * 2) / 5;

  const played = voicing.frets.filter((f): f is number => f !== null && f > 0);
  const minFret = played.length ? Math.min(...played) : 1;
  const baseFret = Math.max(...played, 0) <= NUM_FRETS ? 1 : minFret;
  const uid = `cd-${size}-${label.replace(/[^a-zA-Z0-9]/g, '')}`;

  const barre = voicing.barre;
  const barreRel =
    barre !== null && barre >= baseFret && barre < baseFret + NUM_FRETS
      ? barre - baseFret + 1
      : null;

  // Cordas cobertas pelo barre (para desenhar o retângulo)
  let barreFrom = 0;
  let barreTo = 5;
  if (barre !== null) {
    const barreStrings = voicing.frets.map((f, i) => (f === barre ? i : -1)).filter((i) => i >= 0);
    if (barreStrings.length >= 2) {
      barreFrom = Math.min(...barreStrings);
      barreTo = Math.max(...barreStrings);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn(
        size === 'sm' && 'w-28',
        size === 'md' && 'w-full max-w-44',
        size === 'lg' && 'w-full max-w-52',
        className,
      )}
      role="img"
      aria-label={`Diagrama do acorde ${label}`}
    >
      <defs>
        <radialGradient id={`${uid}-dot`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fdeecd" />
          <stop offset="55%" stopColor="#f2ab3c" />
          <stop offset="100%" stopColor="#c66d14" />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Label */}
      <text
        x={W / 2}
        y={font + 2}
        textAnchor="middle"
        fill="#f8c96a"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize={font + 2}
        fontWeight="700"
      >
        {label}
      </text>

      {/* Nut ou indicador de posição */}
      {baseFret === 1 ? (
        <rect
          x={LEFT - 1}
          y={TOP - 5}
          width={W - LEFT * 2 + 2}
          height={5}
          rx={1}
          fill="#ece7dd"
          opacity={0.92}
        />
      ) : (
        <text
          x={LEFT - 10}
          y={TOP + FRET_GAP / 2 + 3}
          textAnchor="middle"
          fill="#8a8378"
          fontFamily="var(--font-jetbrains), monospace"
          fontSize={font - 2}
        >
          {baseFret}ª
        </text>
      )}

      {/* Trastes */}
      {Array.from({ length: NUM_FRETS + 1 }).map((_, i) => (
        <line
          key={`f${i}`}
          x1={LEFT}
          x2={W - LEFT}
          y1={TOP + i * FRET_GAP}
          y2={TOP + i * FRET_GAP}
          stroke="#3a342e"
          strokeWidth={i === 0 && baseFret === 1 ? 0 : 1.2}
        />
      ))}

      {/* Cordas — grossura levemente crescente da aguda à grave */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={`s${i}`}
          x1={LEFT + i * STRING_GAP}
          x2={LEFT + i * STRING_GAP}
          y1={TOP}
          y2={TOP + NUM_FRETS * FRET_GAP}
          stroke="#8a8378"
          strokeWidth={1 + (5 - i) * 0.15}
          opacity={0.85}
        />
      ))}

      {/* Barre */}
      {barreRel !== null && (
        <rect
          x={LEFT + barreFrom * STRING_GAP - dotR}
          y={TOP + (barreRel - 0.5) * FRET_GAP - dotR * 0.75}
          width={(barreTo - barreFrom) * STRING_GAP + dotR * 2}
          height={dotR * 1.5}
          rx={dotR * 0.75}
          fill="#f2ab3c"
          opacity={0.35}
        />
      )}

      {/* Marcações por corda (6ª → 1ª) */}
      {voicing.frets.map((fret, i) => {
        const x = LEFT + i * STRING_GAP;
        if (fret === null) {
          return (
            <text
              key={i}
              x={x}
              y={TOP - 8}
              textAnchor="middle"
              fill="#8a8378"
              fontFamily="var(--font-jetbrains), monospace"
              fontSize={font - 1}
              fontWeight="600"
            >
              ×
            </text>
          );
        }
        if (fret === 0) {
          return (
            <circle
              key={i}
              cx={x}
              cy={TOP - 11}
              r={dotR * 0.55}
              fill="none"
              stroke="#b5ada1"
              strokeWidth={1.4}
            />
          );
        }
        const rel = fret - baseFret + 1;
        if (rel < 1 || rel > NUM_FRETS) return null;
        const cy = TOP + (rel - 0.5) * FRET_GAP;
        const finger = voicing.fingers[i];
        return (
          <g key={i} filter={`url(#${uid}-glow)`}>
            <circle cx={x} cy={cy} r={dotR} fill={`url(#${uid}-dot)`} />
            {showFingers && finger !== null && finger > 0 && (
              <text
                x={x}
                y={cy + font * 0.28}
                textAnchor="middle"
                fill="#121009"
                fontFamily="var(--font-jetbrains), monospace"
                fontSize={font - 2}
                fontWeight="700"
              >
                {finger}
              </text>
            )}
          </g>
        );
      })}

      {/* Nomes das cordas soltas da afinação */}
      {tuning.stringNames.map((n, i) => (
        <text
          key={`n${i}`}
          x={LEFT + i * STRING_GAP}
          y={TOP + NUM_FRETS * FRET_GAP + font + 4}
          textAnchor="middle"
          fill="#8a8378"
          fontFamily="var(--font-jetbrains), monospace"
          fontSize={font - 2}
        >
          {n}
        </text>
      ))}
    </svg>
  );
}
