const fs = require('fs');
const path = require('path');
const { SITE_ROOT } = require('./seo-sync');

function getAllHtmlFiles(dir, base) {
  base = base || dir;
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'admin') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...getAllHtmlFiles(full, base));
    } else if (e.isFile() && e.name.endsWith('.html')) {
      results.push('/' + path.relative(base, full).replace(/\\/g, '/'));
    }
  }
  return results;
}

function extractInternalLinks(htmlContent, sourceFile) {
  const links = [];
  const hrefRe = /href=["']([^"'#?]+)["']/gi;
  let m;
  while ((m = hrefRe.exec(htmlContent)) !== null) {
    const href = m[1].trim();
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('//')) continue;
    // Resolve relative to source file
    let resolved;
    if (href.startsWith('/')) {
      resolved = href;
    } else {
      const sourceDir = path.dirname(sourceFile);
      resolved = path.posix.normalize(path.posix.join(sourceDir, href));
    }
    // Strip trailing slash → index.html
    if (resolved.endsWith('/')) resolved = resolved + 'index.html';
    // Add .html if no extension
    if (!path.extname(resolved)) resolved = resolved + '/index.html';
    links.push(resolved);
  }
  return [...new Set(links)];
}

function checkLinks() {
  const allFiles = new Set(getAllHtmlFiles(SITE_ROOT));
  const broken = [];
  const ok = [];
  let totalChecked = 0;

  for (const file of allFiles) {
    const fullPath = path.join(SITE_ROOT, file);
    let html;
    try { html = fs.readFileSync(fullPath, 'utf-8'); } catch (_) { continue; }

    const links = extractInternalLinks(html, file);
    for (const link of links) {
      totalChecked++;
      if (allFiles.has(link)) {
        ok.push({ source: file, target: link });
      } else {
        // Check physical file
        const targetPath = path.join(SITE_ROOT, link);
        if (fs.existsSync(targetPath)) {
          ok.push({ source: file, target: link });
        } else {
          broken.push({ source: file, target: link });
        }
      }
    }
  }

  return { broken, totalFiles: allFiles.size, totalChecked, brokenCount: broken.length };
}

module.exports = { checkLinks };
