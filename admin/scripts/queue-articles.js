// Turns a folder of Markdown articles into scheduled blog drafts in
// admin/data/blog.json — one post per day. The server crontab's
// daily_publish.js then publishes each one on its scheduled_at date and
// rebuilds/deploys the Astro site.
//
// Drafts deliberately do NOT get an astro/src/content/blog/<slug>.json entry
// here; daily_publish.js writes that at publish time.
//
// Usage:
//   node admin/scripts/queue-articles.js [folder] [options]
//
// Options:
//   --start=YYYY-MM-DD  first publish date (default: day after the last
//                       scheduled post, never earlier than tomorrow)
//   --time=HH:MM        publish time, UTC (default 08:00)
//   --every=N           days between posts (default 1)
//   --category="..."    category for articles that don't declare one
//   --dry-run           print the plan without writing anything
//
// Each .md file: `# Heading` on the first line is the title, the rest is the
// body. Filename (minus any `NN-` prefix) is the slug. An optional YAML-ish
// frontmatter block can override title, slug, category, cover_image, excerpt,
// tags, meta_description, or pin a single post to a date with `date:`.
//
// Every article must have a cover picture — one is never invented from a
// generic category image. Supply it either as a sibling file next to the .md
// (same name, .webp/.jpg/.png — it gets converted to WebP and copied into
// astro/public/images/), as a `cover_image:` frontmatter path that already
// exists there, or as the first inline image in the body. Articles without one
// are reported and left unqueued. daily_publish.js enforces the same rule again
// at publish time.
const fs = require('fs');
const path = require('path');
const { loadJson, saveJson } = require('../lib/db');

const DEFAULT_FOLDER = path.join(__dirname, '..', '..', 'astro', 'newgoldenoffice-articles');
// The live doc root is built from astro/dist, so astro/public/images is the
// only image folder that reaches production — the repo-root images/ tree is
// retired (see local-repo-lags-production-server-files memory).
const IMAGES_DIR = path.join(__dirname, '..', '..', 'astro', 'public', 'images');
const IMAGE_EXTS = ['.webp', '.jpg', '.jpeg', '.png'];

const CATEGORIES = {
  'تكييفات': /(^|-)(ac|hvac|air-condition|tak?yeef)/,
  'كاميرات المراقبة': /(^|-)(cctv|camera|cameras|surveillance|security)/,
  'ماكينات التصوير': /(^|-)(copier|copiers|photocopier|scanner)/,
  'الطباعة': /(^|-)(print|printing|printer|offset)/,
  'ماكينات عد النقود وفرم الورق': /(^|-)(cash|money|counter|counting|shredder)/,
  'مستلزمات مكتبية': /(^|-)(office|supplies|paper|pens|stationery|filing|envelope)/,
};
const FALLBACK_CATEGORY = 'مستلزمات مكتبية';

function parseArgs(argv) {
  const opts = { folder: DEFAULT_FOLDER, time: '08:00', every: 1, dryRun: false, start: null, category: null };
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg.startsWith('--start=')) opts.start = arg.slice(8);
    else if (arg.startsWith('--time=')) opts.time = arg.slice(7);
    else if (arg.startsWith('--every=')) opts.every = parseInt(arg.slice(8), 10);
    else if (arg.startsWith('--category=')) opts.category = arg.slice(11);
    else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    else opts.folder = path.resolve(arg);
  }
  if (!/^\d{2}:\d{2}$/.test(opts.time)) throw new Error(`--time must be HH:MM, got "${opts.time}"`);
  if (!(opts.every >= 1)) throw new Error(`--every must be 1 or more, got "${opts.every}"`);
  if (opts.start && !/^\d{4}-\d{2}-\d{2}$/.test(opts.start)) throw new Error(`--start must be YYYY-MM-DD, got "${opts.start}"`);
  return opts;
}

function slugify(str) {
  return String(str).toLowerCase().trim()
    .replace(/\.md$/, '')
    .replace(/^\d+[-_.]\s*/, '')
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitFrontmatter(raw) {
  const meta = {};
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta, body: raw };
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+)\s*:\s*(.*)$/i);
    if (kv) meta[kv[1].toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: raw.slice(match[0].length) };
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) => `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => `<a href="${escapeAttr(href)}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,!؟?])/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Markdown subset the article writers actually use: h1-h4, bullet and numbered
// lists, paragraphs, and a bold-only line (the FAQ question convention), which
// becomes an h3 so it lands in the page outline and the FAQ schema.
function markdownToHtml(body) {
  const lines = body.split(/\r?\n/);
  const out = [];
  let list = null;
  let para = [];

  const flushPara = () => {
    if (!para.length) return;
    const text = para.join(' ').trim();
    para = [];
    out.push(`<p>${inline(text)}</p>`);
  };
  const flushList = () => {
    if (!list) return;
    out.push(`<${list.tag}>`);
    for (const item of list.items) out.push(`  <li>${inline(item)}</li>`);
    out.push(`</${list.tag}>`);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }

    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      flushPara(); flushList();
      out.push(`<h${heading[1].length}>${inline(heading[2].trim())}</h${heading[1].length}>`);
      continue;
    }

    // A line that is nothing but bold text is an FAQ question — the articles
    // write these with the answer on the very next line, no blank line.
    const boldOnly = line.match(/^\*\*([^*]+)\*\*$/);
    if (boldOnly) {
      flushPara(); flushList();
      out.push(`<h3>${inline(boldOnly[1])}</h3>`);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      const tag = bullet ? 'ul' : 'ol';
      if (list && list.tag !== tag) flushList();
      if (!list) list = { tag, items: [] };
      list.items.push((bullet || numbered)[1].trim());
      continue;
    }

    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return out.join('\n');
}

function firstParagraph(body) {
  for (const block of body.split(/\r?\n\s*\r?\n/)) {
    const text = block.trim();
    if (!text || /^#/.test(text) || /^[-*\d]/.test(text)) continue;
    return text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*`]/g, '').replace(/\s+/g, ' ');
  }
  return '';
}

function excerptFrom(body, max = 160) {
  const text = firstParagraph(body);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[،,.\s]+$/, '') + '…';
}

function inferCategory(slug, title) {
  const haystack = `${slug} ${title}`.toLowerCase();
  for (const [name, pattern] of Object.entries(CATEGORIES)) {
    if (pattern.test(haystack) || haystack.includes(name)) return name;
  }
  return null;
}

function tryRequireSharp() {
  try { return require('sharp'); } catch (e) { return null; }
}

// Resolves the article's cover picture, copying a sibling image into
// astro/public/images as WebP if that's where it came from. Returns the public
// /images/... URL, or null when the article has no picture at all.
async function resolveCover(folder, file, slug, meta, body, dryRun) {
  if (meta.cover_image) {
    const url = meta.cover_image.trim();
    const local = path.join(IMAGES_DIR, path.basename(url));
    if (!url.startsWith('http') && !fs.existsSync(local)) {
      throw new Error(`cover_image "${url}" is not in astro/public/images/`);
    }
    return url;
  }

  const base = file.replace(/\.md$/, '');
  const sibling = IMAGE_EXTS.map(ext => path.join(folder, base + ext)).find(p => fs.existsSync(p));
  if (sibling) {
    // sharp is only installed where the admin app runs; without it the picture
    // is copied across untouched rather than failing the whole queue.
    const converter = path.extname(sibling).toLowerCase() === '.webp' ? null : tryRequireSharp();
    const outName = `${slug}-cover${converter ? '.webp' : path.extname(sibling).toLowerCase()}`;
    if (!dryRun) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
      const outPath = path.join(IMAGES_DIR, outName);
      if (converter) await converter(sibling).webp({ quality: 82 }).toFile(outPath);
      else fs.copyFileSync(sibling, outPath);
    }
    return `/images/${outName}`;
  }

  const inlineImage = body.match(/!\[[^\]]*\]\(([^)\s]+)\)/);
  if (inlineImage) {
    const url = inlineImage[1];
    if (url.startsWith('http') || fs.existsSync(path.join(IMAGES_DIR, path.basename(url)))) return url;
  }

  return null;
}

function latestScheduleDate(posts) {
  const stamps = posts
    .map(p => p.scheduled_at || p.published_at)
    .filter(Boolean)
    .map(s => new Date(s))
    .filter(d => !isNaN(d));
  return stamps.length ? new Date(Math.max(...stamps)) : null;
}

function slotStart(posts, opts) {
  const [h, m] = opts.time.split(':').map(Number);
  const at = (date) => {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), h, m));
    return d;
  };
  if (opts.start) {
    const [y, mo, d] = opts.start.split('-').map(Number);
    return new Date(Date.UTC(y, mo - 1, d, h, m));
  }
  const tomorrow = new Date(Date.now() + 86400000);
  const latest = latestScheduleDate(posts);
  const afterLatest = latest ? new Date(latest.getTime() + 86400000) : null;
  return at(afterLatest && afterLatest > tomorrow ? afterLatest : tomorrow);
}

function iso(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(opts.folder)) throw new Error(`Folder not found: ${opts.folder}`);
  const files = fs.readdirSync(opts.folder).filter(f => f.endsWith('.md') && !f.startsWith('_')).sort();
  if (!files.length) throw new Error(`No .md files in ${opts.folder}`);

  const posts = loadJson('blog.json');
  const existingSlugs = new Set(posts.map(p => p.slug));
  const queued = [];
  const skipped = [];
  const problems = [];
  const noPicture = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(opts.folder, file), 'utf-8');
    const { meta, body } = splitFrontmatter(raw);

    const h1 = body.match(/^\s*#\s+(.+)$/m);
    const title = (meta.title || (h1 && h1[1]) || '').trim();
    const slug = slugify(meta.slug || file);
    const content = h1 ? body.replace(h1[0], '') : body;

    if (!title) { problems.push(`${file}: no title (add "# Title" as the first line or a frontmatter title:)`); continue; }
    if (!slug) { problems.push(`${file}: could not derive a slug from the filename`); continue; }
    if (existingSlugs.has(slug)) { skipped.push({ file, slug }); continue; }
    if (queued.some(q => q.slug === slug)) { problems.push(`${file}: duplicate slug "${slug}" within this batch`); continue; }

    const category = (meta.category || opts.category || inferCategory(slug, title) || FALLBACK_CATEGORY).trim();
    const excerpt = (meta.excerpt || excerptFrom(content)).trim();
    const bodyHtml = markdownToHtml(content);

    if (!bodyHtml) { problems.push(`${file}: empty body`); continue; }

    let cover;
    try {
      cover = await resolveCover(opts.folder, file, slug, meta, content, opts.dryRun);
    } catch (e) {
      problems.push(`${file}: ${e.message}`);
      continue;
    }
    if (!cover) { noPicture.push({ file, slug }); continue; }

    queued.push({
      file,
      slug,
      title,
      category,
      cover_image: cover,
      excerpt,
      tags: (meta.tags || '').trim(),
      meta_description: (meta.meta_description || excerpt).trim(),
      body_html: bodyHtml,
      pinned_date: meta.date || null,
    });
  }

  if (problems.length) {
    console.error('Nothing was queued — fix these first:\n');
    for (const p of problems) console.error(`  ✗ ${p}`);
    process.exit(1);
  }

  const [hh, mm] = opts.time.split(':').map(Number);
  let slot = slotStart(posts, opts);
  let nextId = posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1;
  const now = iso(new Date());
  const added = [];

  for (const item of queued) {
    let scheduledAt;
    if (item.pinned_date) {
      const [y, mo, d] = item.pinned_date.split('-').map(Number);
      scheduledAt = new Date(Date.UTC(y, mo - 1, d, hh, mm));
    } else {
      scheduledAt = slot;
      slot = new Date(slot.getTime() + opts.every * 86400000);
    }

    added.push({
      id: nextId++,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      cover_image: item.cover_image,
      category: item.category,
      tags: item.tags,
      body_html: item.body_html,
      seo_title: item.title,
      meta_description: item.meta_description,
      meta_keywords: '',
      og_title: '',
      og_description: '',
      og_image: '',
      status: 'draft',
      created_at: now,
      updated_at: now,
      published_at: null,
      scheduled_at: iso(scheduledAt),
      source_file: item.file,
    });
  }

  for (const s of skipped) console.log(`  – skipped ${s.file} (slug "${s.slug}" already in blog.json)`);

  if (noPicture.length) {
    console.log(`\nNOT queued — no picture (${noPicture.length}):\n`);
    for (const n of noPicture) console.log(`  ✗ ${n.file}`);
    console.log(`\n  Add a picture named "${noPicture[0].file.replace(/\.md$/, '')}.jpg" (or .webp/.png) next to the`);
    console.log('  article, or set cover_image: in its frontmatter, then run this again.');
  }

  if (!added.length) {
    console.log('\nNothing new to queue.');
    return;
  }

  console.log(`\n${opts.dryRun ? 'Would queue' : 'Queued'} ${added.length} post(s), one every ${opts.every} day(s) at ${opts.time} UTC:\n`);
  for (const p of added) {
    console.log(`  ${p.scheduled_at.slice(0, 10)}  ${p.slug}`);
    console.log(`              ${p.title}`);
    console.log(`              ${p.category} · ${p.cover_image}`);
  }

  if (opts.dryRun) {
    console.log('\n(dry run — blog.json not modified)');
    return;
  }

  saveJson('blog.json', posts.concat(added));
  console.log(`\nWrote ${added.length} draft(s) to admin/data/blog.json.`);
  console.log('Next: commit + push blog.json, then pull on the server so its cron sees them:');
  console.log("  ssh -i ~/.ssh/id_ed25519_o2switch zash7309@cuivre.o2switch.net 'cd apps/new-golden-office && git pull origin master --no-rebase --no-edit'");
}

main().catch(e => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
