const express = require('express');
const { getSeoPages, getSeoPageById, updateSeoPage } = require('../lib/db');
const { readHtmlMeta, writeHtmlMeta, getHtmlFilePath } = require('../lib/seo-sync');
const { checkLinks } = require('../lib/link-checker');
const { logActivity } = require('../lib/activity');

const router = express.Router();

function seoScore(page) {
  const checks = { total: 5, passed: 0 };
  const titleLen = (page.seo_title || '').length;
  if (titleLen > 0 && titleLen <= 60) checks.passed++;
  const descLen = (page.meta_description || '').length;
  if (descLen >= 120 && descLen <= 160) checks.passed++;
  if ((page.og_title || '').trim()) checks.passed++;
  if ((page.og_description || '').trim()) checks.passed++;
  if ((page.meta_keywords || '').trim()) checks.passed++;
  checks.pct = Math.round(checks.passed / checks.total * 100);
  return checks;
}

router.get('/', (req, res) => {
  let pages = getSeoPages();
  const filter = req.query.filter || '';
  const category = req.query.category || '';
  const issueFilter = req.query.issues === '1';

  if (filter) {
    const q = filter.toLowerCase();
    pages = pages.filter(p =>
      p.label.toLowerCase().includes(q) ||
      p.path.toLowerCase().includes(q) ||
      (p.seo_title || '').toLowerCase().includes(q)
    );
  }
  if (category) {
    pages = pages.filter(p => p.category === category);
  }
  if (issueFilter) {
    pages = pages.filter(p => seoScore(p).pct < 80);
  }

  const allPages = getSeoPages();
  const categories = [...new Set(allPages.map(p => p.category))].sort();

  res.render('seo/list', {
    pageTitle: 'SEO Manager',
    headExtra: '',
    headerActions: '<a href="/2ef65f179f12439e317a23628b016653/seo/link-checker" class="btn btn-outline-secondary btn-sm" style="font-size:12px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:-2px;"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>Link Checker</a>',
    breadcrumb: null,
    pages,
    filter,
    category,
    issueFilter,
    categories
  });
});

router.get('/:id/edit', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const page = getSeoPageById(id);
  if (!page) return res.redirect('/2ef65f179f12439e317a23628b016653/seo');

  // Try to read current meta from the actual HTML file
  const filePath = getHtmlFilePath(page.path);
  const liveMeta = readHtmlMeta(filePath);

  res.render('seo/editor', {
    pageTitle: `SEO: ${page.label}`,
    headExtra: '',
    headerActions: '',
    breadcrumb: [{ label: 'SEO', url: '/2ef65f179f12439e317a23628b016653/seo' }],
    page,
    liveMeta
  });
});

router.post('/:id/update', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const page = getSeoPageById(id);
  if (!page) return res.redirect('/2ef65f179f12439e317a23628b016653/seo');

  const updates = {
    id,
    seo_title: (req.body.seo_title || '').trim(),
    meta_description: (req.body.meta_description || '').trim(),
    meta_keywords: (req.body.meta_keywords || '').trim(),
    og_title: (req.body.og_title || '').trim(),
    og_description: (req.body.og_description || '').trim(),
    og_image: (req.body.og_image || '').trim()
  };

  // Write to actual HTML file
  const filePath = getHtmlFilePath(page.path);
  const written = writeHtmlMeta(filePath, updates);

  // Save to JSON
  updateSeoPage(updates);

  logActivity(req.session.username, 'SEO updated', `${page.label} (${page.path})${written ? '' : ' — HTML file not found'}`);

  req.flash('success', `SEO updated for "${page.label}"${written ? ' and HTML file updated' : ' (data saved, HTML file not found)'}.`);
  res.redirect('/2ef65f179f12439e317a23628b016653/seo');
});

router.get('/link-checker', (req, res) => {
  const result = checkLinks();
  res.render('seo/link-checker', {
    pageTitle: 'SEO: Link Checker',
    headExtra: '',
    headerActions: '',
    breadcrumb: [{ label: 'SEO', url: '/2ef65f179f12439e317a23628b016653/seo' }, { label: 'Link Checker' }],
    ...result
  });
});

module.exports = router;
