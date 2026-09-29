import { describe, expect, it } from 'vitest';
import { renderGridBlock } from './render-grid';

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe('renderGridBlock', () => {
  it('draws one box per event and rest with percentage widths', () => {
    const html = renderGridBlock('bd [sd sd] ~');
    expect(count(html, 'class="cycle-grid__box"')).toBe(3);
    expect(count(html, 'cycle-grid__box--rest')).toBe(1);
    expect(html).toContain('style="left:0%;width:33.3333%"');
    expect(html).toContain('>bd<');
  });
  it('draws three beat lines at 25/50/75%', () => {
    const html = renderGridBlock('bd');
    expect(html).toContain('cycle-grid__beat" style="left:25%"');
    expect(html).toContain('cycle-grid__beat" style="left:50%"');
    expect(html).toContain('cycle-grid__beat" style="left:75%"');
  });
  it('stacks layers as rows', () => {
    expect(count(renderGridBlock('bd*4, hh*8'), 'class="cycle-grid__row"')).toBe(2);
  });
  it('labels cycles for < > patterns', () => {
    const html = renderGridBlock('bd <sd cp>');
    expect(html).toContain('>cycle 1<');
    expect(html).toContain('>cycle 4<');
  });
  it('shows the source pattern, escaped', () => {
    expect(renderGridBlock('bd <sd cp>')).toContain('<code>bd &lt;sd cp&gt;</code>');
  });
  it('adds Play and Stop, with the source to play, escaped', () => {
    const html = renderGridBlock('bd <sd cp>');
    expect(html).toContain('data-grid-src="bd &lt;sd cp&gt;"');
    expect(html).toContain('data-grid="play"');
    expect(html).toContain('data-grid="stop"');
  });
  it('shows a visible error box instead of throwing on bad input', () => {
    const html = renderGridBlock('bd [sd');
    expect(html).toContain('cycle-grid--error');
    expect(html).toContain("Can&#39;t draw this grid");
    expect(html).toContain('<code>bd [sd</code>');
    expect(html).not.toContain('data-grid="play"');
  });
});

describe('held notes (review finding)', () => {
  it('draws the tail of a long note as a held box without its label', () => {
    const html = renderGridBlock('bd/2 sd');
    expect(count(html, 'cycle-grid__box--held')).toBe(2);
    expect(html).toContain('>cycle 2<');
  });
});
