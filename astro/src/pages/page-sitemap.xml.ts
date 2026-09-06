import type { APIRoute } from 'astro';
import { PAGES } from '../lib/sitemap-data';
import { renderUrlset, XML_HEADERS, toW3CDateTime, resolvePageSourceFile, getFileLastModified } from '../lib/sitemap-xml';
import { getSortedPosts, countPages, blogPageHref } from '../lib/blog-list';

export const GET: APIRoute = async () => {
  const staticEntries = PAGES.map((page) => ({
    loc: `https://newgoldenoffice.com${page.path}`,
    lastmod: toW3CDateTime(getFileLastModified(resolvePageSourceFile(page.path))),
    image: page.image,
  }));

  // Blog listing pages 2..N. They're generated from the post collection rather
  // than the static PAGES list, so the count follows the number of posts. Their
  // lastmod is the newest post date — that's what actually changes the listing.
  const posts = await getSortedPosts();
  const newest = posts.length ? new Date(posts[0].date) : new Date();
  const paginationEntries = Array.from(
    { length: Math.max(0, countPages(posts.length) - 1) },
    (_, i) => ({
      loc: `https://newgoldenoffice.com${blogPageHref(i + 2)}`,
      lastmod: toW3CDateTime(newest),
    })
  );

  return new Response(renderUrlset([...staticEntries, ...paginationEntries]), { headers: XML_HEADERS });
};
