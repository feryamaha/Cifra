'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ChordDiagram } from '@/components/ui/ChordDiagram';
import chordDb from '@/data/chords/guitar-chords-db.json';
import { TUNING_LIST, TUNINGS } from '@/data/music/tunings.data';
import { chordPitchClasses, parseChord } from '@/lib/music/chords';
import { mapRootToDbKey, mapSuffixToDb } from '@/lib/music/chords-db.adapter';
import { findVoicings } from '@/lib/music/voicing';
import type { Voicing } from '@/types/music/voicing.types';

interface DbPosition {
  frets: number[];
  fingers: number[];
  barres: number[];
  capo?: boolean;
  baseFret: number;
  midi: number[];
}

interface DbChord {
  key: string;
  suffix: string;
  positions: DbPosition[];
}

type ChordDbData = {
  chords: Record<string, DbChord[]>;
};

interface DisplayVoicing {
  voicing: Voicing;
  label: string;
  source: 'db' | 'engine';
}

/**
 * Posição do chords-db → Voicing com trastes ABSOLUTOS.
 * No banco os frets são relativos ao baseFret (ex.: baseFret 3 + fret 1 =
 * casa 3 real). Sem o offset, todo shape de braço acima renderiza errado.
 */
function dbPositionToVoicing(pos: DbPosition): Voicing {
  const offset = pos.baseFret > 1 ? pos.baseFret - 1 : 0;
  const frets = pos.frets.map((f) => (f === -1 ? null : f === 0 ? 0 : f + offset));
  const fingers = pos.fingers.map((f) => (f === -1 ? null : f));
  const barre = pos.barres.length > 0 ? pos.barres[0] + offset : null;
  return { frets, fingers, barre, score: 0 };
}

function fretsKey(frets: (number | null)[]): string {
  return frets.map((f) => (f === null ? 'x' : f)).join(',');
}

function searchChordDb(query: string): Voicing[] {
  const parsed = parseChord(query.trim());
  if (!parsed) return [];

  const db = chordDb as unknown as ChordDbData;
  const dbKey = mapRootToDbKey(parsed.root);
  const suffix = mapSuffixToDb(parsed.suffix);

  const candidates = db.chords[dbKey];
  if (!candidates) return [];

  let match = candidates.find((c) => c.suffix === suffix);
  if (!match) {
    const altSuffix = suffix.replace(/[()]/g, '');
    match = candidates.find((c) => c.suffix === altSuffix);
  }
  if (!match) return [];

  return match.positions.map(dbPositionToVoicing);
}

function searchEngine(query: string, tuningId: string, limit: number): Voicing[] {
  const parsed = parseChord(query.trim());
  if (!parsed) return [];

  const tuning = TUNINGS[tuningId] ?? TUNINGS.standard;
  const target = chordPitchClasses(parsed);
  return findVoicings(tuning.strings, target, limit);
}

const MAX_VARIATIONS = 16;

/**
 * Banco (shapes consagrados, com dedilhado revisado) + motor dinâmico
 * (variações extras pela afinação), sem duplicar o mesmo desenho.
 */
function searchAllVariations(query: string, tuningId: string): DisplayVoicing[] {
  const fromDb = tuningId === 'standard' ? searchChordDb(query) : [];
  const fromEngine = searchEngine(query, tuningId, MAX_VARIATIONS);

  const seen = new Set<string>();
  const merged: DisplayVoicing[] = [];
  for (const v of fromDb) {
    const key = fretsKey(v.frets);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({ voicing: v, label: `Posição ${merged.length + 1}`, source: 'db' });
  }
  for (const v of fromEngine) {
    if (merged.length >= MAX_VARIATIONS) break;
    const key = fretsKey(v.frets);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({ voicing: v, label: `Posição ${merged.length + 1}`, source: 'engine' });
  }
  return merged;
}

export function ChordDictionary() {
  const [query, setQuery] = useState('C');
  const [lefty, setLefty] = useState(false);
  const [tuningId, setTuningId] = useState('standard');

  const results = useMemo<DisplayVoicing[]>(() => {
    const symbol = query.trim() || 'C';
    return searchAllVariations(symbol, tuningId);
  }, [query, tuningId]);

  const tuning = TUNINGS[tuningId] ?? TUNINGS.standard;

  return (
    <Card className="mx-auto w-[85%] space-y-6 p-4 px-6">
      <label className="block space-y-1">
        <span className="font-mono text-[10px] uppercase text-neutral-500">
          Acorde (notacao BR)
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: C, Dm, F7M, Bm7(b5), G/B"
          className="w-full rounded-lg border border-stroke-200 bg-secondary-900 px-3 py-2.5 font-mono text-sm outline-none focus:border-primary-500"
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <select
            value={tuningId}
            onChange={(e) => setTuningId(e.target.value)}
            className="rounded-lg border border-stroke-200 bg-secondary-900 px-2 py-1.5 text-sm"
          >
            {TUNING_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input type="checkbox" checked={lefty} onChange={(e) => setLefty(e.target.checked)} />
          Canhoto (espelhar)
        </label>
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-auxiliary-danger-default">
          Acorde nao reconhecido ou sem shape encontrado.
        </p>
      ) : (
        <>
          <p className="text-xs text-neutral-500">
            {results.length} {results.length > 1 ? 'variações encontradas' : 'variação encontrada'}
            {results.some((r) => r.source === 'db') && results.some((r) => r.source === 'engine')
              ? ' (shapes consagrados + variações calculadas para explorar o braço)'
              : ''}
          </p>
          <div className="grid grid-cols-2 gap-4 @tablet:grid-cols-3 @Desktop:grid-cols-4">
            {results.map((r, i) => (
              <div
                key={`${r.label}-${i}`}
                className={`flex flex-col items-center gap-2 ${lefty ? 'scale-x-[-1]' : ''}`}
              >
                <span
                  className={`font-chakra text-xs text-neutral-500 ${lefty ? 'scale-x-[-1]' : ''}`}
                >
                  {r.label}
                </span>
                <ChordDiagram
                  voicing={r.voicing}
                  tuning={tuning}
                  label={query.trim() || 'C'}
                  size="md"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
