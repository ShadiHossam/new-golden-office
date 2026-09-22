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
  'تكييفات': /(^|-)(ac|hvac|air-condition|tak?yeef)|تكييف/,
  'كاميرات المراقبة': /(^|-)(cctv|camera|cameras|surveillance|security)|كاميرا|مراقبة/,
  'ماكينات التصوير': /(^|-)(copier|copiers|photocopier|scanner)|تصوير/,
  'الطباعة': /(^|-)(print|printing|printer|offset)|طباعة|مطبعة|طابعة/,
  'ماكينات عد النقود وفرم الورق': /(^|-)(cash|money|counter|counting|shredder)|عد النقود|ماكينات العد|شريدر|فرم الورق|كاشف التزوير/,
  'مستلزمات مكتبية': /(^|-)(office|supplies|paper|pens|stationery|filing|envelope)|قرطاسية|مستلزمات|ورق/,
};
const FALLBACK_CATEGORY = 'مستلزمات مكتبية';

// The article pipeline stamps each file with a `cluster:` — either "A · الطباعة"
// or a site path like "/copiers/buy". Both forms reduce to a site category;
// clusters with no category of their own (geo, corporate supply) fall through
// to keyword inference.
const CLUSTERS = {
  'الطباعة': 'الطباعة',
  'مستلزمات مكتبية': 'مستلزمات مكتبية',
  'كاميرات المراقبة': 'كاميرات المراقبة',
  'ماكينات التصوير': 'ماكينات التصوير',
  'تكييفات': 'تكييفات',
  'ماكينات العد والشريدر': 'ماكينات عد النقود وفرم الورق',
  'printing': 'الطباعة',
  'office-supplies': 'مستلزمات مكتبية',
  'copiers': 'ماكينات التصوير',
  'cameras': 'كاميرات المراقبة',
  'cash-machines': 'ماكينات عد النقود وفرم الورق',
  'ac': 'تكييفات',
};

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
    // The writers leave "[label]([[رابط واتساب: يضعه الفريق]])" for the team to
    // fill in; its target has spaces, so the generic link rule below skips it
    // and it would go live as raw text. Point it at the business WhatsApp.
    .replace(/\[([^\[\]]+)\]\(\[\[رابط واتساب[^\]]*\]\]\)/g, (m, label) => `<a href="https://wa.me/201227392074" target="_blank" rel="noopener">${label}</a>`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => `<a href="${escapeAttr(href)}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,!؟?])/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function splitRow(line) {
  return line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());
}

function tableToHtml(header, rows) {
  const out = ['<table>', '  <thead>', '    <tr>'];
  for (const cell of header) out.push(`      <th>${inline(cell)}</th>`);
  out.push('    </tr>', '  </thead>', '  <tbody>');
  for (const row of rows) {
    out.push('    <tr>');
    for (let i = 0; i < header.length; i++) out.push(`      <td>${inline(row[i] || '')}</td>`);
    out.push('    </tr>');
  }
  out.push('  </tbody>', '</table>');
  return out.join('\n');
}

// The generated articles open with a <KeyPoints points={[{title, detail}]} />
// block — a component that was never built. It renders as the same summary list
// the hand-written posts already carry, so it lands in the chapter outline too.
function keyPointsToHtml(block) {
  const items = [];
  const point = /\{\s*title:\s*"([\s\S]*?)"\s*,\s*detail:\s*"([\s\S]*?)"\s*,?\s*\}/g;
  let match;
  while ((match = point.exec(block))) {
    const title = match[1].replace(/\s+/g, ' ').trim();
    const detail = match[2].replace(/\s+/g, ' ').trim();
    if (!title) continue;
    items.push(detail ? `<strong>${inline(title)}</strong> — ${inline(detail)}` : inline(title));
  }
  if (!items.length) return '';
  return ['<h2>أهم النقاط في سطور (Key Takeaways)</h2>', '<ul>',
    ...items.map(i => `  <li>${i}</li>`), '</ul>'].join('\n');
}

function fencedToHtml(lang, code) {
  if (lang === 'json') {
    try {
      const data = JSON.parse(code);
      if (data && data['@context']) {
        return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
      }
    } catch (e) {
      // Not parseable — fall through and show it as a code block rather than
      // publishing a broken schema.
    }
  }
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<pre><code>${escaped}</code></pre>`;
}

// Markdown subset the article writers actually use: h1-h4, bullet and numbered
// lists, tables, paragraphs, and a bold-only line (the FAQ question
// convention), which becomes an h3 so it lands in the page outline and the FAQ
// schema.
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { flushPara(); flushList(); continue; }

    if (/^<KeyPoints\b/.test(line)) {
      flushPara(); flushList();
      const start = i;
      while (i < lines.length && !/\]\}\s*\/>/.test(lines[i])) i++;
      const html = keyPointsToHtml(lines.slice(start, i + 1).join('\n'));
      if (html) out.push(html);
      continue;
    }

    if (line.startsWith('|') && /^\|[\s:|-]+\|$/.test((lines[i + 1] || '').trim())) {
      flushPara(); flushList();
      const header = splitRow(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(splitRow(lines[i++].trim()));
      i--;
      out.push(tableToHtml(header, rows));
      continue;
    }

    // Each article carries its FAQ schema as either a <script> tag or a ```json
    // fence. Both become one JSON-LD script in the built HTML, which is where
    // Google reads it from — never visible text.
    if (/^<script\b/i.test(line)) {
      flushPara(); flushList();
      const start = i;
      while (i < lines.length && !/<\/script>/i.test(lines[i])) i++;
      out.push(lines.slice(start, i + 1).join('\n'));
      continue;
    }

    if (line.startsWith('```')) {
      flushPara(); flushList();
      const lang = line.slice(3).trim().toLowerCase();
      const start = ++i;
      while (i < lines.length && !lines[i].trim().startsWith('```')) i++;
      out.push(fencedToHtml(lang, lines.slice(start, i).join('\n')));
      continue;
    }

    // A line that is one bare HTML tag — the articles wrap each table in a
    // horizontally scrolling div — passes through instead of becoming a <p>.
    if (/^<\/?[a-z][^>]*>$/i.test(line)) {
      flushPara(); flushList();
      out.push(line);
      continue;
    }

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
    if (!text || /^[#<|]/.test(text) || /^[-*\d]/.test(text)) continue;
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

function categoryFromCluster(cluster) {
  if (!cluster) return null;
  const value = cluster.replace(/^[A-Za-z]\s*[·.\-]\s*/, '').trim();
  const key = value.startsWith('/') ? value.slice(1).split('/')[0] : value;
  return CLUSTERS[key] || null;
}

function inferCategory(slug, title) {
  const haystack = `${slug} ${title}`.toLowerCase();
  for (const [name, pattern] of Object.entries(CATEGORIES)) {
    if (pattern.test(haystack) || haystack.includes(name)) return name;
  }
  return null;
}

// sharp may only be installed in the Astro project (it is on a dev machine),
// so look there too before giving up.
function tryRequireSharp() {
  for (const id of ['sharp', path.join(__dirname, '..', '..', 'astro', 'node_modules', 'sharp')]) {
    try { return require(id); } catch (e) { /* try the next location */ }
  }
  return null;
}

// Blog pictures never show wider than ~772px, so 1200px covers 1.5x screens.
const MAX_IMAGE_WIDTH = 1200;

function findSibling(folder, name) {
  return IMAGE_EXTS.map(ext => path.join(folder, name + ext)).find(p => fs.existsSync(p));
}

// Copies a picture into astro/public/images as WebP and returns its public URL.
async function publishSibling(sibling, outBase, dryRun) {
  // sharp is only installed where the admin app runs; without it the picture
  // is copied across untouched rather than failing the whole queue.
  const converter = tryRequireSharp();
  const outName = `${outBase}${converter ? '.webp' : path.extname(sibling).toLowerCase()}`;
  if (!dryRun) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    const outPath = path.join(IMAGES_DIR, outName);
    if (converter) {
      await converter(sibling).resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true }).webp({ quality: 78 }).toFile(outPath);
    }
    else fs.copyFileSync(sibling, outPath);
  }
  return `/images/${outName}`;
}

// Pictures beyond the cover sit next to the article as <name>-2.jpg,
// <name>-3.jpg, … (fetch-article-images.js saves them that way).
async function resolveBodyImages(folder, file, slug, dryRun) {
  const base = file.replace(/\.md$/, '');
  const urls = [];
  for (let n = 2; ; n++) {
    const sibling = findSibling(folder, `${base}-${n}`);
    if (!sibling) break;
    urls.push(await publishSibling(sibling, `${slug}-${n}`, dryRun));
  }
  return urls;
}

// Spreads body pictures across the article's chapters, each placed after its
// chapter's opening paragraph so the heading still leads. The Key Takeaways
// summary and the FAQ are left without pictures.
function insertBodyImages(html, urls) {
  if (!urls.length) return html;
  const lines = html.split('\n');
  const chapters = lines
    .map((line, i) => ({ line, i }))
    .filter(({ line }) => /^<h2>/.test(line) && !/أهم النقاط|أسئلة شائعة|الأسئلة الشائعة/.test(line));
  if (!chapters.length) return html;

  const inserts = urls.map((url, n) => {
    const chapter = chapters[Math.min(chapters.length - 1, Math.floor((n + 1) * chapters.length / (urls.length + 1)))];
    const at = /^<p>/.test(lines[chapter.i + 1] || '') ? chapter.i + 2 : chapter.i + 1;
    const alt = chapter.line.replace(/<[^>]+>/g, '').trim();
    return { at, tag: `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" loading="lazy">` };
  });
  for (const { at, tag } of inserts.sort((a, b) => b.at - a.at)) lines.splice(at, 0, tag);
  return lines.join('\n');
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
  const sibling = findSibling(folder, base);
  if (sibling) return publishSibling(sibling, `${slug}-cover`, dryRun);

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

    const category = (meta.category || categoryFromCluster(meta.cluster) || opts.category
      || inferCategory(slug, title) || FALLBACK_CATEGORY).trim();
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
    const bodyImages = await resolveBodyImages(opts.folder, file, slug, opts.dryRun);

    queued.push({
      file,
      slug,
      title,
      category,
      cover_image: cover,
      excerpt,
      tags: (meta.tags || '').trim(),
      seo_title: (meta.meta_title || title).trim(),
      meta_description: (meta.meta_description || excerpt).trim(),
      body_html: insertBodyImages(bodyHtml, bodyImages),
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
      seo_title: item.seo_title,
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
    const bodyPictures = (p.body_html.match(/<img /g) || []).length;
    console.log(`              ${p.category} · ${p.cover_image}${bodyPictures ? ` + ${bodyPictures} in article` : ' · ONLY THE COVER, no picture in the article'}`);
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
