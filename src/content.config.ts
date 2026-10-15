import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const base = {
  title: z.string(),
  date: z.date(),
  summary: z.string(),
  draft: z.boolean().optional().default(false),
};

const printPost = z.object({
  ...base,
  type: z.literal('print'),
  material: z.string(),
  color: z.string(),
  layerHeight: z.string(),
  printTime: z.string(),
});

const codePost = z.object({
  ...base,
  type: z.literal('code'),
  stack: z.array(z.string()),
  repo: z.string().url().optional(),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.discriminatedUnion('type', [printPost, codePost]),
});

export const collections = { posts };
