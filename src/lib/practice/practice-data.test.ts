import { describe, expect, it } from 'vitest';
import { missingChecks } from './checks';
import { isError, parseLine } from './parse-line';
import { fitsSteps, rhythmKey, sameRhythm } from './rhythm';
import { DRILL_TYPES, GAP, type DrillEntry, type PracticeData } from './types';

// Catches content mistakes in the practice JSON files before they reach the page.
const modules = import.meta.glob<PracticeData>('../../content/practice/*.practice.json', { eager: true, import: 'default' });
const lessons = import.meta.glob<string>('../../content/lessons/*.md', { eager: true, query: '?raw', import: 'default' });
const files = Object.entries(modules).map(([path, data]) => ({ file: path.split('/').pop()!, data }));

const parses = (mini: string) => expect(() => rhythmKey(mini), mini).not.toThrow();

/** Fails (via expect) when one drill item can't work in its drill. */
function checkItem(entry: DrillEntry): void {
  switch (entry.type) {
    case 'read': {
      const { line, parts, quiz } = entry.item;
      expect(parts.map((p) => p.text).join('')).toBe(line);
      for (const q of quiz) {
        expect(q.correctParts.length).toBeGreaterThan(0);
        for (const i of q.correctParts) expect(parts[i], q.question).toBeDefined();
      }
      return;
    }
    case 'type': {
      const { code, gaps } = entry.item;
      expect(isError(parseLine(code)), code).toBe(false);
      expect([...gaps]).toHaveLength([...code].length);
      [...gaps].forEach((ch, i) => {
        if (ch !== GAP) expect(ch).toBe(code[i]);
      });
      return;
    }
    case 'predict':
      expect(fitsSteps(entry.item.pattern, entry.item.steps), entry.item.pattern).toBe(true);
      return;
    case 'build':
      parses(entry.item.target);
      return;
    case 'ear':
      parses(entry.item.answer);
      for (const d of entry.item.decoys) {
        parses(d);
        expect(sameRhythm(entry.item.answer, d), `${entry.item.answer} vs ${d}`).toBe(false);
      }
      return;
    case 'fix':
      expect(isError(parseLine(entry.item.broken)), entry.item.broken).toBe(true);
      if (entry.item.sameRhythmAs !== null) parses(entry.item.sameRhythmAs);
      return;
  }
}

describe.each(files)('$file', ({ file, data }) => {
  it('is named after its lesson', () => {
    expect(file).toBe(`${data.lesson}.practice.json`);
  });

  it.each(Object.entries(data.checks))('check "%s" has 1–3 valid items', (_id, check) => {
    expect(DRILL_TYPES).toContain(check.type);
    expect(check.items.length).toBeGreaterThanOrEqual(1);
    expect(check.items.length).toBeLessThanOrEqual(3);
    for (const item of check.items) checkItem({ type: check.type, item } as DrillEntry);
  });

  it.each(data.review.map((e, i) => [i + 1, e.type, e] as const))('review item %i (%s) is valid', (_n, _t, entry) => {
    checkItem(entry);
  });

  it('every check block in the lesson has its id here', () => {
    const md = Object.entries(lessons).find(([path]) => path.endsWith(`/${data.lesson}.md`))?.[1];
    expect(md, `lesson ${data.lesson}.md`).toBeDefined();
    expect(missingChecks(md!, data.checks)).toEqual([]);
  });
});

describe('lessons without a practice file', () => {
  it('have no check blocks', () => {
    for (const [path, md] of Object.entries(lessons)) {
      const lesson = path.split('/').pop()!.replace(/\.md$/, '');
      if (files.some((f) => f.data.lesson === lesson)) continue;
      expect(missingChecks(md, undefined), lesson).toEqual([]);
    }
  });
});
