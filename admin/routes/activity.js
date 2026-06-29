const express = require('express');
const { getActivityPaged, getActivityMeta, getActivity } = require('../lib/activity');

const router = express.Router();

router.get('/', (req, res) => {
  const filterUser = req.query.user || 'all';
  const filterAction = req.query.action || 'all';
  const query = req.query.q || '';
  const page = parseInt(req.query.page, 10) || 1;

  const { logs, pagination } = getActivityPaged({ user: filterUser, action: filterAction, q: query, page, perPage: 30 });
  const { users, actions } = getActivityMeta();

  res.render('activity', {
    pageTitle: 'Activity Log',
    headExtra: '',
    headerActions: `<a href="/2ef65f179f12439e317a23628b016653/activity/export?user=${encodeURIComponent(filterUser)}&action=${encodeURIComponent(filterAction)}&q=${encodeURIComponent(query)}" class="btn btn-outline-secondary btn-sm" style="font-size:12px;">Export CSV</a>`,
    breadcrumb: [{ label: 'Activity Log' }],
    logs,
    pagination,
    users,
    actions,
    filterUser,
    filterAction,
    query
  });
});

router.get('/export', (req, res) => {
  const filterUser = req.query.user || 'all';
  const filterAction = req.query.action || 'all';
  const query = req.query.q || '';

  const { logs } = getActivityPaged({ user: filterUser, action: filterAction, q: query, page: 1, perPage: 9999 });

  const rows = [['Date', 'User', 'Action', 'Details']];
  logs.forEach(l => {
    rows.push([
      new Date(l.timestamp).toISOString(),
      l.user || '',
      l.action || '',
      (l.details || '').replace(/"/g, '""')
    ]);
  });

  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="activity-${Date.now()}.csv"`);
  res.send(csv);
});

module.exports = router;
