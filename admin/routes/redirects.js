const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../lib/db');
const { logActivity } = require('../lib/activity');
const { requirePermission } = require('../lib/permissions');

const router = express.Router();
const view = requirePermission('redirects.view');
const manage = requirePermission('redirects.manage');
const FILE = 'redirects.json';

function getRedirects() { return loadJson(FILE); }
function saveRedirects(data) { saveJson(FILE, data); }
function nextId(list) { return list.length ? Math.max(...list.map(r => r.id)) + 1 : 1; }

function normalizePath(raw) {
  if (!raw) return '';
  try {
    const u = new URL(raw);
    return u.pathname + (u.search || '');
  } catch (_) {}
  return raw.startsWith('/') ? raw : '/' + raw;
}

router.get('/', view, (req, res) => {
  const redirects = getRedirects();
  res.render('redirects/list', {
    pageTitle: 'Redirects',
    headExtra: '',
    headerActions: '',
    breadcrumb: [{ label: 'Redirects' }],
    redirects
  });
});

router.post('/', manage, (req, res) => {
  const from = normalizePath((req.body.from || '').trim());
  const to = normalizePath((req.body.to || '').trim());
  const status = parseInt(req.body.status, 10) || 301;

  if (!from) {
    req.flash('danger', 'Source path is required.');
    return res.redirect('/2ef65f179f12439e317a23628b016653/redirects');
  }
  if (status !== 410 && !to) {
    req.flash('danger', 'Destination path is required.');
    return res.redirect('/2ef65f179f12439e317a23628b016653/redirects');
  }

  const list = getRedirects();
  if (list.find(r => r.from === from)) {
    req.flash('danger', `A redirect from "${from}" already exists.`);
    return res.redirect('/2ef65f179f12439e317a23628b016653/redirects');
  }

  list.push({ id: nextId(list), from, to: status === 410 ? '' : to, status, created_at: new Date().toISOString() });
  saveRedirects(list);
  logActivity(req.session.username, 'Redirect added', `${from} → ${to || 'Gone'} (${status})`);
  req.flash('success', 'Redirect added.');
  res.redirect('/2ef65f179f12439e317a23628b016653/redirects');
});

router.post('/:id/edit', manage, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const from = normalizePath((req.body.from || '').trim());
  const to = normalizePath((req.body.to || '').trim());
  const status = parseInt(req.body.status, 10) || 301;

  const list = getRedirects();
  const idx = list.findIndex(r => r.id === id);
  if (idx < 0) { req.flash('danger', 'Redirect not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/redirects'); }

  list[idx] = { ...list[idx], from, to: status === 410 ? '' : to, status };
  saveRedirects(list);
  logActivity(req.session.username, 'Redirect updated', `${from} (${status})`);
  req.flash('success', 'Redirect updated.');
  res.redirect('/2ef65f179f12439e317a23628b016653/redirects');
});

router.post('/:id/delete', manage, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const list = getRedirects();
  const r = list.find(x => x.id === id);
  if (!r) { req.flash('danger', 'Redirect not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/redirects'); }
  saveRedirects(list.filter(x => x.id !== id));
  logActivity(req.session.username, 'Redirect deleted', r.from);
  req.flash('success', 'Redirect deleted.');
  res.redirect('/2ef65f179f12439e317a23628b016653/redirects');
});

module.exports = router;
