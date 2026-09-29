import type { Blockquote, Root } from 'mdast';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { calloutKind, remarkCallouts } from './remark-callouts';

function firstQuote(md: string): Blockquote {
  const processor = unified().use(remarkParse).use(remarkCallouts);
  const tree = processor.runSync(processor.parse(md)) as Root;
  return tree.children.find((n): n is Blockquote => n.type === 'blockquote')!;
}
const classes = (q: Blockquote) => (q.data as { hProperties?: { className?: string[] } } | undefined)?.hProperties?.className;

describe('calloutKind', () => {
  it('matches Piano and Try, including "Try (final challenge):"', () => {
    expect(calloutKind('Piano:')).toBe('piano');
    expect(calloutKind('Try:')).toBe('try');
    expect(calloutKind('Try (final challenge):')).toBe('try');
    expect(calloutKind('Key idea:')).toBe('key');
    expect(calloutKind('Key:')).toBeNull();
    expect(calloutKind('Tryhard')).toBeNull();
    expect(calloutKind('Note:')).toBeNull();
  });
});

describe('remarkCallouts', () => {
  it('tags a Piano blockquote', () => {
    expect(classes(firstQuote('> **Piano:** A bar is a bar.'))).toEqual(['callout', 'callout--piano']);
  });
  it('tags a Try blockquote', () => {
    expect(classes(firstQuote('> **Try:** Change `8` to `16`.'))).toEqual(['callout', 'callout--try']);
  });
  it('tags a Key idea blockquote', () => {
    expect(classes(firstQuote('> **Key idea:** Two languages.'))).toEqual(['callout', 'callout--key']);
  });
  it('leaves plain blockquotes alone', () => {
    expect(classes(firstQuote('> Just a quote with **bold** later.'))).toBeUndefined();
  });
});
