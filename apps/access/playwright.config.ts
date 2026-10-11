import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3100', trace: 'retain-on-failure' },
  webServer: {
    command: 'ACCESS_PROVIDER_KIND=fake ACCESS_STORE_KIND=memory ACCESS_ORIGIN=http://localhost:3100 ACCESS_E2E_SEED=1 ACCESS_TEST_OTP=123456 npm run dev -- -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ]
});
