// New Golden Office — Main JavaScript

const SEARCH_INDEX = [
  { t: 'الرئيسية', u: '/' },
  { t: 'عن الشركة', u: '/about' },
  { t: 'تواصل معنا', u: '/contact' },
  { t: 'معرض الأعمال', u: '/portfolio' },
  { t: 'مستلزمات مكتبية', u: '/office-supplies' },
  { t: 'ورق A4', u: '/office-supplies/a4-paper' },
  { t: 'ورق حراري وكاشير', u: '/office-supplies/thermal' },
  { t: 'أقلام وأدوات كتابة', u: '/office-supplies/pens' },
  { t: 'دفاتر ومفكرات', u: '/office-supplies/notebooks' },
  { t: 'ملفات وأرشفة', u: '/office-supplies/files' },
  { t: 'أختام مطاطية', u: '/office-supplies/stamps' },
  { t: 'أظرف وتغليف', u: '/office-supplies/envelopes' },
  { t: 'وايت بورد وسبورة', u: '/office-supplies/whiteboards' },
  { t: 'دباسة ومشابك', u: '/office-supplies/binding' },
  { t: 'بوست إت وورق لاصق', u: '/office-supplies/sticky-notes' },
  { t: 'بطاريات وفلاشات USB', u: '/office-supplies/batteries-usb' },
  { t: 'خدمات الطباعة', u: '/printing' },
  { t: 'طباعة أوفست', u: '/printing/offset' },
  { t: 'طباعة رقمية', u: '/printing/digital' },
  { t: 'طباعة بنرات وفينيل', u: '/printing/banners' },
  { t: 'بزنس كارد وبروشورات', u: '/printing/business-cards' },
  { t: 'طباعة UV', u: '/printing/uv' },
  { t: 'طباعة هدايا وأكواب', u: '/printing/gifts' },
  { t: 'ماكينات التصوير والطابعات', u: '/copiers' },
  { t: 'بيع ماكينات التصوير', u: '/copiers/buy' },
  { t: 'بيع طابعات', u: '/copiers/printers' },
  { t: 'صيانة ماكينات التصوير', u: '/copiers/maintenance' },
  { t: 'كارتريدج وأحبار', u: '/copiers/cartridges' },
  { t: 'كاميرات المراقبة', u: '/cameras' },
  { t: 'تركيب كاميرات مراقبة', u: '/cameras/install' },
  { t: 'أنظمة DVR و NVR', u: '/cameras/dvr-nvr' },
  { t: 'كاميرات IP وواي فاي', u: '/cameras/ip-wifi' },
  { t: 'صيانة أنظمة المراقبة', u: '/cameras/maintenance' },
  { t: 'تكييفات', u: '/ac' },
  { t: 'بيع تكييفات', u: '/ac/buy' },
  { t: 'تركيب تكييفات', u: '/ac/installation' },
  { t: 'صيانة وشحن فريون', u: '/ac/maintenance' },
  { t: 'ماكينات فارم وعد النقود', u: '/cash-machines' },
  { t: 'ماكينات عد النقود', u: '/cash-machines/counting' },
  { t: 'كشف العملات المزيفة', u: '/cash-machines/detector' },
  { t: 'ماكينات الفارم والختم', u: '/cash-machines/franking' },
  { t: 'ماكينات تدمير المستندات', u: '/cash-machines/shredder' },
];

function initSiteSearch() {
  const toggleBtn = document.querySelector('.nav-search-toggle');
  const panel = document.querySelector('.site-search-panel');
  if (!toggleBtn || !panel) return;

  const input = panel.querySelector('#siteSearchInput');
  const results = panel.querySelector('.site-search-results');
  const closeBtn = panel.querySelector('.site-search-close');

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) { results.innerHTML = ''; return; }
    const matches = SEARCH_INDEX.filter(item => item.t.toLowerCase().includes(q)).slice(0, 8);
    if (!matches.length) {
      results.innerHTML = `<div class="site-search-empty">لا توجد نتائج مطابقة — جرّب كلمة أخرى أو <a href="/contact">تواصل معنا</a></div>`;
      return;
    }
    results.innerHTML = matches.map(m => `<a class="site-search-result" href="${m.u}">${m.t}</a>`).join('');
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

  initSiteSearch();

  // ── Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ── Mobile hamburger
  const hamburger  = document.querySelector('.hamburger');
  const navMenu    = document.querySelector('.nav-menu');
  const navOverlay = document.querySelector('.nav-overlay');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
    navOverlay?.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!navbar?.contains(e.target)) {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('open');
      navOverlay?.classList.remove('open');
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

  // ── Stats counter animation (rAF-based)
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
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
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
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

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
        navOverlay?.classList.remove('open');
      }
    });
  });

  // ── WhatsApp / phone click attribution (GA4)
  // Fires on every wa.me / tel: link sitewide (inline hero CTAs + shared
  // Footer/WhatsAppFloat components) so leads can be traced back to the
  // page/section that produced them.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="wa.me"], a[href^="tel:"]');
    if (!link || typeof gtag !== 'function') return;
    gtag('event', link.href.includes('wa.me') ? 'whatsapp_click' : 'phone_click', {
      page_path: window.location.pathname,
      link_text: link.textContent.trim().slice(0, 100),
    });
  });

});
