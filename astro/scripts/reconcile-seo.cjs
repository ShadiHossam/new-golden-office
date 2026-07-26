// One-off Phase 1 reconciliation: diff admin/data/seo.json against the live
// static HTML's actual <title>/meta tags. HTML wins on conflict (matches the
// precedent already established when a stale seo.json blanked a live og:image).
const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.join(__dirname, '..', '..');
const seoSyncPath = path.join(SITE_ROOT, 'admin', 'lib', 'seo-sync.js');
const { readHtmlMeta } = require(seoSyncPath);

const seoJsonPath = path.join(SITE_ROOT, 'admin', 'data', 'seo.json');
const pages = JSON.parse(fs.readFileSync(seoJsonPath, 'utf-8'));

const FIELDS = ['seo_title', 'meta_description', 'meta_keywords', 'og_title', 'og_description', 'og_image'];

const report = [];
const merged = [];

for (const page of pages) {
  const filePath = path.join(SITE_ROOT, page.path);
  const htmlMeta = readHtmlMeta(filePath);

  if (!htmlMeta) {
    report.push({ path: page.path, issue: 'FILE_NOT_FOUND', note: 'seo.json entry has no corresponding live HTML file' });
    merged.push({ ...page, _source: 'json-only (file missing)' });
    continue;
  }

  const resolved = { ...page };
  for (const field of FIELDS) {
    const jsonVal = (page[field] || '').trim();
    const htmlVal = (htmlMeta[field] || '').trim();
    if (jsonVal !== htmlVal) {
      report.push({
        path: page.path,
        field,
        json_value: jsonVal,
        html_value: htmlVal,
        resolution: 'html_wins'
      });
      // HTML wins, except when HTML has nothing and JSON has a value (don't blank out real data)
      resolved[field] = htmlVal || jsonVal;
    }
  }
  merged.push(resolved);
}

const outDir = path.join(__dirname);
fs.writeFileSync(path.join(outDir, 'seo-reconciliation-report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outDir, 'seo-reconciled.json'), JSON.stringify(merged, null, 2));

console.log(`Checked ${pages.length} pages.`);
console.log(`Conflicts found: ${report.length}`);
const byPath = {};
for (const r of report) {
  byPath[r.path] = (byPath[r.path] || 0) + 1;
}
console.log('Pages with conflicts:', Object.keys(byPath).length);
for (const [p, count] of Object.entries(byPath)) {
  console.log(`  ${p}: ${count} field(s)`);
}
