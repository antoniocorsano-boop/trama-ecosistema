import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'no-entry-public-surface.spec.ts',
  fullyParallel: false,
  retries: 0,
  outputDir: 'test-results/no-entry',
  preserveOutput: 'always',
  use: {
    baseURL: 'http://127.0.0.1:4175',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4175',
    port: 4175,
    reuseExistingServer: false,
    env: {
      ...process.env,
      VITE_TRAMA_ENTRY_HREF: '',
    },
  },
  projects: [
    {
      name: 'no-entry-L',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
