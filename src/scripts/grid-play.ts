import { pageSound } from './practice/sound';

// ▶ Play / ■ Stop under each ```grid diagram: plays s("<the grid's rhythm>") through the page's
// hidden player, so it follows the same one-sound-at-a-time rule as lesson blocks and checks.
const grids = [...document.querySelectorAll<HTMLElement>('.cycle-grid[data-grid-src]')];
if (grids.length > 0) {
  const sound = pageSound();
  for (const grid of grids) {
    const code = `s(${JSON.stringify(grid.dataset.gridSrc ?? '')})`;
    const playButton = grid.querySelector<HTMLButtonElement>('[data-grid="play"]')!;
    const status = grid.querySelector<HTMLElement>('.cycle-grid__status')!;
    playButton.addEventListener('click', async () => {
      if (playButton.classList.contains('is-on')) return; // Already playing this one.
      status.textContent = '';
      const error = await sound.toggle(code, playButton);
      if (error) status.textContent = `Error: ${error}`;
    });
    grid.querySelector('[data-grid="stop"]')!.addEventListener('click', () => {
      if (playButton.classList.contains('is-on')) sound.stop();
    });
  }
}
