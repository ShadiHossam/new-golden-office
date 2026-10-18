export interface SitemapPage {
  path: string;
  image?: string;
}

// Noindex,nofollow pages must never appear in any sitemap (see astro.config.mjs).
// Pages get removed from this list as they're gradually indexed — see
// astro/.rollout-schedule.md for the rollout order.
export const NOINDEX_PATHS: string[] = [];

// The 6 category hub pages (each is a */index.astro route) — these get their
// own file, mirroring the old Yoast category-sitemap.xml.
export const CATEGORIES: SitemapPage[] = [
  { path: '/printing', image: '/images/printing-hub.webp' },
  { path: '/copiers', image: '/images/copiers-hub.webp' },
  { path: '/cameras', image: '/images/cameras-hub.webp' },
  { path: '/ac', image: '/images/ac-hub.webp' },
  { path: '/cash-machines', image: '/images/hero-cash-machines-index.webp' },
  { path: '/office-supplies', image: '/images/office-supplies-hub.webp' },
];

// Every other indexable static page — mirrors the old Yoast page-sitemap.xml.
export const PAGES: SitemapPage[] = [
  { path: '/', image: '/images/hero-office.webp' },
  { path: '/about', image: '/images/about-team.webp' },
  { path: '/contact', image: '/images/hero-office.webp' },
  { path: '/privacy', image: '/images/hero-office.webp' },
  { path: '/terms', image: '/images/hero-office.webp' },
  { path: '/blog' },
  { path: '/alexandria', image: '/images/about-team.webp' },
  { path: '/cairo', image: '/images/about-team.webp' },
  { path: '/alexandria/ac', image: '/images/ac-hub.webp' },
  { path: '/cairo/ac', image: '/images/ac-hub.webp' },
  { path: '/alexandria/cameras', image: '/images/cameras-hub.webp' },
  { path: '/cairo/cameras', image: '/images/cameras-hub.webp' },
  { path: '/alexandria/cash-machines', image: '/images/cash-machines-hub.webp' },
  { path: '/cairo/cash-machines', image: '/images/cash-machines-hub.webp' },
  { path: '/alexandria/copiers', image: '/images/copiers-hub.webp' },
  { path: '/cairo/copiers', image: '/images/copiers-hub.webp' },
  { path: '/alexandria/office-supplies', image: '/images/office-supplies-hub.webp' },
  { path: '/cairo/office-supplies', image: '/images/office-supplies-hub.webp' },
  { path: '/alexandria/printing', image: '/images/printing-hub.webp' },
  { path: '/cairo/printing', image: '/images/printing-hub.webp' },
  { path: '/alexandria/office-setup', image: '/images/about-team.webp' },
  { path: '/cairo/office-setup', image: '/images/about-team.webp' },
  { path: '/printing/offset', image: '/images/hero-printing-offset.webp' },
  { path: '/printing/digital', image: '/images/hero-printing-digital.webp' },
  { path: '/printing/banners', image: '/images/hero-printing-banners.webp' },
  { path: '/printing/business-cards', image: '/images/hero-printing-business-cards.webp' },
  { path: '/printing/uv', image: '/images/hero-printing-uv.webp' },
  { path: '/printing/gifts', image: '/images/hero-printing-gifts.webp' },
  { path: '/printing/brochures', image: '/images/hero-printing-brochures.webp' },
  { path: '/copiers/buy', image: '/images/hero-copiers-buy.webp' },
  { path: '/copiers/printers', image: '/images/hero-copiers-printers.webp' },
  { path: '/copiers/maintenance', image: '/images/copiers-hub.webp' },
  { path: '/copiers/cartridges', image: '/images/copiers-hub.webp' },
  { path: '/cameras/install', image: '/images/hero-cameras-install.webp' },
  { path: '/cameras/dvr-nvr', image: '/images/hero-cameras-dvr-nvr.webp' },
  { path: '/cameras/ip-wifi', image: '/images/hero-cameras-ip-wifi.webp' },
  { path: '/cameras/maintenance', image: '/images/hero-cameras-maintenance.webp' },
  { path: '/ac/buy', image: '/images/hero-ac-buy.webp' },
  { path: '/ac/installation', image: '/images/ac-hub.webp' },
  { path: '/ac/maintenance', image: '/images/hero-ac-maintenance.webp' },
  { path: '/cash-machines/counting', image: '/images/hero-cash-machines-counting.webp' },
  { path: '/cash-machines/detector', image: '/images/hero-cash-machines-detector.webp' },
  { path: '/cash-machines/franking', image: '/images/hero-cash-machines-franking.webp' },
  { path: '/cash-machines/shredder', image: '/images/hero-cash-machines-shredder.webp' },
  { path: '/office-supplies/a4-paper', image: '/images/hero-office-supplies-a4-paper.webp' },
  { path: '/office-supplies/thermal', image: '/images/hero-office-supplies-thermal.webp' },
  { path: '/office-supplies/pens', image: '/images/hero-office-supplies-pens.webp' },
  { path: '/office-supplies/notebooks', image: '/images/hero-office-supplies-notebooks.webp' },
  { path: '/office-supplies/files', image: '/images/hero-office-supplies-files.webp' },
  { path: '/office-supplies/stamps', image: '/images/hero-office-supplies-stamps.webp' },
  { path: '/office-supplies/envelopes', image: '/images/hero-office-supplies-envelopes.webp' },
  { path: '/office-supplies/whiteboards', image: '/images/hero-office-supplies-whiteboards.webp' },
  { path: '/office-supplies/binding', image: '/images/hero-office-supplies-binding.webp' },
  { path: '/office-supplies/sticky-notes', image: '/images/hero-office-supplies-sticky-notes.webp' },
  { path: '/office-supplies/batteries-usb', image: '/images/hero-office-supplies-batteries-usb.webp' },
];
