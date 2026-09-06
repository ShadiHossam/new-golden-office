/**
 * Image pipeline for newgoldenoffice.com
 *
 * Two jobs, both idempotent:
 *   1. Cap every referenced original at MAX_EDGE px and re-encode it in place.
 *      The original URL keeps working, so admin/data/media.json, blog.json,
 *      og:image tags and any external link stay valid — the file behind the
 *      URL is just no longer an 8944px camera original.
 *   2. Emit narrower WebP variants under public/images/v/ (mirroring the
 *      source directory layout) and record them in src/data/image-manifest.json,
 *      which src/components/Img.astro turns into srcset/sizes/width/height.
 *
 * Run: node scripts/optimize-images.mjs [--force]
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC = 'public';
const OUT_DIR = 'public/images/v';
const MANIFEST = 'src/data/image-manifest.json';
const MAX_EDGE = 1600;          // longest edge of the base file
const WIDTHS = [400, 800, 1200, 1600];
const WEBP = { quality: 78, effort: 5 };
const JPEG = { quality: 80, mozjpeg: true };
const SKIP_VARIANTS_BELOW = 420; // logos/icons don't need a srcset
const FORCE = process.argv.includes('--force');

/* ---------- collect every referenced image path ---------- */
function walk(dir, fn) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, fn); else fn(p);
  }
}
const refs = new Set();
// The leading class includes `}` so template literals such as
// `${SITE}/images/og-image.jpg` are picked up too.
const RE = /["'(\s}](\/images\/(?!v\/)[^"'()\s\\`]+\.(?:webp|jpg|jpeg|png))/gi;
walk('src', (p) => {
  if (!/\.(astro|ts|json)$/.test(p)) return;
  for (const m of fs.readFileSync(p, 'utf8').matchAll(RE)) refs.add(m[1]);
});

/* ---------- process ---------- */
const manifest = {};
let baseSaved = 0, variantBytes = 0, processed = 0, skipped = 0;

for (const ref of [...refs].sort()) {
  const abs = path.join(PUBLIC, ref);
  if (!fs.existsSync(abs)) { console.warn('  ! missing, skipped:', ref); continue; }

  const ext = path.extname(ref).toLowerCase();
  const before = fs.statSync(abs).size;
  let meta = await sharp(abs).metadata();

  // --- 1. cap the base file in place ---
  if (Math.max(meta.width, meta.height) > MAX_EDGE) {
    const pipeline = sharp(abs).rotate().resize({
      width: meta.width >= meta.height ? MAX_EDGE : null,
      height: meta.height > meta.width ? MAX_EDGE : null,
      withoutEnlargement: true,
    });
    const buf = await (ext === '.png' ? pipeline.png({ compressionLevel: 9 })
      : ext === '.webp' ? pipeline.webp(WEBP)
      : pipeline.jpeg(JPEG)).toBuffer();
    fs.writeFileSync(abs, buf);
    baseSaved += before - buf.length;
    meta = await sharp(abs).metadata();
    processed++;
  } else {
    skipped++;
  }

  // --- 2. variants ---
  const rel = ref.replace(/^\/images\//, '');
  const outRel = rel.replace(/\.[^.]+$/, '');
  const variants = [];
  if (meta.width >= SKIP_VARIANTS_BELOW) {
    for (const w of WIDTHS) {
      if (w > meta.width) continue;
      const vPath = path.join(OUT_DIR, `${outRel}-${w}.webp`);
      const vUrl = '/' + path.relative(PUBLIC, vPath).split(path.sep).join('/');
      if (FORCE || !fs.existsSync(vPath)) {
        fs.mkdirSync(path.dirname(vPath), { recursive: true });
        await sharp(abs).resize({ width: w, withoutEnlargement: true }).webp(WEBP).toFile(vPath);
      }
      variantBytes += fs.statSync(vPath).size;
      variants.push([w, vUrl]);
    }
    // always offer the base width as the top candidate if no variant reaches it
    if (!variants.some(([w]) => w >= meta.width) && meta.width < WIDTHS[WIDTHS.length - 1]) {
      variants.push([meta.width, ref]);
    }
  }

  manifest[ref] = { w: meta.width, h: meta.height, variants };
}

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));

const dirSize = (d) => { let t = 0; walk(d, (p) => t += fs.statSync(p).size); return t; };
console.log(`\nimages referenced : ${refs.size}`);
console.log(`base files resized: ${processed}  (already small: ${skipped})`);
console.log(`saved on originals: ${(baseSaved / 1048576).toFixed(1)} MB`);
console.log(`variants written  : ${Object.values(manifest).reduce((a, m) => a + m.variants.length, 0)}  (${(variantBytes / 1048576).toFixed(1)} MB)`);
console.log(`public/images now : ${(dirSize('public/images') / 1048576).toFixed(1)} MB`);
console.log(`manifest          : ${MANIFEST}`);
