// Finds free stock photos for a folder of articles and saves them next to each
// .md, named the way queue-articles.js picks them up: <name>.jpg is the cover,
// <name>-2.jpg (and -3, …) go inside the article body.
//
// Sources: Pexels and Pixabay. Both licenses allow commercial use with no
// credit line and allow keeping a copy on our own server (Pixabay requires it —
// no hotlinking). Where each picture came from is still recorded in
// _image-credits.json, and _image-review.html shows every pick side by side.
//
// Usage:
//   PEXELS_KEY=... PIXABAY_KEY=... node admin/scripts/fetch-article-images.js <folder> --queries=<file.json> [options]
//
// Options:
//   --count=N           pictures per article, cover included (default 2)
//   --only=1,2,3        just these articles (filenames without .md)
//   --sources=a,b       pexels,pixabay (default both — whichever has a key)
//   --dry-run           search and report, download nothing
//
// The queries file maps each article to English search phrases:
//   { "1": ["cover phrase", "body phrase", "fallback phrase"], ... }
// Picture N uses phrase N first, then falls back to the others.
//
// A picture that already exists is never overwritten, so pictures added by hand
// win and a stopped run resumes where it left off. Delete a picture you don't
// like and run again: it's replaced with the next-best match, never the same one.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
// Words too generic to prove a photo matches — "office printer" must match on
// "printer", not on "office".
const WEAK_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'office', 'business', 'company', 'people', 'work', 'modern', 'professional']);
// Never on a business blog, whatever the search matched on.
const BLOCKED = /\b(beer|wine|alcohol\w*|whisk(e)?y|vodka|cocktail|pub|bar counter|bartender|cigar\w*|smok\w*|vap\w*|bikini|lingerie|swimsuit|church|gun|weapon|drugs?|casino|gambl\w*|poker|gin|rum|liquor|ammunition|ammo|bitcoin|crypto\w*|toilet|lego|minion|police|protest\w*|pregnan\w*|3d|superhero\w*|otters?|cats?|kitten|dental|teeth|tooth|pexels|unsplash)\b/i;
// Pixabay's download URLs expire after 24 hours, so a cached search is only
// reused within that window.
const CACHE_MS = 23 * 3600 * 1000;

function parseArgs(argv) {
  const opts = { folder: null, queries: null, count: 2, only: null, sources: ['pexels', 'pixabay'], dryRun: false };
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg.startsWith('--queries=')) opts.queries = path.resolve(arg.slice(10));
    else if (arg.startsWith('--count=')) opts.count = parseInt(arg.slice(8), 10);
    else if (arg.startsWith('--only=')) opts.only = arg.slice(7).split(',').map(s => s.trim()).filter(Boolean);
    else if (arg.startsWith('--sources=')) opts.sources = arg.slice(10).split(',').map(s => s.trim());
    else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    else opts.folder = path.resolve(arg);
  }
  if (!opts.folder) throw new Error('Pass the articles folder');
  if (!opts.queries) throw new Error('Pass --queries=<file.json>');
  if (!(opts.count >= 1)) throw new Error(`--count must be 1 or more, got "${opts.count}"`);
  return opts;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const waitUntil = { pexels: 0, pixabay: 0 };

// Both APIs report their remaining quota in headers. Pexels sends the reset as
// a UNIX timestamp, Pixabay as seconds from now. Pexels allows 200 searches an
// hour, so a full batch spends most of its time waiting here.
async function getJson(source, url, headers = {}) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const delay = waitUntil[source] - Date.now();
    if (delay > 0) {
      if (delay > 60000) console.log(`  … ${source} hourly limit reached, waiting ${Math.ceil(delay / 60000)} min`);
      await sleep(delay);
    }
    let res;
    try {
      res = await fetch(url, { headers });
    } catch (e) {
      // A dropped connection is not "no match" — wait and try again.
      console.log(`  … ${source} unreachable (${e.cause ? e.cause.code || e.cause.message : e.message}), retrying in ${30 * (attempt + 1)}s`);
      await sleep(30000 * (attempt + 1));
      continue;
    }
    if (res.headers.has('x-ratelimit-remaining')) {
      const remaining = Number(res.headers.get('x-ratelimit-remaining'));
      const reset = Number(res.headers.get('x-ratelimit-reset'));
      if (remaining <= 1) waitUntil[source] = (reset > 1e9 ? reset * 1000 : Date.now() + (reset || 60) * 1000) + 1000;
    }
    if (res.status === 429) {
      if (waitUntil[source] <= Date.now()) waitUntil[source] = Date.now() + 10 * 60000;
      continue;
    }
    if (!res.ok) throw new Error(`${source} ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }
  throw new Error(`${source}: still failing after several tries — stopping so no article is skipped; run again to resume`);
}

async function searchPexels(query, key) {
  const params = new URLSearchParams({ query, orientation: 'landscape', per_page: '40' });
  const data = await getJson('pexels', `https://api.pexels.com/v1/search?${params}`, { Authorization: key });
  return (data.photos || []).map((p, rank) => ({
    source: 'pexels', id: `pexels-${p.id}`, rank, width: p.width, height: p.height,
    text: `${p.alt || ''} ${p.url}`, page: p.url, author: p.photographer,
    preview: p.src.medium, download: `${p.src.original}?auto=compress&cs=tinysrgb&w=1600`,
  }));
}

async function searchPixabay(query, key) {
  const params = new URLSearchParams({
    key, q: query.slice(0, 100), image_type: 'photo', orientation: 'horizontal',
    safesearch: 'true', min_width: '1280', per_page: '40', lang: 'en',
  });
  const data = await getJson('pixabay', `https://pixabay.com/api/?${params}`);
  return (data.hits || []).map((h, rank) => ({
    source: 'pixabay', id: `pixabay-${h.id}`, rank, width: h.imageWidth, height: h.imageHeight,
    text: `${h.tags || ''} ${h.pageURL}`, page: h.pageURL, author: h.user,
    preview: h.webformatURL, download: h.largeImageURL,
  }));
}

async function search(source, query, key, cacheDir) {
  const hash = crypto.createHash('sha1').update(query.toLowerCase()).digest('hex').slice(0, 16);
  const file = path.join(cacheDir, `${source}-${hash}.json`);
  if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < CACHE_MS) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  const results = source === 'pexels' ? await searchPexels(query, key) : await searchPixabay(query, key);
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(results));
  return results;
}

// A photo only counts as a match when its description or tags contain every
// meaningful word of the query. Ties keep each site's own relevance order.
function rank(query, candidates) {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !WEAK_WORDS.has(w));
  return candidates
    // Checked without the page link, which always says "pexels.com".
    .filter(c => c.width / c.height >= 1.2 && !BLOCKED.test(c.text.replace(/https?:\/\/\S+/g, '')))
    .map(c => {
      const text = c.text.toLowerCase();
      return { ...c, score: terms.filter(t => text.includes(t.replace(/(es|s)$/, ''))).length };
    })
    // Every meaningful word must match — one shared word let "printer rollers"
    // pick a roller coaster and "rubber stamp" pick cookies.
    .filter(c => c.score > 0 && c.score === terms.length)
    .sort((a, b) => b.score - a.score || a.rank - b.rank);
}

async function download(pick, destWithoutExt) {
  const res = await fetch(pick.download);
  if (!res.ok) throw new Error(`download ${res.status} for ${pick.page}`);
  const type = res.headers.get('content-type') || '';
  const ext = type.includes('png') ? '.png' : type.includes('webp') ? '.webp' : '.jpg';
  const file = destWithoutExt + ext;
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return path.basename(file);
}

function articleTitle(folder, base) {
  const raw = fs.readFileSync(path.join(folder, `${base}.md`), 'utf-8');
  const m = raw.match(/^title:\s*"?(.*?)"?\s*$/m) || raw.match(/^#\s+(.+)$/m);
  return m ? m[1] : base;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function writeReview(folder, bases, credits) {
  const rows = bases.map(base => {
    const entry = credits[base];
    const slots = (entry && entry.slots) || [];
    const picks = slots.sort((a, b) => a.slot - b.slot).map(s => `
      <figure>
        <img src="${esc(s.file)}" loading="lazy">
        <figcaption>${s.slot === 0 ? 'Cover' : `In article (${s.slot + 1})`} · <a href="${esc(s.page)}">${esc(s.source)}</a> · “${esc(s.query)}”</figcaption>
      </figure>`).join('');
    const missing = slots.length ? '' : '<p class="missing">No picture found</p>';
    return `
    <section>
      <h2><span>${esc(base)}.md</span> ${esc(articleTitle(folder, base))}</h2>
      <div class="picks">${picks}${missing}</div>
    </section>`;
  }).join('');
  const html = `<!doctype html><meta charset="utf-8"><title>Article pictures review</title>
<style>
body{font:14px system-ui,sans-serif;margin:0 auto;max-width:1100px;padding:24px 16px;background:#f6f6f4;color:#222}
section{background:#fff;border-radius:10px;padding:14px 16px;margin:0 0 14px}
h2{font-size:16px;margin:0 0 10px;direction:rtl;text-align:right}
h2 span{float:left;direction:ltr;color:#888;font-weight:400}
.picks{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
figure{margin:0}img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:6px;display:block}
figcaption{color:#666;font-size:12px;margin-top:4px}.missing{color:#b00}
</style>
<h1>Article pictures (${bases.length} articles)</h1>${rows}`;
  fs.writeFileSync(path.join(folder, '_image-review.html'), html);
}

// Tells whether a picture looks the same as one already known: a 64-bit
// difference hash, so resizing and recompression don't hide a repeat.
async function pictureIndex(dirs) {
  let sharp = null;
  for (const id of ['sharp', path.join(__dirname, '..', '..', 'astro', 'node_modules', 'sharp')]) {
    try { sharp = require(id); break; } catch (e) { /* try the next */ }
  }
  if (!sharp) throw new Error('sharp is needed to check for repeated pictures — run npm install in astro/');
  const hash = async (file) => {
    const data = await sharp(file).greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer();
    let h = 0n;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) h = (h << 1n) | (data[y * 9 + x] > data[y * 9 + x + 1] ? 1n : 0n);
    return h;
  };
  const distance = (a, b) => { let d = 0, x = a ^ b; while (x) { d += Number(x & 1n); x >>= 1n; } return d; };
  const known = [];
  const walk = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    // v/ only holds resized copies; _rejected and _originals aren't in use.
    if (e.isDirectory()) return ['v', '_rejected', '_originals', '_image-cache'].includes(e.name) ? [] : walk(p);
    return IMAGE_EXTS.includes(path.extname(e.name).toLowerCase()) ? [p] : [];
  }) : [];
  for (const file of dirs.flatMap(walk)) {
    try { known.push({ file, h: await hash(file) }); } catch (e) { /* unreadable — skip */ }
  }
  return {
    async match(file) {
      const h = await hash(file);
      const hit = known.find(k => k.file !== file && distance(k.h, h) <= 6);
      return hit ? path.relative(process.cwd(), hit.file) : null;
    },
    async add(file) { known.push({ file, h: await hash(file) }); },
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const keys = { pexels: process.env.PEXELS_KEY, pixabay: process.env.PIXABAY_KEY };
  const sources = opts.sources.filter(s => keys[s]);
  if (!sources.length) throw new Error('Set PEXELS_KEY and/or PIXABAY_KEY in the environment');

  const queries = JSON.parse(fs.readFileSync(opts.queries, 'utf-8'));
  const creditsPath = path.join(opts.folder, '_image-credits.json');
  const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, 'utf-8')) : {};
  const cacheDir = path.join(opts.folder, '_image-cache');

  // Every photo ever picked or rejected stays off-limits, so no two articles
  // share a picture and a deleted picture never comes back.
  const used = new Set();
  const perSource = Object.fromEntries(sources.map(s => [s, 0]));
  for (const entry of Object.values(credits)) {
    for (const s of [...(entry.slots || []), ...(entry.rejected || [])]) used.add(s.id);
    for (const s of entry.slots || []) if (s.source in perSource) perSource[s.source]++;
  }

  // Pictures already on the site, or already picked for this batch, compared by
  // how they look rather than by name or photo ID.
  const seen = await pictureIndex([path.join(__dirname, '..', '..', 'astro', 'public', 'images'), opts.folder]);

  const bases = fs.readdirSync(opts.folder)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => f.slice(0, -3))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const todo = opts.only ? bases.filter(b => opts.only.includes(b)) : bases;
  const noQueries = todo.filter(b => !(queries[b] && queries[b].length));
  if (noQueries.length) throw new Error(`No search phrases for: ${noQueries.join(', ')}`);

  console.log(`${todo.length} article(s), ${opts.count} picture(s) each, from ${sources.join(' + ')}${opts.dryRun ? ' (dry run)' : ''}\n`);
  const notFound = [];
  let saved = 0;

  for (const base of todo) {
    const entry = credits[base] || (credits[base] = { slots: [], rejected: [] });
    for (let slot = 0; slot < opts.count; slot++) {
      const name = slot === 0 ? base : `${base}-${slot + 1}`;
      if (IMAGE_EXTS.some(ext => fs.existsSync(path.join(opts.folder, name + ext)))) continue;

      const previous = entry.slots.find(s => s.slot === slot);
      if (previous && !opts.dryRun) {
        entry.rejected.push(previous);
        entry.slots = entry.slots.filter(s => s !== previous);
      }

      const phrases = queries[base];
      const ordered = [phrases[slot], ...phrases.filter((_, i) => i !== slot)].filter(Boolean);
      // Each picture is searched on one site only: whichever has supplied fewer
      // pictures so far, so neither site dominates the batch. The other site is
      // tried only when the first has nothing that matches.
      const bySource = [...sources].sort((a, b) => perSource[a] - perSource[b]);
      let pick = null;
      let query = null;
      let file = `${name}.jpg`;
      let failed = null;
      search: for (const source of bySource) {
        for (const q of ordered) {
          let results;
          try {
            results = await search(source, q, keys[source], cacheDir);
          } catch (e) {
            // Keep what this article already got, then stop the whole run.
            if (!opts.dryRun) fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
            throw e;
          }
          for (const candidate of rank(q, results)) {
            if (used.has(candidate.id)) continue;
            used.add(candidate.id);
            if (opts.dryRun) { pick = candidate; query = q; break search; }
            try {
              file = await download(candidate, path.join(opts.folder, name));
            } catch (e) {
              failed = e.message;
              continue;
            }
            // A different photo ID can still be the same photo — re-uploaded to
            // the other site, or already on our own pages under another name.
            const twin = await seen.match(path.join(opts.folder, file));
            if (twin) {
              fs.unlinkSync(path.join(opts.folder, file));
              entry.rejected.push({ slot, id: candidate.id, page: candidate.page, reason: `same picture as ${twin}` });
              console.log(`  … ${name}: ${candidate.id} is the same picture as ${twin}, trying the next one`);
              continue;
            }
            await seen.add(path.join(opts.folder, file));
            pick = candidate;
            query = q;
            break search;
          }
        }
      }

      if (!pick) {
        notFound.push(name);
        console.log(`  ✗ ${name}: ${failed || `nothing matched ${JSON.stringify(ordered)}`}`);
        continue;
      }
      perSource[pick.source]++;
      if (!opts.dryRun) saved++;
      entry.slots.push({ slot, file, query, source: pick.source, id: pick.id, page: pick.page, author: pick.author, text: pick.text.trim() });
      console.log(`  ✓ ${file}  ${pick.source}  “${query}”`);
    }
    if (!opts.dryRun) fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
  }

  if (!opts.dryRun) writeReview(opts.folder, bases.filter(b => credits[b]), credits);

  console.log(`\n${opts.dryRun ? 'Would save' : 'Saved'} ${opts.dryRun ? todo.length * opts.count - notFound.length : saved} picture(s).`);
  if (notFound.length) console.log(`No match for ${notFound.length}: ${notFound.join(', ')} — add better phrases to the queries file and run again.`);
  if (!opts.dryRun) console.log(`Review them all in ${path.join(opts.folder, '_image-review.html')}`);
}

main().catch(e => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
