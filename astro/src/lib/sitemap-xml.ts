import { execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://newgoldenoffice.com';
const XSL = `${SITE}/main-sitemap.xsl`;
const PAGES_DIR = path.join(process.cwd(), 'src', 'pages');

export interface UrlEntry {
  loc: string;
  lastmod: string;
  image?: string;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;');
}

export function toW3CDateTime(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

// Maps a route path (e.g. "/ac/buy") to its .astro source file, matching
// Astro's own file-based routing (foo/bar.astro, falling back to foo/bar/index.astro).
export function resolvePageSourceFile(urlPath: string): string {
  const trimmed = urlPath === '/' ? 'index' : urlPath.replace(/^\//, '');
  const direct = path.join(PAGES_DIR, `${trimmed}.astro`);
  if (existsSync(direct)) return direct;
  return path.join(PAGES_DIR, trimmed, 'index.astro');
}

// Real "last modified" for a static page is when its source last changed in
// git — falls back to filesystem mtime, then now, for uncommitted files.
export function getFileLastModified(filePath: string): Date {
  try {
    const output = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (output) return new Date(output);
  } catch {
    // not a git repo, or git unavailable at build time — fall through
  }
  try {
    return statSync(filePath).mtime;
  } catch {
    return new Date();
  }
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
