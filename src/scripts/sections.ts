import { countDone, firstIncomplete, type Section } from '../lib/progress';
import { createStore, safeLocalStorage } from '../lib/storage';

// Section progress on a lesson page: a "Mark section complete" toggle at the end of each
// section, a check mark on its heading, the progress strip at the top, and Reset.
const store = createStore(safeLocalStorage());
const strip = document.querySelector<HTMLElement>('[data-progress]');

if (strip) {
  const lesson = strip.dataset.progress!;
  const sections = JSON.parse(strip.dataset.sections!) as Section[];
  const countEl = strip.querySelector<HTMLElement>('[data-progress-count]')!;
  const continueLink = strip.querySelector<HTMLAnchorElement>('[data-progress-continue]')!;
  const toggles = new Map<string, HTMLButtonElement>();

  /** Put the toggle at the end of the section: before the next ## heading, and before a --- rule if one ends the section. */
  for (const s of sections) {
    const heading = document.getElementById(s.slug);
    if (!heading) continue;
    let last: Element = heading;
    while (last.nextElementSibling && last.nextElementSibling.tagName !== 'H2') last = last.nextElementSibling;
    const row = document.createElement('div');
    row.className = 'section-done';
    const button = document.createElement('button');
    button.type = 'button';
    button.addEventListener('click', () => {
      store.setSection(lesson, s.slug, !store.loadSections(lesson).has(s.slug));
      paint();
    });
    row.append(button);
    if (last.tagName === 'HR') last.before(row);
    else last.after(row);
    toggles.set(s.slug, button);
  }

  const paint = () => {
    const done = store.loadSections(lesson);
    for (const s of sections) {
      const on = done.has(s.slug);
      const button = toggles.get(s.slug);
      if (button) {
        button.textContent = on ? '✓ Section complete' : 'Mark section complete';
        button.setAttribute('aria-pressed', String(on));
      }
      document.getElementById(s.slug)?.classList.toggle('is-complete', on);
      strip.querySelector(`[data-section-link="${CSS.escape(s.slug)}"]`)?.classList.toggle('is-complete', on);
    }
    const n = countDone(sections, done);
    countEl.textContent = `${n} / ${sections.length} sections`;
    const next = firstIncomplete(sections, done);
    continueLink.hidden = next === null;
    if (next) continueLink.href = `#${next.slug}`;
    // All sections complete marks the lesson done. The manual Done button still works either way.
    if (next === null && sections.length > 0 && !store.isDone(lesson)) {
      store.setDone(lesson, true);
      document.dispatchEvent(new CustomEvent('lesson-done-changed'));
    }
  };

  const reset = document.querySelector<HTMLElement>('[data-progress-reset]');
  if (reset) {
    const ask = reset.querySelector<HTMLButtonElement>('[data-reset="ask"]')!;
    const confirmRow = reset.querySelector<HTMLElement>('[data-reset="confirm"]')!;
    const note = reset.querySelector<HTMLElement>('[data-reset="note"]')!;
    ask.addEventListener('click', () => {
      confirmRow.hidden = false;
      ask.hidden = true;
      note.textContent = '';
    });
    reset.querySelector('[data-reset="cancel"]')!.addEventListener('click', () => {
      confirmRow.hidden = true;
      ask.hidden = false;
    });
    reset.querySelector('[data-reset="yes"]')!.addEventListener('click', () => {
      store.resetSections(lesson);
      paint();
      confirmRow.hidden = true;
      ask.hidden = false;
      note.textContent = 'Section progress cleared.';
    });
  }

  paint();
}
