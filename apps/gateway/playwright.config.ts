import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  outputDir: 'test-results',
  preserveOutput: 'always',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4174',
    port: 4174,
    reuseExistingServer: false,
    env: {
      ...process.env,
      VITE_TRAMA_ENTRY_HREF: '/ecosistema',
    },
  },
  projects: [
    {
      name: 'S',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'M',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'L',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'LIM',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 900 } },
    },
  ],
});
