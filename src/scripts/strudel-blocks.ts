import { createStore, safeLocalStorage } from '../lib/storage';
import { evalErrorMessage, readCode, waitForEditor, type StrudelMirrorLike } from '../lib/strudel-editor';
import { strudelUrl } from '../lib/strudel-url';
import { attachLiveGrid } from './live-grid';
import { playback as coordinator } from './playback';

const store = createStore(safeLocalStorage());
const lesson = document.querySelector<HTMLElement>('[data-lesson]')?.dataset.lesson ?? 'unknown';

function isRunShortcut(e: KeyboardEvent): boolean {
  return e.key === 'Enter' && (e.metaKey || e.ctrlKey || e.altKey);
}

async function mount(block: HTMLElement): Promise<void> {
  const index = Number(block.dataset.index);
  const original = block.dataset.code ?? '';
  const id = `${lesson}:${index}`;
  const host = block.querySelector<HTMLElement>('.strudel-block__editor')!;
  const status = block.querySelector<HTMLElement>('.strudel-block__status')!;
  const openLink = block.querySelector<HTMLAnchorElement>('[data-action="open"]')!;
  const button = (action: string) => block.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!;

  // Keep the static <pre> on screen until the live editor exists, so a failed
  // script load never leaves an empty box.
  const fallback = host.querySelector('pre');
  const el = document.createElement('strudel-editor');
  host.append(el);

  let editor: StrudelMirrorLike;
  try {
    editor = await waitForEditor(el);
  } catch (err) {
    el.remove();
    status.textContent = `${(err as Error).message} Use "Open in strudel.cc" instead.`;
    return;
  }
  fallback?.remove();

  editor.setCode(store.loadCode(lesson, index, original) ?? original);

  const setPlaying = (playing: boolean) => block.classList.toggle('is-playing', playing);
  const sync = () => {
    const code = readCode(editor);
    store.saveCode(lesson, index, original, code);
    openLink.href = strudelUrl(code);
  };
  let timer: number | undefined;
  const syncSoon = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(sync, 300);
  };
  const run = async () => {
    coordinator.claim(id);
    sync();
    status.textContent = '';
    try {
      await editor.evaluate();
      const error = evalErrorMessage(editor);
      if (error) status.textContent = `Error: ${error}`;
      setPlaying(!error);
    } catch (err) {
      status.textContent = `Error: ${(err as Error).message}`;
    }
  };
  const stop = () => {
    editor.stop();
    setPlaying(false);
    coordinator.release(id);
  };

  coordinator.register(id, {
    stop: () => {
      editor.stop();
      setPlaying(false);
    },
  });

  // Strudel binds only Ctrl/Alt+Enter (run) and Ctrl/Alt+. (stop). On a Mac, Cmd+Enter would
  // insert a blank line (found in testing), so we take over all of these and run our own path.
  host.addEventListener('keydown', (e) => {
    if (isRunShortcut(e)) {
      e.preventDefault();
      e.stopPropagation();
      void run();
    } else if (e.key === '.' && (e.ctrlKey || e.metaKey || e.altKey)) {
      e.preventDefault();
      e.stopPropagation();
      stop();
    }
  }, true);
  host.addEventListener('input', syncSoon);
  host.addEventListener('keyup', syncSoon);
  host.addEventListener('paste', syncSoon);

  button('play').addEventListener('click', () => void run());
  button('stop').addEventListener('click', stop);
  button('reset').addEventListener('click', () => {
    editor.setCode(original);
    store.clearCode(lesson, index);
    openLink.href = strudelUrl(original);
  });
  attachLiveGrid(block, editor);

  // Always open the exact code on screen, even if the debounce has not fired yet.
  openLink.addEventListener('click', () => {
    openLink.href = strudelUrl(readCode(editor));
  });

  sync();
}

for (const block of document.querySelectorAll<HTMLElement>('.strudel-block')) {
  void mount(block);
}
