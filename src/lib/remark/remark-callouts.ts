import type { Blockquote, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

export type CalloutKind = 'piano' | 'try' | 'key';

export function calloutKind(text: string): CalloutKind | null {
  const m = /^(Piano|Try|Key idea)\b/.exec(text.trim());
  if (!m) return null;
  return m[1] === 'Piano' ? 'piano' : m[1] === 'Try' ? 'try' : 'key';
}

/** `> **Piano:** …`, `> **Try:** …` and `> **Key idea:** …` become styled callouts. */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const first = node.children[0];
      if (first?.type !== 'paragraph') return;
      const lead = first.children[0];
      if (lead?.type !== 'strong') return;
      const kind = calloutKind(toString(lead));
      if (!kind) return;
      const data = (node.data ??= {}) as { hProperties?: Record<string, unknown> };
      data.hProperties = { ...data.hProperties, className: ['callout', `callout--${kind}`] };
    });
  };
}
