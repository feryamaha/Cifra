import type { NotationMode } from '@/types/music/transform.types';
import type { ViewType } from '@/types/song/song-view.types';

export type SongDeepLinkState = {
  transpose: number;
  capo: number;
  tuningId: string;
  notation: NotationMode;
  simplified: boolean;
  viewType: ViewType;
  twoColumns: boolean;
  lefty: boolean;
  inlineDiagrams: boolean;
};

const VIEW_TYPES: ViewType[] = ['chords-lyrics', 'lyrics', 'map', 'chords-only'];
const NOTATIONS: NotationMode[] = ['letters', 'numbers', 'roman', 'solfege'];

function clampInt(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function parseSongDeepLink(search: string): Partial<SongDeepLinkState> {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const out: Partial<SongDeepLinkState> = {};
  if (q.has('tom')) out.transpose = clampInt(Number(q.get('tom')), -11, 11);
  if (q.has('capo')) out.capo = clampInt(Number(q.get('capo')), 0, 12);
  const tun = q.get('afinacao');
  if (tun && /^[a-zA-Z0-9_-]{1,40}$/.test(tun)) out.tuningId = tun;
  const not = q.get('notacao');
  if (not && NOTATIONS.includes(not as NotationMode)) out.notation = not as NotationMode;
  if (q.has('simplificado')) out.simplified = q.get('simplificado') === '1';
  const tipo = q.get('tipo');
  if (tipo && VIEW_TYPES.includes(tipo as ViewType)) out.viewType = tipo as ViewType;
  if (q.has('cols')) out.twoColumns = q.get('cols') === '2';
  if (q.has('canhoto')) out.lefty = q.get('canhoto') === '1';
  if (q.has('diagramas')) out.inlineDiagrams = q.get('diagramas') === '1';
  return out;
}

export function buildSongDeepLinkQuery(state: SongDeepLinkState): string {
  const q = new URLSearchParams();
  if (state.transpose !== 0) q.set('tom', String(state.transpose));
  if (state.capo !== 0) q.set('capo', String(state.capo));
  if (state.tuningId && state.tuningId !== 'standard') q.set('afinacao', state.tuningId);
  if (state.notation !== 'letters') q.set('notacao', state.notation);
  if (state.simplified) q.set('simplificado', '1');
  if (state.viewType !== 'chords-lyrics') q.set('tipo', state.viewType);
  if (state.twoColumns) q.set('cols', '2');
  if (state.lefty) q.set('canhoto', '1');
  if (state.inlineDiagrams) q.set('diagramas', '1');
  const s = q.toString();
  return s ? `?${s}` : '';
}
