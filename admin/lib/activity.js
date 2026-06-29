const path = require('path');
const { loadJson, saveJson } = require('./db');

const ACTIVITY_FILE = 'activity.json';
const MAX_ENTRIES = 500;

function logActivity(user, action, details) {
  const activity = loadJson(ACTIVITY_FILE);
  activity.unshift({
    user: user || 'system',
    action,
    details: details || null,
    timestamp: new Date().toISOString()
  });
  saveJson(ACTIVITY_FILE, activity.slice(0, MAX_ENTRIES));
}

function getActivity(limit) {
  const activity = loadJson(ACTIVITY_FILE);
  return limit ? activity.slice(0, limit) : activity;
}

function getActivityPaged({ user, action, q, page = 1, perPage = 30 } = {}) {
  let logs = loadJson(ACTIVITY_FILE);
  if (user && user !== 'all') logs = logs.filter(l => l.user === user);
  if (action && action !== 'all') logs = logs.filter(l => l.action === action);
  if (q) {
    const ql = q.toLowerCase();
    logs = logs.filter(l =>
      (l.action || '').toLowerCase().includes(ql) ||
      (l.details || '').toLowerCase().includes(ql) ||
      (l.user || '').toLowerCase().includes(ql)
    );
  }
  const total = logs.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const sliced = logs.slice((safePage - 1) * perPage, safePage * perPage);
  return {
    logs: sliced,
    pagination: { total, page: safePage, totalPages, perPage, hasPrev: safePage > 1, hasNext: safePage < totalPages }
  };
}

function getActivityMeta() {
  const logs = loadJson(ACTIVITY_FILE);
  const users = [...new Set(logs.map(l => l.user))].sort();
  const actions = [...new Set(logs.map(l => l.action))].sort();
  return { users, actions };
}

module.exports = { logActivity, getActivity, getActivityPaged, getActivityMeta };
