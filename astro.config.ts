import { defineConfig } from 'astro/config';
import { remarkCallouts } from './src/lib/remark/remark-callouts';
import { remarkLessonBlocks } from './src/lib/remark/remark-lesson-blocks';

export default defineConfig({
  markdown: { remarkPlugins: [remarkLessonBlocks, remarkCallouts] },
});
