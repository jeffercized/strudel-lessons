import type { Hap } from '@strudel/mini';
import { eventsFromHaps } from '../lib/grid/grid-model';
import { buildLiveModel } from '../lib/grid/live-grid';
import { renderGridModel } from '../lib/grid/render-grid';
import type { StrudelMirrorLike } from '../lib/strudel-editor';

type QueryablePattern = { queryArc(b: number, e: number): Hap[] };

export function attachLiveGrid(block: HTMLElement, editor: StrudelMirrorLike): void {
  const toggle = block.querySelector<HTMLButtonElement>('[data-action="grid"]');
  const box = block.querySelector<HTMLElement>('.strudel-block__live-grid');
  if (!toggle || !box) return;
  let frame = 0;
  let drawnCycle = -1;

  const tick = () => {
    const scheduler = editor.repl?.scheduler;
    // Found in testing: the evaluated pattern lives on repl.state, not on the scheduler.
    const pattern = (editor.repl?.state?.pattern ?? scheduler?.pattern) as QueryablePattern | undefined;
    if (scheduler?.started && pattern) {
      const now = Math.max(0, scheduler.now());
      const cycle = Math.floor(now);
      if (cycle !== drawnCycle) {
        const model = buildLiveModel(eventsFromHaps(pattern.queryArc(cycle, cycle + 1), cycle));
        box.innerHTML = `<div class="cycle-grid">${renderGridModel(model)}</div>`;
        // Inside the bar, so 0–100% lines up with the boxes, not the padded frame.
        box.querySelector('.cycle-grid__bar')?.insertAdjacentHTML('beforeend', '<span class="cycle-grid__playhead"></span>');
        drawnCycle = cycle;
      }
      const head = box.querySelector<HTMLElement>('.cycle-grid__playhead');
      if (head) head.style.left = `${(now - cycle) * 100}%`;
    } else if (drawnCycle !== -2) {
      box.textContent = 'Press ▶ to see the grid.';
      drawnCycle = -2;
    }
    frame = requestAnimationFrame(tick);
  };

  toggle.addEventListener('click', () => {
    const show = box.hidden;
    box.hidden = !show;
    toggle.setAttribute('aria-pressed', String(show));
    toggle.textContent = show ? 'Hide grid' : 'Show grid';
    if (show) frame = requestAnimationFrame(tick);
    else cancelAnimationFrame(frame);
  });
}
