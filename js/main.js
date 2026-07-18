// New Golden Office — Main JavaScript

const HERO_CONFIG = [
  { p: /\/about/,                    img: 'about-team.webp',        icon: 'fa-building' },
  { p: /\/printing\/offset/,         img: 'printing-hub.webp',      icon: 'fa-print' },
  { p: /\/printing\/digital/,        img: 'printing-hub.webp',      icon: 'fa-laptop' },
  { p: /\/printing\/banners/,        img: 'printing-hub.webp',      icon: 'fa-image' },
  { p: /\/printing\/business-cards/, img: 'printing-hub.webp',      icon: 'fa-id-card' },
  { p: /\/printing\/uv/,             img: 'printing-hub.webp',      icon: 'fa-sun' },
  { p: /\/printing\/gifts/,          img: 'printing-hub.webp',      icon: 'fa-gift' },
  { p: /\/printing/,                 img: 'printing-hub.webp',      icon: 'fa-print' },
  { p: /\/copiers\/printers/,        img: 'copiers-hub.webp',       icon: 'fa-print' },
  { p: /\/copiers\/maintenance/,     img: 'copiers-hub.webp',       icon: 'fa-tools' },
  { p: /\/copiers\/cartridges/,      img: 'copiers-hub.webp',       icon: 'fa-tint' },
  { p: /\/copiers\/buy/,             img: 'copiers-hub.webp',       icon: 'fa-copy' },
  { p: /\/copiers/,                  img: 'copiers-hub.webp',       icon: 'fa-copy' },
  { p: /\/cameras\/install/,         img: 'cameras-hub.webp',       icon: 'fa-video' },
  { p: /\/cameras\/dvr-nvr/,         img: 'cameras-hub.webp',       icon: 'fa-hdd' },
  { p: /\/cameras\/ip-wifi/,         img: 'cameras-hub.webp',       icon: 'fa-wifi' },
  { p: /\/cameras\/maintenance/,     img: 'cameras-hub.webp',       icon: 'fa-wrench' },
  { p: /\/cameras/,                  img: 'cameras-hub.webp',       icon: 'fa-video' },
  // ac-hub.webp and cash-machines-hub.webp are factually wrong stock photos
  // (a Bluetooth speaker and US dollar bills, respectively) — omitting `img`
  // here falls back to the icon-only placeholder instead of showing them.
  { p: /\/ac\/buy/,                                        icon: 'fa-snowflake' },
  { p: /\/ac\/installation/,                                icon: 'fa-tools' },
  { p: /\/ac\/maintenance/,                                 icon: 'fa-wrench' },
  { p: /\/ac/,                                              icon: 'fa-snowflake' },
  { p: /\/cash-machines\/counting/,                         icon: 'fa-money-bill-wave' },
  { p: /\/cash-machines\/detector/,                         icon: 'fa-search-dollar' },
  { p: /\/cash-machines\/franking/,                         icon: 'fa-stamp' },
  { p: /\/cash-machines\/shredder/,                         icon: 'fa-cut' },
  { p: /\/cash-machines/,                                   icon: 'fa-money-bill-wave' },
  { p: /\/office-supplies\/a4-paper/,img: 'office-supplies-hub.webp', icon: 'fa-file' },
  { p: /\/office-supplies\/thermal/, img: 'office-supplies-hub.webp', icon: 'fa-receipt' },
  { p: /\/office-supplies\/pens/,    img: 'office-supplies-hub.webp', icon: 'fa-pen' },
  { p: /\/office-supplies\/notebooks/,img:'office-supplies-hub.webp', icon: 'fa-book' },
  { p: /\/office-supplies\/files/,   img: 'office-supplies-hub.webp', icon: 'fa-folder' },
  { p: /\/office-supplies\/stamps/,  img: 'office-supplies-hub.webp', icon: 'fa-stamp' },
  { p: /\/office-supplies\/envelopes/,img:'office-supplies-hub.webp', icon: 'fa-envelope' },
  { p: /\/office-supplies\/whiteboards/,img:'office-supplies-hub.webp',icon:'fa-chalkboard' },
  { p: /\/office-supplies\/binding/, img: 'office-supplies-hub.webp', icon: 'fa-paperclip' },
  { p: /\/office-supplies\/sticky-notes/,img:'office-supplies-hub.webp',icon:'fa-sticky-note' },
  { p: /\/office-supplies\/batteries-usb/,img:'office-supplies-hub.webp',icon:'fa-battery-three-quarters' },
  { p: /\/office-supplies/,          img: 'office-supplies-hub.webp', icon: 'fa-briefcase' },
];

function injectHeroImage() {
  const pathname = window.location.pathname;
  const conf = HERO_CONFIG.find(h => h.p.test(pathname));
  if (!conf) return;

  const heroContainer = document.querySelector('.page-hero .container');
  const heroContent = heroContainer?.querySelector('.page-hero-content');
  if (!heroContainer || !heroContent || heroContainer.querySelector('.page-hero-inner')) return;

  const base = document.querySelector('link[data-base]')?.dataset.base ||
    (pathname.split('/').filter(Boolean).length > 1 ? '../' : '');

  const inner = document.createElement('div');
  inner.className = 'page-hero-inner';
  heroContainer.insertBefore(inner, heroContent);
  inner.appendChild(heroContent);

  const imgDiv = document.createElement('div');
  imgDiv.className = 'page-hero-image';
  imgDiv.innerHTML =
    (conf.img ? `<img src="${base}images/${conf.img}" alt="" loading="lazy" onerror="this.style.display='none'">` : '') +
    `<div class="page-hero-icon"><i class="fas ${conf.icon}"></i></div>`;
  inner.appendChild(imgDiv);
}

const SEARCH_INDEX = [
  { t: 'الرئيسية', u: 'index.html' },
  { t: 'عن الشركة', u: 'about.html' },
  { t: 'تواصل معنا', u: 'contact.html' },
  { t: 'معرض الأعمال', u: 'portfolio.html' },
  { t: 'مستلزمات مكتبية', u: 'office-supplies/index.html' },
  { t: 'ورق A4', u: 'office-supplies/a4-paper.html' },
  { t: 'ورق حراري وكاشير', u: 'office-supplies/thermal.html' },
  { t: 'أقلام وأدوات كتابة', u: 'office-supplies/pens.html' },
  { t: 'دفاتر ومفكرات', u: 'office-supplies/notebooks.html' },
  { t: 'ملفات وأرشفة', u: 'office-supplies/files.html' },
  { t: 'أختام مطاطية', u: 'office-supplies/stamps.html' },
  { t: 'أظرف وتغليف', u: 'office-supplies/envelopes.html' },
  { t: 'وايت بورد وسبورة', u: 'office-supplies/whiteboards.html' },
  { t: 'دباسة ومشابك', u: 'office-supplies/binding.html' },
  { t: 'بوست إت وورق لاصق', u: 'office-supplies/sticky-notes.html' },
  { t: 'بطاريات وفلاشات USB', u: 'office-supplies/batteries-usb.html' },
  { t: 'خدمات الطباعة', u: 'printing/index.html' },
  { t: 'طباعة أوفست', u: 'printing/offset.html' },
  { t: 'طباعة رقمية', u: 'printing/digital.html' },
  { t: 'طباعة بنرات وفينيل', u: 'printing/banners.html' },
  { t: 'بزنس كارد وبروشورات', u: 'printing/business-cards.html' },
  { t: 'طباعة UV', u: 'printing/uv.html' },
  { t: 'طباعة هدايا وأكواب', u: 'printing/gifts.html' },
  { t: 'ماكينات التصوير والطابعات', u: 'copiers/index.html' },
  { t: 'بيع ماكينات التصوير', u: 'copiers/buy.html' },
  { t: 'بيع طابعات', u: 'copiers/printers.html' },
  { t: 'صيانة ماكينات التصوير', u: 'copiers/maintenance.html' },
  { t: 'كارتريدج وأحبار', u: 'copiers/cartridges.html' },
  { t: 'كاميرات المراقبة', u: 'cameras/index.html' },
  { t: 'تركيب كاميرات مراقبة', u: 'cameras/install.html' },
  { t: 'أنظمة DVR و NVR', u: 'cameras/dvr-nvr.html' },
  { t: 'كاميرات IP وواي فاي', u: 'cameras/ip-wifi.html' },
  { t: 'صيانة أنظمة المراقبة', u: 'cameras/maintenance.html' },
  { t: 'تكييفات', u: 'ac/index.html' },
  { t: 'بيع تكييفات', u: 'ac/buy.html' },
  { t: 'تركيب تكييفات', u: 'ac/installation.html' },
  { t: 'صيانة وشحن فريون', u: 'ac/maintenance.html' },
  { t: 'ماكينات فارم وعد النقود', u: 'cash-machines/index.html' },
  { t: 'ماكينات عد النقود', u: 'cash-machines/counting.html' },
  { t: 'كشف العملات المزيفة', u: 'cash-machines/detector.html' },
  { t: 'ماكينات الفارم والختم', u: 'cash-machines/franking.html' },
  { t: 'ماكينات تدمير المستندات', u: 'cash-machines/shredder.html' },
];

function initSiteSearch() {
  const navContainer = document.querySelector('.navbar .container');
  const hamburgerBtn = document.querySelector('.hamburger');
  if (!navContainer || !hamburgerBtn || document.querySelector('.nav-search-toggle')) return;

  const base = document.querySelector('link[data-base]')?.dataset.base ||
    (window.location.pathname.split('/').filter(Boolean).length > 1 ? '../' : '');

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'nav-search-toggle';
  toggleBtn.setAttribute('aria-label', 'بحث');
  toggleBtn.innerHTML = '<i class="fas fa-search"></i>';
  navContainer.insertBefore(toggleBtn, hamburgerBtn);

  const panel = document.createElement('div');
  panel.className = 'site-search-panel';
  panel.innerHTML =
    '<div class="site-search-inner">' +
      '<div class="site-search-input-wrap">' +
        '<i class="fas fa-search"></i>' +
        '<input type="text" id="siteSearchInput" placeholder="ابحث عن منتج أو خدمة... مثال: ورق A4، كاميرا مراقبة" autocomplete="off">' +
        '<button type="button" class="site-search-close" aria-label="إغلاق"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="site-search-results"></div>' +
    '</div>';
  document.body.appendChild(panel);

  const input = panel.querySelector('#siteSearchInput');
  const results = panel.querySelector('.site-search-results');
  const closeBtn = panel.querySelector('.site-search-close');

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) { results.innerHTML = ''; return; }
    const matches = SEARCH_INDEX.filter(item => item.t.toLowerCase().includes(q)).slice(0, 8);
    if (!matches.length) {
      results.innerHTML = `<div class="site-search-empty">لا توجد نتائج مطابقة — جرّب كلمة أخرى أو <a href="${base}contact.html">تواصل معنا</a></div>`;
      return;
    }
    results.innerHTML = matches.map(m => `<a class="site-search-result" href="${base}${m.u}">${m.t}</a>`).join('');
  }

  function openPanel() {
    panel.classList.add('open');
    setTimeout(() => input.focus(), 50);
  }
  function closePanel() {
    panel.classList.remove('open');
    input.value = '';
    results.innerHTML = '';
  }

  toggleBtn.addEventListener('click', () => {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  closeBtn.addEventListener('click', closePanel);
  input.addEventListener('input', () => renderResults(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = results.querySelector('.site-search-result');
      if (first) window.location.href = first.getAttribute('href');
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
}

document.addEventListener('DOMContentLoaded', () => {

  injectHeroImage();
  initSiteSearch();

  // ── Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ── Mobile hamburger
  const hamburger = document.querySelector('.hamburger');
  const navMenu   = document.querySelector('.nav-menu');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!navbar?.contains(e.target)) {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('open');
    }
  });

  // ── Mobile dropdown toggle
  // First tap opens the dropdown; a second tap on the already-open label
  // navigates to the category hub page instead of re-toggling forever.
  document.querySelectorAll('.nav-link[data-dropdown]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 1400) {
        const dropdown = link.nextElementSibling;
        if (!dropdown?.classList.contains('open')) {
          e.preventDefault();
          dropdown?.classList.add('open');
        }
      }
    });
  });

  // ── FAQ accordion
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item   = q.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').style.maxHeight = '0';
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ── Stats counter animation (rAF-based, no setInterval)
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1200;
        let start = null;
        function step(ts) {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          el.textContent = prefix + Math.floor(progress * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = prefix + target + suffix;
        }
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));

  // ── Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  // ── Active nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath ||
        (currentPath !== '/' && link.getAttribute('href') !== '/' && currentPath.includes(link.getAttribute('href')))) {
      link.classList.add('active');
    }
  });

  // ── Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = document.querySelector('.navbar')?.offsetHeight || 80;
        window.scrollTo({ top: target.offsetTop - offset - 20, behavior: 'smooth' });
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('open');
      }
    });
  });

  // ── Set current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
