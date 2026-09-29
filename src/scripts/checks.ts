import { escapeHtml } from '../lib/escape-html';
import type { DrillEntry, PracticeData } from '../lib/practice/types';
import { DRILL_NAMES, installRunKeys, runItems } from './practice/runner';
import { pageSound } from './practice/sound';

// Fills each ```check id="…" placeholder in a lesson with its drill from the practice JSON.
const blocks = [...document.querySelectorAll<HTMLElement>('.check[data-check]')];
if (blocks.length > 0) {
  const json = document.getElementById('practice-data')?.textContent;
  const checks: PracticeData['checks'] = json ? (JSON.parse(json) as Pick<PracticeData, 'checks'>).checks : {};
  const sound = pageSound();
  installRunKeys();
  for (const block of blocks) {
    const id = block.dataset.check ?? '';
    const def = checks[id];
    if (!def) {
      // A production build fails before this can happen; in dev, make the mistake impossible to miss.
      block.classList.add('check--missing');
      block.innerHTML = `missing check: <code>${escapeHtml(id || '(no id)')}</code>`;
      continue;
    }
    const entries = def.items.map((item) => ({ type: def.type, item }) as DrillEntry);
    runItems(block, entries, {
      sound,
      label: (e) => `Check · ${DRILL_NAMES[e.type]}`,
      summary: (right, total) => (right === total ? `${right} / ${total} right. Nice, move on.` : `${right} / ${total} right.`),
      restartLabel: 'Try again',
    });
  }
}
