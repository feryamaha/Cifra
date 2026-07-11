/**
 * test-engine.ts
 * Validação empírica dos 4 motores. Rodar: npm run test:engine
 * Cada caso imprime esperado vs obtido e o processo sai com código 1
 * se qualquer asserção falhar (fail-closed).
 */

import { parseChord, chordPitchClasses } from '../src/lib/music/chords';
import { nameToPc, mod12 } from '../src/lib/music/notes';
import {
  chordToDegreeSymbol,
  transposeChord,
  simplifyChord,
  renderChord,
} from '../src/lib/music/transform';
import { TUNINGS } from '../src/data/music/tunings.data';
import { findVoicing } from '../src/lib/music/voicing';

let failures = 0;

function check(label: string, got: unknown, expected: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: esperado=${JSON.stringify(expected)} obtido=${JSON.stringify(got)}`);
}

const C = nameToPc('C')!;
const G = nameToPc('G')!;

console.log('\n== 1. LETRAS -> NÚMEROS (tom de C) ==');
check('F7 -> 47', chordToDegreeSymbol(parseChord('F7')!, C), '47');
check('Am -> 6m', chordToDegreeSymbol(parseChord('Am')!, C), '6m');
check('C7M -> 17M', chordToDegreeSymbol(parseChord('C7M')!, C), '17M');
check('Dm7 -> 2m7', chordToDegreeSymbol(parseChord('Dm7')!, C), '2m7');
check('G/B -> 5/7', chordToDegreeSymbol(parseChord('G/B')!, C), '5/7');
// Matemática do intervalo: C -> G# = 8 semitons = b6 (estilo bemol) ou #5.
// b5 seria F#/Gb (6 semitons). A matriz implementa o intervalo exato.
check('G#dim -> b6dim (8 semitons)', chordToDegreeSymbol(parseChord('G#dim')!, C), 'b6dim');
check('G#dim estilo sustenido -> #5dim', chordToDegreeSymbol(parseChord('G#dim')!, C, 'sharp'), '#5dim');
check('F#m7(11) -> b5m7(11)', chordToDegreeSymbol(parseChord('F#m7(11)')!, C), 'b5m7(11)');

console.log('\n== 2. TRANSPOSIÇÃO (ortografia pelo tom de destino) ==');
check('C7M9 +2 (C->D) -> D7M9', transposeChord(parseChord('C7M9')!, 2, mod12(C + 2)).symbol, 'D7M9');
check('Am +2 -> Bm', transposeChord(parseChord('Am')!, 2, mod12(C + 2)).symbol, 'Bm');
check('F +2 (tom D, sustenidos) -> G', transposeChord(parseChord('F')!, 2, mod12(C + 2)).symbol, 'G');
check('A +1 (tom Db, bemóis) -> Bb', transposeChord(parseChord('A')!, 1, mod12(C + 1)).symbol, 'Bb');
check('G/B +3 (tom Eb, bemóis) -> Bb/D', transposeChord(parseChord('G/B')!, 3, mod12(C + 3)).symbol, 'Bb/D');

console.log('\n== 3. CIFRA SIMPLIFICADA ==');
check('C7M9 -> C', simplifyChord(parseChord('C7M9')!).symbol, 'C');
check('Bm7(11) -> Bm', simplifyChord(parseChord('Bm7(11)')!).symbol, 'Bm');
check('G#dim7 -> G#dim', simplifyChord(parseChord('G#dim7')!).symbol, 'G#dim');
check('G/B -> G', simplifyChord(parseChord('G/B')!).symbol, 'G');
check('Gsus4 -> G', simplifyChord(parseChord('Gsus4')!).symbol, 'G');

console.log('\n== 4. CAPOTRASTE (som constante, shape recalculado) ==');
// Música em G, capo no traste 2: soa G, toca-se shape de F.
const capoCase = renderChord('G', G, {
  transpose: 0,
  capo: 2,
  notation: 'letters',
  simplified: false,
  accidentalStyle: 'flat',
})!;
check('tom G + capo 2: soa G', capoCase.sounding.symbol, 'G');
check('tom G + capo 2: shape F', capoCase.shape.symbol, 'F');
check('tom G + capo 2: display F', capoCase.display, 'F');
// Em modo números o grau segue o tom que SOA, independente do capo.
const capoNum = renderChord('C', G, {
  transpose: 0,
  capo: 2,
  notation: 'numbers',
  simplified: false,
  accidentalStyle: 'flat',
})!;
check('C no tom de G, capo 2, números -> 4', capoNum.display, '4');

console.log('\n== 5. MOTOR DE SHAPES POR AFINAÇÃO ==');
const dChord = chordPitchClasses(parseChord('D')!); // pcs {2,6,9}
for (const tuningId of [
  'standard',
  'halfStepDown',
  'dadgad',
  'openG',
  'openD',
  'openE',
  'dropD',
  'dropC',
]) {
  const tuning = TUNINGS[tuningId];
  const v = findVoicing(tuning.strings, dChord);
  if (!v) {
    failures++;
    console.log(`FAIL  D em ${tuning.label}: nenhum shape encontrado`);
    continue;
  }
  const soundingPcs = new Set(
    v.frets
      .map((f, i) => (f === null ? null : (tuning.strings[i] + f) % 12))
      .filter((p): p is number => p !== null),
  );
  // Notas obrigatórias de D maior: fundamental (2) e terça (6). A 5ª pode ser omitida.
  const coversRequired = [2, 6].every((pc) => soundingPcs.has(pc));
  if (!coversRequired) failures++;
  const hasFingers = Array.isArray(v.fingers) && v.fingers.length === 6;
  if (!hasFingers) failures++;
  console.log(
    `${coversRequired && hasFingers ? 'PASS' : 'FAIL'}  D em ${tuning.label}: frets=[${v.frets
      .map((f) => (f === null ? 'x' : f))
      .join(' ')}] fingers=[${v.fingers.map((f) => (f === null ? 'x' : f)).join(' ')}] barre=${v.barre} req=${coversRequired}`,
  );
}

// Shape conhecido de sanidade: D padrão deve conter a forma clássica xx0232
// (ou algo funcionalmente equivalente que cubra 2,6,9 com baixo em D).
const dStandard = findVoicing(TUNINGS.standard.strings, dChord)!;
const bassIdx = dStandard.frets.findIndex((f) => f !== null);
const bassPc = (TUNINGS.standard.strings[bassIdx] + (dStandard.frets[bassIdx] as number)) % 12;
check('D padrão: baixo é D (pc 2)', bassPc, 2);

// Open D: D maior deve permitir muitas cordas soltas
const dOpenD = findVoicing(TUNINGS.openD.strings, dChord)!;
const openCount = dOpenD.frets.filter((f) => f === 0).length;
if (openCount < 3) failures++;
console.log(
  `${openCount >= 3 ? 'PASS' : 'FAIL'}  D em Open D: ≥3 cordas soltas (obtido ${openCount}) frets=[${dOpenD.frets
    .map((f) => (f === null ? 'x' : f))
    .join(' ')}]`,
);

// Adapter chords-db
import { parseFretsString, positionToVoicing, mapSuffixToDb } from '../src/lib/music/chords-db.adapter';
console.log('\n== 5b. ADAPTER chords-db ==');
check('frets x32010', parseFretsString('x32010'), [null, 3, 2, 0, 1, 0]);
check('suffix 7M -> maj7', mapSuffixToDb('7M'), 'maj7');
check('suffix m -> minor', mapSuffixToDb('m'), 'minor');
const cShape = positionToVoicing({ frets: 'x32010', fingers: 'x32010' });
check('C shape frets', cShape.frets, [null, 3, 2, 0, 1, 0]);

console.log('\n== 6. ROUND-TRIP transposição (12 semitons = identidade) ==');
const roundTrip = transposeChord(
  transposeChord(parseChord('F#m7')!, 7, mod12(nameToPc('F#')! + 7)),
  5,
  mod12(nameToPc('F#')! + 12),
);
check('F#m7 +7 +5 -> F#m7', roundTrip.symbol, 'F#m7');

console.log(`\n${failures === 0 ? 'TODOS OS CASOS PASSARAM' : failures + ' FALHA(S)'}`);
process.exit(failures === 0 ? 0 : 1);
