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
 *   5. Dedos e barre são derivados do frets vencedor.
 */

import type { PitchClass } from '@/types/music/notes.types';
import type { Voicing, VoicingTarget } from '@/types/music/voicing.types';

const cache = new Map<string, Voicing | null>();

function fretsKey(frets: (number | null)[]): string {
  return frets.map((f) => (f === null ? 'x' : f)).join(',');
}

function toVoicing(frets: (number | null)[], score: number): Voicing {
  const { fingers, barre } = assignFingers(frets);
  return { frets, fingers, barre, score };
}

/**
 * Coleta candidatos pontuados (melhor de cada combinação única de frets).
 * Usado por findVoicing (top 1) e findVoicings (top N variações).
 */
function collectVoicings(
  openStrings: PitchClass[],
  target: VoicingTarget,
): { frets: (number | null)[]; score: number }[] {
  const pcSet = new Set(target.pcs);
  const bestByShape = new Map<string, { frets: (number | null)[]; score: number }>();

  for (let window = 0; window <= 9; window++) {
    const options: (number | null)[][] = openStrings.map((open) => {
      const opts: (number | null)[] = [];
      if (pcSet.has(((open % 12) + 12) % 12)) opts.push(0);
      for (let f = Math.max(1, window); f <= window + 3; f++) {
        if (pcSet.has((open + f) % 12)) opts.push(f);
      }
      opts.push(null);
      return opts;
    });

    const frets: (number | null)[] = new Array(6).fill(null);

    const walk = (s: number, muted: number) => {
      if (muted > 3) return;
      if (s === 6) {
        const scored = scoreVoicing(frets, openStrings, target, window);
        if (scored === null) return;
        const key = fretsKey(frets);
        const prev = bestByShape.get(key);
        if (!prev || scored > prev.score) {
          bestByShape.set(key, { frets: [...frets], score: scored });
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

  return [...bestByShape.values()].sort((a, b) => b.score - a.score);
}

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

  const candidates = collectVoicings(openStrings, target);
  if (candidates.length === 0) {
    cache.set(key, null);
    return null;
  }

  const result = toVoicing(candidates[0].frets, candidates[0].score);
  cache.set(key, result);
  return result;
}

const multiCache = new Map<string, Voicing[]>();

/** Top N shapes distintos (variações) para o mesmo acorde/afinação. */
export function findVoicings(
  openStrings: PitchClass[],
  target: VoicingTarget,
  limit = 3,
): Voicing[] {
  const key =
    openStrings.join(',') +
    '|' +
    [...target.pcs].sort().join(',') +
    '|' +
    [...target.required].sort().join(',') +
    '|' +
    target.bassPc +
    '|n' +
    limit;
  const hit = multiCache.get(key);
  if (hit) return hit;

  const candidates = collectVoicings(openStrings, target).slice(0, Math.max(1, limit));
  const result = candidates.map((c) => toVoicing(c.frets, c.score));
  multiCache.set(key, result);
  return result;
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

/**
 * Heurística de dedos e barre:
 * 1. Se ≥3 cordas fretted no mesmo traste com span de cordas ≥2 → barre (dedo 1).
 * 2. Demais frets ordenados por traste, atribuem 2..4 (ou 1 se sem barre).
 */
export function assignFingers(frets: (number | null)[]): {
  fingers: (number | null)[];
  barre: number | null;
} {
  const fingers: (number | null)[] = frets.map((f) => (f === null ? null : f === 0 ? 0 : null));
  const frettedIdx = frets
    .map((f, i) => ({ f, i }))
    .filter((x): x is { f: number; i: number } => x.f !== null && x.f > 0);

  if (frettedIdx.length === 0) return { fingers, barre: null };

  // Conta por traste
  const byFret = new Map<number, number[]>();
  for (const { f, i } of frettedIdx) {
    const list = byFret.get(f) ?? [];
    list.push(i);
    byFret.set(f, list);
  }

  let barre: number | null = null;
  let barreStrings: number[] = [];
  for (const [fret, strings] of byFret) {
    if (strings.length < 3) continue;
    const span = Math.max(...strings) - Math.min(...strings);
    if (span >= 2 && (barre === null || fret < barre)) {
      barre = fret;
      barreStrings = strings;
    }
  }

  if (barre !== null) {
    for (const i of barreStrings) fingers[i] = 1;
  }

  const remaining = frettedIdx
    .filter(({ i }) => fingers[i] === null)
    .sort((a, b) => a.f - b.f || a.i - b.i);

  let nextFinger = barre !== null ? 2 : 1;
  for (const { i } of remaining) {
    fingers[i] = Math.min(nextFinger, 4);
    nextFinger++;
  }

  return { fingers, barre };
}

/** Limpa o cache (útil em testes). */
export function clearVoicingCache(): void {
  cache.clear();
  multiCache.clear();
}

// ---------- classificação de shapes (SPEC_012 B1) ----------

export type VoicingKind = 'aberta' | 'pestana' | 'fechada';

export interface VoicingClass {
  kind: VoicingKind;
  /** menor traste usado (0 = só soltas) — "casa" da posição */
  baseFret: number;
}

/**
 * Classifica como o músico pensa: ABERTA usa corda solta (básicos de
 * primeira posição), PESTANA tem barre, FECHADA é shape móvel sem soltas
 * (região do braço). Base para ordenar/agrupar dicionário e hover.
 */
export function classifyVoicing(v: Voicing): VoicingClass {
  const fretted = v.frets.filter((f): f is number => f !== null && f > 0);
  const baseFret = fretted.length > 0 ? Math.min(...fretted) : 0;
  if (v.barre !== null && v.barre > 0) return { kind: 'pestana', baseFret: v.barre };
  const hasOpen = v.frets.some((f) => f === 0);
  return { kind: hasOpen ? 'aberta' : 'fechada', baseFret };
}

export const VOICING_KIND_LABELS: Record<VoicingKind, string> = {
  aberta: 'Aberta',
  pestana: 'Pestana',
  fechada: 'Fechada',
};

/** Abreviação para rótulos compactos (hover): A, P3, F5... */
export function voicingKindAbbr(c: VoicingClass): string {
  if (c.kind === 'aberta') return 'A';
  const casa = c.baseFret > 1 ? String(c.baseFret) : '';
  return (c.kind === 'pestana' ? 'P' : 'F') + casa;
}
