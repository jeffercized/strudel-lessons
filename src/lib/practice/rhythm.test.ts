import { describe, expect, it } from 'vitest';
import { buildLanes, fitsSteps, onsets, predictAnswer, rhythmKey, sameRhythm } from './rhythm';

describe('sameRhythm', () => {
  it('bd(3,8) is the same beat as bd ~ ~ bd ~ ~ bd ~', () => {
    expect(sameRhythm('bd(3,8)', 'bd ~ ~ bd ~ ~ bd ~')).toBe(true);
  });
  it('bd!3 sd is the same as bd bd bd sd', () => {
    expect(sameRhythm('bd!3 sd', 'bd bd bd sd')).toBe(true);
  });
  it('bd*4 is the same as bd bd bd bd and [bd bd] [bd bd]', () => {
    expect(sameRhythm('bd*4', 'bd bd bd bd')).toBe(true);
    expect(sameRhythm('bd*4', '[bd bd] [bd bd]')).toBe(true);
  });
  it('layer order does not matter', () => {
    expect(sameRhythm('bd*4, ~ cp ~ cp', '~ cp ~ cp, bd*4')).toBe(true);
  });
  it('different timing is a different beat', () => {
    expect(sameRhythm('bd*3 sd', 'bd!3 sd')).toBe(false);
    expect(sameRhythm('bd@3 sd', 'bd!3 sd')).toBe(false);
    expect(sameRhythm('bd*4, hh*4', 'bd*4, [~ hh]*4')).toBe(false);
  });
  it('different sounds at the same time are a different beat', () => {
    expect(sameRhythm('bd sd', 'bd cp')).toBe(false);
  });
  it('looks past the first cycle: <sd [sd sd]> is not sd', () => {
    expect(sameRhythm('bd sd bd <sd [sd sd]>', 'bd sd bd sd')).toBe(false);
    expect(sameRhythm('bd sd bd <sd [sd sd]>', '<[bd sd bd sd] [bd sd bd [sd sd]]>')).toBe(true);
  });
  it('a held note is not a new onset: bd@3 sd vs bd ~ ~ sd', () => {
    expect(sameRhythm('bd@3 sd', 'bd ~ ~ sd')).toBe(true);
  });
  it('invalid mini-notation is never the same', () => {
    expect(sameRhythm('bd [sd', 'bd [sd')).toBe(false);
  });
});

describe('rhythmKey', () => {
  it('throws on invalid mini-notation', () => {
    expect(() => rhythmKey('bd [sd')).toThrow();
  });
});

describe('onsets', () => {
  it('gives times inside the asked cycle', () => {
    expect(onsets('bd sd', 2).map((e) => [e.begin, e.sound])).toEqual([[0, 'bd'], [0.5, 'sd']]);
  });
});

describe('predictAnswer', () => {
  it('bd ~ bd ~ in 8 steps', () => {
    const a = predictAnswer('bd ~ bd ~', 8);
    expect(a.rows).toEqual(['bd']);
    expect([...a.cells].sort()).toEqual(['bd@0', 'bd@4']);
  });
  it('bd*3 sd in 6 steps', () => {
    expect([...predictAnswer('bd*3 sd', 6).cells].sort()).toEqual(['bd@0', 'bd@1', 'bd@2', 'sd@3']);
  });
  it('[~ oh]*4, bd*4: rows in order of first sound', () => {
    const a = predictAnswer('[~ oh]*4, bd*4', 8);
    expect(a.rows).toEqual(['bd', 'oh']);
    expect(a.cells.has('oh@1')).toBe(true);
    expect(a.cells.has('bd@2')).toBe(true);
  });
});

describe('fitsSteps', () => {
  it('true when every hit lands on a step', () => {
    expect(fitsSteps('bd(3,8)', 8)).toBe(true);
  });
  it('false when a hit falls between steps', () => {
    expect(fitsSteps('bd*3', 4)).toBe(false);
  });
});

describe('buildLanes', () => {
  it('marks hits that match the target and ones that do not', () => {
    const lanes = buildLanes('bd*4, ~ cp ~ cp', 'bd*4, cp*2');
    const cp = lanes.find((l) => l.sound === 'cp')!;
    expect(cp.target.map((e) => e.begin)).toEqual([0.25, 0.75]);
    expect(cp.mine.map((e) => [e.begin, e.match])).toEqual([[0, false], [0.5, false]]);
    const bd = lanes.find((l) => l.sound === 'bd')!;
    expect(bd.mine.every((e) => e.match)).toBe(true);
  });
  it('adds a lane for a sound that is not in the target', () => {
    const lanes = buildLanes('bd*4', 'bd*4, hh*2');
    expect(lanes.map((l) => l.sound)).toEqual(['bd', 'hh']);
    expect(lanes[1].target).toEqual([]);
  });
  it('ignores the learner line when it is null or invalid', () => {
    expect(buildLanes('bd sd', null).every((l) => l.mine.length === 0)).toBe(true);
    expect(buildLanes('bd sd', 'bd [').every((l) => l.mine.length === 0)).toBe(true);
  });
});
