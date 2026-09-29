import { describe, expect, it } from 'vitest';
import { buildLiveModel } from './live-grid';

describe('buildLiveModel', () => {
  it('makes one row per sound, in first-seen order, with rests filled', () => {
    const model = buildLiveModel([
      { begin: 0, end: 0.25, label: 'bd' },
      { begin: 0, end: 0.125, label: 'hh' },
      { begin: 0.5, end: 0.75, label: 'bd' },
    ]);
    expect(model.cycles).toHaveLength(1);
    const [bd, hh] = model.cycles[0].rows;
    expect(bd.map((s) => s.label)).toEqual(['bd', null, 'bd', null]);
    expect(hh.map((s) => s.label)).toEqual(['hh', null]);
  });
});
