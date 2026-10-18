const express = require('express');
const { requirePermission } = require('../lib/permissions');
const store = require('../lib/analytics-store');

const router = express.Router();
router.use(requirePermission('analytics.view'));

const MAX_DAYS = store.RETENTION_DAYS;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ?range=today|7d|30d|90d|custom&from=YYYY-MM-DD&to=YYYY-MM-DD (Cairo dates)
function parseRange(q) {
  const today = store.todayCairo();
  const range = ['today', '7d', '30d', '90d', 'custom'].includes(q.range) ? q.range : '7d';
  let from, to = today;
  const custom = range === 'custom' && DATE_RE.test(q.from || '') && DATE_RE.test(q.to || '');
  if (custom) {
    from = q.from <= q.to ? q.from : q.to;
    to = q.from <= q.to ? q.to : q.from;
    if (to > today) to = today;
    if (from > to) from = to;
    if (from < store.addDays(to, -(MAX_DAYS - 1))) from = store.addDays(to, -(MAX_DAYS - 1));
  } else {
    const days = { today: 1, '7d': 7, '30d': 30, '90d': 90 }[range] || 7;
    from = store.addDays(today, -(days - 1));
  }
  return { range: range === 'custom' && !custom ? '7d' : range, from, to };
}

router.get('/', async (req, res, next) => {
  try {
    store.cleanup();
    const r = parseRange(req.query);
    const data = await store.loadRange(r.from, r.to);
    const agg = store.aggregate(data, r.from, r.to);
    // Same-length period before, for the KPI deltas.
    const span = Math.round((Date.parse(r.to) - Date.parse(r.from)) / 86400000) + 1;
    const prevTo = store.addDays(r.from, -1), prevFrom = store.addDays(prevTo, -(span - 1));
    const prev = store.aggregate(await store.loadRange(prevFrom, prevTo), prevFrom, prevTo).kpis;
    res.render('analytics', {
      pageTitle: 'Analytics',
      headExtra: '',
      headerActions: '',
      breadcrumb: null,
      username: req.session.username,
      r, agg, prev, bad: data.bad,
    });
  } catch (e) { next(e); }
});

router.get('/visit/:vid', async (req, res, next) => {
  try {
    if (!/^s_[a-z0-9]{8,24}$/.test(req.params.vid)) return res.status(400).json({ error: 'bad id' });
    const r = parseRange(req.query);
    const j = store.journey(await store.loadRange(r.from, r.to), req.params.vid);
    if (!j) return res.status(404).json({ error: 'not found' });
    res.json(j);
  } catch (e) { next(e); }
});

function csvCell(v) {
  const s = v == null ? '' : String(v);
  // Leading = + - @ would run as a formula in Excel.
  const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
  return /[",\n\r]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe;
}

router.get('/export.csv', async (req, res, next) => {
  try {
    const r = parseRange(req.query);
    const agg = store.aggregate(await store.loadRange(r.from, r.to), r.from, r.to);
    const type = req.query.type === 'visits' ? 'visits' : 'leads';
    let rows;
    if (type === 'leads') {
      rows = [['time_utc', 'channel', 'button', 'page', 'page_title', 'source', 'campaign', 'landing', 'pages_viewed',
        'active_seconds', 'visit_number', 'city', 'country', 'device', 'name', 'phone', 'message', 'clicks']];
      for (const l of agg.leads) {
        rows.push([l.at, l.ch, l.btn, l.p, l.t, l.src, l.utm.campaign || '', l.landing, l.pages, l.act, l.n, l.city, l.cc,
          l.dev.type || '', l.form && l.form.name || '', l.form && l.form.phone || '', l.msg || '', l.count]);
      }
    } else {
      rows = [['start_utc', 'source', 'campaign', 'landing', 'exit', 'pages', 'active_seconds', 'leads', 'visit_number',
        'city', 'country', 'device', 'os', 'browser']];
      for (const v of agg.visits) {
        rows.push([v.st, v.src, v.utm.campaign || '', v.landing, v.exit, v.pages, v.act, v.leads, v.n, v.city, v.cc,
          v.dev.type || '', v.dev.os || '', v.dev.br || '']);
      }
    }
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="ngo-${type}-${r.from}-to-${r.to}.csv"`);
    res.send('﻿' + rows.map(row => row.map(csvCell).join(',')).join('\r\n'));
  } catch (e) { next(e); }
});

module.exports = router;
