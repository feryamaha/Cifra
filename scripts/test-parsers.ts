/**
 * Validação dos parsers. bun run test:parsers
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseChordPro } from '../src/lib/parsers/chordpro';
import { parseChordOverLyrics } from '../src/lib/parsers/chord-over-lyrics';
import { metaFromFileName } from '../src/lib/parsers/chord-utils';
import { chartToSongDraft, lineToParts } from '../src/lib/parsers/to-song-draft';
import { parseChartText } from '../src/lib/parsers/detect-and-parse';
import { parseChordsText, songToChartText, userSongFromDraft } from '../src/lib/songs/user-songs';
import { detectChordSequences } from '../src/utils/song-view.helpers';

let fails = 0;
function check(label: string, cond: boolean, detail = '') {
  if (!cond) fails++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`);
}

const fixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

// --- ChordPro ---
const chordpro = `{title: Teste}
{artist: Demo}
{key: G}
{start_of_verse}
[G]Olá mun[D]do
{end_of_verse}
{start_of_chorus}
[C]Refrão [G]aqui
{end_of_chorus}
`;

const cp = parseChordPro(chordpro);
check('chordpro title', cp.meta.title === 'Teste');
check('chordpro key', cp.meta.key === 'G');
check('chordpro sections', cp.sections.length === 2, String(cp.sections.length));
check('chordpro has G', cp.chords.includes('G'));
check('chordpro format', cp.format === 'chordpro');

const draft = chartToSongDraft(cp);
check('draft chords', draft.chords.length >= 2);
check(
  'draft parts have chords',
  draft.sections.some((s) => s.lines.some((l) => l.parts.some((p) => p.chord))),
);

// --- Fixture Gratidão (formato do plano) ---
const gratidao = readFileSync(join(fixtures, 'gratidao-cifraclub.txt'), 'utf8');
const g = parseChordOverLyrics(gratidao);
check('gratidão title', /gratid[aã]o/i.test(g.meta.title ?? ''), String(g.meta.title));
check('gratidão key G', g.meta.key === 'G', String(g.meta.key));
check('gratidão has sections >= 3', g.sections.length >= 3, String(g.sections.length));
check(
  'gratidão section names',
  g.sections.some((s) => /intro/i.test(s.name)) &&
    g.sections.some((s) => /verso|verse/i.test(s.name) || s.type === 'verse') &&
    g.sections.some((s) => /refr/i.test(s.name) || s.type === 'chorus'),
  g.sections.map((s) => s.name).join(', '),
);
check('gratidão chords include Em', g.chords.includes('Em'), g.chords.join(' '));
check('gratidão chords include G', g.chords.includes('G'));

// verso: linha "letra da música aqui" deve ter G e D
const verseSec = g.sections.find((s) => /verso|verse/i.test(s.name) || s.type === 'verse');
const verseLine = verseSec?.lines.find((l) => /letra da m[uú]sica/i.test(l.lyrics));
check('gratidão verse line found', Boolean(verseLine), verseSec?.lines.map((l) => l.lyrics).join('|'));
check(
  'gratidão verse has G and D',
  Boolean(verseLine && verseLine.chords.some((c) => c.chord === 'G') && verseLine.chords.some((c) => c.chord === 'D')),
  verseLine?.chords.map((c) => `${c.chord}@${c.charIndex}`).join(' '),
);

// G deve estar no começo (~0), D mais à direita
if (verseLine) {
  const gPos = verseLine.chords.find((c) => c.chord === 'G')?.charIndex ?? -1;
  const dPos = verseLine.chords.find((c) => c.chord === 'D')?.charIndex ?? -1;
  check('gratidão G before D', gPos >= 0 && dPos > gPos, `G@${gPos} D@${dPos}`);
}

const gDraft = chartToSongDraft(g);
check('gratidão draft has chords', gDraft.chords.length >= 4);
const partsLine = gDraft.sections
  .flatMap((s) => s.lines)
  .find((l) => l.parts.some((p) => /letra da m[uú]sica/i.test(p.text)));
check(
  'gratidão draft first chord on lyric is G',
  partsLine?.parts.find((p) => p.chord)?.chord === 'G',
  partsLine?.parts.map((p) => `${p.chord}:${JSON.stringify(p.text)}`).join(' | '),
);

// --- blank lines between chords and lyrics ---
const blank = readFileSync(join(fixtures, 'cifraclub-blank-lines.txt'), 'utf8');
const b = parseChordOverLyrics(blank);
const lyricWithChords = b.sections
  .flatMap((s) => s.lines)
  .find((l) => /Olá mundo/i.test(l.lyrics));
check(
  'blank-line: chords attach to next lyric',
  Boolean(
    lyricWithChords &&
      lyricWithChords.chords.some((c) => c.chord === 'C') &&
      lyricWithChords.chords.some((c) => c.chord === 'G'),
  ),
  lyricWithChords?.chords.map((c) => c.chord).join(' ') ?? 'no line',
);
check('blank-line: section Intro', b.sections.some((s) => /intro/i.test(s.name)));
check('blank-line: section Refrão', b.sections.some((s) => /refr/i.test(s.name) || s.type === 'chorus'));

// --- lineToParts unit ---
const parts = lineToParts({
  lyrics: 'letra da música aqui',
  chords: [
    { chord: 'G', charIndex: 0 },
    { chord: 'D', charIndex: 15 },
  ],
});
check('lineToParts starts with G', parts[0]?.chord === 'G' || parts.find((p) => p.chord === 'G') != null);
check(
  'lineToParts reconstructs lyrics',
  parts.map((p) => p.text).join('') === 'letra da música aqui',
  parts.map((p) => p.text).join(''),
);

// --- Fixture real: Bruna Olly - Gratidão (Cifra Club) ---
const bruna = readFileSync(join(fixtures, 'gratidao-bruna-olly.txt'), 'utf8');
const bo = parseChordOverLyrics(bruna);
check('bruna: 10 seções', bo.sections.length === 10, bo.sections.map((s) => s.name).join(' | '));
check(
  'bruna: nomes de seção preservados',
  ['Intro', 'Primeira Parte', 'Refrão', 'Segunda Parte', 'Terceira Parte', 'Interlúdio', 'Pós-Refrão', 'Rfráo Final'].every(
    (n) => bo.sections.some((s) => s.name === n),
  ),
  bo.sections.map((s) => s.name).join(' | '),
);
const boIntro = bo.sections[0];
check(
  'bruna: [Intro] com acordes inline vira seção intro',
  boIntro.type === 'intro' && boIntro.lines[0]?.chords.map((c) => c.chord).join(' ') === 'E C#m B11 A9',
  `${boIntro.type}: ${boIntro.lines[0]?.chords.map((c) => c.chord).join(' ')}`,
);
check(
  'bruna: nenhuma letra contém colchete de seção',
  bo.sections.every((s) => s.lines.every((l) => !l.lyrics.includes('['))),
);
check('bruna: título não inventado de cabeçalho', bo.meta.title === undefined, String(bo.meta.title));
check('bruna: tom estimado E', bo.meta.key === 'E', String(bo.meta.key));
check(
  'bruna: Pós-Refrão detectado',
  bo.sections.some((s) => s.name === 'Pós-Refrão' && s.type === 'chorus'),
);
check(
  'bruna: seção com typo cai em ending',
  bo.sections.some((s) => s.name === 'Rfráo Final' && s.type === 'ending'),
);

// sequências: mineração de padrões repetidos (SPEC_012 C, contrato novo:
// dinâmico por música, nomes sequenciais, ordenado por repetições reais)
const boSong = userSongFromDraft(chartToSongDraft(bo, { title: 'Gratidão', artist: 'Bruna Olly' }));
const seqs = detectChordSequences(boSong);
check('bruna: detectou progressões', seqs.length >= 3 && seqs.length <= 8, String(seqs.length));
check(
  'bruna: nomes sequenciais Progressão 1..N (sem "principal")',
  seqs.every((s, i) => s.name === `Progressão ${i + 1}`),
  seqs.map((s) => s.name).join(' | '),
);
check(
  'bruna: ordenado por repetições (desc)',
  seqs.every((s, i) => i === 0 || s.occurrences <= seqs[i - 1].occurrences),
  seqs.map((s) => `×${s.occurrences}`).join(' '),
);
check(
  'bruna: a mais repetida toca 2+ vezes e tem contagem alta',
  (seqs[0]?.occurrences ?? 0) >= 4,
  String(seqs[0]?.occurrences),
);
check('bruna: sem sequências duplicadas', new Set(seqs.map((s) => s.chords.join('|'))).size === seqs.length);
check(
  'bruna: toda progressão tem 2+ acordes, contagem >= 1 e seção de origem',
  seqs.every((s) => s.chords.length >= 2 && s.occurrences >= 1 && s.sections.length >= 1),
);
check(
  'bruna: refrão final + pós-refrão + final agrupados',
  seqs.some((s) => s.chords.join(' ') === 'E Bm7 A Am' && s.sections.length >= 3),
  seqs.map((s) => `${s.chords.join(' ')} [${s.sections.join(',')}]`).join('\n'),
);

// --- metadados do nome do arquivo ---
const fn = metaFromFileName('Bruna Olly - Gratidão.txt');
check('filename: artista', fn.artist === 'Bruna Olly', String(fn.artist));
check('filename: título', fn.title === 'Gratidão', String(fn.title));

// --- parseChordsText rejeita palavras que começam com A–G ---
const junk = parseChordsText('E Como Então Aleluia De As C#m7 B11 A9');
check('manual: só acordes reais', junk.join(' ') === 'E C#m7 B11 A9', junk.join(' '));

// --- round-trip de edição: songToChartText re-parseável ---
const rt = parseChordOverLyrics(songToChartText(boSong));
check('round-trip: mesmas seções', rt.sections.length === boSong.sections.length, `${rt.sections.length} vs ${boSong.sections.length}`);
// Song.chords é lista de ÚNICOS na ordem de aparição (fix do falso positivo
// do import em lote: ocorrências estouravam o teto do schema Zod). O parser
// devolve ocorrências; comparar únicos com únicos.
const rtUnique = [...new Set(rt.chords)];
check(
  'round-trip: acordes preservados',
  rtUnique.join(' ') === boSong.chords.join(' '),
  `${rtUnique.length} vs ${boSong.chords.length}`,
);

// --- auto detect ---
check('auto detect chordpro', parseChartText(chordpro).format === 'chordpro');
check('auto detect over-lyrics', parseChartText(gratidao).format === 'chord-over-lyrics');

// --- reject no chords ---
const noChords = parseChordOverLyrics('Só uma letra\nsem nenhum acorde aqui\n');
check('no chords warning', noChords.chords.length === 0);
check('no chords format unknown', noChords.format === 'unknown');

console.log(fails === 0 ? '\nTODOS OS PARSERS OK' : `\n${fails} FALHA(S)`);
process.exit(fails === 0 ? 0 : 1);
