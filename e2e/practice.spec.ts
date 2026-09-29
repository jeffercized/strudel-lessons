import { expect, test, type Page } from '@playwright/test';

const LESSON = '/lessons/lesson-01-cycles/';
const REVIEW = '/lessons/lesson-01-cycles/practice/';

const noSideScroll = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);

test.describe('inline checks', () => {
  test('every check shows its drill, none are missing', async ({ page }) => {
    await page.goto(LESSON);
    const labels = page.locator('.check .runner__label');
    await expect(labels).toHaveCount(11);
    await expect(page.locator('.check--missing')).toHaveCount(0);
    await expect(page.locator('.check[data-check="space"] .runner__label')).toHaveText('Check · Predict');
    await expect(page.locator('.check[data-check="reading"] .runner__label')).toHaveText('Check · Read');
    await noSideScroll(page);
  });

  test('a check runs to a summary, and Try again starts over', async ({ page }) => {
    await page.goto(LESSON);
    const check = page.locator('.check[data-check="space"]');
    await expect(check.locator('.runner__count')).toHaveText('1 / 2');
    await expect(check.getByRole('button', { name: 'Try again' })).toBeHidden();
    // Pattern 1 is s("bd sd") in 8 steps: bd on step 1, sd on step 5.
    await check.getByRole('button', { name: 'bd, step 1' }).click();
    await check.getByRole('button', { name: 'sd, step 5' }).click();
    await check.getByRole('button', { name: 'Check' }).click();
    await expect(check.locator('[data-predict="fb"]')).toContainText('Every step right');
    await check.getByRole('button', { name: 'Next' }).click();
    await check.getByRole('button', { name: 'Finish' }).click();
    await expect(check.locator('.runner__summary')).toHaveText('1 / 2 right.');
    await check.getByRole('button', { name: 'Try again' }).click();
    await expect(check.locator('.runner__count')).toHaveText('1 / 2');
  });

  test('one sound at a time: a check stops a lesson block, and the reverse', async ({ page }) => {
    await page.goto(LESSON);
    const block = page.locator('.strudel-block').first();
    await expect.poll(() => block.evaluate((b) => !!(b.querySelector('strudel-editor') as HTMLElement & { editor?: unknown })?.editor), { timeout: 20000 }).toBe(true);
    await block.getByRole('button', { name: '▶ Play' }).click();
    await expect(block).toHaveClass(/is-playing/);
    const ear = page.locator('.check[data-check="star"]').getByRole('button', { name: 'Play the mystery beat' });
    await ear.click();
    await expect(ear).toHaveAttribute('aria-pressed', 'true', { timeout: 20000 });
    await expect(block).not.toHaveClass(/is-playing/);
    await block.getByRole('button', { name: '▶ Play' }).click();
    await expect(block).toHaveClass(/is-playing/);
    await expect(ear).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('section progress', () => {
  test('mark complete survives reload, and Continue points at the first incomplete section', async ({ page }) => {
    await page.goto(LESSON);
    const toggles = page.locator('.section-done button');
    await expect(toggles).toHaveCount(13);
    await expect(page.locator('#cheat-cards + .section-done')).toHaveCount(0);
    await toggles.nth(0).click();
    await expect(toggles.nth(0)).toHaveText('✓ Section complete');
    await expect(page.locator('[data-progress-count]')).toHaveText('1 / 13 sections');
    await page.reload();
    await expect(page.locator('[data-progress-count]')).toHaveText('1 / 13 sections');
    await expect(page.locator('h2#the-one-big-idea')).toHaveClass(/is-complete/);
    const cont = page.getByRole('link', { name: 'Continue where you left off →' });
    await expect(cont).toHaveAttribute('href', '#1-space-next-step');
    await cont.click();
    await expect(page).toHaveURL(/#1-space-next-step$/);
    await noSideScroll(page);
  });

  test('all sections complete marks the lesson done; reset clears sections only', async ({ page }) => {
    await page.goto(LESSON);
    const toggles = page.locator('.section-done button');
    await expect(toggles).toHaveCount(13);
    for (let i = 0; i < 13; i++) await toggles.nth(i).click();
    await expect(page.locator('[data-progress-count]')).toHaveText('13 / 13 sections');
    await expect(page.getByRole('link', { name: 'Continue where you left off →' })).toBeHidden();
    await expect(page.locator('[data-done-button]')).toHaveText('✓ Done (tap to undo)');

    await page.getByRole('button', { name: 'Reset lesson progress' }).click();
    await page.getByRole('button', { name: 'Yes, reset' }).click();
    await expect(page.locator('[data-progress-count]')).toHaveText('0 / 13 sections');
    await expect(page.locator('[data-done-button]')).toHaveText('✓ Done (tap to undo)');
  });

  test('home page shows section progress per lesson', async ({ page }) => {
    await page.goto(LESSON);
    await page.locator('.section-done button').nth(0).click();
    await page.locator('.section-done button').nth(1).click();
    await page.goto('/');
    await expect(page.locator('[data-section-progress="lesson-01-cycles"]')).toHaveText('2 / 13');
  });
});

test.describe('mixed review', () => {
  test('lesson links to it, and it shows shuffled items one at a time with a summary', async ({ page }) => {
    await page.goto(LESSON);
    await page.getByRole('link', { name: 'Mixed review →' }).click();
    await expect(page).toHaveURL(REVIEW);
    await expect(page.getByRole('heading', { name: 'Mixed review' })).toBeVisible();
    await expect(page.getByRole('tab')).toHaveCount(0);
    const frame = page.locator('[data-review]');
    await expect(frame.locator('.runner__count')).toHaveText('1 / 9');
    for (let i = 1; i < 9; i++) await frame.getByRole('button', { name: 'Next' }).click();
    await expect(frame.locator('.runner__count')).toHaveText('9 / 9');
    await frame.getByRole('button', { name: 'Finish' }).click();
    await expect(frame.locator('.runner__summary')).toHaveText('0 / 9 right on the first try.');
    await frame.getByRole('button', { name: 'Start again' }).click();
    await expect(frame.locator('.runner__count')).toHaveText('1 / 9');
    await noSideScroll(page);
  });

  test('Ear never shows the answer code outside the choices', async ({ page }) => {
    await page.goto(LESSON);
    const answer = 'bd*4, hh*8';
    // The lesson itself may use the same code (the cheat card does), so compare before and after Play.
    const shown = () =>
      page.evaluate(
        (text) =>
          [...document.querySelectorAll<HTMLElement>('body *')].filter((e) => {
            if (e.closest('.practice-engine, script, .choice')) return false;
            const r = e.getBoundingClientRect();
            return r.right > 0 && r.width > 0 && e.children.length === 0 && (e.textContent ?? '').includes(text);
          }).length,
        answer,
      );
    const before = await shown();
    const check = page.locator('.check[data-check="star"]');
    await check.getByRole('button', { name: 'Play the mystery beat' }).click();
    await expect
      .poll(() => page.evaluate(() => (document.querySelector('.practice-engine strudel-editor') as HTMLElement & { editor?: { code?: string } })?.editor?.code ?? ''), { timeout: 20000 })
      .toContain(answer);
    expect(await shown()).toBe(before);
    const outsideChoices = await check.evaluate((c, text) => [...c.querySelectorAll('*')].filter((e) => !e.closest('.choice') && e.children.length === 0 && (e.textContent ?? '').includes(text)).length, answer);
    expect(outsideChoices).toBe(0);
  });
});

test('Predict: Clear works before and after Check', async ({ page }) => {
  await page.goto(LESSON);
  const check = page.locator('.check[data-check="space"]');
  const cells = check.locator('.cell');
  const clear = check.getByRole('button', { name: 'Clear' });
  await cells.nth(0).click();
  await clear.click();
  await expect(check.locator('.cell--on')).toHaveCount(0);
  await cells.nth(0).click();
  await cells.nth(3).click();
  await check.getByRole('button', { name: 'Check' }).click();
  await expect(check.locator('.cell--hit, .cell--wrong, .cell--miss')).not.toHaveCount(0);
  await clear.click();
  await expect(check.locator('.cell--hit, .cell--wrong, .cell--miss, .cell--on')).toHaveCount(0);
  await expect(check.getByRole('button', { name: 'Play it' })).toBeDisabled();
});

test('Build: hits draw live and an equivalent line matches', async ({ page }) => {
  await page.goto(LESSON);
  const check = page.locator('.check[data-check="layers"]');
  const input = check.getByLabel('Write the code');
  // Focusing the box puts the cursor between the quotes of s(""); let that happen first.
  await input.focus();
  await expect.poll(() => input.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(3);
  await input.fill('s("~ cp ~ cp, bd bd bd bd")');
  await expect(check.locator('.lane__mine--match')).toHaveCount(6);
  await expect(check.locator('[data-build="fb"]')).toContainText('Both play the same');
});

test('Fix: Enter checks the line', async ({ page }) => {
  await page.goto(LESSON);
  const check = page.locator('.check[data-check="skeleton"]');
  const input = check.getByLabel('Fix the line');
  await input.fill('s("bd sd bd sd")');
  await input.press('Enter');
  await expect(check.locator('[data-fix="fb"]')).toContainText('Fixed.');
});

test('grid diagrams play and stop, one sound at a time', async ({ page }) => {
  await page.goto(LESSON);
  const grid = (src: string) => page.locator(`.cycle-grid[data-grid-src="${src}"]`);
  await expect(page.locator('.cycle-grid [data-grid="play"]')).toHaveCount(11);
  const repeat = grid('bd!3 sd').getByRole('button', { name: '▶ Play' });
  const stretch = grid('bd@3 sd').getByRole('button', { name: '▶ Play' });
  await repeat.click();
  await expect(repeat).toHaveAttribute('aria-pressed', 'true', { timeout: 20000 });
  await stretch.click();
  await expect(stretch).toHaveAttribute('aria-pressed', 'true', { timeout: 20000 });
  await expect(repeat).toHaveAttribute('aria-pressed', 'false');
  await grid('bd@3 sd').getByRole('button', { name: '■ Stop' }).click();
  await expect(stretch).toHaveAttribute('aria-pressed', 'false');
});
