/** Política de senha do lado do servidor (nunca confiar só no client). */

export function validatePasswordStrength(
  password: string,
): { ok: true } | { ok: false; error: string } {
  if (password.length < 8) {
    return { ok: false, error: 'A senha deve ter pelo menos 8 caracteres.' };
  }
  if (password.length > 128) {
    return { ok: false, error: 'Senha inválida.' };
  }
  // bloqueia senhas trivialmente fracas sem listar dicionário completo
  const lower = password.toLowerCase();
  const banned = ['12345678', 'password', 'senha123', 'qwerty12', 'cifra123', 'admin123'];
  if (banned.includes(lower)) {
    return { ok: false, error: 'Escolha uma senha mais forte.' };
  }
  return { ok: true };
}
