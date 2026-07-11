/** Utilitários compartilhados dos parsers de cifra. */

/**
 * Acorde no estilo cifra brasileira / Cifra Club.
 * Exemplos: C, G/B, C#m7, F7M, Bm7(b5), Cadd9, Gsus4, C°, Caug, C9, F7M(9)
 */
export const CHORD_TOKEN_RE =
  /^[A-G](?:#|b)?(?:m(?!aj)|maj|min|dim|aug|sus\d*|add\d+|M|°|º|\+)?(?:\d+)?(?:\(?(?:b|#|maj|min|add|sus|dim|aug|M)?\d*\)?)*(?:\/[A-G](?:#|b)?)?$/i;

/** Palavras que NÃO são acordes mesmo se casarem parcialmente */
const FALSE_POSITIVES = new Set(
  [
    'a',
    'e', // só se isoladas em frase — tratamos por contexto de linha
    'de',
    'do',
    'da',
    'em',
    'no',
    'na',
    'um',
    'uma',
    'os',
    'as',
    'ao',
    'ou',
    'se',
    'me',
    'te',
    'lhe',
    'intro',
    'verso',
    'ponte',
    'solo',
    'final',
    'riff',
    'capo',
    'tom',
    'bpm',
    'x',
    '2x',
    '3x',
    '4x',
  ].map((s) => s.toLowerCase()),
);

export function isChordToken(token: string): boolean {
  const t = token.trim();
  if (!t || t.length > 20) return false;
  // remove adornos comuns do CC
  const clean = t.replace(/[|]+$/g, '').replace(/,$/, '');
  // Falso positivo só em minúsculas puras (preposições: "em", "de") —
  // "Em" / "Am" são acordes menores válidos.
  if (clean === clean.toLowerCase() && FALSE_POSITIVES.has(clean.toLowerCase())) {
    // exceção: acorde de uma letra minúscula não existe; a/e sozinhos rejeitados
    return false;
  }
  return CHORD_TOKEN_RE.test(clean);
}

/** Normaliza notação comum → BR leve */
export function normalizeChord(symbol: string): string {
  let s = symbol.trim().replace(/[|]+$/g, '').replace(/,$/, '');
  s = s.replace(/º/g, '°');
  s = s.replace(/maj7/gi, '7M').replace(/Maj7/g, '7M');
  s = s.replace(/min(?![a-z])/gi, 'm');
  s = s.replace(/^([A-G](?:#|b)?)maj$/i, '$1');
  s = s.replace(/^([A-G](?:#|b)?)\+$/, '$1aug');
  return s;
}

export function slugifySection(name: string, i: number): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `${base || 'sec'}_${i + 1}`;
}

export function detectSectionType(
  label: string,
): 'intro' | 'verse' | 'prechorus' | 'chorus' | 'bridge' | 'interlude' | 'solo' | 'ending' {
  const n = label.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (/intro|introducao|inicio/.test(n)) return 'intro';
  if (/pre[\s-]?refr|pre[\s-]?chorus|prechorus|pre-refr/.test(n)) return 'prechorus';
  if (/refr|chorus|coro/.test(n)) return 'chorus';
  if (/ponte|bridge/.test(n)) return 'bridge';
  if (/solo/.test(n)) return 'solo';
  if (/interlud|instrumental|passagem/.test(n)) return 'interlude';
  if (/final|outro|ending|fim|coda/.test(n)) return 'ending';
  if (/verso|verse|estrofe|parte|estrofa/.test(n)) return 'verse';
  return 'verse';
}

export function sectionTag(type: string, n: number): string {
  const map: Record<string, string> = {
    intro: 'I',
    verse: 'V',
    prechorus: 'Pr',
    chorus: 'R',
    bridge: 'B',
    interlude: 'Inst',
    solo: 'S',
    ending: 'F',
  };
  const base = map[type] || 'S';
  return type === 'intro' || type === 'ending' ? base : `${base}${n}`;
}

export function sectionName(type: string, n: number, original?: string): string {
  if (original?.trim()) {
    // limpa colchetes e "2x"
    return original
      .replace(/^[[\s(]+|[\]\s)]+$/g, '')
      .replace(/\s*2x\s*$/i, '')
      .trim();
  }
  const map: Record<string, string> = {
    intro: 'Introdução',
    verse: `Verso ${n}`,
    prechorus: `Pré-Refrão ${n}`,
    chorus: `Refrão ${n}`,
    bridge: `Ponte ${n}`,
    interlude: `Interlúdio ${n}`,
    solo: `Solo ${n}`,
    ending: 'Final',
  };
  return map[type] || `Seção ${n}`;
}

/**
 * Extrai título/artista do nome do arquivo enviado.
 * Convenção "Artista - Título.txt" (ex: "Bruna Olly - Gratidão.txt").
 */
export function metaFromFileName(fileName: string): { title?: string; artist?: string } {
  const base = fileName
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_]+/g, ' ')
    .trim();
  if (!base) return {};
  const parts = base.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
  }
  return { title: base };
}

/** Expand tabs para espaços (preserva alinhamento coluna Cifra Club) */
export function expandTabs(line: string, tabSize = 4): string {
  let out = '';
  for (const ch of line) {
    if (ch === '\t') {
      const n = tabSize - (out.length % tabSize);
      out += ' '.repeat(n);
    } else {
      out += ch;
    }
  }
  return out;
}

/** Remove lixo típico de copy do Cifra Club / sites */
export function sanitizeChartText(text: string): string {
  let t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // zero-width / nbsp
  t = t.replace(/[\u200B-\u200D\uFEFF]/g, '');
  t = t.replace(/\u00A0/g, ' ');
  // linhas de ruído de UI
  const noise =
    /^(cifra\s*club|cifraclub|ultimate\s*guitar|contribu[ií]d[oa]|enviad[oa]\s+por|ver\s+tradu[cç]|imprimir|baixar|favoritar|comentar|http[s]?:\/\/|www\.|capotraste\s+não|tom\s+original\s*:?\s*$)/i;
  t = t
    .split('\n')
    .filter((line) => !noise.test(line.trim()))
    .join('\n');
  return t;
}
