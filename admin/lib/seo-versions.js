const { loadJson, saveJson } = require('./db');

const FILE = 'seo-versions.json';
const MAX_PER_PAGE = 20;
const SNAPSHOT_FIELDS = ['seo_title', 'meta_description', 'meta_keywords', 'og_title', 'og_description', 'og_image'];

function loadAll() { return loadJson(FILE); }
function saveAll(list) { saveJson(FILE, list); }
function nextId(list) { return list.length ? Math.max(...list.map(v => v.id)) + 1 : 1; }

function snapshotFrom(page) {
  const snap = {};
  SNAPSHOT_FIELDS.forEach(f => { snap[f] = page[f] || ''; });
  return snap;
}

function saveVersion(page, savedBy) {
  const all = loadAll();
  const entry = {
    id: nextId(all),
    page_id: page.id,
    path: page.path,
    label: page.label,
    ...snapshotFrom(page),
    saved_by: savedBy || 'system',
    saved_at: new Date().toISOString()
  };
  all.unshift(entry);

  // Cap history per page so the file doesn't grow unbounded
  const forThisPage = all.filter(v => v.page_id === page.id);
  if (forThisPage.length > MAX_PER_PAGE) {
    const toDrop = new Set(forThisPage.slice(MAX_PER_PAGE).map(v => v.id));
    saveAll(all.filter(v => !toDrop.has(v.id)));
  } else {
    saveAll(all);
  }
  return entry;
}

function getVersions(pageId) {
  return loadAll()
    .filter(v => v.page_id === pageId)
    .sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));
}

function getVersion(pageId, versionId) {
  return loadAll().find(v => v.page_id === pageId && v.id === versionId);
}

module.exports = { saveVersion, getVersions, getVersion, SNAPSHOT_FIELDS };
