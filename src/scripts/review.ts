import type { PracticeData } from '../lib/practice/types';
import { DRILL_NAMES, installRunKeys, runItems } from './practice/runner';
import { pageSound } from './practice/sound';
import { shuffle } from './practice/ui';

// The Mixed review: every review item, shuffled, one at a time.
const frame = document.querySelector<HTMLElement>('[data-review]')!;
const { review } = JSON.parse(document.getElementById('practice-data')!.textContent!) as Pick<PracticeData, 'review'>;
installRunKeys();
runItems(frame, review, {
  sound: pageSound(),
  label: (e) => DRILL_NAMES[e.type],
  order: shuffle,
  summary: (right, total) =>
    right === total ? `${right} / ${total} right. Every one on the first try.` : `${right} / ${total} right on the first try.`,
  restartLabel: 'Start again',
});
