import { describe, expect, it } from 'vitest';
import { neighbors, sortLessons } from './lessons';

const e = (id: string, number: number) => ({ id, data: { number } });

describe('sortLessons', () => {
  it('orders by lesson number, not by id', () => {
    const sorted = sortLessons([e('b', 10), e('a', 2), e('c', 1)]);
    expect(sorted.map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });
  it('does not change the input array', () => {
    const input = [e('b', 2), e('a', 1)];
    sortLessons(input);
    expect(input.map((x) => x.id)).toEqual(['b', 'a']);
  });
});

describe('neighbors', () => {
  const list = [e('one', 1), e('two', 2), e('three', 3)];
  it('gives prev and next in the middle', () => {
    const n = neighbors(list, 'two');
    expect(n.prev?.id).toBe('one');
    expect(n.next?.id).toBe('three');
  });
  it('gives null at the ends', () => {
    expect(neighbors(list, 'one').prev).toBeNull();
    expect(neighbors(list, 'three').next).toBeNull();
  });
  it('gives nulls for an unknown id', () => {
    expect(neighbors(list, 'nope')).toEqual({ prev: null, next: null });
  });
});
