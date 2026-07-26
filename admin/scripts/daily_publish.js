// Runs on a server crontab (not triggered by the admin app). Publishes any
// draft blog post whose scheduled_at has passed, writes the Astro content
// collection entry, triggers a rebuild+deploy, and commits + pushes so the
// git history stays the source of truth even though this runs unattended
// outside any human's local checkout.
//
// Cutover note (Phase 6, astro-migration-plan memory): this used to also
// render blog/<slug>.html + post-sitemap.xml directly and rsync the whole
// legacy static tree to the live doc root. That rsync is gone as of cutover
// — the live doc root is now fully owned by astro/dist/ (deployed via
// triggerAstroRebuild()'s own rsync, gated on ASTRO_DEPLOY_TARGET), and
// re-rsyncing the old static tree on top of it here would silently undo the
// cutover on the next scheduled post.
const path = require('path');
const { execSync } = require('child_process');
const { loadJson, saveJson } = require('../lib/db');
const { writeAstroBlogEntry, triggerAstroRebuild } = require('../lib/astro-sync');

const ADMIN_ROOT = path.join(__dirname, '..');
const SITE_ROOT = path.join(ADMIN_ROOT, '..');
const LOG_PATH = path.join(ADMIN_ROOT, 'data', 'cron-publish.log');
const fs = require('fs');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_PATH, line);
  process.stdout.write(line);
}

function sh(cmd) {
  return execSync(cmd, { cwd: SITE_ROOT, encoding: 'utf-8' }).trim();
}

function main() {
  const posts = loadJson('blog.json');
  const now = new Date();
  const due = posts.filter(p => p.status === 'draft' && p.scheduled_at && new Date(p.scheduled_at) <= now);

  if (!due.length) {
    log('No due posts.');
    return;
  }

  due.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  for (const post of due) {
    log(`Publishing: ${post.slug}`);
    post.status = 'published';
    post.published_at = now.toISOString();
    post.updated_at = post.published_at;
    writeAstroBlogEntry(post);
  }

  saveJson('blog.json', posts);
  triggerAstroRebuild();

  try {
    sh('git add -A');
    sh(`git commit -m "Auto-publish: ${due.map(p => p.slug).join(', ')}"`);
    sh('git push origin master');
    log('git commit+push: ok');
  } catch (e) {
    log(`git commit/push FAILED: ${e.message}`);
  }

  log(`Done. Published ${due.length} post(s): ${due.map(p => p.slug).join(', ')}`);
}

main();
