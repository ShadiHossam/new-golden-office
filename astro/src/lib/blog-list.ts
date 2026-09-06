import { getCollection } from 'astro:content';

export const POSTS_PER_PAGE = 12;

export interface PostCard {
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  cover_image?: string;
  date: string;
}

/** Published posts, newest first, flattened to what the listing cards need. */
export async function getSortedPosts(): Promise<PostCard[]> {
  const all = await getCollection('blog', ({ data }) => data.status === 'published');
  return all
    .sort(
      (a, b) =>
        new Date(b.data.published_at || b.data.updated_at).getTime() -
        new Date(a.data.published_at || a.data.updated_at).getTime()
    )
    .map((p) => ({
      slug: p.data.slug,
      title: p.data.title,
      excerpt: p.data.excerpt,
      category: p.data.category,
      cover_image: p.data.cover_image,
      date: p.data.published_at || p.data.updated_at,
    }));
}

export const countPages = (total: number) => Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

/** Page 1 is /blog; later pages sit under /blog/page/N so they can never
 *  collide with the /blog/[slug] post route. */
export const blogPageHref = (n: number) => (n <= 1 ? '/blog' : `/blog/page/${n}`);
