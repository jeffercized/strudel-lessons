import { predictAnswer } from '../../lib/practice/rhythm';
import type { PredictItem } from '../../lib/practice/types';
import { el, lineOf, play, say, type MountItem } from './ui';

/** Read a pattern, tap the steps you think will play, then Check. */
export const mountPredict: MountItem<PredictItem> = (root, item, { sound, report }) => {
  const codeLine = el(root, '[data-predict="code"]');
  const grid = el(root, '[data-predict="grid"]');
  const fb = el(root, '[data-predict="fb"]');
  const playButton = el<HTMLButtonElement>(root, '[data-predict="play"]');
  const answer = predictAnswer(item.pattern, item.steps);
  const { steps } = item;
  let checked = false;
  const picked = new Set<string>();

  const draw = () => {
    const rows = answer.rows.map((sound) => {
      const row = document.createElement('div');
      row.className = 'pgrid__row';
      const name = document.createElement('span');
      name.className = 'pgrid__name';
      name.textContent = sound;
      const cells = document.createElement('div');
      cells.className = 'pgrid__cells';
      cells.style.gridTemplateColumns = `repeat(${steps}, 1fr)`;
      for (let s = 0; s < steps; s++) {
        const id = `${sound}@${s}`;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cell';
        // A line at the start of beats 2, 3 and 4.
        if (steps % 4 === 0 && s > 0 && s % (steps / 4) === 0) b.classList.add('cell--beat');
        b.setAttribute('aria-label', `${sound}, step ${s + 1}`);
        if (checked) {
          b.disabled = true;
          if (picked.has(id) && answer.cells.has(id)) b.classList.add('cell--hit');
          else if (picked.has(id)) b.classList.add('cell--wrong');
          else if (answer.cells.has(id)) b.classList.add('cell--miss');
        } else {
          b.setAttribute('aria-pressed', String(picked.has(id)));
          if (picked.has(id)) b.classList.add('cell--on');
          b.addEventListener('click', () => {
            if (picked.has(id)) picked.delete(id);
            else picked.add(id);
            b.classList.toggle('cell--on', picked.has(id));
            b.setAttribute('aria-pressed', String(picked.has(id)));
          });
        }
        cells.append(b);
      }
      row.append(name, cells);
      return row;
    });
    grid.replaceChildren(...rows);
  };

  const start = () => {
    picked.clear();
    checked = false;
    playButton.disabled = true;
    say(fb, 'info', `This cycle is split into <b>${steps} steps</b>. Tap where each sound plays.`);
    draw();
  };

  codeLine.textContent = lineOf(item.pattern);
  el(root, '[data-predict="check"]').addEventListener('click', () => {
    if (checked) return;
    checked = true;
    let hit = 0;
    let wrong = 0;
    for (const id of picked) {
      if (answer.cells.has(id)) hit++;
      else wrong++;
    }
    const missed = answer.cells.size - hit;
    draw();
    playButton.disabled = false;
    report(!wrong && !missed);
    if (!wrong && !missed) say(fb, 'good', 'Every step right. Press Play and listen along.');
    else {
      const parts = [`${hit} right`];
      if (wrong) parts.push(`${wrong} extra (red)`);
      if (missed) parts.push(`${missed} missed (outlined)`);
      say(fb, 'bad', `${parts.join(', ')}. Press Play and follow the grid while it loops.`);
    }
  });
  el(root, '[data-predict="clear"]').addEventListener('click', () => {
    // After Check, Clear starts this pattern over: taps, colours and Play all reset.
    if (checked) sound.stop();
    start();
  });
  playButton.addEventListener('click', () => void play(sound, lineOf(item.pattern), playButton, fb));
  start();
  return {};
};
