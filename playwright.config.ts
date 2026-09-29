import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  // Plain static server: `astro preview` in Astro 7 detaches, which Playwright reads as a crash.
  webServer: { command: 'npm run build && npx --yes http-server dist -p 4322 -s', port: 4322, reuseExistingServer: false, timeout: 180000 },
  use: { baseURL: 'http://localhost:4322' },
  projects: [
    { name: 'mac-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'ipad', use: { ...devices['iPad Pro 11'], browserName: 'chromium' } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
