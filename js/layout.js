// layout.js — Shared navbar + footer injected into every page
(function () {
  const path = window.location.pathname;
  const base = (document.querySelector('link[data-base]')?.dataset.base) ||
    (path.split('/').filter(Boolean).length > 1 ? '../' : '');

  const B = base; // shorthand

  const NAV = `
<nav class="navbar">
  <div class="container">
    <a href="${B}index.html" class="navbar-brand">
      <img src="${B}images/logo.png" alt="نيو جولدن أوفيس" class="logo-img" onerror="this.style.display='none'">
      <div class="logo-text">نيو جولدن أوفيس</div>
    </a>
    <ul class="nav-menu">
      <li class="nav-item"><a href="${B}index.html" class="nav-link">الرئيسية</a></li>
      <li class="nav-item"><a href="${B}about.html" class="nav-link">عن الشركة</a></li>
      <li class="nav-item"><a href="${B}portfolio.html" class="nav-link">معرض أعمالنا</a></li>
      <li class="nav-item"><a href="${B}blog/index.html" class="nav-link">المدونة</a></li>
      <li class="nav-item">
        <a href="${B}office-supplies/index.html" class="nav-link" data-dropdown>مستلزمات مكتبية <i class="fas fa-chevron-down arrow"></i></a>
        <div class="dropdown">
          <a href="${B}office-supplies/a4-paper.html"><i class="fas fa-file"></i> ورق A4</a>
          <a href="${B}office-supplies/thermal.html"><i class="fas fa-receipt"></i> ورق حراري</a>
          <a href="${B}office-supplies/pens.html"><i class="fas fa-pen"></i> أقلام وأدوات كتابة</a>
          <a href="${B}office-supplies/notebooks.html"><i class="fas fa-book"></i> دفاتر ومفكرات</a>
          <a href="${B}office-supplies/files.html"><i class="fas fa-folder"></i> ملفات وأرشفة</a>
          <div class="dropdown-divider"></div>
          <a href="${B}office-supplies/stamps.html"><i class="fas fa-stamp"></i> أختام</a>
          <a href="${B}office-supplies/envelopes.html"><i class="fas fa-envelope"></i> أظرف وتغليف</a>
          <a href="${B}office-supplies/whiteboards.html"><i class="fas fa-chalkboard"></i> وايت بورد</a>
          <a href="${B}office-supplies/binding.html"><i class="fas fa-paperclip"></i> أدوات ربط</a>
          <a href="${B}office-supplies/sticky-notes.html"><i class="fas fa-sticky-note"></i> بوست إت</a>
          <a href="${B}office-supplies/batteries-usb.html"><i class="fas fa-battery-three-quarters"></i> بطاريات وUSB</a>
        </div>
      </li>
      <li class="nav-item">
        <a href="${B}printing/index.html" class="nav-link" data-dropdown>خدمات الطباعة <i class="fas fa-chevron-down arrow"></i></a>
        <div class="dropdown">
          <a href="${B}printing/offset.html"><i class="fas fa-print"></i> طباعة أوفست</a>
          <a href="${B}printing/digital.html"><i class="fas fa-digital-tachograph"></i> طباعة رقمية</a>
          <a href="${B}printing/banners.html"><i class="fas fa-image"></i> طباعة بنرات وفينيل</a>
          <a href="${B}printing/business-cards.html"><i class="fas fa-id-card"></i> بزنس كارد وبروشورات</a>
          <a href="${B}printing/uv.html"><i class="fas fa-sun"></i> طباعة UV</a>
          <a href="${B}printing/gifts.html"><i class="fas fa-gift"></i> طباعة هدايا وأكواب</a>
        </div>
      </li>
      <li class="nav-item">
        <a href="${B}copiers/index.html" class="nav-link" data-dropdown>ماكينات التصوير <i class="fas fa-chevron-down arrow"></i></a>
        <div class="dropdown">
          <a href="${B}copiers/buy.html"><i class="fas fa-copy"></i> بيع ماكينات التصوير</a>
          <a href="${B}copiers/printers.html"><i class="fas fa-print"></i> بيع طابعات</a>
          <a href="${B}copiers/maintenance.html"><i class="fas fa-tools"></i> صيانة ماكينات التصوير</a>
          <a href="${B}copiers/cartridges.html"><i class="fas fa-tint"></i> كارتريدج وأحبار</a>
        </div>
      </li>
      <li class="nav-item">
        <a href="${B}cameras/index.html" class="nav-link" data-dropdown>كاميرات المراقبة <i class="fas fa-chevron-down arrow"></i></a>
        <div class="dropdown">
          <a href="${B}cameras/install.html"><i class="fas fa-video"></i> بيع وتركيب كاميرات</a>
          <a href="${B}cameras/dvr-nvr.html"><i class="fas fa-hdd"></i> أنظمة DVR و NVR</a>
          <a href="${B}cameras/ip-wifi.html"><i class="fas fa-wifi"></i> كاميرات IP وواي فاي</a>
          <a href="${B}cameras/maintenance.html"><i class="fas fa-wrench"></i> صيانة أنظمة المراقبة</a>
        </div>
      </li>
      <li class="nav-item">
        <a href="${B}ac/index.html" class="nav-link" data-dropdown>تكييفات <i class="fas fa-chevron-down arrow"></i></a>
        <div class="dropdown">
          <a href="${B}ac/buy.html"><i class="fas fa-wind"></i> بيع تكييفات</a>
          <a href="${B}ac/installation.html"><i class="fas fa-tools"></i> تركيب تكييفات</a>
          <a href="${B}ac/maintenance.html"><i class="fas fa-wrench"></i> صيانة وشحن فريون</a>
        </div>
      </li>
      <li class="nav-item">
        <a href="${B}cash-machines/index.html" class="nav-link" data-dropdown>ماكينات فارم وعد <i class="fas fa-chevron-down arrow"></i></a>
        <div class="dropdown">
          <a href="${B}cash-machines/counting.html"><i class="fas fa-money-bill-wave"></i> ماكينات عد النقود</a>
          <a href="${B}cash-machines/detector.html"><i class="fas fa-search-dollar"></i> كشف العملات المزيفة</a>
          <a href="${B}cash-machines/franking.html"><i class="fas fa-stamp"></i> ماكينات الفارم والختم</a>
          <a href="${B}cash-machines/shredder.html"><i class="fas fa-cut"></i> تدمير المستندات</a>
        </div>
      </li>
      <li class="nav-item"><a href="${B}contact.html" class="nav-link nav-cta">تواصل معنا</a></li>
    </ul>
    <button class="hamburger" aria-label="القائمة"><span></span><span></span><span></span></button>
  </div>
</nav>`;

  const FOOTER = `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="navbar-brand" style="gap:10px;margin-bottom:12px">
          <img src="${B}images/logo.png" alt="نيو جولدن أوفيس" class="logo-img" style="border-color:rgba(255,255,255,0.2)" onerror="this.style.display='none'">
          <div><div class="logo-text">نيو جولدن أوفيس</div><div class="logo-sub">NEW GOLDEN OFFICE</div></div>
        </div>
        <p class="footer-desc">نوفر لك الوقت والجهد — نجيب بأفضل حل لكل احتياج، بجودة مضمونة وأسعار تنافسية. شريكك الموثوق في مصر منذ عام 1990.</p>
        <div class="footer-social">
          <a href="https://wa.me/201227392074" class="social-link"><i class="fab fa-whatsapp"></i></a>
          <a href="tel:+201227392074" class="social-link"><i class="fas fa-phone"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h5>خدماتنا</h5>
        <ul class="footer-links">
          <li><a href="${B}office-supplies/index.html"><i class="fas fa-angle-left"></i> مستلزمات مكتبية</a></li>
          <li><a href="${B}printing/index.html"><i class="fas fa-angle-left"></i> خدمات الطباعة</a></li>
          <li><a href="${B}copiers/index.html"><i class="fas fa-angle-left"></i> ماكينات التصوير</a></li>
          <li><a href="${B}cameras/index.html"><i class="fas fa-angle-left"></i> كاميرات المراقبة</a></li>
          <li><a href="${B}ac/index.html"><i class="fas fa-angle-left"></i> التكييفات</a></li>
          <li><a href="${B}cash-machines/index.html"><i class="fas fa-angle-left"></i> ماكينات الفارم والعد</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>روابط سريعة</h5>
        <ul class="footer-links">
          <li><a href="${B}index.html"><i class="fas fa-angle-left"></i> الرئيسية</a></li>
          <li><a href="${B}about.html"><i class="fas fa-angle-left"></i> عن الشركة</a></li>
          <li><a href="${B}portfolio.html"><i class="fas fa-angle-left"></i> معرض أعمالنا</a></li>
          <li><a href="${B}blog/index.html"><i class="fas fa-angle-left"></i> المدونة</a></li>
          <li><a href="${B}contact.html"><i class="fas fa-angle-left"></i> تواصل معنا</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>تواصل معنا</h5>
        <div class="footer-contact-items">
          <div class="footer-contact-item"><i class="fas fa-map-marker-alt"></i><span>26 عبد المنعم سند، الإبراهيمية، باب شرق، الإسكندرية</span></div>
          <div class="footer-contact-item"><i class="fas fa-phone-alt"></i><a href="tel:+201227392074" style="color:rgba(255,255,255,0.8)">01227392074</a></div>
          <div class="footer-contact-item"><i class="fab fa-whatsapp"></i><a href="https://wa.me/201227392074" target="_blank" style="color:rgba(255,255,255,0.8)">واتساب مباشر</a></div>
          <div class="footer-contact-item"><i class="fas fa-clock"></i><span>السبت - الخميس: 9 ص — 6 م</span></div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>جميع الحقوق محفوظة &copy; <span id="current-year">2026</span> — نيو جولدن أوفيس</p>
      <div class="footer-bottom-links">
        <a href="${B}privacy.html">سياسة الخصوصية</a>
        <a href="${B}terms.html">الشروط والأحكام</a>
        <a href="${B}contact.html">تواصل معنا</a>
      </div>
    </div>
  </div>
</footer>
<a href="https://wa.me/201227392074?text=مرحباً،%20أريد%20الاستفسار%20عن%20خدماتكم" class="whatsapp-float" target="_blank" aria-label="واتساب"><i class="fab fa-whatsapp"></i></a>
<a href="tel:+201227392074" class="phone-float" aria-label="اتصل بنا"><i class="fas fa-phone-alt"></i></a>`;

  document.body.insertAdjacentHTML('afterbegin', NAV);
  document.body.insertAdjacentHTML('beforeend', FOOTER);

  // Mark active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && path.endsWith(href.replace(/^\.\.\//, '').replace(/^\.\//, ''))) {
      link.classList.add('active');
    }
  });

  // ── SEO HEAD INJECTIONS ──────────────────────────────────────────────────
  const SITE = 'https://newgoldenoffice.com';

  // Build canonical URL from current path, normalising index.html → trailing slash
  const canonicalPath = path.replace(/\/index\.html$/, '/').replace(/^.*\/([^/]+\/?)$/, (_, p) => {
    // reconstruct full path relative to site root
    return path;
  });
  const cleanPath = path.replace(/index\.html$/, '').replace(/\/index\.html$/, '/') || '/';
  const canonicalUrl = SITE + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);

  // Canonical tag
  if (!document.querySelector('link[rel="canonical"]')) {
    const cl = document.createElement('link');
    cl.rel = 'canonical';
    cl.href = canonicalUrl;
    document.head.appendChild(cl);
  }

  // og:url
  if (!document.querySelector('meta[property="og:url"]')) {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:url');
    m.content = canonicalUrl;
    document.head.appendChild(m);
  }

  // og:image
  if (!document.querySelector('meta[property="og:image"]')) {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:image');
    m.content = SITE + '/images/og-image.jpg';
    document.head.appendChild(m);
  }

  // Twitter cards
  if (!document.querySelector('meta[name="twitter:card"]')) {
    [['twitter:card', 'summary_large_image'],
     ['twitter:image', SITE + '/images/og-image.jpg']].forEach(([n, v]) => {
      const m = document.createElement('meta');
      m.name = n; m.content = v;
      document.head.appendChild(m);
    });
  }

  // BreadcrumbList schema
  const PAGE_NAMES = {
    'about': 'عن الشركة', 'contact': 'تواصل معنا', 'portfolio': 'معرض أعمالنا',
    'blog': 'المدونة',
    'privacy': 'سياسة الخصوصية', 'terms': 'الشروط والأحكام',
    'printing': 'خدمات الطباعة', 'offset': 'طباعة أوفست', 'digital': 'طباعة رقمية',
    'banners': 'طباعة بنرات', 'business-cards': 'كروت شخصية وبروشورات',
    'uv': 'طباعة UV', 'gifts': 'طباعة هدايا وأكواب',
    'copiers': 'ماكينات التصوير', 'buy': 'بيع ماكينات التصوير',
    'printers': 'طابعات للبيع', 'maintenance': 'صيانة', 'cartridges': 'كارتريدج وأحبار',
    'cameras': 'كاميرات المراقبة', 'install': 'تركيب كاميرات',
    'dvr-nvr': 'أنظمة DVR و NVR', 'ip-wifi': 'كاميرات IP وواي فاي',
    'ac': 'تكييفات', 'installation': 'تركيب تكييفات',
    'cash-machines': 'ماكينات الفارم والعد', 'counting': 'ماكينات عد النقود',
    'detector': 'كشف العملات المزيفة', 'franking': 'ماكينات الفارم والختم',
    'shredder': 'تدمير المستندات',
    'office-supplies': 'مستلزمات مكتبية', 'a4-paper': 'ورق A4',
    'thermal': 'ورق حراري', 'pens': 'أقلام وأدوات كتابة',
    'notebooks': 'دفاتر ومفكرات', 'files': 'ملفات وأرشفة',
    'stamps': 'أختام مطاطية', 'envelopes': 'أظرف وتغليف',
    'whiteboards': 'وايت بورد', 'binding': 'دباسة ومشابك',
    'sticky-notes': 'بوست إت', 'batteries-usb': 'بطاريات وUSB'
  };

  const segments = cleanPath.split('/').filter(s => s && s !== 'index.html' && !s.endsWith('.html'));
  const htmlPage = cleanPath.split('/').pop()?.replace('.html', '');
  const allSegs = [...segments];
  if (htmlPage && htmlPage !== 'index' && !segments.includes(htmlPage)) allSegs.push(htmlPage);

  const breadcrumbItems = [{ name: 'الرئيسية', url: SITE + '/' }];
  let builtUrl = SITE;
  allSegs.forEach(seg => {
    builtUrl += '/' + seg;
    const name = PAGE_NAMES[seg] || seg;
    breadcrumbItems.push({ name, url: builtUrl + (seg.includes('.') ? '' : '/') });
  });

  if (breadcrumbItems.length > 1) {
    const bcSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url
      }))
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(bcSchema);
    document.head.appendChild(s);
  }
  // ────────────────────────────────────────────────────────────────────────
})();
