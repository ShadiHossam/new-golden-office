import { CATEGORIES, PAGES } from './sitemap-data';
import siteSeo from '../data/site-seo.json';
import { PAGE_NAMES } from './pageNames';

const SITE = 'https://newgoldenoffice.com';

type SeoEntry = { title: string; description: string };
const SEO = siteSeo as Record<string, SeoEntry>;

const CATEGORY_LABELS: Record<string, string> = {
  printing: 'Printing Services',
  copiers: 'Copiers & Printers',
  cameras: 'Security Cameras (CCTV)',
  ac: 'Air Conditioning',
  'cash-machines': 'Cash Handling Machines',
  'office-supplies': 'Office Supplies',
};

const COMPANY_PATHS = ['/', '/about', '/contact'];
const LEGAL_PATHS = ['/privacy', '/terms'];

function pageLabel(path: string): string {
  if (path === '/') return 'الرئيسية';
  const segments = path.split('/').filter(Boolean);
  const relPath = segments.join('/');
  const segment = segments[segments.length - 1] ?? '';
  return PAGE_NAMES[relPath] ?? PAGE_NAMES[segment] ?? segment;
}

function linkLine(path: string): string | null {
  const seo = SEO[path];
  if (!seo) return null;
  return `- [${pageLabel(path)}](${SITE}${path}): ${seo.description}`;
}

export interface BlogPostSummary {
  title: string;
  slug: string;
  excerpt: string;
  published_at?: string;
}

export function buildLlmsTxt(posts: BlogPostSummary[]): string {
  const lines: string[] = [];

  lines.push('# New Golden Office (نيو جولدن أوفيس)');
  lines.push('');
  lines.push(
    '> Egypt-wide supplier and service provider for office equipment and supplies: copiers & printers, printing services, CCTV security cameras, air conditioning, cash-handling machines, and office supplies. Founded 1999.'
  );
  lines.push('');
  lines.push(
    `Phone / WhatsApp: +20 122 739 2074. Headquarters: 26 Abdel Moneim Sanad St., Ibrahimeya, Bab Sharq, Alexandria, Egypt. Website language: Arabic.`
  );
  lines.push('');

  lines.push('## Company');
  for (const path of COMPANY_PATHS) {
    const line = linkLine(path);
    if (line) lines.push(line);
  }
  lines.push('');

  for (const category of CATEGORIES) {
    const key = category.path.split('/').filter(Boolean)[0];
    const label = CATEGORY_LABELS[key] ?? key;
    const hubPath = '/' + key;
    const subPages = PAGES.filter((p) => p.path.startsWith(`/${key}/`));

    lines.push(`## ${label}`);
    const hubLine = linkLine(hubPath);
    if (hubLine) lines.push(hubLine);
    for (const sub of subPages) {
      const line = linkLine(sub.path);
      if (line) lines.push(line);
    }
    lines.push('');
  }

  if (posts.length > 0) {
    lines.push('## Blog');
    for (const post of posts) {
      lines.push(`- [${post.title}](${SITE}/blog/${post.slug}): ${post.excerpt}`);
    }
    lines.push('');
  }

  lines.push('## Optional');
  for (const path of LEGAL_PATHS) {
    const seo = SEO[path];
    if (seo) lines.push(`- [${pageLabel(path)}](${SITE}${path})`);
  }

  return lines.join('\n') + '\n';
}
