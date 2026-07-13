/**
 * Testes SPEC_014 / ISSUE_007 — progressões da forma.
 * Fixture sintética (universal); sem hardcode no detector.
 */
import { applyAutoProgressionsIfEmpty } from '../src/lib/songs/user-songs';
import type { Song, SongSection } from '../src/types/song/song.types';
import { chordCore, detectChordSequences } from '../src/utils/song-view.helpers';

function section(id: string, name: string, chords: string[]): SongSection {
  return {
    id,
    type: 'verse',
    tag: id.slice(0, 3).toUpperCase(),
    name,
    lines: [{ parts: chords.map((chord) => ({ chord, text: '    ' })) }],
  };
}

function makeSyntheticSong(): Song {
  const intro = section('intro', 'Intro', ['E', 'C#m', 'B11', 'A9']);
  const verse = section('verse', 'Verso', ['E', 'C#m', 'B', 'A9']);
  const chorus = section('chorus', 'Refrão', ['E', 'B11', 'A9', 'C#m', 'B11']);
  const bridge = section('bridge', 'Ponte', ['E', 'B/E', 'A/E', 'E', 'E4']);
  const bridgeVar = section('bridge2', 'Ponte var', ['E', 'B', 'A', 'E', 'B']);
  const solo = section('solo', 'Solo', ['A', 'C#m', 'B']);
  const ending = section('end', 'Final', ['E', 'Bm', 'A', 'Am']);

  return {
    id: 'synth',
    slug: 'synth-progressions',
    title: 'Sintética',
    artist: 'Teste',
    genre: 'Teste',
    key: 'E',
    originalKey: 'E',
    tuning: 'standard',
    chords: [],
    timeSignature: '4/4',
    source: 'user',
    map: [
      'intro',
      'verse',
      'chorus',
      'verse',
      'chorus',
      'bridge',
      'bridge',
      'bridge',
      'bridge2',
      'solo',
      'chorus',
      'chorus',
      'end',
    ],
    sections: [intro, verse, chorus, bridge, bridgeVar, solo, ending],
  };
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function coresOf(chords: string[]): string {
  return chords.map(chordCore).join(' ');
}

function main() {
  // F1 núcleo
  assert(chordCore('B11') === 'B', 'B11 → B');
  assert(chordCore('A9') === 'A', 'A9 → A');
  assert(chordCore('A/E') === 'A', 'A/E → A (não B)');
  assert(chordCore('B/E') === 'B', 'B/E → B');
  assert(chordCore('E4') === 'E', 'E4 → E');
  assert(chordCore('Bm') === 'Bm', 'Bm ≠ B');

  const song = makeSyntheticSong();
  const seqs = detectChordSequences(song);
  console.log(
    'Auto:',
    seqs.map((s) => `${s.name} [${coresOf(s.chords)}] ×${s.occurrences}`).join(' | '),
  );

  const byCore = seqs.map((s) => coresOf(s.chords));

  assert(
    byCore.some((c) => c === 'E C#m B A'),
    `intro/verso E C#m B A, got: ${byCore.join(' ; ')}`,
  );
  const chorus = seqs.find((s) => coresOf(s.chords) === 'E B A C#m B');
  assert(!!chorus, `refrão E B A C#m B, got: ${byCore.join(' ; ')}`);
  assert((chorus?.occurrences ?? 0) >= 3, `refrão ×≥3, got ×${chorus?.occurrences}`);
  assert(
    byCore.some((c) => c === 'E B A E E'),
    `ponte E B A E E, got: ${byCore.join(' ; ')}`,
  );
  // Solo e final: seções do chart com ×1 entram (SPEC_014 C7)
  assert(byCore.some((c) => c === 'A C#m B'), `solo A C#m B, got: ${byCore.join(' ; ')}`);
  assert(byCore.some((c) => c === 'E Bm A Am'), `final E Bm A Am, got: ${byCore.join(' ; ')}`);

  assert(
    !seqs.some((s) => coresOf(s.chords) === 'E B' && s.chords.length === 2),
    'não inventar E B de fronteira',
  );

  // Manual vence
  const withManual: Song = {
    ...song,
    progressions: [{ chords: ['G', 'D', 'Em', 'C'] }, { chords: ['C', 'G', 'D'] }],
  };
  const man = detectChordSequences(withManual);
  assert(man.length === 2 && man[0].chords.join(' ') === 'G D Em C', 'manual vence');

  // empty → auto preenche; filled → não sobrescreve
  const empty = applyAutoProgressionsIfEmpty({ ...song, progressions: undefined });
  assert(
    (empty.progressions?.length ?? 0) >= 3,
    'applyAuto preenche quando vazio',
  );
  const filled = applyAutoProgressionsIfEmpty({
    ...song,
    progressions: [{ chords: ['C', 'G', 'Am', 'F'] }],
  });
  assert(
    filled.progressions?.length === 1 && filled.progressions[0].chords[0] === 'C',
    'applyAuto não sobrescreve preenchido',
  );

  console.log('test-progressions: PASS');
}

main();
