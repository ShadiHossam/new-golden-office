import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    body_html: z.string(),
    excerpt: z.string().optional().default(''),
    cover_image: z.string().optional().default(''),
    category: z.string().optional().default(''),
    tags: z.string().optional().default(''),
    seo_title: z.string().optional().default(''),
    meta_description: z.string().optional().default(''),
    meta_keywords: z.string().optional().default(''),
    og_title: z.string().optional().default(''),
    og_description: z.string().optional().default(''),
    og_image: z.string().optional().default(''),
    status: z.enum(['draft', 'published']),
    created_at: z.string(),
    updated_at: z.string(),
    published_at: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    body_html: z.string(),
    seo_title: z.string().optional().default(''),
    meta_description: z.string().optional().default(''),
    meta_keywords: z.string().optional().default(''),
    og_title: z.string().optional().default(''),
    og_description: z.string().optional().default(''),
    og_image: z.string().optional().default(''),
    robots: z.string().optional().default(''),
    status: z.enum(['draft', 'published']).default('published'),
  }),
});

export const collections = { blog, pages };
