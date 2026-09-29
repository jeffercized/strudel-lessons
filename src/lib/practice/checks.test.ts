import { describe, expect, it } from 'vitest';
import { checkIdsIn, missingChecks } from './checks';

const md = ['# Lesson', '```check id="space"', '```', 'text', '```strudel', 's("bd")', '```', '```check id="rest"', '```'].join('\n');

describe('checkIdsIn', () => {
  it('finds every check id in order, ignoring other fences', () => {
    expect(checkIdsIn(md)).toEqual(['space', 'rest']);
  });
  it('a check without an id gives an empty id', () => {
    expect(checkIdsIn('```check\n```')).toEqual(['']);
  });
});

describe('missingChecks', () => {
  it('lists ids with no entry in the practice data', () => {
    expect(missingChecks(md, { space: {} })).toEqual(['rest']);
    expect(missingChecks(md, { space: {}, rest: {} })).toEqual([]);
  });
  it('every id is missing when the lesson has no practice data', () => {
    expect(missingChecks(md, undefined)).toEqual(['space', 'rest']);
  });
});
