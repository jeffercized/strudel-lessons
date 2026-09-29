import { escapeHtml } from '../../lib/escape-html';
import { isError, parseLine } from '../../lib/practice/parse-line';
import { sameRhythm } from '../../lib/practice/rhythm';
import { GAP, type TypeItem } from '../../lib/practice/types';
import { code, el, onEnter, play, playLine, say, type MountItem } from './ui';

type Level = 'trace' | 'gaps' | 'memory';

/** Type a line: trace it, fill the gaps, or write it from memory. */
export const mountType: MountItem<TypeItem> = (root, item, { sound, report }) => {
  const levels = el(root, '[data-type="levels"]');
  const prompt = el(root, '[data-type="prompt"]');
  const target = el(root, '[data-type="target"]');
  const input = el<HTMLInputElement>(root, '[data-type="input"]');
  const fb = el(root, '[data-type="fb"]');
  const checkButton = el<HTMLButtonElement>(root, '[data-type="check"]');
  const hearTarget = el<HTMLButtonElement>(root, '[data-type="play-target"]');
  const playMine = el<HTMLButtonElement>(root, '[data-type="play-mine"]');
  let level: Level = 'trace';

  const wanted = (() => {
    const r = parseLine(item.code);
    return isError(r) ? null : r.mini;
  })();

  const renderTarget = () => {
    const line = item.code;
    const typed = input.value;
    if (level === 'trace') {
      let html = '';
      for (let i = 0; i < line.length; i++) {
        const ch = escapeHtml(line[i]);
        if (i < typed.length) {
          const shown = typed[i] === ' ' && line[i] !== ' ' ? '·' : ch;
          html += `<span class="${typed[i] === line[i] ? 'ok' : 'no'}">${shown}</span>`;
        } else {
          html += `<span class="todo${i === typed.length ? ' cur' : ''}">${ch}</span>`;
        }
      }
      target.innerHTML = html;
      target.hidden = false;
    } else if (level === 'gaps') {
      target.innerHTML = [...item.gaps].map((ch) => (ch === GAP ? `<span class="mask">${GAP}</span>` : escapeHtml(ch))).join('');
      target.hidden = false;
    } else {
      target.hidden = true;
    }
  };

  const render = () => {
    prompt.innerHTML =
      level === 'trace'
        ? 'Type the line exactly. Mistakes turn red as you go.'
        : level === 'gaps'
          ? `Each ${GAP} is one missing character. Type the whole line.`
          : `Write the line from memory: <em>${escapeHtml(item.description)}</em>`;
    checkButton.hidden = level === 'trace';
    hearTarget.hidden = level === 'trace';
    input.value = '';
    say(fb, null);
    renderTarget();
  };

  const check = () => {
    const r = parseLine(input.value);
    if (isError(r)) {
      report(false);
      return say(fb, 'bad', r.error);
    }
    if (wanted !== null && sameRhythm(r.mini, wanted)) {
      report(true);
      const exact = input.value.trim() === item.code;
      say(fb, 'good', exact ? 'Correct.' : `Correct. It plays the same as ${code(item.code)}, written a different way.`);
    } else {
      report(false);
      say(fb, 'bad', 'The code works, but it plays a different rhythm. Hear the target and compare.');
    }
  };

  levels.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-level]');
    if (!b) return;
    level = b.dataset.level as Level;
    for (const x of levels.querySelectorAll('button')) x.setAttribute('aria-pressed', String(x === b));
    sound.stop();
    render();
  });
  input.addEventListener('input', () => {
    renderTarget();
    if (level !== 'trace') return say(fb, null);
    if (input.value === item.code) {
      report(true);
      say(fb, 'good', 'Exact match. Press <b>Play my line</b> to hear it, then try <b>Fill the gaps</b>.');
    } else if (input.value.length >= item.code.length) say(fb, 'bad', 'Almost. Look for the red characters.');
    else say(fb, null);
  });
  onEnter(input, () => {
    if (level !== 'trace') check();
  });
  checkButton.addEventListener('click', check);
  hearTarget.addEventListener('click', () => void play(sound, item.code, hearTarget, fb));
  const mine = () => void playLine(sound, input.value, playMine, fb);
  playMine.addEventListener('click', mine);
  render();
  return { playMine: mine };
};
