// Keeps astro/public/.htaccess in sync with admin/data/redirects.json so
// redirects added/edited/deleted in the admin Redirects panel actually take
// effect live, instead of just sitting in the JSON file unused. Writes a
// marker-delimited block that's regenerated in full on every change — never
// hand-edit between the markers, it will be overwritten on the next save.
const fs = require('fs');
const path = require('path');

const HTACCESS_PATH = path.join(__dirname, '..', '..', 'astro', 'public', '.htaccess');
const BEGIN_MARKER = '# BEGIN MANAGED REDIRECTS -- generated from admin/data/redirects.json, do not hand-edit';
const END_MARKER = '# END MANAGED REDIRECTS';
const INSERT_AFTER = 'DirectorySlash Off';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripNewlines(str) {
  return String(str || '').replace(/[\r\n]/g, '');
}

const CANONICAL_ORIGIN = 'https://newgoldenoffice.com';

// Site-relative targets are emitted absolute so a request that's wrong in both
// host and path (http://www.…/portfolio) is fixed in one 301 rather than
// bouncing off the host-canonicalization rules further down the .htaccess.
function toAbsolute(to) {
  if (/^https?:\/\//i.test(to)) return to;
  return `${CANONICAL_ORIGIN}${to.startsWith('/') ? to : `/${to}`}`;
}

function buildRuleLine(r) {
  const from = escapeRegex(stripNewlines(r.from).replace(/^\//, ''));
  if (r.status === 410) {
    return `RewriteRule ^${from}/?$ - [G,L]`;
  }
  const to = toAbsolute(stripNewlines(r.to) || '/');
  const code = r.status === 302 ? 302 : 301;
  return `RewriteRule ^${from}/?$ ${to} [R=${code},L]`;
}

function syncHtaccessRedirects(redirects) {
  let content;
  try {
    content = fs.readFileSync(HTACCESS_PATH, 'utf-8');
  } catch (e) {
    return false; // no .htaccess in this checkout (e.g. fresh clone) — nothing to sync
  }

  const lines = redirects.filter((r) => r.from).map(buildRuleLine);
  const block = [BEGIN_MARKER, ...lines, END_MARKER].join('\n');

  const markerRe = new RegExp(`${escapeRegex(BEGIN_MARKER)}[\\s\\S]*?${escapeRegex(END_MARKER)}`);
  let next;
  if (markerRe.test(content)) {
    next = content.replace(markerRe, block);
  } else if (content.includes(INSERT_AFTER)) {
    next = content.replace(INSERT_AFTER, `${INSERT_AFTER}\n\n${block}`);
  } else {
    next = `${block}\n\n${content}`;
  }

  if (next !== content) {
    fs.writeFileSync(HTACCESS_PATH, next, 'utf-8');
    return true;
  }
  return false;
}

module.exports = { syncHtaccessRedirects };
