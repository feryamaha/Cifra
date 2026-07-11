/**
 * Adapter: formato tombatossals/chords-db → Voicing do Cifra Tom.
 *
 * frets: "x32010" (6ª→1ª, x = mute)
 * fingers: "x32010" (0 = open/none, 1–4 = dedo)
 *
 * Uso futuro: popular um JSON vendored e preferir fingers do DB
 * quando a afinação for standard e o score do motor for similar.
 *
 * Fonte: https://github.com/tombatossals/chords-db (MIT)
 */

import type { Voicing } from '@/types/music/voicing.types';
import { assignFingers } from './voicing';

export interface ChordsDbPosition {
  frets: string;
  fingers?: string;
  barres?: number | number[];
  capo?: boolean;
  baseFret?: number;
}

export interface ChordsDbChord {
  key: string;
  suffix: string;
  positions: ChordsDbPosition[];
}

/** Converte string de frets do chords-db em array Cifra Tom. */
export function parseFretsString(frets: string): (number | null)[] {
  const chars = frets.replace(/-/g, '').split('');
  if (chars.length !== 6) {
    throw new Error(`Frets inválidos (esperado 6): ${frets}`);
  }
  return chars.map((c) => {
    if (c === 'x' || c === 'X') return null;
    if (c === '0') return 0;
    // Base-36 para trastes ≥ 10 (a=10, b=11…)
    const n = Number.parseInt(c, 36);
    if (Number.isNaN(n)) return null;
    return n;
  });
}

/** Converte string de fingers do chords-db. */
export function parseFingersString(fingers: string): (number | null)[] {
  const chars = fingers.replace(/-/g, '').split('');
  if (chars.length !== 6) {
    throw new Error(`Fingers inválidos (esperado 6): ${fingers}`);
  }
  return chars.map((c) => {
    if (c === 'x' || c === 'X' || c === '0' || c === '-') return c === 'x' || c === 'X' ? null : 0;
    const n = Number.parseInt(c, 10);
    return Number.isNaN(n) ? null : n;
  });
}

/** Posição do chords-db → Voicing. */
export function positionToVoicing(position: ChordsDbPosition, score = 0): Voicing {
  const frets = parseFretsString(position.frets);
  let fingers: (number | null)[];
  let barre: number | null = null;

  if (position.fingers) {
    fingers = parseFingersString(position.fingers);
  } else {
    const assigned = assignFingers(frets);
    fingers = assigned.fingers;
    barre = assigned.barre;
  }

  if (position.barres !== undefined) {
    barre = Array.isArray(position.barres) ? (position.barres[0] ?? null) : position.barres;
  }

  return { frets, fingers, barre, score };
}

/**
 * Mapeia raiz BR (C, C#, Db, ...) para chave do chords-db JSON.
 * O JSON usa: C, Csharp, D, Eb, E, F, Fsharp, G, Ab, A, Bb, B
 */
export function mapRootToDbKey(root: string): string {
  const r = root.trim();
  if (r === 'C#') return 'Csharp';
  if (r === 'F#') return 'Fsharp';
  if (r === 'G#') return 'Ab';
  if (r === 'A#') return 'Bb';
  if (r === 'D#') return 'Eb';
  return r.toUpperCase();
}

/**
 * Mapeia sufixo BR do Cifra Tom → suffix do chords-db quando diferem.
 * Ex: 7M → maj7, m7(b5) → m7b5, ° → dim
 */
export function mapSuffixToDb(suffix: string): string {
  if (!suffix || suffix === '') return 'major';
  if (suffix === 'm') return 'minor';
  if (/maj9|7M\(9\)/.test(suffix)) return 'maj9';
  if (/maj11|7M\(11\)/.test(suffix)) return 'maj11';
  if (/maj13|7M\(13\)/.test(suffix)) return 'maj13';
  if (/maj7b5|7M\(b5\)/.test(suffix)) return 'maj7b5';
  if (/maj7#5|7M\(#5\)/.test(suffix)) return 'maj7#5';
  if (/(7M|maj7|Maj7)/.test(suffix)) return 'maj7';
  if (/mmaj7|m7M/.test(suffix)) return 'mmaj7';
  if (/mmaj9|m7M9/.test(suffix)) return 'mmaj9';
  if (/mmaj11|m7M11/.test(suffix)) return 'mmaj11';
  if (/madd9/.test(suffix)) return 'madd9';
  if (/add9/.test(suffix)) return 'add9';
  if (/add11/.test(suffix)) return 'add11';
  if (/m69/.test(suffix)) return 'm69';
  if (/69/.test(suffix)) return '69';
  if (/m11/.test(suffix)) return 'm11';
  if (/m9/.test(suffix)) return 'm9';
  if (/m6/.test(suffix)) return 'm6';
  if (/(dim7|°7)/.test(suffix)) return 'dim7';
  if (/(dim|°)/.test(suffix)) return 'dim';
  if (/(aug|\+)/.test(suffix)) return 'aug';
  if (/m7b5|m7\(b5\)|ø/.test(suffix)) return 'm7b5';
  if (/7b5|7\(b5\)/.test(suffix)) return '7b5';
  if (/7#9|7\(#9\)/.test(suffix)) return '7#9';
  if (/7b9|7\(b9\)/.test(suffix)) return '7b9';
  if (/9#11|9\(#11\)/.test(suffix)) return '9#11';
  if (/7sus4/.test(suffix)) return '7sus4';
  if (/sus4|sus(?!2)/.test(suffix)) return 'sus4';
  if (/sus2/.test(suffix)) return 'sus2';
  if (/^7$/.test(suffix)) return '7';
  if (/^9$/.test(suffix)) return '9';
  if (/^11$/.test(suffix)) return '11';
  if (/^13$/.test(suffix)) return '13';
  if (/^5$/.test(suffix)) return '5';
  // Fallback: passa o sufixo limpo
  return suffix.replace(/[()]/g, '');
}
