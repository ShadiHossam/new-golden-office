const express = require('express');
const { getSeoPages, getMedia } = require('../lib/db');
const { getActivity } = require('../lib/activity');

const router = express.Router();

router.get('/', (req, res) => {
  const pages = getSeoPages();
  const media = getMedia();
  const recentActivity = getActivity(10);

  const byCategory = {};
  pages.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  });

  const categoryStats = Object.entries(byCategory)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const stats = {
    totalPages: pages.length,
    totalMedia: media.length,
    updatedPages: pages.filter(p => p.updated_at).length,
    categories: Object.keys(byCategory).length
  };

  res.render('dashboard', {
    pageTitle: 'Dashboard',
    headExtra: '',
    headerActions: '',
    breadcrumb: null,
    username: req.session.username,
    stats,
    categoryStats,
    recentActivity
  });
});

module.exports = router;
