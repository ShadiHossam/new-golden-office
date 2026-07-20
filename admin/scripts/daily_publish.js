// Runs on a server crontab (not triggered by the admin app). Publishes any
// draft blog post whose scheduled_at has passed, deploys the static site,
// and commits + pushes so the git history stays the source of truth even
// though this runs unattended outside any human's local checkout.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadJson, saveJson, getSeoPages, saveSeoPages } = require('../lib/db');
const { renderBlogPostHtml, renderBlogIndexHtml, absoluteUrl } = require('../lib/blog-templates');

const ADMIN_ROOT = path.join(__dirname, '..');
const SITE_ROOT = path.join(ADMIN_ROOT, '..');
const BLOG_DIR = path.join(SITE_ROOT, 'blog');
const SITEMAP_PATH = path.join(SITE_ROOT, 'post-sitemap.xml');
const LIVE_DOC_ROOT = '/home/zash7309/newgoldenoffice.com/';
const LOG_PATH = path.join(ADMIN_ROOT, 'data', 'cron-publish.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_PATH, line);
  process.stdout.write(line);
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

function upsertSitemapEntry(post) {
  if (!fs.existsSync(SITEMAP_PATH)) return;
  let xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const loc = `https://newgoldenoffice.com/blog/${post.slug}`;
  const lastmod = post.updated_at || new Date().toISOString();
  const blockRe = new RegExp(`\\t<url>\\n\\t\\t<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>\\n`, 'g');
  const image = absoluteUrl(post.cover_image || post.og_image);
  const block = `\t<url>\n\t\t<loc>${loc}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n${image ? `\t\t<image:image>\n\t\t\t<image:loc>${image}</image:loc>\n\t\t</image:image>\n` : ''}\t</url>\n`;
  xml = xml.replace(blockRe, '');
  xml = xml.replace('</urlset>', block + '</urlset>');
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
}

function sh(cmd) {
  return execSync(cmd, { cwd: SITE_ROOT, encoding: 'utf-8' }).trim();
}

function main() {
  const posts = loadJson('blog.json');
  const now = new Date();
  const due = posts.filter(p => p.status === 'draft' && p.scheduled_at && new Date(p.scheduled_at) <= now);

  if (!due.length) {
    log('No due posts.');
    return;
  }

  due.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  for (const post of due) {
    log(`Publishing: ${post.slug}`);
    post.status = 'published';
    post.published_at = now.toISOString();
    post.updated_at = post.published_at;

    fs.mkdirSync(BLOG_DIR, { recursive: true });
    fs.writeFileSync(path.join(BLOG_DIR, `${post.slug}.html`), renderBlogPostHtml(post), 'utf-8');
    upsertSeoEntry(post);
    upsertSitemapEntry(post);
  }

  saveJson('blog.json', posts);
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), renderBlogIndexHtml(loadJson('blog.json')), 'utf-8');

  try {
    sh(`rsync -a --exclude='admin' --exclude='.git' --exclude='.gitignore' ${SITE_ROOT}/ ${LIVE_DOC_ROOT}`);
    log('rsync to live doc root: ok');
  } catch (e) {
    log(`rsync FAILED: ${e.message}`);
  }

  try {
    sh('git add -A');
    sh(`git commit -m "Auto-publish: ${due.map(p => p.slug).join(', ')}"`);
    sh('git push origin master');
    log('git commit+push: ok');
  } catch (e) {
    log(`git commit/push FAILED: ${e.message}`);
  }

  log(`Done. Published ${due.length} post(s): ${due.map(p => p.slug).join(', ')}`);
}

main();
