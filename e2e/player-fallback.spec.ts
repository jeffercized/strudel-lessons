import { expect, test } from '@playwright/test';

// Review finding: if the Strudel script never loads, players must not go blank.
test('players keep the code and explain when the Strudel script fails to load', async ({ page }) => {
  test.setTimeout(60000);
  await page.route('**/unpkg.com/**', (route) => route.abort());
  await page.goto('/lessons/lesson-01-cycles/');
  const first = page.locator('.strudel-block').first();
  await expect(first.locator('.strudel-block__status')).toContainText('did not load', { timeout: 30000 });
  await expect(first.locator('.strudel-block__editor pre')).toContainText('s("bd sd bd sd")');
});
