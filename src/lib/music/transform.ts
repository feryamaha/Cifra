/**
 * transform.ts
 * Os três motores de transformação de símbolo:
 *   1. transposeChord  (semitons, ortografia pelo tom de destino)
 *   2. chordToDegree   (letras -> números da escala, sufixo intacto)
 *   3. simplifyChord   (reduz a tríade básica)
 */

import type { ParsedChord } from '@/types/music/chords.types';
import type { PitchClass } from '@/types/music/notes.types';
import type { AccidentalStyle, RenderedChord, ViewOptions } from '@/types/music/transform.types';
import { parseChord } from './chords';
import { keyPrefersFlats, mod12, pcToName } from './notes';

/* ------------------------------------------------------------------ */
/* 1. TRANSPOSIÇÃO                                                     */
/* ------------------------------------------------------------------ */

/**
 * Transpõe um acorde por n semitons.
 * A ortografia (F# vs Gb) é decidida pela armadura do TOM DE DESTINO,
 * não nota a nota: é assim que uma cifra impressa se mantém coerente.
 */
export function transposeChord(
  chord: ParsedChord,
  semitones: number,
  targetKeyPc: PitchClass,
): ParsedChord {
  const useFlats = keyPrefersFlats(targetKeyPc);
  const newRootPc = mod12(chord.rootPc + semitones);
  const newRoot = pcToName(newRootPc, useFlats);
  const newBassPc = chord.bassPc === null ? null : mod12(chord.bassPc + semitones);
  const newBass = newBassPc === null ? null : pcToName(newBassPc, useFlats);
  const symbol = `${newRoot}${chord.suffix}${newBass ? `/${newBass}` : ''}`;
  return {
    symbol,
    root: newRoot,
    rootPc: newRootPc,
    suffix: chord.suffix,
    bass: newBass,
    bassPc: newBassPc,
  };
}

/* ------------------------------------------------------------------ */
/* 2. LETRAS -> NÚMEROS DA ESCALA                                       */
/* ------------------------------------------------------------------ */

/**
 * Matriz intervalo -> grau (referência: escala maior do tom).
 * 0=1  1=b2  2=2  3=b3  4=3  5=4  6=b5  7=5  8=b6  9=6  10=b7  11=7
 *
 * Nota de calibração: no tom de C, G# está a 8 semitons da tônica,
 * portanto é grafado b6 (ou #5 no estilo sustenido). b5 corresponde
 * a F#/Gb (6 semitons). A matriz abaixo implementa a matemática exata.
 */
const DEGREE_FLAT = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
const DEGREE_SHARP = ['1', '#1', '2', '#2', '3', '4', '#4', '5', '#5', '6', '#6', '7'];
const ROMAN_FLAT = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
const SOLFEGE = ['Do', 'Do#', 'Re', 'Mib', 'Mi', 'Fa', 'Fa#', 'Sol', 'Lab', 'La', 'Sib', 'Si'];

export function pcToDegree(
  pc: PitchClass,
  keyPc: PitchClass,
  style: AccidentalStyle = 'flat',
): string {
  const interval = mod12(pc - keyPc);
  return style === 'flat' ? DEGREE_FLAT[interval] : DEGREE_SHARP[interval];
}

/**
 * F7 em C -> "47" | Am em C -> "6m" | C7M em C -> "17M" | F7/A -> "47/3"
 * O sufixo NUNCA é tocado: só raiz e baixo viram grau.
 */
export function chordToDegreeSymbol(
  chord: ParsedChord,
  keyPc: PitchClass,
  style: AccidentalStyle = 'flat',
): string {
  const deg = pcToDegree(chord.rootPc, keyPc, style);
  const bassDeg = chord.bassPc === null ? '' : `/${pcToDegree(chord.bassPc, keyPc, style)}`;
  return `${deg}${chord.suffix}${bassDeg}`;
}

/* ------------------------------------------------------------------ */
/* 3. CIFRA SIMPLIFICADA                                                */
/* ------------------------------------------------------------------ */

/**
 * Reduz o acorde à tríade básica:
 *   C7M9      -> C
 *   Bm7(11)   -> Bm
 *   G#dim7    -> G#dim
 *   Caug7     -> Caug
 *   Dsus4     -> D      (sus vira maior na versão simplificada)
 *   G/B       -> G      (inversões são descartadas: menos uma decisão
 *                        para o iniciante)
 */
export function simplifyChord(chord: ParsedChord): ParsedChord {
  const s = chord.suffix;
  let suffix = '';
  if (/(dim|°)/.test(s)) suffix = 'dim';
  else if (/(aug|\+)/.test(s)) suffix = 'aug';
  else if (/^m(?!aj)/.test(s)) suffix = 'm';
  return {
    symbol: `${chord.root}${suffix}`,
    root: chord.root,
    rootPc: chord.rootPc,
    suffix,
    bass: null,
    bassPc: null,
  };
}

/* ------------------------------------------------------------------ */
/* Pipeline completo usado pela UI                                      */
/* ------------------------------------------------------------------ */

/**
 * Regra do capotraste: o capo no traste N sobe todas as cordas N semitons.
 * Para a música continuar soando no tom atual, o shape tocado é o acorde
 * transposto N semitons PARA BAIXO. Ex: música em G, capo 2 -> shapes de F.
 */
export function renderChord(
  originalSymbol: string,
  originalKeyPc: PitchClass,
  opts: ViewOptions,
): RenderedChord | null {
  const parsed = parseChord(originalSymbol);
  if (!parsed) return null;

  const currentKeyPc = mod12(originalKeyPc + opts.transpose);
  let sounding = transposeChord(parsed, opts.transpose, currentKeyPc);
  if (opts.simplified) sounding = simplifyChord(sounding);

  const shapeKeyPc = mod12(currentKeyPc - opts.capo);
  const shape = transposeChord(sounding, -opts.capo, shapeKeyPc);

  let display: string;
  if (opts.notation === 'numbers') {
    display = chordToDegreeSymbol(sounding, currentKeyPc, opts.accidentalStyle);
  } else if (opts.notation === 'roman') {
    const interval = mod12(sounding.rootPc - currentKeyPc);
    const rootR = ROMAN_FLAT[interval];
    const bassR =
      sounding.bassPc === null ? '' : `/${ROMAN_FLAT[mod12(sounding.bassPc - currentKeyPc)]}`;
    display = `${rootR}${sounding.suffix}${bassR}`;
  } else if (opts.notation === 'solfege') {
    const rootS = SOLFEGE[sounding.rootPc];
    const bassS = sounding.bassPc === null ? '' : `/${SOLFEGE[sounding.bassPc]}`;
    display = `${rootS}${sounding.suffix}${bassS}`;
  } else if (opts.capo > 0) {
    display = shape.symbol;
  } else {
    display = sounding.symbol;
  }

  return { display, sounding, shape };
}
