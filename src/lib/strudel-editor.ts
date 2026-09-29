/** The parts of Strudel's editor object (StrudelMirror) we use. Names confirmed in testing. */
export interface StrudelMirrorLike {
  evaluate(): unknown;
  stop(): void;
  setCode(code: string): void;
  code?: string;
  editor?: { state: { doc: { toString(): string } } };
  repl?: {
    scheduler?: { now(): number; started?: boolean; pattern?: unknown };
    state?: { pattern?: unknown; evalError?: unknown };
  };
}

type StrudelElement = HTMLElement & { editor?: StrudelMirrorLike };

/** Wait until <strudel-editor> has created its editor object. */
export async function waitForEditor(el: HTMLElement, timeoutMs = 15000): Promise<StrudelMirrorLike> {
  // Start the clock first: if the Strudel script never loads, whenDefined() never settles.
  const start = performance.now();
  const target = el as StrudelElement;
  while (!target.editor) {
    if (performance.now() - start > timeoutMs) throw new Error('The Strudel player did not load.');
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return target.editor;
}

/** The code currently in the editor, including unsaved typing. */
export function readCode(editor: StrudelMirrorLike): string {
  return editor.editor?.state.doc.toString() ?? editor.code ?? '';
}

/** Strudel reports code errors in repl state instead of throwing. */
export function evalErrorMessage(editor: StrudelMirrorLike): string | null {
  const err = editor.repl?.state?.evalError;
  if (!err) return null;
  return err instanceof Error ? err.message : String(err);
}
