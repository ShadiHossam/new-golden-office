// node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ngo-an-'));
process.env.ANALYTICS_DIR = dir;
const store = require('../lib/analytics-store');

const D1 = '2026-10-10', D2 = '2026-10-11';
const page = (p, at, act = 10, ev = []) => ({ id: p.slice(1, 9) || 'home', p, t: 'T ' + p, at, act, scr: 50, ev });
const visit = (vid, uid, st, pages, extra = {}) => ({
  k: 'visit', v: 1, uid, vid, n: 1, st, src: { type: 'google_organic', landing: pages[0].p, utm: {} }, dev: { type: 'mobile' },
  pages, leads: 0, ts: st, cc: 'EG', city: 'Cairo', ...extra,
});
const lead = (vid, uid, at, extra = {}) => ({
  k: 'lead', v: 1, uid, vid, n: 1, at, ch: 'whatsapp', btn: 'float', p: '/copiers', t: 'Copiers',
  msg: 'hi\n\n(من صفحة: Copiers)', path: ['/', '/copiers'], src: { type: 'google_organic', landing: '/', utm: {} }, ts: at, ...extra,
});
function write(day, lines) {
  fs.writeFileSync(path.join(dir, day + '.ndjson'), lines.map(l => typeof l === 'string' ? l : JSON.stringify(l)).join('\n') + '\n');
}

// Day 1 (UTC):
//  s_a: two snapshots, second has more pages -> the 2-page one wins; 1 lead
//  s_b: lead only, no visit line -> stub visit
//  s_c: opted-out visitor (optout arrives on day 2) -> hidden
//  one corrupt line
// Day 2:
//  s_d: visit that started late on day 1 Cairo time but was only sent on day 2 UTC file
//  s_a: a later, smaller snapshot again -> still the 2-page one wins
write(D1, [
  visit('s_aaaaaaaa', 'u_11111111', '2026-10-10T08:00:00Z', [page('/', '2026-10-10T08:00:00Z')]),
  visit('s_aaaaaaaa', 'u_11111111', '2026-10-10T08:00:00Z', [page('/', '2026-10-10T08:00:00Z'), page('/copiers', '2026-10-10T08:01:00Z', 40, [{ e: 'wa', s: 'float', o: 30 }])], { leads: 1 }),
  lead('s_aaaaaaaa', 'u_11111111', '2026-10-10T08:01:30Z'),
  lead('s_aaaaaaaa', 'u_11111111', '2026-10-10T08:01:35Z'), // double click, 5 s later -> collapsed
  lead('s_bbbbbbbb', 'u_22222222', '2026-10-10T09:00:00Z', { ch: 'call', btn: 'hero', form: null }),
  visit('s_cccccccc', 'u_33333333', '2026-10-10T10:00:00Z', [page('/ac', '2026-10-10T10:00:00Z')]),
  '{not json',
]);
write(D2, [
  { k: 'optout', v: 1, uid: 'u_33333333', ts: '2026-10-11T07:00:00Z' },
  visit('s_dddddddd', 'u_44444444', '2026-10-10T21:30:00Z', [page('/cameras', '2026-10-10T21:30:00Z', 100)], { n: 2 }),
  visit('s_aaaaaaaa', 'u_11111111', '2026-10-10T08:00:00Z', [page('/', '2026-10-10T08:00:00Z')]),
]);

test('loadRange dedupes, stubs, drops opt-outs, counts bad lines', async () => {
  // 2026-10-10 21:30Z is 2026-10-11 00:30 in Cairo (UTC+3 in October), so s_d belongs to the 11th.
  const r10 = await store.loadRange('2026-10-10', '2026-10-10');
  const vids = r10.visits.map(v => v.vid).sort();
  assert.deepEqual(vids, ['s_aaaaaaaa', 's_bbbbbbbb']);
  assert.equal(r10.visits.find(v => v.vid === 's_aaaaaaaa').pages.length, 2);
  assert.equal(r10.visits.find(v => v.vid === 's_bbbbbbbb').stub, true);
  assert.equal(r10.leads.length, 3);
  assert.equal(r10.bad, 1);

  const r11 = await store.loadRange('2026-10-11', '2026-10-11');
  assert.deepEqual(r11.visits.map(v => v.vid), ['s_dddddddd']);
});

test('aggregate KPIs and breakdowns', async () => {
  const data = await store.loadRange('2026-10-10', '2026-10-11');
  const a = store.aggregate(data, '2026-10-10', '2026-10-11');
  assert.equal(a.kpis.visits, 3);
  assert.equal(a.kpis.visitors, 3);
  assert.equal(a.kpis.wa, 2);
  assert.equal(a.kpis.calls, 1);
  assert.equal(a.kpis.convVisits, 2);
  assert.equal(a.kpis.returning, 1);
  assert.equal(a.leads.length, 2, 'double click collapsed into one row');
  assert.equal(a.leads.find(l => l.vid === 's_aaaaaaaa').count, 2);
  assert.equal(a.daily.find(d => d.date === '2026-10-10').visits, 2);
  assert.equal(a.daily.find(d => d.date === '2026-10-11').visits, 1);
  assert.equal(a.byLeadPage[0].key, '/copiers');
  assert.equal(a.exitPages[0].key, '/cameras');
  const heatTotal = a.heat.flat().reduce((x, y) => x + y, 0);
  assert.equal(heatTotal, 3);
});

test('journey returns pages, leads and other visits', async () => {
  const data = await store.loadRange('2026-10-10', '2026-10-11');
  const j = store.journey(data, 's_aaaaaaaa');
  assert.equal(j.pages.length, 2);
  assert.equal(j.leads.length, 2);
  assert.equal(store.journey(data, 's_cccccccc'), null, 'opted-out visit is not reachable');
});

test('past days are cached and the cache is invalidated when the file grows', async () => {
  await store.loadRange('2026-10-10', '2026-10-10');
  const cache = path.join(dir, 'cache', D1 + '.json');
  assert.ok(fs.existsSync(cache));
  fs.appendFileSync(path.join(dir, D1 + '.ndjson'),
    JSON.stringify(visit('s_eeeeeeee', 'u_55555555', '2026-10-10T12:00:00Z', [page('/printing', '2026-10-10T12:00:00Z')])) + '\n');
  const r = await store.loadRange('2026-10-10', '2026-10-10');
  assert.ok(r.visits.some(v => v.vid === 's_eeeeeeee'));
});

test('cleanup removes files older than the retention window', () => {
  const old = '2020-01-01';
  write(old, [visit('s_ffffffff', 'u_66666666', '2020-01-01T00:00:00Z', [page('/', '2020-01-01T00:00:00Z')])]);
  store._resetCleanup();
  const removed = store.cleanup();
  assert.ok(removed >= 1);
  assert.ok(!fs.existsSync(path.join(dir, old + '.ndjson')));
  assert.ok(fs.existsSync(path.join(dir, D1 + '.ndjson')), 'recent files kept');
});

test.after(() => fs.rmSync(dir, { recursive: true, force: true }));
