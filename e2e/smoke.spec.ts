import { expect, test } from '@playwright/test';

const LESSON = '/lessons/lesson-01-cycles/';

test('home lists lesson 1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('1. Cycles & mini-notation')).toBeVisible();
});

test('lesson 1 has every block, and no horizontal scroll', async ({ page }) => {
  await page.goto(LESSON);
  await expect(page.locator('.strudel-block')).toHaveCount(13);
  await expect(page.locator('.cycle-grid')).toHaveCount(11);
  await expect(page.locator('.cycle-grid--error')).toHaveCount(0);
  await expect(page.locator('.callout--piano')).toHaveCount(5);
  await expect(page.locator('.callout--key')).toHaveCount(1);
  await expect(page.locator('.check')).toHaveCount(11);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('players mount', async ({ page }) => {
  await page.goto(LESSON);
  // Lesson players only; the page also has one hidden player for the checks.
  await expect(page.locator('.strudel-block strudel-editor')).toHaveCount(13);
  // Each element must have finished creating its editor, with the lesson's code loaded.
  const ready = () =>
    page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('.strudel-block')].filter((b) => {
        const el = b.querySelector('strudel-editor') as (HTMLElement & { editor?: { code?: string } }) | null;
        return el?.editor?.code === b.dataset.code;
      }).length,
    );
  await expect.poll(ready, { timeout: 20000 }).toBe(13);
});

test('every page links to the source code (AGPL)', async ({ page }) => {
  for (const path of ['/', LESSON, '/lessons/lesson-01-cycles/practice/']) {
    await page.goto(path);
    await expect(page.locator('.site-footer').getByRole('link', { name: 'Source code' })).toHaveAttribute('href', 'https://github.com/jeffercized/strudel-lessons');
    await expect(page.locator('.site-footer').getByRole('link', { name: 'AGPL-3.0' })).toBeVisible();
  }
});

test('every page has the tab icon and share-preview tags', async ({ page, request }) => {
  for (const path of ['/', LESSON]) {
    await page.goto(path);
    for (const sel of ['link[rel="icon"][type="image/svg+xml"]', 'link[rel="apple-touch-icon"]']) {
      const href = await page.locator(sel).getAttribute('href');
      expect((await request.get(href!)).status()).toBe(200);
    }
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', await page.title());
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://strudel.frequency.fyi${path}`);
  }
  expect((await request.get('/favicon.ico')).status()).toBe(200);
});
