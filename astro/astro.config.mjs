// @ts-check
import { defineConfig } from 'astro/config';

// Sitemap is hand-rolled (src/pages/{sitemap,page-sitemap,post-sitemap,category-sitemap}.xml.ts)
// to replicate the old Yoast-style split + XSL-styled browser view — see src/lib/sitemap-data.ts
// for the noindex exclusion list (Alexandria/Cairo, pending owner review).

export default defineConfig({
  site: 'https://newgoldenoffice.com',
  output: 'static',
});
