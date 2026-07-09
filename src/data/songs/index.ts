/**
 * Registro de músicas do protótipo. Com banco de dados, este módulo
 * vira a camada de acesso: const song = await db.song.findUnique({ where: { slug } }).
 * Os componentes não mudam em nada: eles só conhecem o contrato Song.
 */

import type { Song } from '@/types/song/song.types';
import estradaDeTerra from './estrada-de-terra.json';

export const SONGS: Record<string, Song> = {
  [estradaDeTerra.slug]: estradaDeTerra as Song,
};
