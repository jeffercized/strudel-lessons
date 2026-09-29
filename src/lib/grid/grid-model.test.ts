import { describe, expect, it } from 'vitest';
import { assignLanes, buildGridModel, fillRests, labelOf, queryCycle, type GridSegment } from './grid-model';

/** Compare [begin, end, label] triples with float tolerance. */
function expectSegments(actual: GridSegment[], expected: [number, number, string | null][]) {
  expect(actual.length).toBe(expected.length);
  actual.forEach((seg, i) => {
    const [b, e, label] = expected[i];
    expect(seg.begin).toBeCloseTo(b, 9);
    expect(seg.end).toBeCloseTo(e, 9);
    expect(seg.label).toBe(label);
  });
}

const oneRow = (src: string) => {
  const model = buildGridModel(src);
  expect(model.cycles).toHaveLength(1);
  expect(model.cycles[0].label).toBeNull();
  expect(model.cycles[0].rows).toHaveLength(1);
  return model.cycles[0].rows[0];
};

describe('event positions from the Strudel parser', () => {
  it('bd [sd sd]', () => {
    expectSegments(oneRow('bd [sd sd]'), [[0, 0.5, 'bd'], [0.5, 0.75, 'sd'], [0.75, 1, 'sd']]);
  });
  it('rests become null segments: bd ~ bd ~', () => {
    expectSegments(oneRow('bd ~ bd ~'), [[0, 0.25, 'bd'], [0.25, 0.5, null], [0.5, 0.75, 'bd'], [0.75, 1, null]]);
  });
  it('hh*8 is eight equal eighths', () => {
    const row = oneRow('hh*8');
    expect(row).toHaveLength(8);
    row.forEach((s, i) => {
      expect(s.begin).toBeCloseTo(i / 8, 9);
      expect(s.end).toBeCloseTo((i + 1) / 8, 9);
    });
  });
  it('bd*3 sd squeezes three kicks into the first half', () => {
    expectSegments(oneRow('bd*3 sd'), [[0, 1 / 6, 'bd'], [1 / 6, 1 / 3, 'bd'], [1 / 3, 0.5, 'bd'], [0.5, 1, 'sd']]);
  });
  it('bd!3 sd is four quarters', () => {
    expectSegments(oneRow('bd!3 sd'), [[0, 0.25, 'bd'], [0.25, 0.5, 'bd'], [0.5, 0.75, 'bd'], [0.75, 1, 'sd']]);
  });
  it('bd@3 sd stretches the kick to 3/4', () => {
    expectSegments(oneRow('bd@3 sd'), [[0, 0.75, 'bd'], [0.75, 1, 'sd']]);
  });
  it('bd(3,8) is the tresillo with rests between', () => {
    expectSegments(oneRow('bd(3,8)'), [
      [0, 0.125, 'bd'], [0.125, 0.375, null], [0.375, 0.5, 'bd'], [0.5, 0.75, null], [0.75, 0.875, 'bd'], [0.875, 1, null],
    ]);
  });
});

describe('layers', () => {
  it('bd*4, ~ cp ~ cp, hh*8 gives three rows', () => {
    const model = buildGridModel('bd*4, ~ cp ~ cp, hh*8');
    expect(model.cycles).toHaveLength(1);
    const [kick, clap, hats] = model.cycles[0].rows;
    expect(kick).toHaveLength(4);
    expectSegments(clap, [[0, 0.25, null], [0.25, 0.5, 'cp'], [0.5, 0.75, null], [0.75, 1, 'cp']]);
    expect(hats).toHaveLength(8);
  });
  it('overlapping events inside one layer go into separate lanes', () => {
    const model = buildGridModel('[bd, sd] hh');
    const rows = model.cycles[0].rows;
    expect(rows).toHaveLength(2);
    expectSegments(rows[0], [[0, 0.5, 'bd'], [0.5, 1, 'hh']]);
    expectSegments(rows[1], [[0, 0.5, 'sd'], [0.5, 1, null]]);
  });
});

describe('< > shows four labelled cycles', () => {
  it('bd sd bd <sd [sd sd]>', () => {
    const model = buildGridModel('bd sd bd <sd [sd sd]>');
    expect(model.cycles.map((c) => c.label)).toEqual(['cycle 1', 'cycle 2', 'cycle 3', 'cycle 4']);
    expect(model.cycles[0].rows[0].at(-1)).toMatchObject({ label: 'sd' });
    expect(model.cycles[0].rows[0].at(-1)!.begin).toBeCloseTo(0.75, 9);
    const c2 = model.cycles[1].rows[0];
    expectSegments(c2.slice(-2), [[0.75, 0.875, 'sd'], [0.875, 1, 'sd']]);
  });
});

describe('helpers', () => {
  it('labelOf handles strings, numbers, sample indexes and objects', () => {
    expect(labelOf('bd')).toBe('bd');
    expect(labelOf(60)).toBe('60');
    expect(labelOf(['bd', 3])).toBe('bd:3');
    expect(labelOf({ s: 'hh', gain: 0.5 })).toBe('hh');
    expect(labelOf({ note: 'c3' })).toBe('c3');
  });
  it('queryCycle returns cycle-relative times', () => {
    const events = queryCycle('bd sd', 3);
    expect(events[0].begin).toBeCloseTo(0, 9);
    expect(events[1].end).toBeCloseTo(1, 9);
  });
  it('fillRests of nothing is one full rest', () => {
    expectSegments(fillRests([]), [[0, 1, null]]);
  });
  it('assignLanes of nothing is one empty lane', () => {
    expect(assignLanes([])).toEqual([[]]);
  });
  it('buildGridModel throws on invalid mini-notation', () => {
    expect(() => buildGridModel('bd [sd')).toThrow();
  });
});

describe('events longer than one cycle (review finding)', () => {
  it('bd/2 sd: the kick starts only every other bar, so cycles are labelled and the tail is "held"', () => {
    const model = buildGridModel('bd/2 sd');
    expect(model.cycles.map((c) => c.label)).toEqual(['cycle 1', 'cycle 2', 'cycle 3', 'cycle 4']);
    const [c1, c2] = model.cycles.map((c) => c.rows[0]);
    expect(c1[0]).toMatchObject({ label: 'bd' });
    expect(c1[0].held).toBeFalsy();
    expect(c2[0]).toMatchObject({ label: 'bd', held: true });
  });
});
