import type { Code, Html, Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { escapeHtml } from '../escape-html';
import { renderGridBlock } from '../grid/render-grid';
import { parseMeta } from './parse-meta';
import { renderStrudelBlock } from './strudel-block-html';

/** ```strudel -> player markup, ```grid -> cycle diagram, ```check -> placeholder for an inline check. */
export function remarkLessonBlocks() {
  return (tree: Root) => {
    let strudelIndex = 0;
    visit(tree, 'code', (node: Code, index, parent) => {
      if (!parent || index === undefined) return;
      let value: string;
      if (node.lang === 'strudel') value = renderStrudelBlock(node.value, strudelIndex++, parseMeta(node.meta).title);
      else if (node.lang === 'grid') value = renderGridBlock(node.value);
      else if (node.lang === 'check') value = renderCheckBlock(parseMeta(node.meta).id ?? '');
      else return;
      parent.children[index] = { type: 'html', value } satisfies Html;
    });
  };
}

/** The client script (src/scripts/checks.ts) fills this with the drill from the lesson's practice JSON. */
export function renderCheckBlock(id: string): string {
  return `<div class="check" data-check="${escapeHtml(id)}"></div>`;
}
