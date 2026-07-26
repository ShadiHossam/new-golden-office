// New Golden Office — Main JavaScript

document.addEventListener('DOMContentLoaded', () => {

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
        entry.target.classList.add('animate');
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
      }
    });
  });

});
