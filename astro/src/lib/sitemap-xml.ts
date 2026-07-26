const SITE = 'https://newgoldenoffice.com';
const XSL = `${SITE}/main-sitemap.xsl`;

export interface UrlEntry {
  loc: string;
  lastmod: string;
  image?: string;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;');
}

export function renderUrlset(entries: UrlEntry[]): string {
  const body = entries
    .map(({ loc, lastmod, image }) => {
      const imageTag = image
        ? `\n\t\t<image:image>\n\t\t\t<image:loc>${escapeXml(SITE + image)}</image:loc>\n\t\t</image:image>`
        : '';
      return `\t<url>\n\t\t<loc>${escapeXml(loc)}</loc>\n\t\t<lastmod>${lastmod}</lastmod>${imageTag}\n\t</url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="${XSL}"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
<!-- XML Sitemap generated for New Golden Office -->
`;
}

export interface SitemapEntry {
  loc: string;
  lastmod: string;
}

export function renderSitemapIndex(entries: SitemapEntry[]): string {
  const body = entries
    .map(({ loc, lastmod }) => `\t<sitemap>\n\t\t<loc>${escapeXml(loc)}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n\t</sitemap>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="${XSL}"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
<!-- XML Sitemap generated for New Golden Office -->
`;
}

export const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=UTF-8',
};
