import { revalidatePath } from 'next/cache';

/**
 * Revalidação sob demanda do conteúdo público (SPEC_012 A4).
 * Com ISR ativo (home 120s, cifra 300s), TODA mutação de catálogo feita pelo
 * admin chama isto para o público ver a mudança imediatamente, sem esperar a
 * janela de revalidação.
 */
export function revalidateSongContent(slug?: string): void {
  try {
    revalidatePath('/');
    revalidatePath('/sitemap.xml');
    if (slug) revalidatePath(`/musica/${slug}`);
  } catch {
    // revalidação é otimização: nunca derruba a mutação que a chamou
  }
}
