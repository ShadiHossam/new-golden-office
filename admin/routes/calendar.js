const express = require('express');
const { getActivity } = require('../lib/activity');
const { requirePermission, hasPermission } = require('../lib/permissions');

const router = express.Router();
router.use(requirePermission('calendar.view'));

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function ymd(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

router.get('/', (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year, 10) || now.getFullYear();
  const month = Math.max(1, Math.min(12, parseInt(req.query.month, 10) || (now.getMonth() + 1)));

  const canViewAll = hasPermission(req.currentUser, 'activity.view_all');
  let logs = getActivity();
  if (!canViewAll) logs = logs.filter(l => l.user === req.currentUser.username);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start

  const todayStr = ymd(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const logDateStr = (l) => (l.timestamp || '').slice(0, 10);

  const days = [];
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, -i);
    days.push({ date: d, day: d.getDate(), isCurrentMonth: false, logs: [] });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month - 1, d);
    const dateStr = ymd(year, month, d);
    const dayLogs = logs.filter(l => logDateStr(l) === dateStr);
    days.push({ date, day: d, isCurrentMonth: true, logs: dayLogs, isToday: dateStr === todayStr });
  }
  while (days.length % 7 !== 0) {
    const d = new Date(year, month, days.length - startPad - lastDay.getDate() + 1);
    days.push({ date: d, day: d.getDate(), isCurrentMonth: false, logs: [] });
  }

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const activityCountInView = days.filter(d => d.isCurrentMonth).reduce((n, d) => n + d.logs.length, 0);

  const selectedDay = req.query.day && /^\d{4}-\d{2}-\d{2}$/.test(req.query.day) ? req.query.day : null;
  const selectedDayLogs = selectedDay ? logs.filter(l => logDateStr(l) === selectedDay).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];

  res.render('calendar/view', {
    pageTitle: 'Calendar',
    headExtra: '',
    headerActions: '',
    breadcrumb: [{ label: 'Calendar' }],
    days, year, month,
    monthName: MONTH_NAMES[month - 1],
    prevMonth, prevYear, nextMonth, nextYear,
    activityCountInView,
    selectedDay,
    selectedDayLogs
  });
});

module.exports = router;
