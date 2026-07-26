import type { APIRoute } from 'astro';
import { CATEGORIES } from '../lib/sitemap-data';
import { renderUrlset, XML_HEADERS } from '../lib/sitemap-xml';

export const GET: APIRoute = () => {
  const buildTime = new Date().toISOString();
  const xml = renderUrlset(
    CATEGORIES.map((category) => ({
      loc: `https://newgoldenoffice.com${category.path}`,
      lastmod: buildTime,
      image: category.image,
    }))
  );
  return new Response(xml, { headers: XML_HEADERS });
};
