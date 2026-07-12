import { defineConfig, devices } from '@playwright/test';

/**
 * Suíte E2E (SPEC_009 / ISSUE_004 §2).
 * Alvo: dev server local. Next 16 bloqueia segundo `next dev` no mesmo
 * diretório, então reuseExistingServer aproveita o server já ativo.
 * Timeouts largos por causa do compile sob demanda do Turbopack em dev.
 */
export default defineConfig({
  testDir: './tests/e2e',
  // Dev server (Turbopack) compila rota a rota: 1 worker evita saturar o
  // compile com navegações paralelas (1ª execução com 2 workers = timeouts).
  timeout: 90_000,
  expect: { timeout: 20_000 },
  retries: 1,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1440, height: 900 },
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
