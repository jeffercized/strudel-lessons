import { escapeHtml } from '../../lib/escape-html';
import { isError, lineToCode, parseLine, type ParsedLine } from '../../lib/practice/parse-line';
import type { Sound } from './sound';

/** What a drill item gets from the runner that shows it. */
export interface ItemContext {
  sound: Sound;
  /** Say how an attempt went. Only the first call counts toward the score. */
  report(right: boolean): void;
}

export interface ItemHandle {
  /** Cmd/Ctrl+Enter: play the learner's own line, if this item has one. */
  playMine?(): void;
}

export type MountItem<T> = (root: HTMLElement, item: T, ctx: ItemContext) => ItemHandle;

export type Feedback = 'good' | 'bad' | 'info';

export function el<T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Missing ${selector}`);
  return found;
}

/** Show a message (HTML) in a feedback box, or clear it. */
export function say(box: HTMLElement, kind: Feedback | null, html = ''): void {
  box.className = kind ? `feedback feedback--${kind}` : 'feedback';
  box.innerHTML = html;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const code = (text: string) => `<code>${escapeHtml(text)}</code>`;
export const lineOf = (mini: string) => `s(${JSON.stringify(mini)})`;

/** Play (or stop) some code; if Strudel reports an error, show it. */
export async function play(sound: Sound, source: string, button: HTMLButtonElement, box: HTMLElement): Promise<void> {
  const error = await sound.toggle(source, button);
  if (error) say(box, 'bad', `<b>Strudel says:</b> ${code(error)}`);
}

/** Check the learner's line first, so they get the friendly message instead of Strudel's. */
export function playLine(sound: Sound, typed: string, button: HTMLButtonElement, box: HTMLElement): ParsedLine | null {
  const r = parseLine(typed);
  if (isError(r)) {
    if (button.classList.contains('is-on')) sound.stop();
    say(box, 'bad', r.error);
    return null;
  }
  void play(sound, lineToCode(r), button, box);
  return r;
}

export function onEnter(input: HTMLInputElement, action: () => void): void {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      action();
    }
  });
}
