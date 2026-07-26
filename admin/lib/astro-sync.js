// Phase 3 of the Astro migration: every admin write that used to touch the
// static HTML tree also writes the equivalent Astro content-collection /
// data-source file, so the Astro build stays in sync with admin edits during
// the parity-build window and is ready to take over at cutover.
//
// IMPORTANT — deploy gate: triggerAstroRebuild() only builds. It only rsyncs
// to a live doc root if ASTRO_DEPLOY_TARGET is set in the environment. This
// is deliberate: deploying this code to the server must NOT start silently
// overwriting the live static site the moment it lands — an operator has to
// explicitly opt in (at cutover) by setting that env var, the same way
// NODE_ENV is set today (see deployment-o2switch memory).
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { sanitizeBodyHtml } = require('./page-templates');

const SITE_ROOT = path.join(__dirname, '..', '..');
const ASTRO_ROOT = path.join(SITE_ROOT, 'astro');
const BLOG_DIR = path.join(ASTRO_ROOT, 'src', 'content', 'blog');
const PAGES_DIR = path.join(ASTRO_ROOT, 'src', 'content', 'pages');
const SITE_SEO_PATH = path.join(ASTRO_ROOT, 'src', 'data', 'site-seo.json');
const LOCK_PATH = path.join(ASTRO_ROOT, '.building');
const LOG_PATH = path.join(__dirname, '..', 'data', 'astro-build.log');

// On this o2switch/CloudLinux host, whatever `npm` this admin process would
// find via PATH (from its own nodevenv activation at Passenger startup) is a
// wrapper that always redirects installs to THIS app's venv — running it
// against astro/ silently "succeeds" while writing to the wrong
// node_modules entirely (see astro-migration-plan memory). Bypass it by
// putting the real Node install's bin dir first on PATH for this subprocess
// only. Falls back to the plain environment on hosts without this path
// (e.g. local dev).
const REAL_NODE_BIN = '/opt/alt/alt-nodejs22/root/usr/bin';
const BUILD_ENV = fs.existsSync(REAL_NODE_BIN)
  ? { ...process.env, PATH: `${REAL_NODE_BIN}:${process.env.PATH}` }
  : process.env;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(LOG_PATH, line); } catch (e) { /* logging is best-effort */ }
}

function writeAstroBlogEntry(post) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const entry = {
    title: post.title,
    slug: post.slug,
    body_html: sanitizeBodyHtml(post.body_html || ''),
    excerpt: post.excerpt || '',
    cover_image: post.cover_image || '',
    category: post.category || '',
    tags: post.tags || '',
    seo_title: post.seo_title || '',
    meta_description: post.meta_description || '',
    meta_keywords: post.meta_keywords || '',
    og_title: post.og_title || '',
    og_description: post.og_description || '',
    og_image: post.og_image || '',
    status: post.status,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at || '',
  };
  fs.writeFileSync(path.join(BLOG_DIR, `${post.slug}.json`), JSON.stringify(entry, null, 2), 'utf-8');
}

function deleteAstroBlogEntry(slug) {
  const p = path.join(BLOG_DIR, `${slug}.json`);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

function writeAstroPageEntry(page) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
  const entry = {
    title: page.title,
    slug: page.slug,
    body_html: sanitizeBodyHtml(page.body_html || ''),
    seo_title: page.seo_title || '',
    meta_description: page.meta_description || '',
    meta_keywords: page.meta_keywords || '',
    og_title: page.og_title || '',
    og_description: page.og_description || '',
    og_image: page.og_image || '',
    status: page.status,
  };
  fs.writeFileSync(path.join(PAGES_DIR, `${page.slug}.json`), JSON.stringify(entry, null, 2), 'utf-8');
}

function deleteAstroPageEntry(slug) {
  const p = path.join(PAGES_DIR, `${slug}.json`);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

function writeAstroSeo(url, updates) {
  if (!url) return;
  let data = {};
  if (fs.existsSync(SITE_SEO_PATH)) {
    try { data = JSON.parse(fs.readFileSync(SITE_SEO_PATH, 'utf-8')); } catch (e) { data = {}; }
  }
  data[url] = {
    title: updates.seo_title || '',
    description: updates.meta_description || '',
    keywords: updates.meta_keywords || '',
    ogTitle: updates.og_title || '',
    ogDescription: updates.og_description || '',
    ogImage: updates.og_image || '',
  };
  fs.mkdirSync(path.dirname(SITE_SEO_PATH), { recursive: true });
  fs.writeFileSync(SITE_SEO_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Fire-and-forget: caller does not await the actual build/deploy, only that
// the content file was written. A simple lock file prevents two publishes in
// quick succession from racing two concurrent `astro build` runs.
function triggerAstroRebuild() {
  if (fs.existsSync(LOCK_PATH)) {
    log('Skipped: a build is already in progress (.building lock present).');
    return;
  }
  fs.writeFileSync(LOCK_PATH, String(process.pid));
  log('Build started.');

  execFile('npm', ['run', 'build'], { cwd: ASTRO_ROOT, env: BUILD_ENV }, (err, stdout, stderr) => {
    if (err) {
      log(`Build FAILED: ${err.message}\n${stderr}`);
      try { fs.unlinkSync(LOCK_PATH); } catch (e) {}
      return;
    }
    log('Build succeeded.');

    const target = process.env.ASTRO_DEPLOY_TARGET;
    if (!target) {
      log('No ASTRO_DEPLOY_TARGET set — build complete, not deployed. Set this env var to enable auto-deploy (see astro-migration-plan memory, Phase 6).');
      try { fs.unlinkSync(LOCK_PATH); } catch (e) {}
      return;
    }

    const distDir = path.join(ASTRO_ROOT, 'dist') + path.sep;
    execFile('rsync', ['-a', '--delete', distDir, target], (rsyncErr, rsyncStdout, rsyncStderr) => {
      if (rsyncErr) {
        log(`Deploy rsync FAILED: ${rsyncErr.message}\n${rsyncStderr}`);
      } else {
        log(`Deployed to ${target}`);
      }
      try { fs.unlinkSync(LOCK_PATH); } catch (e) {}
    });
  });
}

module.exports = {
  writeAstroBlogEntry,
  deleteAstroBlogEntry,
  writeAstroPageEntry,
  deleteAstroPageEntry,
  writeAstroSeo,
  triggerAstroRebuild,
};
