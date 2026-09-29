import { describe, expect, it } from 'vitest';
import { decodeStrudelHash } from '../strudel-url';
import { renderStrudelBlock } from './strudel-block-html';

function parseAttr(html: string, name: string): string {
  const m = new RegExp(`${name}="([^"]*)"`).exec(html);
  if (!m) throw new Error(`no ${name}`);
  return m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

const tricky = 's("bd*4").bank(\'RolandTR909\')\n// --> & <b> `x` é';

describe('renderStrudelBlock', () => {
  it('stores the exact code in data-code', () => {
    expect(parseAttr(renderStrudelBlock(tricky, 0), 'data-code')).toBe(tricky);
  });
  it('links to strudel.cc with the exact code', () => {
    const href = parseAttr(renderStrudelBlock(tricky, 0), 'href');
    expect(decodeStrudelHash(href.split('#')[1])).toBe(tricky);
  });
  it('never emits raw < or " from the code', () => {
    const html = renderStrudelBlock('"<script>alert(1)</script>"', 0);
    expect(html).not.toContain('<script>');
  });
  it('includes index, controls and optional title', () => {
    const html = renderStrudelBlock('s("bd")', 3, 'Four on the floor');
    expect(html).toContain('data-index="3"');
    for (const a of ['play', 'stop', 'reset', 'open', 'grid']) expect(html).toContain(`data-action="${a}"`);
    expect(html).toContain('<div class="strudel-block__title">Four on the floor</div>');
    expect(renderStrudelBlock('s("bd")', 0)).not.toContain('strudel-block__title');
    expect(html).toContain('<div class="strudel-block__live-grid" hidden></div>');
  });
});
