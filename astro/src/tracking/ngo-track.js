/* New Golden Office first-party visit tracker.
 *
 * Keeps the visitor's journey in localStorage and sends it to /t/c.php about
 * once per visit (when the tab is left), plus one small beacon per WhatsApp /
 * call / form lead. Also appends "(من صفحة: <title>)" to every WhatsApp
 * message, for everyone, including visitors who refused tracking.
 *
 * Rules: ES5 only, no dependencies, every entry point wrapped in try/catch so a
 * bug here can never break a page or stop WhatsApp from opening.
 * Off switches: window.NGO_TRACK_OFF = true, ?ngo_track=off, or the
 * ngo_consent=refused cookie. Data format: see admin/lib/analytics-store.js.
 */
(function () {
  'use strict';
  var W = window, D = document, L = location;
  var NUM = '201227392074';
  var TAG = '(من صفحة:';
  var KEY = 'ngo_t';
  var EP = '/t/c.php';
  var IDLE = 30 * 60 * 1000;
  var MAX_PAGES = 100, MAX_EV = 30, MAX_BYTES = 30000;

  // ---------- helpers ----------
  function now() { return Date.now(); }
  function iso(t) { return new Date(t).toISOString(); }
  function day(t) { var d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function clip(s, n) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n); }
  function rid() {
    var a = 'abcdefghijklmnopqrstuvwxyz0123456789', out = '', i, buf;
    try { buf = new Uint8Array(16); W.crypto.getRandomValues(buf); } catch (e) { buf = null; }
    for (i = 0; i < 16; i++) out += a.charAt((buf ? buf[i] : Math.floor(Math.random() * 256)) % 36);
    return out;
  }
  function cookie(n) {
    var m = D.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)'));
    return m ? m[1] : null;
  }
  function closest(el, sel) {
    while (el && el.nodeType === 1) {
      if ((el.matches || el.webkitMatchesSelector).call(el, sel)) return el;
      el = el.parentNode;
    }
    return null;
  }
  function params(search) {
    var out = {}, parts = (search || '').replace(/^\?/, '').split('&'), i, kv;
    for (i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      kv = parts[i].split('=');
      try { out[decodeURIComponent(kv[0]).toLowerCase()] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')); } catch (e) {}
    }
    return out;
  }
  function hostOf(url) {
    var m = /^[a-z][a-z0-9+.-]*:\/\/([^\/?#:]+)/i.exec(url || '');
    return m ? m[1].toLowerCase().replace(/^www\./, '') : '';
  }

  // ---------- page title (used in the WhatsApp text and the journey) ----------
  function pageTitle() {
    var h = D.querySelector('h1'), t = clip(h && h.textContent, 120);
    if (!t) {
      var parts = String(D.title || '').split(/\s[|–-]\s/), i;
      for (i = 0; i < parts.length; i++) {
        if (parts[i].indexOf('نيو جولدن') === -1 && clip(parts[i], 1)) { t = clip(parts[i], 120); break; }
      }
      if (!t) t = clip(D.title, 120);
    }
    return t;
  }

  // ---------- WhatsApp text: append the page title ----------
  function isOurWa(u) {
    return typeof u === 'string' && u.indexOf(NUM) > -1 &&
      /^https?:\/\/(wa\.me\/|api\.whatsapp\.com\/send)/i.test(u);
  }
  function waText(u) {
    try {
      var q = u.indexOf('?');
      var parts = q < 0 ? [] : u.slice(q + 1).split('&'), i;
      for (i = 0; i < parts.length; i++) {
        if (parts[i].indexOf('text=') === 0) return decodeURIComponent(parts[i].slice(5));
      }
    } catch (e) {}
    return '';
  }
  function addTitle(u, title) {
    try {
      if (!isOurWa(u)) return u;
      var q = u.indexOf('?');
      var base = q < 0 ? u : u.slice(0, q);
      var parts = q < 0 || q === u.length - 1 ? [] : u.slice(q + 1).split('&');
      var idx = -1, text = '', i, out, t;
      for (i = 0; i < parts.length; i++) {
        if (parts[i].indexOf('text=') === 0) { idx = i; text = decodeURIComponent(parts[i].slice(5)); }
      }
      if (text.indexOf(TAG) > -1) return u;
      t = title == null ? pageTitle() : title;
      if (!t) return u;
      var build = function (tt) {
        var p = parts.slice();
        var enc = 'text=' + encodeURIComponent((text ? text : 'مرحبًا') + '\n\n' + TAG + ' ' + tt + ')');
        if (idx > -1) p[idx] = enc; else p.push(enc);
        return base + '?' + p.join('&');
      };
      out = build(t);
      if (out.length > 2000) out = build(t.slice(0, 60));
      return out;
    } catch (e) { return u; }
  }

  // ---------- source classification ----------
  // Referrer host -> source, first match wins (after ads / facebook / utm checks).
  var HOSTS = [
    [/(^|\.)google\.[a-z.]+$|googlequicksearchbox/, 'google_organic'],
    [/(^|\.)bing\.com$/, 'bing_organic'],
    [/(^|\.)yandex\./, 'yandex_organic'],
    [/(^|\.)duckduckgo\.com$/, 'duckduckgo_organic'],
    [/(^|\.)yahoo\./, 'yahoo_organic'],
    [/(^|\.)(wa\.me|whatsapp\.com)$/, 'social:whatsapp'],
    [/(^|\.)(t\.co|twitter\.com|x\.com)$/, 'social:twitter'],
    [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'social:linkedin'],
    [/(^|\.)(youtube\.com|youtu\.be)$/, 'social:youtube'],
    [/(^|\.)tiktok\.com$/, 'social:tiktok']
  ];
  function classify(ref, search) {
    var q = params(search), h = hostOf(ref), utm = {}, keys = ['source', 'medium', 'campaign', 'term', 'content'], i;
    for (i = 0; i < keys.length; i++) if (q['utm_' + keys[i]]) utm[keys[i]] = clip(q['utm_' + keys[i]], 80);
    var click = q.gclid ? 'gclid' : q.gbraid ? 'gbraid' : q.wbraid ? 'wbraid' : q.fbclid ? 'fbclid' : null;
    var med = (utm.medium || '').toLowerCase(), srcName = (utm.source || '').toLowerCase(), type;
    var self = h && (h === L.hostname.replace(/^www\./, '') || /(^|\.)newgoldenoffice\.com$/.test(h));
    if (click === 'gclid' || click === 'gbraid' || click === 'wbraid' ||
        (/^(cpc|ppc|paid)/.test(med) && (!srcName || srcName.indexOf('google') > -1))) type = 'google_ads';
    else if (/^(cpc|ppc|paid)/.test(med)) type = 'paid:' + clip(srcName, 30);
    else if (click === 'fbclid' || /(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(h)) type = 'facebook';
    else if (/(^|\.)instagram\.com$/.test(h)) type = 'instagram';
    else if (srcName) type = 'campaign:' + clip(srcName, 30);
    else if (self) type = 'internal';
    else {
      for (i = 0; i < HOSTS.length; i++) if (HOSTS[i][0].test(h)) { type = HOSTS[i][1]; break; }
    }
    if (!type) type = h ? 'referral:' + h : 'direct';
    return { type: type, ref: self ? '' : h, utm: utm, click: click, landing: L.pathname };
  }

  // ---------- button / section labels ----------
  function btnOf(a) {
    if (closest(a, '.whatsapp-float,.phone-float')) return 'float';
    if (closest(a, 'nav,.navbar')) return 'nav';
    if (closest(a, 'footer')) return 'footer';
    if (closest(a, '.bp-content')) return 'blog_body';
    if (closest(a, '.hero,[class*="page-hero"],[class*="-hero"]')) return 'hero';
    return 'inline';
  }
  function formBtn(f) {
    if (!f) return 'form';
    var id = f.id || '';
    if (id === 'quoteForm') return 'city_form';
    if (id === 'contactForm') return 'contact_form';
    if (id === 'bpWaForm') return 'blog_form';
    if (/mid-cta-form/.test(f.className || '')) return 'midpage_form';
    return 'form';
  }
  function sectionOf(el) {
    var s = closest(el, 'section[id],header,footer,nav,section,aside');
    if (!s) return '';
    if (s.id) return clip(s.id, 30);
    return clip(s.tagName.toLowerCase() === 'section' ? (s.className || 'section').split(' ')[0] : s.tagName.toLowerCase(), 30);
  }
  function formData(f) {
    if (!f || !f.elements) return null;
    var out = {}, i, el, id;
    for (i = 0; i < f.elements.length; i++) {
      el = f.elements[i]; id = (el.id || el.name || '').toLowerCase();
      if (!el.value || el.type === 'checkbox' || (el.type === 'hidden' && id !== 'service')) continue;
      if (/company/.test(id)) out.company = clip(el.value, 80);
      else if (/name$/.test(id)) out.name = clip(el.value, 80);
      else if (/phone$/.test(id) || el.type === 'tel') out.phone = clip(el.value, 30);
      else if (/subservice$/.test(id)) out.detail = clip(el.value, 80);
      else if (/service$/.test(id)) out.service = clip(el.value, 40);
    }
    return out;
  }

  // ---------- device ----------
  function device() {
    var ua = navigator.userAgent || '', c = navigator.connection;
    var type = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? 'tablet'
      : /Mobi|iPhone|iPod|Android/i.test(ua) ? 'mobile' : 'desktop';
    var os = /Windows/.test(ua) ? 'Windows' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android'
      : /CrOS/.test(ua) ? 'ChromeOS' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
    var br = /FBAN|FBAV/.test(ua) ? 'Facebook app' : /Instagram/.test(ua) ? 'Instagram app' : /Edg\//.test(ua) ? 'Edge'
      : /OPR\/|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung' : /CriOS|Chrome\//.test(ua) ? 'Chrome'
      : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other';
    return { type: type, os: os, br: br, sw: screen.width, sh: screen.height, vw: W.innerWidth,
      lang: clip(navigator.language, 12), net: c && c.effectiveType ? c.effectiveType : '' };
  }

  // ---------- storage ----------
  var mem = null;
  function load() {
    try { var s = W.localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {}
    return mem;
  }
  function save(s) {
    mem = s;
    try { W.localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }
  function mutate(fn) { var s = load() || {}; fn(s); save(s); return s; }
  function findPage(v, id) {
    if (!v || !v.pages) return null;
    for (var i = v.pages.length - 1; i >= 0; i--) if (v.pages[i].id === id) return v.pages[i];
    return null;
  }

  // ---------- sending ----------
  function send(obj) {
    try {
      var body = JSON.stringify(obj);
      if (navigator.sendBeacon && navigator.sendBeacon(EP, new Blob([body], { type: 'text/plain' }))) return;
      if (W.fetch) W.fetch(EP, { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'text/plain' } });
    } catch (e) {}
  }
  function visitPayload(s, v, end) {
    var pages = v.pages.slice(), out, i;
    function make() {
      return { k: 'visit', v: 1, uid: s.uid, vid: v.vid, n: v.n || s.n, fs: s.fs, src: v.src, first: s.first, dev: dev,
        pages: pages, leads: v.leads || 0, st: iso(v.st), dur: Math.round((v.la - v.st) / 1000), end: end };
    }
    out = make();
    // Trim oldest click lists first, then oldest pages, until under the limit.
    for (i = 0; JSON.stringify(out).length > MAX_BYTES && i < pages.length; i++) {
      pages[i] = { id: pages[i].id, p: pages[i].p, t: pages[i].t, at: pages[i].at, act: pages[i].act, scr: pages[i].scr, ev: [] };
      out = make();
    }
    while (JSON.stringify(out).length > MAX_BYTES && pages.length > 1) { pages.shift(); out = make(); }
    return out;
  }

  // ---------- tracker state for this page ----------
  var started = false, stopped = false, vid = null, pid = null, dev = null;
  var acc = 0, visSince = 0, maxY = 0, navAt = 0, lastSubmit = null, lastSubmitAt = 0, pageStart = now();

  function scrollPct() {
    if (!maxY) return 0;
    try {
      var h = D.documentElement.scrollHeight;
      var pct = h > 0 ? Math.floor((maxY + W.innerHeight) / h * 4) * 25 : 0;
      return pct > 100 ? 100 : pct;
    } catch (e) { return 0; }
  }
  function activeMs() { return acc + (visSince ? now() - visSince : 0); }
  function flush(extra) {
    var t = now(), act = Math.min(1800, Math.round(activeMs() / 1000));
    return mutate(function (s) {
      var v = s.cur;
      if (!v || v.vid !== vid) return;
      var pg = findPage(v, pid);
      var scr = scrollPct();
      if (pg) { pg.act = act; if (scr > (pg.scr || 0)) pg.scr = scr; }
      v.la = t;
      if (extra) { extra(v, pg); v.sent = false; }
    });
  }
  function addEv(ev) {
    if (!started || stopped) return;
    ev.o = Math.round((now() - pageStart) / 1000);
    flush(function (v, pg) { if (pg && pg.ev.length < MAX_EV) pg.ev.push(ev); });
  }
  function totalAct(v) { var n = 0; for (var i = 0; i < v.pages.length; i++) n += v.pages[i].act || 0; return n; }

  function onHide(reason) {
    if (!started || stopped) return;
    if (visSince) { acc += now() - visSince; visSince = 0; }
    var s = flush(), v = s.cur;
    if (!v || v.vid !== vid) return;
    if (now() - navAt < 1500) return; // internal navigation: the next page carries on this visit
    if (v.sent && totalAct(v) - (v.sentAct || 0) < 30) return;
    sendVisit(s, v, reason);
  }
  function sendVisit(s, v, reason) {
    var act = totalAct(v);
    send(visitPayload(s, v, reason));
    mutate(function (s2) { if (s2.cur && s2.cur.vid === vid) { s2.cur.sent = true; s2.cur.sentAct = act; } });
  }

  function start() {
    if (started || stopped) return;
    started = true;
    dev = device();
    var t = now(), ref = D.referrer, src = classify(ref, L.search), nav = null;
    try { nav = performance.getEntriesByType('navigation')[0]; } catch (e) {}
    var reload = nav && nav.type === 'reload';

    var s = load() || {};
    if (!s.uid || !/^u_[a-z0-9]{16}$/.test(s.uid)) { s = { uid: 'u_' + rid(), n: 0, fs: iso(t) }; }
    var v = s.cur;
    var expired = !v || !v.pages || t - v.la > IDLE || v.day !== day(t);
    var newSource = v && src.type !== 'internal' && src.type !== 'direct' && v.src && src.type !== v.src.type;
    if (v && !expired && reload) newSource = false;
    if (expired || newSource) {
      if (v && v.pages && v.pages.length && !v.sent) send(visitPayload(s, v, 'resume'));
      if (src.type === 'internal') src = { type: 'direct', ref: '', utm: {}, click: null, landing: L.pathname };
      s.n = (s.n || 0) + 1;
      v = s.cur = { vid: 's_' + rid(), n: s.n, st: t, la: t, day: day(t), src: src, pages: [], leads: 0, sent: false };
      if (!s.first) s.first = src;
    }
    vid = v.vid;
    var last = v.pages[v.pages.length - 1];
    if (reload && last && last.p === L.pathname) {
      pid = last.id; last.rl = (last.rl || 0) + 1; acc = (last.act || 0) * 1000;
    } else {
      pid = rid().slice(0, 8);
      v.pages.push({ id: pid, p: L.pathname, t: pageTitle(), at: iso(t), act: 0, scr: 0, ev: [] });
      if (v.pages.length > MAX_PAGES) v.pages.shift();
    }
    v.la = t; v.sent = false;
    save(s);

    if (D.visibilityState === 'visible') visSince = now();
    D.addEventListener('visibilitychange', function () {
      try {
        if (D.visibilityState === 'hidden') onHide('hidden');
        else if (!visSince) { visSince = now(); navAt = 0; }
      } catch (e) {}
    });
    W.addEventListener('pagehide', function () { try { onHide('exit'); } catch (e) {} });
    W.addEventListener('pageshow', function (e) {
      try { if (e.persisted) { navAt = 0; if (!visSince) visSince = now(); flush(function () {}); } } catch (er) {}
    });

    // Only remember the furthest scroll position here (no layout reads on
    // scroll); scrollPct() turns it into a percentage when the visit is saved.
    // Reading the scroll position can force a layout, so do it at most once
    // per frame.
    var ticking = false;
    W.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      W.requestAnimationFrame(function () {
        ticking = false;
        var y = W.pageYOffset || 0;
        if (y > maxY) maxY = y;
      });
    }, { passive: true });

    var started_forms = {};
    D.addEventListener('focusin', function (e) {
      try {
        var f = e.target && e.target.form;
        if (!f) return;
        var key = f.id || f.className || 'form';
        if (started_forms[key]) return;
        started_forms[key] = 1;
        addEv({ e: 'form_start', l: clip(key, 40), s: formBtn(f) });
      } catch (er) {}
    }, true);
  }

  function lead(ch, btn, url, form) {
    try {
      if (stopped) return;
      if (!started) start();
      var t = now(), msg = ch === 'whatsapp' ? clip(waText(url), 600) : '';
      var s = flush(function (v, pg) {
        v.leads = (v.leads || 0) + 1;
        if (pg && pg.ev.length < MAX_EV) pg.ev.push({ e: ch === 'whatsapp' ? 'wa' : 'call', s: btn, o: Math.round((t - pageStart) / 1000) });
      });
      var v = s.cur;
      if (!v || v.vid !== vid) return;
      var path = [], i;
      for (i = 0; i < v.pages.length; i++) path.push(v.pages[i].p);
      send({ k: 'lead', v: 1, uid: s.uid, vid: vid, n: v.n || s.n, at: iso(t), ch: ch, btn: btn, p: L.pathname, t: pageTitle(),
        msg: msg, form: form || null, path: path.slice(-30), src: v.src, first: s.first, dev: dev });
      // Also send the journey so far right away: the visitor is leaving for
      // WhatsApp / the dialer, and a leave-time beacon can be lost. If they
      // come back and keep browsing, the next send replaces this snapshot.
      sendVisit(s, v, 'lead');
    } catch (e) {}
  }

  // ---------- global listeners (installed right away; cheap) ----------
  var trackingAllowed = !(W.NGO_TRACK_OFF === true || /[?&]ngo_track=off\b/.test(L.search) || cookie('ngo_consent') === 'refused');
  if (trackingAllowed && !/[?&]ngo_track=force\b/.test(L.search)) {
    if (navigator.webdriver || /bot|crawl|spider|slurp|lighthouse|headless|pagespeed|preview|prerender/i.test(navigator.userAgent || '')) trackingAllowed = false;
  }
  if (!trackingAllowed) stopped = true;

  function onLinkActivate(e) {
    try {
      var a = e.target && closest(e.target, 'a[href]');
      if (!a) {
        if (e.type === 'click' && started && !stopped) {
          var b = e.target && closest(e.target, 'button,[role="button"],summary');
          if (b && b.type !== 'submit') addEv({ e: 'btn', l: clip(b.textContent || b.getAttribute('aria-label'), 60), s: sectionOf(b) });
        }
        return;
      }
      var href = a.href || '', raw = a.getAttribute('href') || '';
      if (isOurWa(href)) {
        var nu = addTitle(href);
        if (nu !== href) a.href = nu;
        if (e.type === 'click' || e.button === 1) lead('whatsapp', btnOf(a), nu, null);
        return;
      }
      if (e.type !== 'click') return;
      if (/^tel:/i.test(raw)) { lead('call', btnOf(a), href, null); return; }
      if (!started || stopped) return;
      var label = clip(a.textContent || a.getAttribute('aria-label'), 60);
      if (hostOf(href) && hostOf(href) !== L.hostname.replace(/^www\./, '')) {
        addEv({ e: 'out', l: label, h: hostOf(href), s: sectionOf(a) });
      } else if (raw.charAt(0) !== '#') {
        var newTab = a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey;
        if (!newTab) navAt = now();
        addEv({ e: 'nav', l: label, h: clip(a.pathname, 120), s: sectionOf(a) });
      }
    } catch (er) {}
  }
  D.addEventListener('click', onLinkActivate, true);
  D.addEventListener('auxclick', onLinkActivate, true);

  D.addEventListener('submit', function (e) { lastSubmit = e.target; lastSubmitAt = now(); }, true);

  // WhatsApp forms open the chat with window.open(url) from their submit handler.
  var origOpen = W.open;
  if (typeof origOpen === 'function') {
    W.open = function (u) {
      var args = arguments;
      try {
        if (isOurWa(u)) {
          var nu = addTitle(u);
          var f = now() - lastSubmitAt < 3000 ? lastSubmit : (D.activeElement && D.activeElement.form);
          lead('whatsapp', formBtn(f), nu, formData(f));
          args = [nu];
          for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        }
      } catch (e) { args = arguments; }
      return origOpen.apply(W, args);
    };
  }

  W.NGO_TRACK = {
    start: function () {
      try {
        if (W.NGO_TRACK_OFF === true || /[?&]ngo_track=off\b/.test(L.search)) return;
        if (stopped && !started) { stopped = false; start(); }
      } catch (e) {}
    },
    optout: function () {
      try {
        var s = load();
        if (s && s.uid) send({ k: 'optout', v: 1, uid: s.uid });
        stopped = true;
        mem = null;
        try { W.localStorage.removeItem(KEY); } catch (e) {}
      } catch (e) {}
    },
    // exposed for tests
    _t: { classify: classify, addTitle: addTitle, isOurWa: isOurWa, waText: waText, btnOf: btnOf, formBtn: formBtn, visitPayload: visitPayload }
  };

  if (!stopped) {
    var boot = function () { try { start(); } catch (e) {} };
    if (W.requestIdleCallback) W.requestIdleCallback(boot, { timeout: 2000 });
    else setTimeout(boot, 1);
  }
})();
