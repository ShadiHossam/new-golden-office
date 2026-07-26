import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderUrlset, XML_HEADERS } from '../lib/sitemap-xml';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => data.status === 'published');

  const xml = renderUrlset(
    posts.map((post) => ({
      loc: `https://newgoldenoffice.com/blog/${post.data.slug}`,
      lastmod: new Date(post.data.updated_at || post.data.published_at || post.data.created_at).toISOString(),
      image: post.data.cover_image || undefined,
    }))
  );
  return new Response(xml, { headers: XML_HEADERS });
};
