import { describe, expect, it } from 'vitest';
import { splitLayers } from './split-layers';

describe('splitLayers', () => {
  it('returns one layer when there is no comma', () => {
    expect(splitLayers('bd [sd sd] ~ hh*2')).toEqual(['bd [sd sd] ~ hh*2']);
  });
  it('splits top-level commas and trims', () => {
    expect(splitLayers('bd*4, ~ cp ~ cp, hh*8')).toEqual(['bd*4', '~ cp ~ cp', 'hh*8']);
  });
  it('does not split commas inside brackets, angles, parens or braces', () => {
    expect(splitLayers('bd(3,8), [bd, sd] <a, b> {x, y}')).toEqual(['bd(3,8)', '[bd, sd] <a, b> {x, y}']);
  });
  it('drops empty parts and handles empty input', () => {
    expect(splitLayers('bd,, sd,')).toEqual(['bd', 'sd']);
    expect(splitLayers('   ')).toEqual([]);
  });
});
