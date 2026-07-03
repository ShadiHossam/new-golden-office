const express = require('express');
const fs = require('fs');
const path = require('path');
const { loadJson, saveJson, getSeoPages, saveSeoPages } = require('../lib/db');
const { renderPageHtml } = require('../lib/page-templates');
const { logActivity } = require('../lib/activity');
const { requirePermission } = require('../lib/permissions');

const router = express.Router();
const FILE = 'pages.json';
const SITE_ROOT = path.join(__dirname, '..', '..');

const view = requirePermission('pages.view');
const create = requirePermission('pages.create');
const edit = requirePermission('pages.edit');
const del = requirePermission('pages.delete');
const publish = requirePermission('pages.publish');

function getPages() { return loadJson(FILE); }
function savePages(list) { saveJson(FILE, list); }
function nextId(list) { return list.length ? Math.max(...list.map(p => p.id)) + 1 : 1; }

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'page';
}

// Reserved names that would collide with existing top-level site files/dirs.
const RESERVED_SLUGS = ['index', 'about', 'contact', 'privacy', 'terms', 'portfolio', 'admin', 'ac', 'cameras', 'copiers', 'cash-machines', 'office-supplies', 'printing', 'css', 'js', 'images'];

function writePageFile(page) {
  const filePath = path.join(SITE_ROOT, `${page.slug}.html`);
  fs.writeFileSync(filePath, renderPageHtml(page), 'utf-8');
  return filePath;
}

function upsertSeoEntry(page) {
  const pages = getSeoPages();
  const seoPath = `${page.slug}.html`;
  const idx = pages.findIndex(p => p.path === seoPath);
  const entry = {
    id: idx >= 0 ? pages[idx].id : (pages.length ? Math.max(...pages.map(p => p.id)) + 1 : 1),
    path: seoPath,
    url: `/${page.slug}`,
    label: page.title,
    category: 'Custom',
    seo_title: page.seo_title || page.title,
    meta_description: page.meta_description || '',
    meta_keywords: page.meta_keywords || '',
    og_title: page.og_title || '',
    og_description: page.og_description || '',
    og_image: page.og_image || '',
    updated_at: new Date().toISOString()
  };
  if (idx >= 0) pages[idx] = entry;
  else pages.push(entry);
  saveSeoPages(pages);
}

function removeSeoEntry(slug) {
  const pages = getSeoPages().filter(p => p.path !== `${slug}.html`);
  saveSeoPages(pages);
}

router.get('/', view, (req, res) => {
  const pages = getPages().sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
  res.render('pages/list', {
    pageTitle: 'Pages',
    headExtra: '',
    headerActions: '<a href="/2ef65f179f12439e317a23628b016653/pages/new" class="btn btn-primary btn-sm">New Page</a>',
    breadcrumb: [{ label: 'Pages' }],
    pages
  });
});

router.get('/new', create, (req, res) => {
  res.render('pages/editor', {
    pageTitle: 'New Page',
    headExtra: '',
    headerActions: '',
    breadcrumb: [{ label: 'Pages', url: '/2ef65f179f12439e317a23628b016653/pages' }, { label: 'New Page' }],
    page: null
  });
});

router.post('/new', create, (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) {
    req.flash('danger', 'Title is required.');
    return res.redirect('/2ef65f179f12439e317a23628b016653/pages/new');
  }

  const pages = getPages();
  const page = {
    id: nextId(pages),
    title,
    slug: slugify(req.body.slug || title),
    breadcrumb_label: (req.body.breadcrumb_label || '').trim(),
    lead: (req.body.lead || '').trim(),
    body_html: req.body.body_html || '',
    seo_title: (req.body.seo_title || '').trim(),
    meta_description: (req.body.meta_description || '').trim(),
    meta_keywords: (req.body.meta_keywords || '').trim(),
    og_title: (req.body.og_title || '').trim(),
    og_description: (req.body.og_description || '').trim(),
    og_image: (req.body.og_image || '').trim(),
    show_cta: req.body.show_cta === 'on',
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: null
  };

  pages.push(page);
  savePages(pages);
  logActivity(req.session.username, 'Page created', `${page.title} (draft)`);
  req.flash('success', `Page "${page.title}" created as a draft.`);
  res.redirect(`/2ef65f179f12439e317a23628b016653/pages/${page.id}/edit`);
});

router.get('/:id/edit', view, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const page = getPages().find(p => p.id === id);
  if (!page) { req.flash('danger', 'Page not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/pages'); }

  res.render('pages/editor', {
    pageTitle: `Edit: ${page.title}`,
    headExtra: '',
    headerActions: page.status === 'published'
      ? `<a href="/${page.slug}.html" target="_blank" class="btn btn-outline-secondary btn-sm">View Live</a>`
      : '',
    breadcrumb: [{ label: 'Pages', url: '/2ef65f179f12439e317a23628b016653/pages' }, { label: page.title }],
    page
  });
});

router.post('/:id/edit', edit, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pages = getPages();
  const idx = pages.findIndex(p => p.id === id);
  if (idx < 0) { req.flash('danger', 'Page not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/pages'); }

  const title = (req.body.title || '').trim();
  if (!title) {
    req.flash('danger', 'Title is required.');
    return res.redirect(`/2ef65f179f12439e317a23628b016653/pages/${id}/edit`);
  }

  const page = pages[idx];
  page.title = title;
  page.breadcrumb_label = (req.body.breadcrumb_label || '').trim();
  page.lead = (req.body.lead || '').trim();
  page.body_html = req.body.body_html || '';
  page.seo_title = (req.body.seo_title || '').trim();
  page.meta_description = (req.body.meta_description || '').trim();
  page.meta_keywords = (req.body.meta_keywords || '').trim();
  page.og_title = (req.body.og_title || '').trim();
  page.og_description = (req.body.og_description || '').trim();
  page.og_image = (req.body.og_image || '').trim();
  page.show_cta = req.body.show_cta === 'on';
  page.updated_at = new Date().toISOString();

  // Slug is locked once published — changing it would orphan the live file.
  if (page.status !== 'published') {
    page.slug = slugify(req.body.slug || title);
  }

  savePages(pages);

  if (page.status === 'published') {
    writePageFile(page);
    upsertSeoEntry(page);
  }

  logActivity(req.session.username, 'Page updated', page.title);
  req.flash('success', `Page "${page.title}" saved${page.status === 'published' ? ' and republished' : ' as draft'}.`);
  res.redirect(`/2ef65f179f12439e317a23628b016653/pages/${id}/edit`);
});

router.post('/:id/publish', publish, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pages = getPages();
  const page = pages.find(p => p.id === id);
  if (!page) { req.flash('danger', 'Page not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/pages'); }

  if (RESERVED_SLUGS.includes(page.slug)) {
    req.flash('danger', `"${page.slug}" collides with an existing site page/folder. Change the URL slug first.`);
    return res.redirect(`/2ef65f179f12439e317a23628b016653/pages/${id}/edit`);
  }
  const filePath = path.join(SITE_ROOT, `${page.slug}.html`);
  if (page.status !== 'published' && fs.existsSync(filePath)) {
    req.flash('danger', `A file already exists at "${page.slug}.html". Choose a different URL slug.`);
    return res.redirect(`/2ef65f179f12439e317a23628b016653/pages/${id}/edit`);
  }

  writePageFile(page);
  upsertSeoEntry(page);
  page.status = 'published';
  page.published_at = new Date().toISOString();
  page.updated_at = page.published_at;
  savePages(pages);

  logActivity(req.session.username, 'Page published', `${page.title} → /${page.slug}.html`);
  req.flash('success', `"${page.title}" is now live at /${page.slug}.html.`);
  res.redirect(`/2ef65f179f12439e317a23628b016653/pages/${id}/edit`);
});

router.post('/:id/delete', del, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pages = getPages();
  const page = pages.find(p => p.id === id);
  if (!page) { req.flash('danger', 'Page not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/pages'); }

  if (page.status === 'published' && req.body.remove_file === 'on') {
    const filePath = path.join(SITE_ROOT, `${page.slug}.html`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    removeSeoEntry(page.slug);
  }

  savePages(pages.filter(p => p.id !== id));
  logActivity(req.session.username, 'Page deleted', page.title);
  req.flash('success', `Page "${page.title}" deleted.`);
  res.redirect('/2ef65f179f12439e317a23628b016653/pages');
});

module.exports = router;
