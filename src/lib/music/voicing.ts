/**
 * voicing.ts
 * Dicionário DINÂMICO de shapes: em vez de uma tabela fixa de desenhos
 * por afinação (que explode em manutenção: 12 raízes x dezenas de
 * qualidades x 5 afinações), o shape é CALCULADO.
 *
 * Algoritmo:
 *   1. O acorde vira um conjunto de pitch classes (chords.ts).
 *   2. Para cada janela de 4 trastes (posição 0..9), cada corda gera
 *      candidatos: solta (0), trastes da janela cuja nota pertence ao
 *      acorde, ou muda (null).
 *   3. Busca em profundidade combina os candidatos e cada combinação
 *      recebe uma pontuação.
 *   4. O melhor shape vence. Resultado memoizado por
 *      (afinação, pcs do acorde, baixo).
 *
 * Pontuação (heurística de tocabilidade no violão):
 *   -30 por nota obrigatória ausente (fundamental, terça, sétima)
 *   +12 se a corda mais grave soando é o baixo pedido
 *   +1 por corda solta, +(9 - janela) para preferir a região do braço
 *   -6 por corda muda no meio do shape, -2 por corda muda em geral
 *   -10 se a extensão entre dedos passa de 3 trastes
 *   -8 por dedo além do 4º (barré é tratado como custo leve)
 */

import type { PitchClass } from '@/types/music/notes.types';
import type { Voicing, VoicingTarget } from '@/types/music/voicing.types';

const cache = new Map<string, Voicing | null>();

export function findVoicing(openStrings: PitchClass[], target: VoicingTarget): Voicing | null {
  const key =
    openStrings.join(',') +
    '|' +
    [...target.pcs].sort().join(',') +
    '|' +
    [...target.required].sort().join(',') +
    '|' +
    target.bassPc;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const pcSet = new Set(target.pcs);
  let best: Voicing | null = null;

  for (let window = 0; window <= 9; window++) {
    const options: (number | null)[][] = openStrings.map((open) => {
      const opts: (number | null)[] = [];
      if (pcSet.has(((open % 12) + 12) % 12)) opts.push(0);
      for (let f = Math.max(1, window); f <= window + 3; f++) {
        if (pcSet.has((open + f) % 12)) opts.push(f);
      }
      opts.push(null); // mute por último: privilegia soar
      return opts;
    });

    const frets: (number | null)[] = new Array(6).fill(null);

    const walk = (s: number, muted: number) => {
      if (muted > 3) return; // poda: mais de 3 cordas mudas nunca vence
      if (s === 6) {
        const scored = scoreVoicing(frets, openStrings, target, window);
        if (scored !== null && (best === null || scored > best.score)) {
          best = { frets: [...frets], score: scored };
        }
        return;
      }
      for (const opt of options[s]) {
        frets[s] = opt;
        walk(s + 1, muted + (opt === null ? 1 : 0));
      }
    };
    walk(0, 0);
  }

  cache.set(key, best);
  return best;
}

function scoreVoicing(
  frets: (number | null)[],
  openStrings: PitchClass[],
  target: VoicingTarget,
  window: number,
): number | null {
  const sounding: (PitchClass | null)[] = frets.map((f, i) =>
    f === null ? null : (openStrings[i] + f) % 12,
  );
  const active = sounding.filter((p): p is PitchClass => p !== null);
  if (active.length < 3) return null;

  let score = 0;
  const covered = new Set(active);
  for (const r of target.required) if (!covered.has(r)) score -= 30;

  const firstIdx = frets.findIndex((f) => f !== null);
  if (firstIdx >= 0 && sounding[firstIdx] === target.bassPc) score += 12;

  const fretted = frets.filter((f): f is number => f !== null && f > 0);
  if (fretted.length > 4) score -= (fretted.length - 4) * 8;
  score += frets.filter((f) => f === 0).length;
  score += 9 - window;

  let seenSounding = false;
  for (let i = 0; i < 6; i++) {
    if (frets[i] !== null) {
      seenSounding = true;
    } else {
      score -= 2;
      if (seenSounding && frets.slice(i + 1).some((f) => f !== null)) score -= 6;
    }
  }

  if (fretted.length > 0) {
    const span = Math.max(...fretted) - Math.min(...fretted);
    if (span > 3) score -= 10;
  }

  return score;
}
