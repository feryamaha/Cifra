/**
 * Sanitização de texto de usuário.
 * Política: saída sempre como texto puro (React escapa). Não usar como “XSS HTML sanitizer”.
 */

/** Remove caracteres de controle e limita tamanho. */
export function sanitizePlainText(input: string, maxLen: number): string {
  let out = '';
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127)) {
      out += input[i];
    }
  }
  return out.trim().slice(0, maxLen);
}

/**
 * Remove tags angulares de forma best-effort (não é parser HTML).
 * Preferir sanitizePlainText + renderização em texto React.
 * // nosemgrep: R2 — texto puro; nunca injetar em dangerouslySetInnerHTML
 */
export function stripHtml(input: string): string {
  let out = '';
  let inTag = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '<') {
      inTag = true;
      continue;
    }
    if (ch === '>') {
      inTag = false;
      continue;
    }
    if (!inTag) out += ch;
  }
  return out;
}
