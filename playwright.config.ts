import { defineConfig, devices } from '@playwright/test';

// Lets the audio engine start without a real person's click, so tests load Strudel's sound worklets.
const launchOptions = { args: ['--autoplay-policy=no-user-gesture-required'] };

export default defineConfig({
  testDir: 'e2e',
  // Our own static server: it sends the same security headers as Vercel (vercel.json), so tests run under
  // the real Content-Security-Policy. (`astro preview` in Astro 7 detaches, which Playwright reads as a crash.)
  webServer: { command: 'npm run build && node e2e/serve-dist.mjs 4322', port: 4322, reuseExistingServer: false, timeout: 180000 },
  use: { baseURL: 'http://localhost:4322' },
  projects: [
    { name: 'mac-chrome', use: { ...devices['Desktop Chrome'], launchOptions } },
    { name: 'ipad', use: { ...devices['iPad Pro 11'], browserName: 'chromium', launchOptions } },
    { name: 'phone', use: { ...devices['Pixel 7'], launchOptions } },
  ],
});
