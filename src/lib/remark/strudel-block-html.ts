import { escapeHtml } from '../escape-html';
import { strudelUrl } from '../strudel-url';

/** Static markup for a ```strudel fence. The client script turns it into a live editor. */
export function renderStrudelBlock(code: string, index: number, title?: string): string {
  const escaped = escapeHtml(code);
  const titleHtml = title ? `<div class="strudel-block__title">${escapeHtml(title)}</div>` : '';
  return [
    `<div class="strudel-block" data-index="${index}" data-code="${escaped}">`,
    titleHtml,
    `<div class="strudel-block__editor"><pre><code>${escaped}</code></pre></div>`,
    '<div class="strudel-block__controls">',
    '<button type="button" data-action="play">▶ Play</button>',
    '<button type="button" data-action="stop">■ Stop</button>',
    '<button type="button" data-action="reset">Reset</button>',
    `<a class="button" data-action="open" href="${escapeHtml(strudelUrl(code))}" target="_blank" rel="noopener">Open in strudel.cc ↗</a>`,
    '<button type="button" data-action="grid" aria-pressed="false">Show grid</button>',
    '</div>',
    '<div class="strudel-block__live-grid" hidden></div>',
    '<p class="strudel-block__status" role="status"></p>',
    '</div>',
  ].join('');
}
