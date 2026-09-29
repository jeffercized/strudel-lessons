import { expect, test, type Page } from '@playwright/test';

const LESSON = '/lessons/lesson-01-cycles/';

/** Collect every Content-Security-Policy violation from the moment the page starts. */
async function watchViolations(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI || 'inline'}`),
    );
  });
  return () => page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
}

test('security headers are sent', async ({ request }) => {
  const res = await request.get(LESSON);
  const h = res.headers();
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('sound plays under the security policy, with nothing blocked', async ({ page }) => {
  const violations = await watchViolations(page);
  await page.goto(LESSON);
  const block = page.locator('.strudel-block').first();
  await expect.poll(() => block.evaluate((b) => !!(b.querySelector('strudel-editor') as HTMLElement & { editor?: unknown })?.editor), { timeout: 20000 }).toBe(true);
  await block.getByRole('button', { name: '▶ Play' }).click();
  await expect(block).toHaveClass(/is-playing/);
  // The audio engine is really running, which means its worklets loaded.
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { getAudioContext?: () => AudioContext }).getAudioContext?.().state), { timeout: 20000 })
    .toBe('running');
  // Samples load from GitHub.
  await expect
    .poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((e) => e.name.includes('raw.githubusercontent.com'))), { timeout: 20000 })
    .toBe(true);
  // A grid and a check use the hidden player.
  await page.locator('.cycle-grid [data-grid="play"]').first().click();
  await page.locator('.check[data-check="star"]').getByRole('button', { name: 'Play the mystery beat' }).click();
  await page.waitForTimeout(2000);
  expect(await violations()).toEqual([]);
});

test('the policy blocks what it should', async ({ page }) => {
  await page.goto(LESSON);
  const result = await page.evaluate(async () => {
    const s = document.createElement('script');
    s.textContent = 'window.__inlineRan = true';
    document.body.append(s);
    await new Promise((r) => setTimeout(r, 200));
    let otherHost = 'allowed';
    try {
      await fetch('https://unpkg.com/@strudel/repl@1.3.0/package.json'); // unpkg is allowed for scripts only
    } catch {
      otherHost = 'blocked';
    }
    return { inlineRan: (window as unknown as { __inlineRan?: boolean }).__inlineRan === true, otherHost };
  });
  expect(result).toEqual({ inlineRan: false, otherHost: 'blocked' });
});
