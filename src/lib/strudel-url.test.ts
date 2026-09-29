import { describe, expect, it } from 'vitest';
import { decodeStrudelHash, encodeStrudelHash, strudelUrl } from './strudel-url';

const tricky = 'setcpm(130/4)\n$: s("bd*4").bank(\'RolandTR909\')\n// é — `x` --> & <b>';

describe('strudel.cc hash', () => {
  it('round-trips quotes, newlines, unicode and HTML characters', () => {
    expect(decodeStrudelHash(encodeStrudelHash(tricky))).toBe(tricky);
  });
  it('accepts a leading #', () => {
    expect(decodeStrudelHash(`#${encodeStrudelHash('s("bd")')}`)).toBe('s("bd")');
  });
  it('builds the full URL with URL-safe characters only', () => {
    const url = strudelUrl(tricky);
    expect(url.startsWith('https://strudel.cc/#')).toBe(true);
    expect(url.split('#')[1]).not.toMatch(/[+/=\s]/);
  });
  it('matches the known encoding of a simple pattern', () => {
    // btoa('s("bd")') === 'cygiYmQiKQ==' ; '=' is percent-encoded
    expect(encodeStrudelHash('s("bd")')).toBe('cygiYmQiKQ%3D%3D');
  });
});
