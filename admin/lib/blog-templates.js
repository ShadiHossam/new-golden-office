// Renders blog posts + the blog index into the same HTML shell used by the
// site's existing hand-authored pages, but one level deep under /blog/
// (same base-path depth as e.g. /printing/offset.html), plus Article/
// CollectionPage JSON-LD structured data specific to blog content.

const { sanitizeBodyHtml } = require('./page-templates');

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateAr(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) { return ''; }
}

const DEFAULT_COVER = 'https://newgoldenoffice.com/images/og-image.jpg';

function renderBlogPostHtml(post) {
  const title = escapeHtml(post.seo_title || post.title);
  const desc = escapeHtml(post.meta_description || post.excerpt);
  const keywords = escapeHtml(post.meta_keywords);
  const ogTitle = escapeHtml(post.og_title || post.seo_title || post.title);
  const ogDesc = escapeHtml(post.og_description || post.meta_description || post.excerpt);
  const ogImage = escapeHtml(post.og_image || post.cover_image || DEFAULT_COVER);
  const canonical = `https://newgoldenoffice.com/blog/${post.slug}.html`;
  const publishedIso = post.published_at || new Date().toISOString();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || post.excerpt || '',
    image: post.cover_image || post.og_image || DEFAULT_COVER,
    datePublished: publishedIso,
    dateModified: post.updated_at || publishedIso,
    author: { '@type': 'Organization', name: 'نيو جولدن أوفيس' },
    publisher: {
      '@type': 'Organization',
      name: 'نيو جولدن أوفيس',
      logo: { '@type': 'ImageObject', url: 'https://newgoldenoffice.com/images/logo.png' }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }
  };

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-NMLZVZR3');</script>
  <!-- End Google Tag Manager -->

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-SEPETFLC25"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-SEPETFLC25');

    gtag('config', 'AW-18320973253');
  </script>

  <!-- Microsoft Clarity -->
  <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "xlc66h8b4c");
  </script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${canonical}">
  <meta name="keywords" content="${keywords}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:type" content="article">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">
  <link rel="dns-prefetch" href="https://wa.me">
  <link rel="dns-prefetch" href="https://www.google.com">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="../css/style.css">
  <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
</head>
<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NMLZVZR3"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->

  <!-- Navbar injected by layout.js -->

  <!-- Page Hero -->
  <section class="page-hero">
    <div class="container">
      <div class="page-hero-content">
        <nav class="breadcrumb" aria-label="breadcrumb">
          <a href="../index.html">الرئيسية</a>
          <i class="fa-solid fa-chevron-left"></i>
          <a href="../blog/index.html">المدونة</a>
          <i class="fa-solid fa-chevron-left"></i>
          <span>${escapeHtml(post.title)}</span>
        </nav>
        <h1 class="reveal">${escapeHtml(post.title)}</h1>
        <p class="lead reveal delay-1" style="opacity:.85;font-size:14px;">
          <i class="fa-regular fa-calendar"></i> ${formatDateAr(publishedIso)}
          ${post.category ? ` &nbsp;·&nbsp; <i class="fa-solid fa-tag"></i> ${escapeHtml(post.category)}` : ''}
        </p>
      </div>
    </div>
  </section>

  <!-- Post Content -->
  <section class="section">
    <div class="container" style="max-width:820px;">
      ${post.cover_image ? `<img src="${escapeHtml(post.cover_image)}" alt="${escapeHtml(post.title)}" style="width:100%;border-radius:var(--radius);margin-bottom:28px;" loading="eager">` : ''}
      <div class="blog-post-body">${sanitizeBodyHtml(post.body_html)}</div>
    </div>
  </section>

  <section class="cta-banner">
    <div class="container">
      <div class="reveal">
        <h2>محتاج استشارة أو عرض سعر؟</h2>
        <p>فريقنا المتخصص جاهز لمساعدتك في اختيار أفضل الحلول لعملك</p>
        <div class="btn-group">
          <a href="../contact.html" class="btn btn-primary btn-lg">
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
  </section>

  <script src="../js/layout.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>
`;
}

function renderBlogIndexHtml(posts) {
  const published = posts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.published_at || b.updated_at) - new Date(a.published_at || a.updated_at));

  const cards = published.map(p => `
      <a href="${escapeHtml(p.slug)}.html" class="blog-card reveal">
        <div class="blog-card-image" style="background-image:url('${escapeHtml(p.cover_image || DEFAULT_COVER)}')"></div>
        <div class="blog-card-body">
          ${p.category ? `<span class="blog-card-category">${escapeHtml(p.category)}</span>` : ''}
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.excerpt || '')}</p>
          <span class="blog-card-date"><i class="fa-regular fa-calendar"></i> ${formatDateAr(p.published_at)}</span>
        </div>
      </a>`).join('\n');

  const emptyState = `
      <div class="empty-state" style="padding:60px 20px;text-align:center;grid-column:1/-1;">
        <p style="color:var(--text-muted);">مقالات جديدة قريباً — تابعونا للحصول على نصائح ومقالات حول مستلزمات مكتبية وأنظمة أمان وطباعة.</p>
      </div>`;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'مدونة نيو جولدن أوفيس',
    url: 'https://newgoldenoffice.com/blog/',
    ...(published.length ? {
      hasPart: published.map(p => ({
        '@type': 'Article',
        headline: p.title,
        url: `https://newgoldenoffice.com/blog/${p.slug}.html`
      }))
    } : {})
  };

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-NMLZVZR3');</script>
  <!-- End Google Tag Manager -->

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-SEPETFLC25"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-SEPETFLC25');

    gtag('config', 'AW-18320973253');
  </script>

  <!-- Microsoft Clarity -->
  <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "xlc66h8b4c");
  </script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مدونة نيو جولدن أوفيس | مقالات ونصائح عن مستلزمات مكتبية وطباعة وأنظمة أمان</title>
  <meta name="description" content="مقالات ونصائح من نيو جولدن أوفيس حول مستلزمات مكتبية، خدمات الطباعة، ماكينات التصوير، كاميرات المراقبة، والتكييفات في مصر.">
  <link rel="canonical" href="https://newgoldenoffice.com/blog/">
  <meta property="og:title" content="مدونة نيو جولدن أوفيس">
  <meta property="og:description" content="مقالات ونصائح حول مستلزمات مكتبية وخدمات الطباعة وأنظمة الأمان في مصر.">
  <meta property="og:image" content="${DEFAULT_COVER}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">
  <link rel="dns-prefetch" href="https://wa.me">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="../css/style.css">
  <script type="application/ld+json">${JSON.stringify(collectionSchema)}</script>
</head>
<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NMLZVZR3"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->

  <!-- Navbar injected by layout.js -->

  <!-- Page Hero -->
  <section class="page-hero">
    <div class="container">
      <div class="page-hero-content">
        <nav class="breadcrumb" aria-label="breadcrumb">
          <a href="../index.html">الرئيسية</a>
          <i class="fa-solid fa-chevron-left"></i>
          <span>المدونة</span>
        </nav>
        <h1 class="reveal">المدونة</h1>
        <p class="lead reveal delay-1">مقالات ونصائح حول مستلزمات مكتبية، طباعة، أنظمة أمان، وتكييفات في مصر</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="blog-grid">${published.length ? cards : emptyState}
      </div>
    </div>
  </section>

  <script src="../js/layout.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>
`;
}

module.exports = { renderBlogPostHtml, renderBlogIndexHtml };
