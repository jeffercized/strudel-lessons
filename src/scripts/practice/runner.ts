import type { DrillEntry, DrillType } from '../../lib/practice/types';
import { mountBuild } from './build';
import { mountEar } from './ear';
import { mountFix } from './fix';
import { mountPredict } from './predict';
import { mountRead } from './read';
import type { Sound } from './sound';
import { mountType } from './type';
import type { ItemContext, ItemHandle } from './ui';

export const DRILL_NAMES: Record<DrillType, string> = {
  read: 'Read',
  type: 'Type',
  predict: 'Predict',
  build: 'Build',
  ear: 'Ear',
  fix: 'Fix',
};

// Each drill is self-contained: to remove one, delete its script, its <template> and its line here.
function mountEntry(root: HTMLElement, entry: DrillEntry, ctx: ItemContext): ItemHandle {
  switch (entry.type) {
    case 'read':
      return mountRead(root, entry.item, ctx);
    case 'type':
      return mountType(root, entry.item, ctx);
    case 'predict':
      return mountPredict(root, entry.item, ctx);
    case 'build':
      return mountBuild(root, entry.item, ctx);
    case 'ear':
      return mountEar(root, entry.item, ctx);
    case 'fix':
      return mountFix(root, entry.item, ctx);
  }
}

export interface RunOptions {
  sound: Sound;
  /** Shown above each item, e.g. "Check · Predict". */
  label(entry: DrillEntry): string;
  /** HTML for the end, given how many were right on the first try. */
  summary(right: number, total: number): string;
  restartLabel: string;
  /** Order for each run (the Mixed review reshuffles on Start again). */
  order?(entries: DrillEntry[]): DrillEntry[];
}

const handles = new WeakMap<HTMLElement, ItemHandle>();

/** Show drill items one at a time with a counter, a Next button and a summary at the end. */
export function runItems(frame: HTMLElement, entries: DrillEntry[], opts: RunOptions): void {
  frame.classList.add('runner');
  frame.innerHTML = [
    '<div class="runner__head"><span class="runner__label"></span><span class="counter runner__count"></span></div>',
    '<div class="runner__item"></div>',
    '<div class="runner__foot"><button type="button" class="runner__next"></button></div>',
    '<div class="runner__done" hidden><p class="runner__summary" role="status"></p><button type="button" class="runner__again"></button></div>',
  ].join('');
  const q = <T extends HTMLElement>(s: string) => frame.querySelector<T>(s)!;
  const label = q('.runner__label');
  const count = q('.runner__count');
  const itemBox = q('.runner__item');
  const foot = q('.runner__foot');
  const next = q<HTMLButtonElement>('.runner__next');
  const done = q('.runner__done');
  const again = q<HTMLButtonElement>('.runner__again');
  again.textContent = opts.restartLabel;

  let list: DrillEntry[] = [];
  let index = 0;
  let right = 0;

  const show = () => {
    const entry = list[index];
    let reported = false;
    const ctx: ItemContext = {
      sound: opts.sound,
      report(ok) {
        // Only the first try counts; learners can keep trying after that.
        if (reported) return;
        reported = true;
        if (ok) right++;
      },
    };
    const template = document.querySelector<HTMLTemplateElement>(`template[data-drill="${entry.type}"]`);
    if (!template) throw new Error(`No <template data-drill="${entry.type}"> on this page`);
    itemBox.replaceChildren(template.content.cloneNode(true));
    const root = itemBox.firstElementChild as HTMLElement;
    handles.set(frame, mountEntry(root, entry, ctx));
    label.textContent = opts.label(entry);
    count.textContent = list.length > 1 ? `${index + 1} / ${list.length}` : '';
    next.textContent = index === list.length - 1 ? 'Finish' : 'Next';
  };

  const start = () => {
    list = opts.order ? opts.order(entries) : entries;
    index = 0;
    right = 0;
    done.hidden = true;
    itemBox.hidden = false;
    foot.hidden = false;
    show();
  };

  next.addEventListener('click', () => {
    opts.sound.stop();
    if (index < list.length - 1) {
      index++;
      show();
      return;
    }
    itemBox.hidden = true;
    foot.hidden = true;
    count.textContent = '';
    handles.delete(frame);
    q('.runner__summary').innerHTML = opts.summary(right, list.length);
    done.hidden = false;
  });
  again.addEventListener('click', start);
  start();
}

let keysInstalled = false;

/** Cmd/Ctrl+Enter plays the learner's line in whichever runner has the focus. */
export function installRunKeys(): void {
  if (keysInstalled) return;
  keysInstalled = true;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !(e.metaKey || e.ctrlKey)) return;
    const frame = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('.runner');
    const handle = frame ? handles.get(frame) : undefined;
    if (!handle?.playMine) return;
    e.preventDefault();
    handle.playMine();
  });
}
