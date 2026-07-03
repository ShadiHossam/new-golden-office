// Renders a new custom page into the exact same HTML shell used by the
// site's existing hand-authored pages (about.html, contact.html, etc.):
// same <head> boilerplate, page-hero/breadcrumb/section markup, and the
// shared js/layout.js + js/main.js scripts that inject the navbar/footer
// client-side. Pages are always created at the site root (no subdirectory
// support — layout.js's base-path detection only needs to handle root vs.
// one-level-deep category pages, and root keeps this scaffold simple).

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Body content comes from an admin-only contentEditable editor. Strip the
// handful of tags/attributes that could execute script if pasted in, since
// this is written straight into a live static HTML file.
function sanitizeBodyHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
}

function renderPageHtml(page) {
  const title = escapeHtml(page.seo_title || page.title);
  const desc = escapeHtml(page.meta_description);
  const keywords = escapeHtml(page.meta_keywords);
  const ogTitle = escapeHtml(page.og_title || page.seo_title || page.title);
  const ogDesc = escapeHtml(page.og_description || page.meta_description);
  const ogImage = escapeHtml(page.og_image || 'https://newgoldenoffice.com/images/logo.png');
  const canonical = `https://newgoldenoffice.com/${page.slug}.html`;

  const ctaSection = page.show_cta ? `
  <section class="cta-banner">
    <div class="container">
      <div class="reveal">
        <h2>احجز استشارتك المجانية اليوم</h2>
        <p>فريقنا المتخصص جاهز لمساعدتك في اختيار أفضل الحلول لعملك وتقديم عرض سعر مخصص لاحتياجاتك</p>
        <div class="btn-group">
          <a href="contact.html" class="btn btn-primary btn-lg">
            <i class="fa-solid fa-phone"></i>
            تواصل معنا الآن
          </a>
          <a href="https://wa.me/201227392074" class="btn btn-outline btn-lg" target="_blank" rel="noopener">
            <i class="fa-brands fa-whatsapp"></i>
            واتساب
          </a>
        </div>
      </div>
    </div>
  </section>` : '';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${canonical}">
  <meta name="keywords" content="${keywords}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">
  <link rel="dns-prefetch" href="https://wa.me">
  <link rel="dns-prefetch" href="https://www.google.com">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Navbar injected by layout.js -->

  <!-- Page Hero -->
  <section class="page-hero">
    <div class="container">
      <div class="page-hero-content">
        <nav class="breadcrumb" aria-label="breadcrumb">
          <a href="index.html">الرئيسية</a>
          <i class="fa-solid fa-chevron-left"></i>
          <span>${escapeHtml(page.breadcrumb_label || page.title)}</span>
        </nav>
        <h1 class="reveal">${escapeHtml(page.title)}</h1>
        ${page.lead ? `<p class="lead reveal delay-1">${escapeHtml(page.lead)}</p>` : ''}
      </div>
    </div>
  </section>

  <!-- Page Content -->
  <section class="section">
    <div class="container">
      ${sanitizeBodyHtml(page.body_html)}
    </div>
  </section>
${ctaSection}
  <script src="js/layout.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
`;
}

module.exports = { renderPageHtml, sanitizeBodyHtml };
