import { isError, parseLine } from '../../lib/practice/parse-line';
import { sameRhythm } from '../../lib/practice/rhythm';
import type { FixItem } from '../../lib/practice/types';
import { code, el, onEnter, say, type MountItem } from './ui';

/** Edit a broken line until it runs, keeping the rhythm the same. */
export const mountFix: MountItem<FixItem> = (root, item, { sound, report }) => {
  const says = el(root, '[data-fix="says"]');
  const input = el<HTMLInputElement>(root, '[data-fix="input"]');
  const fb = el(root, '[data-fix="fb"]');
  const engineButton = document.createElement('button');

  const reset = () => {
    input.value = item.broken;
    say(fb, null);
  };

  const check = () => {
    const r = parseLine(input.value);
    if (isError(r)) {
      report(false);
      return say(fb, 'bad', `Still broken. ${r.error}`);
    }
    if (item.sameRhythmAs !== null && !sameRhythm(r.mini, item.sameRhythmAs)) {
      report(false);
      return say(fb, 'bad', 'It runs now, but the rhythm changed. Fix only the error and keep the beat the same.');
    }
    report(true);
    say(fb, 'good', `Fixed. ${item.explanation}`);
  };

  says.innerHTML = `<b>Strudel says:</b> ${code(item.strudelSays)}`;
  reset();
  el(root, '[data-fix="check"]').addEventListener('click', check);
  onEnter(input, check);
  el(root, '[data-fix="reset"]').addEventListener('click', reset);
  el(root, '[data-fix="hint"]').addEventListener('click', () => say(fb, 'info', item.hint));

  return {
    // Cmd/Ctrl+Enter sends the line to real Strudel as typed, so a still-broken line shows Strudel's own error.
    playMine: () => {
      void sound.toggle(input.value, engineButton).then((error) => {
        if (error) say(fb, 'bad', `<b>Strudel says:</b> ${code(error)}`);
        else say(fb, 'info', 'Playing. Press Check when you think it is fixed.');
      });
    },
  };
};
