import { describe, expect, it } from 'vitest';
import { countDone, firstIncomplete, lessonSections, shortTitle, type Heading } from './progress';

const h = (depth: number, text: string, slug = text.toLowerCase().replace(/\W+/g, '-')): Heading => ({ depth, slug, text });

describe('lessonSections', () => {
  const headings = [h(2, 'The one big idea'), h(3, 'A detail'), h(2, '4. [ ] : split one step'), h(2, 'Cheat cards'), h(3, 'Mini-notation')];
  it('keeps ## headings only and skips Cheat cards', () => {
    expect(lessonSections(headings).map((s) => s.title)).toEqual(['The one big idea', '4. [ ] : split one step']);
  });
  it('keeps the slug Astro gave the heading', () => {
    expect(lessonSections([h(2, 'Tempo: setcpm', 'tempo-setcpm')])[0].slug).toBe('tempo-setcpm');
  });
});

describe('shortTitle', () => {
  it('keeps the number and the part before the colon', () => {
    expect(shortTitle('4. [ ] : split one step into smaller steps')).toBe('4. [ ]');
    expect(shortTitle('1. Space: next step')).toBe('1. Space');
    expect(shortTitle('Tempo: setcpm')).toBe('Tempo');
    expect(shortTitle('The one big idea')).toBe('The one big idea');
  });
});

describe('progress', () => {
  const sections = lessonSections([h(2, 'A'), h(2, 'B'), h(2, 'C')]);
  it('counts completed sections, ignoring old slugs', () => {
    expect(countDone(sections, new Set(['a', 'c', 'renamed-old']))).toBe(2);
  });
  it('finds the first incomplete section', () => {
    expect(firstIncomplete(sections, new Set(['a']))?.slug).toBe('b');
    expect(firstIncomplete(sections, new Set(['a', 'b']))?.slug).toBe('c');
    expect(firstIncomplete(sections, new Set())?.slug).toBe('a');
  });
  it('returns null when all are complete', () => {
    expect(firstIncomplete(sections, new Set(['a', 'b', 'c']))).toBeNull();
  });
});
