import { describe, expect, it } from 'vitest';
import { createStore, KEY_PREFIX, type KeyValueStore } from './storage';

function memory(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwing: KeyValueStore = {
  getItem: () => { throw new Error('SecurityError'); },
  setItem: () => { throw new Error('QuotaExceededError'); },
  removeItem: () => { throw new Error('SecurityError'); },
};

describe('code edits', () => {
  it('returns null when nothing is saved', () => {
    expect(createStore(memory()).loadCode('l1', 0, 'orig')).toBeNull();
  });
  it('saves and loads an edit per lesson and block index', () => {
    const m = memory();
    const s = createStore(m);
    s.saveCode('l1', 2, 'orig', 'edited');
    expect(s.loadCode('l1', 2, 'orig')).toBe('edited');
    expect(s.loadCode('l1', 3, 'orig')).toBeNull();
    expect(m.data.has(`${KEY_PREFIX}code:l1:2`)).toBe(true);
  });
  it('removes the saved edit when the code equals the original again', () => {
    const m = memory();
    const s = createStore(m);
    s.saveCode('l1', 0, 'orig', 'edited');
    s.saveCode('l1', 0, 'orig', 'orig');
    expect(m.data.size).toBe(0);
  });
  it('clearCode removes the edit (Reset)', () => {
    const s = createStore(memory());
    s.saveCode('l1', 0, 'orig', 'edited');
    s.clearCode('l1', 0);
    expect(s.loadCode('l1', 0, 'orig')).toBeNull();
  });
  it('ignores a stale edit when the lesson original changed', () => {
    const s = createStore(memory());
    s.saveCode('l1', 0, 'old original', 'my edit');
    expect(s.loadCode('l1', 0, 'new original')).toBeNull();
  });
  it('ignores corrupt stored JSON', () => {
    const m = memory();
    m.data.set(`${KEY_PREFIX}code:l1:0`, '{not json');
    expect(createStore(m).loadCode('l1', 0, 'orig')).toBeNull();
  });
  it('keeps code with quotes, newlines and unicode exactly', () => {
    const s = createStore(memory());
    const code = 's("bd*4")\n$: s(\'hh\') // é —';
    s.saveCode('l1', 0, 'orig', code);
    expect(s.loadCode('l1', 0, 'orig')).toBe(code);
  });
});

describe('done flags', () => {
  it('toggles done', () => {
    const s = createStore(memory());
    expect(s.isDone('l1')).toBe(false);
    s.setDone('l1', true);
    expect(s.isDone('l1')).toBe(true);
    s.setDone('l1', false);
    expect(s.isDone('l1')).toBe(false);
  });
});

describe('section progress', () => {
  it('stores completion per lesson, keyed by heading slug', () => {
    const m = memory();
    const s = createStore(m);
    s.setSection('l1', '4--split-one-step', true);
    s.setSection('l1', 'tempo-setcpm', true);
    expect([...s.loadSections('l1')].sort()).toEqual(['4--split-one-step', 'tempo-setcpm']);
    expect(s.loadSections('l2').size).toBe(0);
    expect(JSON.parse(m.data.get(`${KEY_PREFIX}sections:l1`)!)).toContain('tempo-setcpm');
  });
  it('un-marking removes the slug, and the key when none are left', () => {
    const m = memory();
    const s = createStore(m);
    s.setSection('l1', 'a', true);
    s.setSection('l1', 'a', false);
    expect(s.loadSections('l1').size).toBe(0);
    expect(m.data.has(`${KEY_PREFIX}sections:l1`)).toBe(false);
  });
  it('reset clears sections only, not code edits or the done mark', () => {
    const s = createStore(memory());
    s.setSection('l1', 'a', true);
    s.saveCode('l1', 0, 'orig', 'edited');
    s.setDone('l1', true);
    s.resetSections('l1');
    expect(s.loadSections('l1').size).toBe(0);
    expect(s.loadCode('l1', 0, 'orig')).toBe('edited');
    expect(s.isDone('l1')).toBe(true);
  });
  it('ignores broken saved data', () => {
    const m = memory();
    m.data.set(`${KEY_PREFIX}sections:l1`, '{not json');
    expect(createStore(m).loadSections('l1').size).toBe(0);
    m.data.set(`${KEY_PREFIX}sections:l1`, '[1, "ok"]');
    expect([...createStore(m).loadSections('l1')]).toEqual(['ok']);
  });
});

describe('no usable storage', () => {
  for (const [name, backing] of [['null', null], ['throwing', throwing]] as const) {
    it(`never throws with ${name} backing`, () => {
      const s = createStore(backing);
      expect(() => s.saveCode('l1', 0, 'o', 'x')).not.toThrow();
      expect(s.loadCode('l1', 0, 'o')).toBeNull();
      expect(() => s.clearCode('l1', 0)).not.toThrow();
      expect(() => s.setDone('l1', true)).not.toThrow();
      expect(s.isDone('l1')).toBe(false);
      expect(() => s.setSection('l1', 'a', true)).not.toThrow();
      expect(s.loadSections('l1').size).toBe(0);
      expect(() => s.resetSections('l1')).not.toThrow();
    });
  }
});
