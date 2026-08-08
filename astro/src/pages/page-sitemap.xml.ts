import type { APIRoute } from 'astro';
import { PAGES } from '../lib/sitemap-data';
import { renderUrlset, XML_HEADERS, toW3CDateTime, resolvePageSourceFile, getFileLastModified } from '../lib/sitemap-xml';

export const GET: APIRoute = () => {
  const xml = renderUrlset(
    PAGES.map((page) => ({
      loc: `https://newgoldenoffice.com${page.path}`,
      lastmod: toW3CDateTime(getFileLastModified(resolvePageSourceFile(page.path))),
      image: page.image,
    }))
  );
  return new Response(xml, { headers: XML_HEADERS });
};
