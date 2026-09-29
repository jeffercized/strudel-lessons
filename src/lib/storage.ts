export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const KEY_PREFIX = 'strudel-lessons:';

interface SavedCode {
  original: string;
  code: string;
}

/** localStorage, or null when the browser blocks it (e.g. private browsing). */
export function safeLocalStorage(): KeyValueStore | null {
  try {
    const s = window.localStorage;
    const probe = `${KEY_PREFIX}__probe`;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function createStore(backing: KeyValueStore | null) {
  const get = (key: string): string | null => {
    try {
      return backing?.getItem(KEY_PREFIX + key) ?? null;
    } catch {
      return null;
    }
  };
  const set = (key: string, value: string): void => {
    try {
      backing?.setItem(KEY_PREFIX + key, value);
    } catch {
      // Storage full or blocked: edits just won't persist.
    }
  };
  const remove = (key: string): void => {
    try {
      backing?.removeItem(KEY_PREFIX + key);
    } catch {
      // Ignore, same reason as above.
    }
  };
  const codeKey = (lesson: string, index: number) => `code:${lesson}:${index}`;
  const doneKey = (lesson: string) => `done:${lesson}`;
  const sectionsKey = (lesson: string) => `sections:${lesson}`;
  const loadSections = (lesson: string): Set<string> => {
    const raw = get(sectionsKey(lesson));
    if (raw === null) return new Set();
    try {
      const list: unknown = JSON.parse(raw);
      return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : []);
    } catch {
      return new Set();
    }
  };

  return {
    loadCode(lesson: string, index: number, original: string): string | null {
      const raw = get(codeKey(lesson, index));
      if (raw === null) return null;
      try {
        const saved = JSON.parse(raw) as Partial<SavedCode>;
        // An edit made against an older version of the lesson is stale.
        if (saved.original !== original || typeof saved.code !== 'string') return null;
        return saved.code;
      } catch {
        return null;
      }
    },
    saveCode(lesson: string, index: number, original: string, code: string): void {
      if (code === original) remove(codeKey(lesson, index));
      else set(codeKey(lesson, index), JSON.stringify({ original, code } satisfies SavedCode));
    },
    clearCode(lesson: string, index: number): void {
      remove(codeKey(lesson, index));
    },
    isDone(lesson: string): boolean {
      return get(doneKey(lesson)) === '1';
    },
    setDone(lesson: string, done: boolean): void {
      if (done) set(doneKey(lesson), '1');
      else remove(doneKey(lesson));
    },
    /** Heading slugs of the sections marked complete. Slugs, not positions, so new sections don't shift them. */
    loadSections,
    setSection(lesson: string, slug: string, complete: boolean): void {
      const done = loadSections(lesson);
      if (complete) done.add(slug);
      else done.delete(slug);
      if (done.size === 0) remove(sectionsKey(lesson));
      else set(sectionsKey(lesson), JSON.stringify([...done]));
    },
    /** Clears section completion only: code edits and the lesson's Done mark stay. */
    resetSections(lesson: string): void {
      remove(sectionsKey(lesson));
    },
  };
}

export type LessonStore = ReturnType<typeof createStore>;
