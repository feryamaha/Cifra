/**
 * Diagrama de acorde em SVG puro, sem lib externa.
 * Recebe um Voicing calculado (lib/music/voicing.ts) e desenha:
 * cordas, trastes, pestana de posição, bolinhas, X (muda) e O (solta).
 */

import type { ChordDiagramProps } from '@/types/ui/chord-diagram.types';

const W = 160;
const H = 190;
const LEFT = 24;
const TOP = 40;
const STRING_GAP = (W - LEFT * 2) / 5;
const FRET_GAP = 28;
const NUM_FRETS = 4;

export function ChordDiagram({ voicing, tuning, label }: ChordDiagramProps) {
  const played = voicing.frets.filter((f): f is number => f !== null && f > 0);
  const minFret = played.length ? Math.min(...played) : 1;
  const baseFret = Math.max(...played, 0) <= NUM_FRETS ? 1 : minFret;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-44"
      role="img"
      aria-label={`Diagrama do acorde ${label}`}
    >
      <text
        x={W / 2}
        y={16}
        textAnchor="middle"
        className="fill-primary-300 font-mono text-[14px] font-bold"
      >
        {label}
      </text>

      {/* pestana do braço ou indicador de posição */}
      {baseFret === 1 ? (
        <rect
          x={LEFT - 1}
          y={TOP - 4}
          width={W - LEFT * 2 + 2}
          height={4}
          className="fill-neutral-900"
        />
      ) : (
        <text
          x={LEFT - 14}
          y={TOP + FRET_GAP / 2 + 4}
          className="fill-neutral-700 font-mono text-[10px]"
        >
          {baseFret}ª
        </text>
      )}

      {/* trastes */}
      {Array.from({ length: NUM_FRETS + 1 }).map((_, i) => (
        <line
          key={`f${i}`}
          x1={LEFT}
          x2={W - LEFT}
          y1={TOP + i * FRET_GAP}
          y2={TOP + i * FRET_GAP}
          className="stroke-stroke-200"
          strokeWidth={1}
        />
      ))}

      {/* cordas */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={`s${i}`}
          x1={LEFT + i * STRING_GAP}
          x2={LEFT + i * STRING_GAP}
          y1={TOP}
          y2={TOP + NUM_FRETS * FRET_GAP}
          className="stroke-neutral-500"
          strokeWidth={1}
        />
      ))}

      {/* marcações por corda (da 6ª à 1ª, esquerda -> direita) */}
      {voicing.frets.map((fret, i) => {
        const x = LEFT + i * STRING_GAP;
        if (fret === null) {
          return (
            <text
              key={i}
              x={x}
              y={TOP - 8}
              textAnchor="middle"
              className="fill-neutral-500 font-mono text-[11px]"
            >
              x
            </text>
          );
        }
        if (fret === 0) {
          return (
            <circle
              key={i}
              cx={x}
              cy={TOP - 12}
              r={4}
              className="fill-none stroke-neutral-700"
              strokeWidth={1.2}
            />
          );
        }
        const rel = fret - baseFret + 1;
        return (
          <circle
            key={i}
            cx={x}
            cy={TOP + (rel - 0.5) * FRET_GAP}
            r={7}
            className="fill-primary-400"
          />
        );
      })}

      {/* nomes das cordas soltas da afinação */}
      {tuning.stringNames.map((n, i) => (
        <text
          key={`n${i}`}
          x={LEFT + i * STRING_GAP}
          y={TOP + NUM_FRETS * FRET_GAP + 16}
          textAnchor="middle"
          className="fill-neutral-500 font-mono text-[10px]"
        >
          {n}
        </text>
      ))}
    </svg>
  );
}
