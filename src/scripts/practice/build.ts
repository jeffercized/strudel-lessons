import { escapeHtml } from '../../lib/escape-html';
import { isError, parseLine } from '../../lib/practice/parse-line';
import { buildLanes, sameRhythm } from '../../lib/practice/rhythm';
import type { BuildItem } from '../../lib/practice/types';
import { code, el, lineOf, onEnter, play, playLine, say, type MountItem } from './ui';

const START = 's("")';
const pct = (n: number) => `${Number((n * 100).toFixed(4))}%`;

/** See and hear a target rhythm, then write the code. Hits appear live while typing. */
export const mountBuild: MountItem<BuildItem> = (root, item, { sound, report }) => {
  const grid = el(root, '[data-build="grid"]');
  const input = el<HTMLInputElement>(root, '[data-build="input"]');
  const fb = el(root, '[data-build="fb"]');
  const hearTarget = el<HTMLButtonElement>(root, '[data-build="play-target"]');
  const playMine = el<HTMLButtonElement>(root, '[data-build="play-mine"]');
  let usedHint = false;

  const drawLanes = (mine: string | null) => {
    const nums = '<div class="lanes__nums"><span></span><div><span>1</span><span>2</span><span>3</span><span>4</span></div></div>';
    const rows = buildLanes(item.target, mine).map((lane) => {
      const beats = [0.25, 0.5, 0.75].map((b) => `<span class="lane__beat" style="left:${pct(b)}"></span>`).join('');
      const target = lane.target
        .map((e) => `<span class="lane__target" style="left:calc(${pct(e.begin)} + 2px);width:calc(${pct(e.end - e.begin)} - 4px)"></span>`)
        .join('');
      const hits = lane.mine
        .map(
          (e) =>
            `<span class="lane__mine lane__mine--${e.match ? 'match' : 'off'}" style="left:calc(${pct(e.begin)} + 6px);width:max(6px, calc(${pct(e.end - e.begin)} - 12px))"></span>`,
        )
        .join('');
      return `<div class="lanes__row"><span class="lanes__name">${escapeHtml(lane.sound)}</span><div class="lane">${beats}${target}${hits}</div></div>`;
    });
    grid.innerHTML = `<div class="lanes">${nums}${rows.join('')}</div>`;
  };

  /** Live update while typing. `force` also shows the error for the untouched starting line. */
  const update = (force = false) => {
    const r = parseLine(input.value);
    drawLanes(isError(r) ? null : r.mini);
    if (isError(r)) {
      if (force || input.value.trim() !== START) say(fb, 'bad', r.error);
      return;
    }
    if (sameRhythm(r.mini, item.target)) {
      // Right means matched without the hint.
      report(!usedHint);
      say(fb, 'good', r.mini.trim() === item.target ? 'Match.' : `Match. The version from the lesson is ${code(lineOf(item.target))}. Both play the same.`);
    } else {
      say(fb, 'info', "Keep going. Green hits are right; red ones aren't in the target.");
    }
  };

  input.value = START;
  say(fb, 'info', 'Listen, look at the outlined target, then write the line. Start between the quotes.');
  update();
  input.addEventListener('input', () => update());
  onEnter(input, () => update(true));
  input.addEventListener('focus', () => {
    if (input.value === START) setTimeout(() => input.setSelectionRange(3, 3), 0);
  });
  hearTarget.addEventListener('click', () => void play(sound, lineOf(item.target), hearTarget, fb));
  const mine = () => void playLine(sound, input.value, playMine, fb);
  playMine.addEventListener('click', mine);
  el(root, '[data-build="hint"]').addEventListener('click', () => {
    usedHint = true;
    say(fb, 'info', item.hint);
  });
  return { playMine: mine };
};
