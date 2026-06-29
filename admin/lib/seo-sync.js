const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.join(__dirname, '..', '..');

function readHtmlMeta(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const html = fs.readFileSync(filePath, 'utf-8');

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  const kwMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']*)["']/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']keywords["']/i);
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+property=["']og:title["']/i);
  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+property=["']og:description["']/i);
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+property=["']og:image["']/i);

  return {
    seo_title: titleMatch ? titleMatch[1].trim() : '',
    meta_description: descMatch ? descMatch[1].trim() : '',
    meta_keywords: kwMatch ? kwMatch[1].trim() : '',
    og_title: ogTitleMatch ? ogTitleMatch[1].trim() : '',
    og_description: ogDescMatch ? ogDescMatch[1].trim() : '',
    og_image: ogImageMatch ? ogImageMatch[1].trim() : ''
  };
}

function writeHtmlMeta(filePath, { seo_title, meta_description, meta_keywords, og_title, og_description, og_image }) {
  if (!fs.existsSync(filePath)) return false;
  let html = fs.readFileSync(filePath, 'utf-8');

  // Update <title>
  if (seo_title !== undefined) {
    html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo_title)}</title>`);
  }

  // Update meta description
  if (meta_description !== undefined) {
    if (/<meta\s+name=["']description["']/i.test(html)) {
      html = html.replace(
        /(<meta\s+name=["']description["']\s+content=["'])[^"']*(['"])/i,
        `$1${escapeHtml(meta_description)}$2`
      );
    }
  }

  // Update meta keywords
  if (meta_keywords !== undefined && meta_keywords !== '') {
    if (/<meta\s+name=["']keywords["']/i.test(html)) {
      html = html.replace(
        /(<meta\s+name=["']keywords["']\s+content=["'])[^"']*(['"])/i,
        `$1${escapeHtml(meta_keywords)}$2`
      );
    }
  }

  // Update og:title
  if (og_title !== undefined) {
    if (/<meta\s+property=["']og:title["']/i.test(html)) {
      html = html.replace(
        /(<meta\s+property=["']og:title["']\s+content=["'])[^"']*(['"])/i,
        `$1${escapeHtml(og_title)}$2`
      );
    }
  }

  // Update og:description
  if (og_description !== undefined) {
    if (/<meta\s+property=["']og:description["']/i.test(html)) {
      html = html.replace(
        /(<meta\s+property=["']og:description["']\s+content=["'])[^"']*(['"])/i,
        `$1${escapeHtml(og_description)}$2`
      );
    }
  }

  // Update og:image
  if (og_image !== undefined) {
    if (/<meta\s+property=["']og:image["']/i.test(html)) {
      html = html.replace(
        /(<meta\s+property=["']og:image["']\s+content=["'])[^"']*(['"])/i,
        `$1${escapeHtml(og_image)}$2`
      );
    }
  }

  fs.writeFileSync(filePath, html, 'utf-8');
  return true;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getHtmlFilePath(relativePath) {
  return path.join(SITE_ROOT, relativePath);
}

module.exports = { readHtmlMeta, writeHtmlMeta, getHtmlFilePath, SITE_ROOT };
