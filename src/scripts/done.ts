import { createStore, safeLocalStorage } from '../lib/storage';

const store = createStore(safeLocalStorage());

for (const mark of document.querySelectorAll<HTMLElement>('[data-done-mark]')) {
  mark.hidden = !store.isDone(mark.dataset.doneMark ?? '');
}

// Home page: "6 / 13" sections complete per lesson.
for (const el of document.querySelectorAll<HTMLElement>('[data-section-progress]')) {
  const slugs = JSON.parse(el.dataset.slugs ?? '[]') as string[];
  const done = store.loadSections(el.dataset.sectionProgress ?? '');
  const n = slugs.filter((s) => done.has(s)).length;
  el.textContent = `${n} / ${slugs.length}`;
  el.title = `${n} of ${slugs.length} sections complete`;
}

const button = document.querySelector<HTMLButtonElement>('[data-done-button]');
if (button) {
  const lesson = button.dataset.doneButton ?? '';
  const paint = () => {
    const done = store.isDone(lesson);
    button.textContent = done ? '✓ Done (tap to undo)' : 'Mark lesson done';
    button.setAttribute('aria-pressed', String(done));
  };
  paint();
  button.addEventListener('click', () => {
    store.setDone(lesson, !store.isDone(lesson));
    paint();
  });
  // Completing every section marks the lesson done (src/scripts/sections.ts).
  document.addEventListener('lesson-done-changed', paint);
}
