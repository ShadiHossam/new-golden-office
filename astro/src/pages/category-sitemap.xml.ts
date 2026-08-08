import type { APIRoute } from 'astro';
import { CATEGORIES } from '../lib/sitemap-data';
import { renderUrlset, XML_HEADERS, toW3CDateTime, resolvePageSourceFile, getFileLastModified } from '../lib/sitemap-xml';

export const GET: APIRoute = () => {
  const xml = renderUrlset(
    CATEGORIES.map((category) => ({
      loc: `https://newgoldenoffice.com${category.path}`,
      lastmod: toW3CDateTime(getFileLastModified(resolvePageSourceFile(category.path))),
      image: category.image,
    }))
  );
  return new Response(xml, { headers: XML_HEADERS });
};
