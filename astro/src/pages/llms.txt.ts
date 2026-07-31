import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildLlmsTxt } from '../lib/llms-txt';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => data.status === 'published');
  posts.sort((a, b) => {
    const dateA = new Date(a.data.published_at || a.data.created_at).getTime();
    const dateB = new Date(b.data.published_at || b.data.created_at).getTime();
    return dateB - dateA;
  });

  const text = buildLlmsTxt(
    posts.map((post) => ({
      title: post.data.title,
      slug: post.data.slug,
      excerpt: post.data.excerpt,
      published_at: post.data.published_at,
    }))
  );

  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
