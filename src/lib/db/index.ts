import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type Db = NeonHttpDatabase<typeof schema>;

function sanitizeUrl(url: string): string {
  // channel_binding=require quebra alguns drivers Node; sslmode=require basta.
  return url.replace(/&?channel_binding=require/g, '').replace(/\?&/, '?');
}

/**
 * Conexão LAZY: a instância só é criada na PRIMEIRA query, não no import.
 * Evita falha no `next build` (collect de /api/*) quando DATABASE_URL ainda
 * não está no ambiente de build (SPEC_011 / ISSUE_005).
 */
let instance: Db | null = null;

export function getDb(): Db {
  if (instance) return instance;
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    // mensagem genérica: sem nomes de arquivo/env no stack exposto ao client
    throw new Error('Configuração de banco indisponível.');
  }
  instance = drizzle(neon(sanitizeUrl(url)), { schema });
  return instance;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = getDb() as object;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});
