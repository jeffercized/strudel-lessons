import { describe, expect, it } from 'vitest';
import { parseMeta } from './parse-meta';

describe('parseMeta', () => {
  it('reads title="..." including unicode', () => {
    expect(parseMeta('title="Techno skeleton — 130 BPM"')).toEqual({ title: 'Techno skeleton — 130 BPM' });
  });
  it('reads several keys, like id="…"', () => {
    expect(parseMeta('id="brackets" title="Split"')).toEqual({ id: 'brackets', title: 'Split' });
  });
  it('returns {} for empty or missing meta', () => {
    expect(parseMeta(null)).toEqual({});
    expect(parseMeta(undefined)).toEqual({});
    expect(parseMeta('')).toEqual({});
  });
});
