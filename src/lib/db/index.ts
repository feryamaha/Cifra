import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // mensagem genérica: sem nomes de arquivo/env no stack exposto ao client
    throw new Error('Configuração de banco indisponível.');
  }
  // channel_binding=require quebra alguns drivers Node; sslmode=require basta.
  return url.replace(/&?channel_binding=require/g, '').replace(/\?&/, '?');
}

const sql = neon(requireDatabaseUrl());

export const db = drizzle(sql, { schema });
