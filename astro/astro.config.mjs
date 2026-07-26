// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Alexandria/Cairo local-SEO pages are noindex,nofollow pending owner
// review (see seo-audit-2026-07 memory) — exclude them from the generated
// sitemap so they don't get submitted for indexing ahead of that decision.
const NOINDEX_PATHS = ['https://newgoldenoffice.com/alexandria', 'https://newgoldenoffice.com/cairo'];

export default defineConfig({
  site: 'https://newgoldenoffice.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_PATHS.some((p) => page === p || page === `${p}/`),
    }),
  ],
});
