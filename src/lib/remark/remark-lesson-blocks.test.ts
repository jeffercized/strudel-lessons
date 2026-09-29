import type { Html, Root } from 'mdast';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { remarkLessonBlocks } from './remark-lesson-blocks';

function run(md: string): Root {
  const processor = unified().use(remarkParse).use(remarkLessonBlocks);
  return processor.runSync(processor.parse(md)) as Root;
}
const htmlNodes = (tree: Root) => tree.children.filter((n): n is Html => n.type === 'html');

const md = [
  '```strudel title="First"',
  's("bd*4")',
  '```',
  '',
  '```grid',
  'bd [sd sd]',
  '```',
  '',
  '```js',
  'console.log(1)',
  '```',
  '',
  '```strudel',
  's("hh*8")',
  '```',
].join('\n');

describe('remarkLessonBlocks', () => {
  it('turns strudel and grid fences into HTML and leaves other code alone', () => {
    const tree = run(md);
    const html = htmlNodes(tree);
    expect(html).toHaveLength(3);
    expect(tree.children.some((n) => n.type === 'code' && n.lang === 'js')).toBe(true);
  });
  it('numbers strudel blocks in order, skipping grids', () => {
    const [first, grid, second] = htmlNodes(run(md));
    expect(first.value).toContain('data-index="0"');
    expect(first.value).toContain('First');
    expect(grid.value).toContain('cycle-grid');
    expect(second.value).toContain('data-index="1"');
  });
  it('turns a check fence into a placeholder with its id, escaped', () => {
    const [check] = htmlNodes(run('```check id="brackets"\n```'));
    expect(check.value).toBe('<div class="check" data-check="brackets"></div>');
    const [bad] = htmlNodes(run('```check id="a<b"\n```'));
    expect(bad.value).toContain('data-check="a&lt;b"');
  });
});
