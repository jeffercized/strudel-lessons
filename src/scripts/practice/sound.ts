import { evalErrorMessage, waitForEditor, type StrudelMirrorLike } from '../../lib/strudel-editor';
import { playback } from '../playback';

/**
 * One hidden Strudel editor plays every sound on the practice page.
 * One engine means only one thing can ever play at a time, and the Ear drill's
 * answer is never shown on screen: the code only goes into this invisible editor.
 */
export interface Sound {
  /** Play code, or stop if this button is already playing. Returns Strudel's error text, if any. */
  toggle(code: string, button: HTMLButtonElement): Promise<string | null>;
  stop(): void;
}

const ID = 'drills';

function createSound(): Sound {
  // <strudel-editor> puts its visible code box *next to* itself, not inside, so the
  // off-screen wrapper is what keeps the code (and the Ear answer) off the page.
  const box = document.createElement('div');
  box.className = 'practice-engine';
  box.setAttribute('aria-hidden', 'true');
  box.inert = true;
  const el = document.createElement('strudel-editor');
  box.append(el);
  document.body.append(box);
  const ready: Promise<StrudelMirrorLike> = waitForEditor(el);
  let playing: HTMLButtonElement | null = null;

  const mark = (button: HTMLButtonElement | null, on: boolean) => {
    button?.classList.toggle('is-on', on);
    button?.setAttribute('aria-pressed', String(on));
  };

  const silence = () => {
    mark(playing, false);
    playing = null;
    ready.then((editor) => editor.stop()).catch(() => {});
  };
  const stop = () => {
    silence();
    playback.release(ID);
  };
  // A lesson block starting elsewhere on the page stops the drill sound.
  playback.register(ID, { stop: silence });

  return {
    stop,
    async toggle(code, button) {
      if (playing === button) {
        stop();
        return null;
      }
      mark(playing, false);
      playing = button;
      mark(button, true);
      playback.claim(ID);
      let editor: StrudelMirrorLike;
      try {
        editor = await ready;
      } catch (err) {
        stop();
        return (err as Error).message;
      }
      // Another button may have been pressed while the engine was loading.
      if (playing !== button) return null;
      try {
        editor.setCode(code);
        await editor.evaluate();
        const error = evalErrorMessage(editor);
        if (error) stop();
        return error;
      } catch (err) {
        stop();
        return (err as Error).message;
      }
    },
  };
}

let shared: Sound | null = null;

/** The page's one hidden player, shared by checks, grids and the Mixed review. */
export function pageSound(): Sound {
  shared ??= createSound();
  return shared;
}
