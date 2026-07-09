/**
 * Contrato de dados da música. Hoje vive em JSON estático (src/data/songs/*);
 * amanhã este mesmo shape vira as tabelas do banco (ver README-ARQUITETURA).
 *
 * O modelo segue a engenharia reversa do MultiTracks:
 *   - `map`: sequência de seções (o "Mapa da Música": I V1 Pr Pr R1...)
 *   - `sections`: conteúdo de cada seção, com anotações de arranjo
 *     ("Entra violão", "Grande pausa")
 *   - linhas como pares { chord, text }: o acorde ancora EXATAMENTE
 *     sobre a sílaba onde o texto do par começa. Isso evita o modelo
 *     frágil do "acorde por posição de coluna" de cifra em <pre>.
 */

export interface SongPart {
  /** símbolo do acorde no tom original, ou null para trecho sem acorde */
  chord: string | null;
  /** trecho de letra que começa sob esse acorde */
  text: string;
}

export interface SongLine {
  parts: SongPart[];
}

export type SectionType =
  | 'intro'
  | 'verse'
  | 'prechorus'
  | 'chorus'
  | 'bridge'
  | 'interlude'
  | 'solo'
  | 'ending';

export interface SongSection {
  id: string;
  type: SectionType;
  /** rótulo curto do mapa, ex: "V1", "Pr", "R1" */
  tag: string;
  name: string;
  /** anotação de arranjo, ex: "Entra guitarra e órgão" */
  annotation?: string;
  lines: SongLine[];
}

export interface Song {
  id: string;
  slug: string;
  title: string;
  artist: string;
  originalKey: string;
  bpm: number;
  timeSignature: string;
  /** sequência de execução: ids de seção na ordem tocada */
  map: string[];
  sections: SongSection[];
}
