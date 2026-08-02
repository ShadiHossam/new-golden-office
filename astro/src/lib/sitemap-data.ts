export interface SitemapPage {
  path: string;
  image?: string;
}

// Noindex,nofollow pages must never appear in any sitemap (see astro.config.mjs).
// Pages get removed from this list as they're gradually indexed — see
// astro/.rollout-schedule.md for the rollout order.
export const NOINDEX_PATHS = [
  '/alexandria/ac', '/alexandria/cameras', '/alexandria/cash-machines',
  '/alexandria/copiers', '/alexandria/office-supplies', '/alexandria/printing',
  '/alexandria/office-setup',
  '/cairo/ac', '/cairo/cameras', '/cairo/cash-machines',
  '/cairo/copiers', '/cairo/office-supplies', '/cairo/printing',
  '/cairo/office-setup',
  '/printing/brochures',
];

// The 6 category hub pages (each is a */index.astro route) — these get their
// own file, mirroring the old Yoast category-sitemap.xml.
export const CATEGORIES: SitemapPage[] = [
  { path: '/printing', image: '/images/printing-hub.webp' },
  { path: '/copiers', image: '/images/copiers-hub.webp' },
  { path: '/cameras', image: '/images/cameras-hub.webp' },
  { path: '/ac', image: '/images/ac-hub.webp' },
  { path: '/cash-machines', image: '/images/cash-machines-hub.webp' },
  { path: '/office-supplies', image: '/images/office-supplies-hub.webp' },
];

// Every other indexable static page — mirrors the old Yoast page-sitemap.xml.
export const PAGES: SitemapPage[] = [
  { path: '/', image: '/images/hero-office.webp' },
  { path: '/about', image: '/images/about-team.webp' },
  { path: '/contact', image: '/images/hero-office.webp' },
  { path: '/portfolio', image: '/images/hero-office.webp' },
  { path: '/privacy', image: '/images/hero-office.webp' },
  { path: '/terms', image: '/images/hero-office.webp' },
  { path: '/blog' },
  { path: '/alexandria', image: '/images/about-team.webp' },
  { path: '/cairo', image: '/images/about-team.webp' },
  { path: '/printing/offset', image: '/images/printing-hub.webp' },
  { path: '/printing/digital', image: '/images/printing-hub.webp' },
  { path: '/printing/banners', image: '/images/printing-hub.webp' },
  { path: '/printing/business-cards', image: '/images/printing-hub.webp' },
  { path: '/printing/uv', image: '/images/printing-hub.webp' },
  { path: '/printing/gifts', image: '/images/printing-hub.webp' },
  { path: '/copiers/buy', image: '/images/copiers-hub.webp' },
  { path: '/copiers/printers', image: '/images/copiers-hub.webp' },
  { path: '/copiers/maintenance', image: '/images/copiers-hub.webp' },
  { path: '/copiers/cartridges', image: '/images/copiers-hub.webp' },
  { path: '/cameras/install', image: '/images/cameras-hub.webp' },
  { path: '/cameras/dvr-nvr', image: '/images/cameras-hub.webp' },
  { path: '/cameras/ip-wifi', image: '/images/cameras-hub.webp' },
  { path: '/cameras/maintenance', image: '/images/cameras-hub.webp' },
  { path: '/ac/buy', image: '/images/ac-hub.webp' },
  { path: '/ac/installation', image: '/images/ac-hub.webp' },
  { path: '/ac/maintenance', image: '/images/ac-hub.webp' },
  { path: '/cash-machines/counting', image: '/images/cash-machines-hub.webp' },
  { path: '/cash-machines/detector', image: '/images/cash-machines-hub.webp' },
  { path: '/cash-machines/franking', image: '/images/cash-machines-hub.webp' },
  { path: '/cash-machines/shredder', image: '/images/cash-machines-hub.webp' },
  { path: '/office-supplies/a4-paper', image: '/images/office-supplies-hub.webp' },
  { path: '/office-supplies/thermal', image: '/images/office-supplies-hub.webp' },
  { path: '/office-supplies/pens', image: '/images/office-supplies-hub.webp' },
  { path: '/office-supplies/notebooks', image: '/images/office-supplies-hub.webp' },
  { path: '/office-supplies/files', image: '/images/office-supplies-hub.webp' },
  { path: '/office-supplies/stamps', image: '/images/office-supplies-hub.webp' },
  { path: '/office-supplies/envelopes', image: '/images/office-supplies-hub.webp' },
  { path: '/office-supplies/whiteboards', image: '/images/office-supplies-hub.webp' },
  { path: '/office-supplies/binding', image: '/images/office-supplies-hub.webp' },
  { path: '/office-supplies/sticky-notes', image: '/images/office-supplies-hub.webp' },
  { path: '/office-supplies/batteries-usb', image: '/images/office-supplies-hub.webp' },
];
