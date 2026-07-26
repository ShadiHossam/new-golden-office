// Phase 3 refactor: replace each page's hardcoded BaseLayout SEO props with a
// lookup into astro/src/data/site-seo.json, so the (soon to be rewritten)
// admin SEO editor has one structured file to write to instead of regexing
// .astro source or 44 separate literal prop blocks.
const fs = require('fs');
const path = require('path');

const ASTRO_ROOT = path.join(__dirname, '..');
const reconciled = JSON.parse(fs.readFileSync(path.join(__dirname, 'seo-reconciled.json'), 'utf-8'));

function mapPathToAstroFile(htmlPath) {
  const noExt = htmlPath.replace(/\.html$/, '');
  const rel = noExt === 'index' ? 'index.astro' : `${noExt}.astro`;
  return path.join(ASTRO_ROOT, 'src', 'pages', rel);
}

function relImportPath(fromFile) {
  const depth = path.relative(path.join(ASTRO_ROOT, 'src', 'pages'), path.dirname(fromFile)).split(path.sep).filter(Boolean).length;
  return '../'.repeat(depth + 1) + 'lib/siteSeo';
}

let updated = 0;
const skipped = [];

for (const page of reconciled) {
  if (page.path.startsWith('blog/')) continue;

  const filePath = mapPathToAstroFile(page.path);
  if (!fs.existsSync(filePath)) {
    skipped.push(page.path);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  const tagMatch = content.match(/<BaseLayout\b[\s\S]*?\n>/);
  if (!tagMatch) {
    skipped.push(`${page.path} (no BaseLayout tag)`);
    continue;
  }
  let block = tagMatch[0];
  const before = block;

  // Strip the now-lookup-driven attributes, keep everything else (schemaJson, preloadImage, robots).
  for (const attr of ['title', 'description', 'keywords', 'ogTitle', 'ogDescription', 'ogImage']) {
    block = block.replace(new RegExp(`\\n\\s*${attr}="[^"]*"`), '');
  }
  block = block.replace(/<BaseLayout\b/, `<BaseLayout\n  {...getSeoFor('${page.url}')}`);

  content = content.replace(before, block);

  // Add the import if not already present.
  if (!content.includes("from '../lib/siteSeo'") && !content.includes("lib/siteSeo'")) {
    const importLine = `import { getSeoFor } from '${relImportPath(filePath)}';`;
    // Insert right after the last existing import in the frontmatter block.
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      const fm = fmMatch[1];
      const lines = fm.split('\n');
      let lastImportIdx = -1;
      lines.forEach((l, i) => { if (l.trim().startsWith('import ')) lastImportIdx = i; });
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, importLine);
      } else {
        lines.unshift(importLine);
      }
      const newFm = lines.join('\n');
      content = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${newFm}\n---`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  updated++;
}

console.log(`Updated ${updated} pages to use getSeoFor().`);
if (skipped.length) {
  console.log('Skipped:', skipped);
}
