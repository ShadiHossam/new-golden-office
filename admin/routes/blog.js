const express = require('express');
const fs = require('fs');
const path = require('path');
const { loadJson, saveJson, getSeoPages, saveSeoPages } = require('../lib/db');
const { renderBlogPostHtml, renderBlogIndexHtml, absoluteUrl } = require('../lib/blog-templates');
const { logActivity } = require('../lib/activity');
const { requirePermission } = require('../lib/permissions');

const router = express.Router();
const FILE = 'blog.json';
const SITE_ROOT = path.join(__dirname, '..', '..');
const BLOG_DIR = path.join(SITE_ROOT, 'blog');
const SITEMAP_PATH = path.join(SITE_ROOT, 'post-sitemap.xml');

const view = requirePermission('blog.view');
const create = requirePermission('blog.create');
const edit = requirePermission('blog.edit');
const del = requirePermission('blog.delete');
const publish = requirePermission('blog.publish');

function getPosts() { return loadJson(FILE); }
function savePosts(list) { saveJson(FILE, list); }
function nextId(list) { return list.length ? Math.max(...list.map(p => p.id)) + 1 : 1; }

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'post';
}

// Only 'index' collides inside /blog/ — the directory itself is reserved.
const RESERVED_SLUGS = ['index'];

function writeBlogPostFile(post) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const filePath = path.join(BLOG_DIR, `${post.slug}.html`);
  fs.writeFileSync(filePath, renderBlogPostHtml(post), 'utf-8');
  return filePath;
}

function writeBlogIndexFile() {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), renderBlogIndexHtml(getPosts()), 'utf-8');
}

function upsertSeoEntry(post) {
  const pages = getSeoPages();
  const seoPath = `blog/${post.slug}.html`;
  const idx = pages.findIndex(p => p.path === seoPath);
  const entry = {
    id: idx >= 0 ? pages[idx].id : (pages.length ? Math.max(...pages.map(p => p.id)) + 1 : 1),
    path: seoPath,
    url: `/blog/${post.slug}`,
    label: post.title,
    category: 'Blog',
    seo_title: post.seo_title || post.title,
    meta_description: post.meta_description || post.excerpt || '',
    meta_keywords: post.meta_keywords || '',
    og_title: post.og_title || '',
    og_description: post.og_description || '',
    og_image: post.og_image || post.cover_image || '',
    updated_at: new Date().toISOString()
  };
  if (idx >= 0) pages[idx] = entry;
  else pages.push(entry);
  saveSeoPages(pages);
}

function removeSeoEntry(slug) {
  const pages = getSeoPages().filter(p => p.path !== `blog/${slug}.html`);
  saveSeoPages(pages);
}

// post-sitemap.xml has no XML-parser dependency in this app (see seo-sync.js
// for the same regex-based approach on live HTML) — match/replace the <url>
// block for this post's <loc> by string search rather than pulling in a lib.
function upsertSitemapEntry(post) {
  if (!fs.existsSync(SITEMAP_PATH)) return;
  let xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const loc = `https://newgoldenoffice.com/blog/${post.slug}.html`;
  const lastmod = post.updated_at || new Date().toISOString();
  const blockRe = new RegExp(`\\t<url>\\n\\t\\t<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>\\n`, 'g');
  const image = absoluteUrl(post.cover_image || post.og_image);
  const block = `\t<url>\n\t\t<loc>${loc}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n${image ? `\t\t<image:image>\n\t\t\t<image:loc>${image}</image:loc>\n\t\t</image:image>\n` : ''}\t</url>\n`;

  xml = xml.replace(blockRe, '');
  xml = xml.replace('</urlset>', block + '</urlset>');
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
}

function removeSitemapEntry(slug) {
  if (!fs.existsSync(SITEMAP_PATH)) return;
  let xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const loc = `https://newgoldenoffice.com/blog/${slug}.html`;
  const blockRe = new RegExp(`\\t<url>\\n\\t\\t<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>\\n`, 'g');
  xml = xml.replace(blockRe, '');
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
}

router.get('/', view, (req, res) => {
  const posts = getPosts().sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
  res.render('blog/list', {
    pageTitle: 'Blog',
    headExtra: '',
    headerActions: '<a href="/2ef65f179f12439e317a23628b016653/blog/new" class="btn btn-primary btn-sm">New Post</a>',
    breadcrumb: [{ label: 'Blog' }],
    posts
  });
});

router.get('/new', create, (req, res) => {
  res.render('blog/editor', {
    pageTitle: 'New Post',
    headExtra: '',
    headerActions: '',
    breadcrumb: [{ label: 'Blog', url: '/2ef65f179f12439e317a23628b016653/blog' }, { label: 'New Post' }],
    post: null
  });
});

router.post('/new', create, (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) {
    req.flash('danger', 'Title is required.');
    return res.redirect('/2ef65f179f12439e317a23628b016653/blog/new');
  }

  const posts = getPosts();
  const post = {
    id: nextId(posts),
    title,
    slug: slugify(req.body.slug || title),
    excerpt: (req.body.excerpt || '').trim(),
    cover_image: (req.body.cover_image || '').trim(),
    category: (req.body.category || '').trim(),
    tags: (req.body.tags || '').trim(),
    body_html: req.body.body_html || '',
    seo_title: (req.body.seo_title || '').trim(),
    meta_description: (req.body.meta_description || '').trim(),
    meta_keywords: (req.body.meta_keywords || '').trim(),
    og_title: (req.body.og_title || '').trim(),
    og_description: (req.body.og_description || '').trim(),
    og_image: (req.body.og_image || '').trim(),
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: null
  };

  posts.push(post);
  savePosts(posts);
  logActivity(req.session.username, 'Blog post created', `${post.title} (draft)`);
  req.flash('success', `Post "${post.title}" created as a draft.`);
  res.redirect(`/2ef65f179f12439e317a23628b016653/blog/${post.id}/edit`);
});

router.get('/:id/edit', view, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = getPosts().find(p => p.id === id);
  if (!post) { req.flash('danger', 'Post not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/blog'); }

  res.render('blog/editor', {
    pageTitle: `Edit: ${post.title}`,
    headExtra: '',
    headerActions: post.status === 'published'
      ? `<a href="/blog/${post.slug}.html" target="_blank" class="btn btn-outline-secondary btn-sm">View Live</a>`
      : '',
    breadcrumb: [{ label: 'Blog', url: '/2ef65f179f12439e317a23628b016653/blog' }, { label: post.title }],
    post
  });
});

router.post('/:id/edit', edit, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const posts = getPosts();
  const idx = posts.findIndex(p => p.id === id);
  if (idx < 0) { req.flash('danger', 'Post not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/blog'); }

  const title = (req.body.title || '').trim();
  if (!title) {
    req.flash('danger', 'Title is required.');
    return res.redirect(`/2ef65f179f12439e317a23628b016653/blog/${id}/edit`);
  }

  const post = posts[idx];
  post.title = title;
  post.excerpt = (req.body.excerpt || '').trim();
  post.cover_image = (req.body.cover_image || '').trim();
  post.category = (req.body.category || '').trim();
  post.tags = (req.body.tags || '').trim();
  post.body_html = req.body.body_html || '';
  post.seo_title = (req.body.seo_title || '').trim();
  post.meta_description = (req.body.meta_description || '').trim();
  post.meta_keywords = (req.body.meta_keywords || '').trim();
  post.og_title = (req.body.og_title || '').trim();
  post.og_description = (req.body.og_description || '').trim();
  post.og_image = (req.body.og_image || '').trim();
  post.updated_at = new Date().toISOString();

  // Slug is locked once published — changing it would orphan the live file.
  if (post.status !== 'published') {
    post.slug = slugify(req.body.slug || title);
  }

  savePosts(posts);

  if (post.status === 'published') {
    writeBlogPostFile(post);
    upsertSeoEntry(post);
    upsertSitemapEntry(post);
    writeBlogIndexFile();
  }

  logActivity(req.session.username, 'Blog post updated', post.title);
  req.flash('success', `Post "${post.title}" saved${post.status === 'published' ? ' and republished' : ' as draft'}.`);
  res.redirect(`/2ef65f179f12439e317a23628b016653/blog/${id}/edit`);
});

router.post('/:id/publish', publish, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  if (!post) { req.flash('danger', 'Post not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/blog'); }

  if (RESERVED_SLUGS.includes(post.slug)) {
    req.flash('danger', `"${post.slug}" collides with the blog index. Change the URL slug first.`);
    return res.redirect(`/2ef65f179f12439e317a23628b016653/blog/${id}/edit`);
  }
  const filePath = path.join(BLOG_DIR, `${post.slug}.html`);
  if (post.status !== 'published' && fs.existsSync(filePath)) {
    req.flash('danger', `A file already exists at "/blog/${post.slug}.html". Choose a different URL slug.`);
    return res.redirect(`/2ef65f179f12439e317a23628b016653/blog/${id}/edit`);
  }

  post.status = 'published';
  post.published_at = new Date().toISOString();
  post.updated_at = post.published_at;
  savePosts(posts);

  writeBlogPostFile(post);
  upsertSeoEntry(post);
  upsertSitemapEntry(post);
  writeBlogIndexFile();

  logActivity(req.session.username, 'Blog post published', `${post.title} → /blog/${post.slug}.html`);
  req.flash('success', `"${post.title}" is now live at /blog/${post.slug}.html.`);
  res.redirect(`/2ef65f179f12439e317a23628b016653/blog/${id}/edit`);
});

router.post('/:id/delete', del, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  if (!post) { req.flash('danger', 'Post not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/blog'); }

  if (post.status === 'published' && req.body.remove_file === 'on') {
    const filePath = path.join(BLOG_DIR, `${post.slug}.html`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    removeSeoEntry(post.slug);
    removeSitemapEntry(post.slug);
  }

  savePosts(posts.filter(p => p.id !== id));
  writeBlogIndexFile();
  logActivity(req.session.username, 'Blog post deleted', post.title);
  req.flash('success', `Post "${post.title}" deleted.`);
  res.redirect('/2ef65f179f12439e317a23628b016653/blog');
});

module.exports = router;
