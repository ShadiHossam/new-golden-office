import type { APIRoute } from 'astro';
import { PAGES } from '../lib/sitemap-data';
import { renderUrlset, XML_HEADERS } from '../lib/sitemap-xml';

export const GET: APIRoute = () => {
  const buildTime = new Date().toISOString();
  const xml = renderUrlset(
    PAGES.map((page) => ({
      loc: `https://newgoldenoffice.com${page.path}`,
      lastmod: buildTime,
      image: page.image,
    }))
  );
  return new Response(xml, { headers: XML_HEADERS });
};
