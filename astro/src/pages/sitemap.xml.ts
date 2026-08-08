import type { APIRoute } from 'astro';
import { renderSitemapIndex, XML_HEADERS, toW3CDateTime } from '../lib/sitemap-xml';

export const GET: APIRoute = () => {
  const buildTime = toW3CDateTime(new Date());
  const xml = renderSitemapIndex([
    { loc: 'https://newgoldenoffice.com/post-sitemap.xml', lastmod: buildTime },
    { loc: 'https://newgoldenoffice.com/page-sitemap.xml', lastmod: buildTime },
    { loc: 'https://newgoldenoffice.com/category-sitemap.xml', lastmod: buildTime },
  ]);
  return new Response(xml, { headers: XML_HEADERS });
};
