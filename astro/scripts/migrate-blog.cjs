// One-off Phase 2 migration: admin/data/blog.json -> astro/src/content/blog/<slug>.json
// Content-collection entries, one per post. Published posts get their
// og_image/cover_image cross-checked against the live rendered blog/<slug>.html
// and the live value wins if blog.json is stale (known drift risk).
const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.join(__dirname, '..', '..');
const ASTRO_ROOT = path.join(__dirname, '..');
const { sanitizeBodyHtml } = require(path.join(SITE_ROOT, 'admin', 'lib', 'page-templates.js'));

const posts = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, 'admin', 'data', 'blog.json'), 'utf-8'));

const outDir = path.join(ASTRO_ROOT, 'src', 'content', 'blog');
fs.mkdirSync(outDir, { recursive: true });

function extractOgImage(html) {
  const m = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+property=["']og:image["']/i);
  return m ? m[1].trim() : '';
}

let written = 0;
const notes = [];

for (const post of posts) {
  let og_image = post.og_image || '';
  let cover_image = post.cover_image || '';

  if (post.status === 'published') {
    const liveFile = path.join(SITE_ROOT, 'blog', `${post.slug}.html`);
    if (fs.existsSync(liveFile)) {
      const liveHtml = fs.readFileSync(liveFile, 'utf-8');
      const liveOgImage = extractOgImage(liveHtml);
      if (liveOgImage && liveOgImage !== (og_image || cover_image)) {
        notes.push(`${post.slug}: og_image differs from live (json="${og_image || cover_image}" live="${liveOgImage}") -> using live`);
        og_image = liveOgImage;
      }
    } else {
      notes.push(`${post.slug}: published but no live blog/${post.slug}.html found`);
    }
  }

  const entry = {
    title: post.title,
    slug: post.slug,
    body_html: sanitizeBodyHtml(post.body_html || ''),
    excerpt: post.excerpt || '',
    cover_image,
    category: post.category || '',
    tags: post.tags || '',
    seo_title: post.seo_title || '',
    meta_description: post.meta_description || '',
    meta_keywords: post.meta_keywords || '',
    og_title: post.og_title || '',
    og_description: post.og_description || '',
    og_image,
    status: post.status,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at || '',
  };

  fs.writeFileSync(path.join(outDir, `${post.slug}.json`), JSON.stringify(entry, null, 2), 'utf-8');
  written++;
}

console.log(`Wrote ${written} blog content-collection entries to ${path.relative(ASTRO_ROOT, outDir)}`);
console.log(`Published: ${posts.filter(p => p.status === 'published').length}, Draft: ${posts.filter(p => p.status === 'draft').length}`);
if (notes.length) {
  console.log('\nNotes:');
  notes.forEach(n => console.log(`  - ${n}`));
}
