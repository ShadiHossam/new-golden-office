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
  { p: /\/ac\/buy/,                  img: 'ac-hub.webp',            icon: 'fa-snowflake' },
  { p: /\/ac\/installation/,         img: 'ac-hub.webp',            icon: 'fa-tools' },
  { p: /\/ac\/maintenance/,          img: 'ac-hub.webp',            icon: 'fa-wrench' },
  { p: /\/ac/,                       img: 'ac-hub.webp',            icon: 'fa-snowflake' },
  { p: /\/cash-machines\/counting/,  img: 'cash-machines-hub.webp', icon: 'fa-money-bill-wave' },
  { p: /\/cash-machines\/detector/,  img: 'cash-machines-hub.webp', icon: 'fa-search-dollar' },
  { p: /\/cash-machines\/franking/,  img: 'cash-machines-hub.webp', icon: 'fa-stamp' },
  { p: /\/cash-machines\/shredder/,  img: 'cash-machines-hub.webp', icon: 'fa-cut' },
  { p: /\/cash-machines/,            img: 'cash-machines-hub.webp', icon: 'fa-money-bill-wave' },
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
    `<img src="${base}images/${conf.img}" alt="" loading="lazy" onerror="this.style.display='none'">` +
    `<div class="page-hero-icon"><i class="fas ${conf.icon}"></i></div>`;
  inner.appendChild(imgDiv);
}

document.addEventListener('DOMContentLoaded', () => {

  injectHeroImage();

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
  document.querySelectorAll('.nav-link[data-dropdown]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dropdown = link.nextElementSibling;
        dropdown?.classList.toggle('open');
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
        entry.target.classList.add('animate');
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
