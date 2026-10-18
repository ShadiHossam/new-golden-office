// Reads the first-party analytics written by astro/public/t/c.php and turns it
// into what the Analytics page shows. Nothing here runs for site visitors: it
// only runs when someone opens the Analytics page.
//
// Storage: <dataDir()>/YYYY-MM-DD.ndjson (UTC day), one JSON object per line:
//   { k:'visit', uid, vid, n, fs, st, src, first, dev, pages:[{id,p,t,at,act,scr,ev,rl}], leads, dur, end, ...server }
//   { k:'lead',  uid, vid, n, at, ch:'whatsapp'|'call', btn, p, t, msg, form, path, src, first, dev, ...server }
//   { k:'optout', uid, ...server }
// Server fields added by c.php: ts, ip (salted hash), ua, cc, city, reg.
// A visit is sent again whenever the visitor comes back to the tab, so the
// same vid can appear several times; the snapshot with the most pages wins.
//
// Past days are cached once in <dir>/cache/YYYY-MM-DD.json (invalidated when
// the ndjson size changes). Files older than RETENTION_DAYS are deleted.

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const RETENTION_DAYS = 180;
const TZ = 'Africa/Cairo';

// Production: ~/ngo-analytics, the folder astro/public/t/c.php writes to
// (outside the doc root and the git checkout). Locally: data/analytics-dev.
function dataDir() {
  if (process.env.ANALYTICS_DIR) return process.env.ANALYTICS_DIR;
  const home = path.join(os.homedir(), 'ngo-analytics');
  return fs.existsSync(home) ? home : path.join(__dirname, '..', 'data', 'analytics-dev');
}

// ---------- dates ----------
const cairoDateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const cairoPartsFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23', weekday: 'short' });
const WEEKDAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function cairoDate(iso) { return cairoDateFmt.format(new Date(iso)); }
function cairoHourDay(iso) {
  const parts = cairoPartsFmt.formatToParts(new Date(iso));
  const hour = Number(parts.find(p => p.type === 'hour').value) % 24;
  const wd = WEEKDAYS.indexOf(parts.find(p => p.type === 'weekday').value);
  return { hour, wd };
}
function utcDay(d) { return d.toISOString().slice(0, 10); }
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return utcDay(d);
}
function daysBetween(from, to) {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}
function todayCairo() { return cairoDate(new Date().toISOString()); }

// ---------- parsing ----------
function better(a, b) {
  // Is visit snapshot b better than a?
  const pa = (a.pages || []).length, pb = (b.pages || []).length;
  if (pb !== pa) return pb > pa;
  const la = (a.pages || []).reduce((n, p) => n + (p.act || 0), 0);
  const lb = (b.pages || []).reduce((n, p) => n + (p.act || 0), 0);
  if (lb !== la) return lb > la;
  return String(b.ts || '') >= String(a.ts || '');
}

async function parseNdjson(file) {
  const day = { visits: {}, leads: [], optouts: [], bad: 0 };
  if (!fs.existsSync(file)) return day;
  const rl = readline.createInterface({ input: fs.createReadStream(file, { encoding: 'utf8' }), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    let o;
    try { o = JSON.parse(line); } catch (e) { day.bad++; continue; }
    if (!o || typeof o !== 'object') { day.bad++; continue; }
    if (o.k === 'visit' && o.vid && Array.isArray(o.pages)) {
      const prev = day.visits[o.vid];
      if (!prev || better(prev, o)) day.visits[o.vid] = o;
    } else if (o.k === 'lead' && o.vid) {
      day.leads.push(o);
    } else if (o.k === 'optout' && o.uid) {
      day.optouts.push(o.uid);
    } else {
      day.bad++;
    }
  }
  return day;
}

async function loadDay(date, { today }) {
  const dir = dataDir();
  const file = path.join(dir, date + '.ndjson');
  let size = -1;
  try { size = fs.statSync(file).size; } catch (e) { return { visits: {}, leads: [], optouts: [], bad: 0 }; }
  const cacheFile = path.join(dir, 'cache', date + '.json');
  if (!today) {
    try {
      const c = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (c.srcSize === size) return c;
    } catch (e) {}
  }
  const day = await parseNdjson(file);
  if (!today) {
    try {
      fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
      const tmp = cacheFile + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify({ srcSize: size, ...day }));
      fs.renameSync(tmp, cacheFile);
    } catch (e) {}
  }
  return day;
}

// Opt-outs apply to every day, including days before the visitor refused.
// Kept in cache/optouts.json together with the ndjson sizes already scanned.
async function loadOptouts() {
  const dir = dataDir();
  const cacheFile = path.join(dir, 'cache', 'optouts.json');
  let cache = { uids: [], scanned: {} };
  try { cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch (e) {}
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => /^\d{4}-\d{2}-\d{2}\.ndjson$/.test(f)); } catch (e) { return new Set(); }
  const uids = new Set(cache.uids);
  let changed = false;
  for (const f of files) {
    let size;
    try { size = fs.statSync(path.join(dir, f)).size; } catch (e) { continue; }
    if (cache.scanned[f] === size) continue;
    const rl = readline.createInterface({ input: fs.createReadStream(path.join(dir, f), { encoding: 'utf8' }), crlfDelay: Infinity });
    for await (const line of rl) {
      if (line.indexOf('"optout"') === -1) continue;
      try { const o = JSON.parse(line); if (o.k === 'optout' && o.uid) uids.add(o.uid); } catch (e) {}
    }
    cache.scanned[f] = size;
    changed = true;
  }
  if (changed) {
    try {
      fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
      cache.uids = [...uids];
      fs.writeFileSync(cacheFile + '.tmp', JSON.stringify(cache));
      fs.renameSync(cacheFile + '.tmp', cacheFile);
    } catch (e) {}
  }
  return uids;
}

// ---------- normalising ----------
function visitStart(v) {
  return v.st || (v.pages && v.pages[0] && v.pages[0].at) || v.ts;
}
function stubFromLead(l) {
  return {
    k: 'visit', stub: true, uid: l.uid, vid: l.vid, n: l.n, st: l.at, ts: l.ts, src: l.src, first: l.first, dev: l.dev,
    pages: (l.path || [l.p]).map(p => ({ p, t: p === l.p ? l.t : '', act: 0, scr: 0, ev: [] })),
    leads: 0, dur: 0, cc: l.cc, city: l.city, reg: l.reg,
  };
}

// Loads every visit and lead whose start falls between from and to (Cairo
// dates, inclusive). Files are UTC days, so one extra day each side is read.
async function loadRange(from, to) {
  const today = utcDay(new Date());
  const visits = new Map();
  const leads = [];
  let bad = 0;
  for (const d of daysBetween(addDays(from, -1), addDays(to, 1))) {
    if (d > today) break;
    const day = await loadDay(d, { today: d === today });
    bad += day.bad || 0;
    for (const v of Object.values(day.visits)) {
      const prev = visits.get(v.vid);
      if (!prev || better(prev, v)) visits.set(v.vid, v);
    }
    leads.push(...day.leads);
  }
  const optouts = await loadOptouts();

  // A lead whose visit never arrived still gets a (stub) visit.
  for (const l of leads) {
    if (!visits.has(l.vid)) visits.set(l.vid, stubFromLead(l));
  }

  const inRange = iso => { const c = cairoDate(iso); return c >= from && c <= to; };
  const outVisits = [];
  for (const v of visits.values()) {
    if (optouts.has(v.uid)) continue;
    const st = visitStart(v);
    if (!st || !inRange(st)) continue;
    outVisits.push(v);
  }
  const keep = new Set(outVisits.map(v => v.vid));
  const outLeads = leads.filter(l => keep.has(l.vid) && !optouts.has(l.uid));
  outLeads.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  outVisits.sort((a, b) => String(visitStart(b)).localeCompare(String(visitStart(a))));
  return { visits: outVisits, leads: outLeads, bad };
}

// ---------- aggregation ----------
function srcLabel(src) { return (src && src.type) || 'direct'; }
function landing(v) { return (v.src && v.src.landing) || (v.pages[0] && v.pages[0].p) || '/'; }
function activeSecs(v) { return (v.pages || []).reduce((n, p) => n + (p.act || 0), 0); }
function inc(map, key, field, by = 1) {
  if (!map.has(key)) map.set(key, { key, visits: 0, leads: 0, views: 0, act: 0 });
  map.get(key)[field] += by;
  return map.get(key);
}
function top(map, n, sortField) {
  return [...map.values()]
    .map(r => ({ ...r, conv: r.visits ? r.convVisits / r.visits : 0 }))
    .sort((a, b) => (b[sortField] - a[sortField]) || (b.visits - a.visits))
    .slice(0, n);
}

// Collapses repeat clicks on the same button within 10 s into one row (count).
function collapseLeads(leads) {
  const out = [];
  const sorted = [...leads].sort((a, b) => String(a.at).localeCompare(String(b.at)));
  for (const l of sorted) {
    const last = out[out.length - 1];
    if (last && last.vid === l.vid && last.ch === l.ch && last.p === l.p && last.btn === l.btn &&
        Date.parse(l.at) - Date.parse(last.lastAt) < 10000) {
      last.count++;
      last.lastAt = l.at;
      if (l.form) last.form = l.form;
      if (l.msg) last.msg = l.msg;
      continue;
    }
    out.push({ ...l, count: 1, lastAt: l.at });
  }
  return out.reverse();
}

function aggregate({ visits, leads }, from, to) {
  const leadsByVid = new Map();
  for (const l of leads) {
    if (!leadsByVid.has(l.vid)) leadsByVid.set(l.vid, []);
    leadsByVid.get(l.vid).push(l);
  }
  const uids = new Set();
  let newVisitors = 0, convVisits = 0, pagesTotal = 0, actTotal = 0;
  const bySource = new Map(), byLanding = new Map(), byCity = new Map(), byDevice = new Map();
  const byLeadPage = new Map(), byButton = new Map(), exitPages = new Map(), topPages = new Map(), byCampaign = new Map();
  const daily = new Map(daysBetween(from, to).map(d => [d, { date: d, visits: 0, leads: 0 }]));
  const heat = Array.from({ length: 7 }, () => Array(24).fill(0));

  const addConv = (map, key, converted) => {
    const r = inc(map, key, 'visits');
    r.convVisits = (r.convVisits || 0) + (converted ? 1 : 0);
    return r;
  };

  for (const v of visits) {
    const vl = leadsByVid.get(v.vid) || [];
    const converted = vl.length > 0;
    uids.add(v.uid);
    if ((v.n || 1) === 1) newVisitors++;
    if (converted) convVisits++;
    pagesTotal += v.pages.length;
    actTotal += activeSecs(v);
    const day = cairoDate(visitStart(v));
    if (daily.has(day)) daily.get(day).visits++;

    addConv(bySource, srcLabel(v.src), converted).leads += vl.length;
    addConv(byLanding, landing(v), converted).leads += vl.length;
    addConv(byCity, v.city || (v.cc ? v.cc : '—'), converted).leads += vl.length;
    addConv(byDevice, (v.dev && v.dev.type) || '—', converted).leads += vl.length;
    const camp = v.src && v.src.utm && v.src.utm.campaign;
    if (camp) addConv(byCampaign, camp, converted).leads += vl.length;
    if (!converted && v.pages.length && !v.stub) addConv(exitPages, v.pages[v.pages.length - 1].p, false);
    for (const p of v.pages) {
      if (v.stub) continue;
      const r = inc(topPages, p.p, 'views');
      r.act += p.act || 0;
      if (!r.title && p.t) r.title = p.t;
    }
  }

  let wa = 0, calls = 0, forms = 0;
  for (const l of leads) {
    if (l.ch === 'call') calls++; else wa++;
    if (l.form) forms++;
    const d = cairoDate(l.at);
    if (daily.has(d)) daily.get(d).leads++;
    const r = inc(byLeadPage, l.p, 'leads');
    if (!r.title && l.t) r.title = l.t;
    inc(byButton, l.btn || '—', 'leads');
    const { hour, wd } = cairoHourDay(l.at);
    if (wd >= 0) heat[wd][hour]++;
  }

  const visitsById = new Map(visits.map(v => [v.vid, v]));
  const leadRows = collapseLeads(leads).map(l => {
    const v = visitsById.get(l.vid) || stubFromLead(l);
    return {
      at: l.at, ch: l.ch, btn: l.btn, p: l.p, t: l.t, msg: l.msg, form: l.form, count: l.count,
      vid: l.vid, uid: l.uid, n: v.n || l.n || 1, src: srcLabel(v.src || l.src), utm: (v.src || l.src || {}).utm || {},
      landing: landing(v), pages: v.pages.length, act: activeSecs(v), stub: !!v.stub,
      city: v.city || l.city || '', cc: v.cc || l.cc || '', dev: v.dev || l.dev || {},
    };
  });

  const visitRows = visits.map(v => ({
    st: visitStart(v), vid: v.vid, uid: v.uid, n: v.n || 1, src: srcLabel(v.src), utm: (v.src && v.src.utm) || {},
    landing: landing(v), exit: v.pages.length ? v.pages[v.pages.length - 1].p : '', pages: v.pages.length,
    act: activeSecs(v), leads: (leadsByVid.get(v.vid) || []).length, city: v.city || '', cc: v.cc || '',
    dev: v.dev || {}, stub: !!v.stub,
  }));

  const n = visits.length;
  return {
    kpis: {
      visits: n, visitors: uids.size, newVisitors, returning: n - newVisitors,
      wa, calls, forms, leads: leads.length, convVisits, convRate: n ? convVisits / n : 0,
      avgPages: n ? pagesTotal / n : 0, avgAct: n ? actTotal / n : 0,
    },
    daily: [...daily.values()],
    bySource: top(bySource, 15, 'leads'),
    byCampaign: top(byCampaign, 15, 'leads'),
    byLanding: top(byLanding, 15, 'visits'),
    byCity: top(byCity, 15, 'visits'),
    byDevice: top(byDevice, 5, 'visits'),
    byLeadPage: [...byLeadPage.values()].sort((a, b) => b.leads - a.leads).slice(0, 15),
    byButton: [...byButton.values()].sort((a, b) => b.leads - a.leads),
    exitPages: top(exitPages, 15, 'visits'),
    topPages: [...topPages.values()].map(r => ({ ...r, avgAct: r.views ? r.act / r.views : 0 }))
      .sort((a, b) => b.views - a.views).slice(0, 20),
    heat, weekdays: WEEKDAYS,
    leads: leadRows,
    visits: visitRows,
  };
}

// Full journey of one visit, plus that visitor's other visits in the range.
function journey(range, vid) {
  const v = range.visits.find(x => x.vid === vid);
  if (!v) return null;
  const leads = range.leads.filter(l => l.vid === vid).sort((a, b) => String(a.at).localeCompare(String(b.at)));
  const others = range.visits.filter(x => x.uid === v.uid && x.vid !== vid).map(x => ({
    vid: x.vid, st: visitStart(x), src: srcLabel(x.src), pages: x.pages.length,
    leads: range.leads.filter(l => l.vid === x.vid).length,
  }));
  return {
    vid: v.vid, uid: v.uid, n: v.n || 1, st: visitStart(v), fs: v.fs, src: v.src, first: v.first, dev: v.dev,
    city: v.city, reg: v.reg, cc: v.cc, dur: v.dur, end: v.end, stub: !!v.stub, pages: v.pages,
    leads: leads.map(l => ({ at: l.at, ch: l.ch, btn: l.btn, p: l.p, t: l.t, msg: l.msg, form: l.form })),
    others,
  };
}

// ---------- retention ----------
let lastCleanup = 0;
function cleanup(now = new Date()) {
  if (Date.now() - lastCleanup < 24 * 3600 * 1000) return 0;
  lastCleanup = Date.now();
  const dir = dataDir();
  const cutoff = utcDay(new Date(now.getTime() - RETENTION_DAYS * 24 * 3600 * 1000));
  let removed = 0;
  for (const sub of ['', 'cache']) {
    let files = [];
    try { files = fs.readdirSync(path.join(dir, sub)); } catch (e) { continue; }
    for (const f of files) {
      const m = /^(\d{4}-\d{2}-\d{2})\.(ndjson|json)$/.exec(f);
      if (m && m[1] < cutoff) {
        try { fs.unlinkSync(path.join(dir, sub, f)); removed++; } catch (e) {}
      }
    }
  }
  return removed;
}
function _resetCleanup() { lastCleanup = 0; }

module.exports = {
  RETENTION_DAYS, dataDir, loadRange, aggregate, journey, cleanup, collapseLeads, cairoDate, todayCairo, addDays,
  _resetCleanup,
};
