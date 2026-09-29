import type { EarItem } from '../../lib/practice/types';
import { code, el, lineOf, play, say, shuffle, type MountItem } from './ui';

/** Hear a mystery beat and pick the line that made it. */
export const mountEar: MountItem<EarItem> = (root, item, { sound, report }) => {
  const playButton = el<HTMLButtonElement>(root, '[data-ear="play"]');
  const choices = el(root, '[data-ear="choices"]');
  const fb = el(root, '[data-ear="fb"]');
  let done = false;

  say(fb, 'info', 'Press play first. Pick when you think you know.');
  const buttons = shuffle([item.answer, ...item.decoys]).map((option) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice';
    b.textContent = lineOf(option);
    b.addEventListener('click', () => {
      if (done) return;
      done = true;
      const good = option === item.answer;
      report(good);
      for (const other of buttons) {
        other.disabled = true;
        if (other === b) other.classList.add(good ? 'choice--right' : 'choice--wrong');
        else if (other.textContent === lineOf(item.answer)) other.classList.add('choice--right');
      }
      say(
        fb,
        good ? 'good' : 'bad',
        good ? 'Right. Keep it playing and read along.' : `It was ${code(lineOf(item.answer))}. Keep it playing and listen for the difference.`,
      );
    });
    return b;
  });
  choices.replaceChildren(...buttons);

  // The code goes only into the hidden engine, so the answer never shows on screen.
  playButton.addEventListener('click', () => void play(sound, lineOf(item.answer), playButton, fb));
  return {};
};
