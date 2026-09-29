import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lessons = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/lessons' }),
  schema: z.object({
    number: z.number().int().positive(),
    title: z.string(),
    goal: z.string(),
  }),
});

// One schema per drill item. Shapes documented in src/lib/practice/types.ts.
const readItem = z.object({
  line: z.string(),
  parts: z.array(
    z.object({ text: z.string(), kind: z.enum(['fn', 'str', 'punc']), label: z.string(), title: z.string(), detail: z.string() }),
  ),
  quiz: z.array(z.object({ question: z.string(), correctParts: z.array(z.number().int()), explanation: z.string() })),
});
const typeItem = z.object({ code: z.string(), gaps: z.string(), description: z.string() });
const predictItem = z.object({ pattern: z.string(), steps: z.number().int().positive() });
const buildItem = z.object({ target: z.string(), hint: z.string() });
const earItem = z.object({ answer: z.string(), decoys: z.array(z.string()) });
const fixItem = z.object({
  broken: z.string(),
  strudelSays: z.string(),
  hint: z.string(),
  sameRhythmAs: z.string().nullable(),
  explanation: z.string(),
});
const checkOf = <T extends string, I extends z.ZodType>(type: T, item: I) =>
  z.object({ section: z.string(), type: z.literal(type), items: z.array(item).min(1).max(3) });
const entryOf = <T extends string, I extends z.ZodType>(type: T, item: I) => z.object({ type: z.literal(type), item });

const check = z.discriminatedUnion('type', [
  checkOf('read', readItem),
  checkOf('type', typeItem),
  checkOf('predict', predictItem),
  checkOf('build', buildItem),
  checkOf('ear', earItem),
  checkOf('fix', fixItem),
]);
const reviewEntry = z.discriminatedUnion('type', [
  entryOf('read', readItem),
  entryOf('type', typeItem),
  entryOf('predict', predictItem),
  entryOf('build', buildItem),
  entryOf('ear', earItem),
  entryOf('fix', fixItem),
]);

// Drill content for a lesson: inline checks per section, and the Mixed review.
const practice = defineCollection({
  loader: glob({
    pattern: '*.practice.json',
    base: './src/content/practice',
    generateId: ({ data }) => String(data.lesson),
  }),
  schema: z.object({
    lesson: z.string(),
    checks: z.record(z.string(), check),
    review: z.array(reviewEntry),
  }),
});

export const collections = { lessons, practice };
