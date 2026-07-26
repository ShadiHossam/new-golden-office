import siteSeo from '../data/site-seo.json';

interface SeoEntry {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const data = siteSeo as Record<string, SeoEntry>;

export function getSeoFor(url: string): SeoEntry {
  const entry = data[url];
  if (!entry) {
    throw new Error(`No site-seo.json entry for url "${url}" — add one or check astro/src/data/site-seo.json`);
  }
  return entry;
}
