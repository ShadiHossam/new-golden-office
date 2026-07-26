// Phase 2C: sync each .astro page's inline BaseLayout SEO props to match the
// Phase 1 reconciled seo.json (live HTML was the winner on conflict).
const fs = require('fs');
const path = require('path');

const ASTRO_ROOT = path.join(__dirname, '..');
const reconciled = JSON.parse(fs.readFileSync(path.join(__dirname, 'seo-reconciled.json'), 'utf-8'));

function mapPathToAstroFile(htmlPath) {
  const noExt = htmlPath.replace(/\.html$/, '');
  const rel = noExt === 'index' ? 'index.astro' : `${noExt}.astro`;
  return path.join(ASTRO_ROOT, 'src', 'pages', rel);
}

function escapeForAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

function setAttr(block, name, value) {
  if (value === undefined || value === null || value === '') return block;
  const re = new RegExp(`(^\\s*${name}=")[^"]*(")`, 'm');
  if (re.test(block)) {
    return block.replace(re, `$1${escapeForAttr(value)}$2`);
  }
  // insert before the closing '>' line
  return block.replace(/\n>\s*$/, `\n  ${name}="${escapeForAttr(value)}"\n>`);
}

let updated = 0;
let skippedNoFile = 0;
const log = [];

for (const page of reconciled) {
  if (page.path.startsWith('blog/')) continue; // handled separately by the blog content collection

  const filePath = mapPathToAstroFile(page.path);
  if (!fs.existsSync(filePath)) {
    skippedNoFile++;
    log.push(`SKIP (no astro file): ${page.path} -> ${path.relative(ASTRO_ROOT, filePath)}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const tagMatch = content.match(/<BaseLayout\b[\s\S]*?\n>/);
  if (!tagMatch) {
    log.push(`SKIP (no <BaseLayout> tag found): ${filePath}`);
    continue;
  }

  let block = tagMatch[0];
  const before = block;
  block = setAttr(block, 'title', page.seo_title);
  block = setAttr(block, 'description', page.meta_description);
  block = setAttr(block, 'keywords', page.meta_keywords);
  block = setAttr(block, 'ogTitle', page.og_title);
  block = setAttr(block, 'ogDescription', page.og_description);
  block = setAttr(block, 'ogImage', page.og_image);

  if (block !== before) {
    content = content.replace(before, block);
    fs.writeFileSync(filePath, content, 'utf-8');
    updated++;
    log.push(`UPDATED: ${path.relative(ASTRO_ROOT, filePath)}`);
  }
}

console.log(`Updated ${updated} pages. Skipped ${skippedNoFile} (no matching astro file).`);
console.log(log.join('\n'));
