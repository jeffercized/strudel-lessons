import { escapeHtml } from '../escape-html';
import { buildGridModel, type GridModel, type GridSegment } from './grid-model';

const pct = (n: number) => `${Number((n * 100).toFixed(4))}%`;

function renderBox(s: GridSegment): string {
  const style = `left:${pct(s.begin)};width:${pct(s.end - s.begin)}`;
  if (s.label === null) return `<span class="cycle-grid__box cycle-grid__box--rest" style="${style}"></span>`;
  const label = escapeHtml(s.label);
  if (s.held) return `<span class="cycle-grid__box cycle-grid__box--held" style="${style}" title="${label} (held)"></span>`;
  return `<span class="cycle-grid__box" style="${style}" title="${label}">${label}</span>`;
}

export function renderGridModel(model: GridModel): string {
  const beats = [0.25, 0.5, 0.75].map((b) => `<span class="cycle-grid__beat" style="left:${pct(b)}"></span>`).join('');
  return model.cycles
    .map((cycle) => {
      const label = cycle.label ? `<div class="cycle-grid__label">${escapeHtml(cycle.label)}</div>` : '';
      const rows = cycle.rows.map((row) => `<div class="cycle-grid__row">${row.map(renderBox).join('')}</div>`).join('');
      return `<div class="cycle-grid__cycle">${label}<div class="cycle-grid__bar">${beats}${rows}</div></div>`;
    })
    .join('');
}

/** Full diagram for a ```grid fence. Never throws: bad input renders an error box. */
export function renderGridBlock(src: string): string {
  const source = src.trim();
  const caption = `<figcaption class="cycle-grid__src"><code>${escapeHtml(source)}</code></figcaption>`;
  try {
    const body = renderGridModel(buildGridModel(source));
    // The client script (src/scripts/grid-play.ts) plays s("<source>") when Play is pressed.
    const controls = [
      '<div class="cycle-grid__controls">',
      '<button type="button" data-grid="play" aria-pressed="false">▶ Play</button>',
      '<button type="button" data-grid="stop">■ Stop</button>',
      '</div>',
      '<p class="cycle-grid__status" role="status"></p>',
    ].join('');
    return `<figure class="cycle-grid" data-grid-src="${escapeHtml(source)}">${caption}${body}${controls}</figure>`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[grid] Can't draw "${source}": ${message}`);
    return `<figure class="cycle-grid cycle-grid--error">${caption}<p>${escapeHtml("Can't draw this grid")}: ${escapeHtml(message)}</p></figure>`;
  }
}
