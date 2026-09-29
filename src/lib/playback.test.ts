import { describe, expect, it, vi } from 'vitest';
import { createPlaybackCoordinator } from './playback';

describe('playback coordinator', () => {
  it('stops every other player when one claims playback', () => {
    const c = createPlaybackCoordinator();
    const a = { stop: vi.fn() };
    const b = { stop: vi.fn() };
    const d = { stop: vi.fn() };
    c.register('a', a);
    c.register('b', b);
    c.register('d', d);
    c.claim('b');
    expect(a.stop).toHaveBeenCalledOnce();
    expect(d.stop).toHaveBeenCalledOnce();
    expect(b.stop).not.toHaveBeenCalled();
    expect(c.active).toBe('b');
  });
  it('keeps going if one stop() throws', () => {
    const c = createPlaybackCoordinator();
    const ok = { stop: vi.fn() };
    c.register('bad', { stop: () => { throw new Error('boom'); } });
    c.register('ok', ok);
    c.register('me', { stop: vi.fn() });
    expect(() => c.claim('me')).not.toThrow();
    expect(ok.stop).toHaveBeenCalledOnce();
  });
  it('release clears active only for the active id', () => {
    const c = createPlaybackCoordinator();
    c.register('a', { stop: vi.fn() });
    c.claim('a');
    c.release('b');
    expect(c.active).toBe('a');
    c.release('a');
    expect(c.active).toBeNull();
  });
});
