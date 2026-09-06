/**
 * Generates src/data/image-meta.json — one unique alt + title per image file.
 *
 * Why per-file and not per-usage: alt describes the picture, not the page it
 * sits on. Before this, a shared image like ac-hub.webp took whatever page
 * title it appeared under (4 different alts for one picture), while a post's
 * three images all inherited the post title (3 pictures, one alt).
 *
 * Curated entries below are hand-written from what each photo actually shows.
 * Blog images are derived from their post and the section heading they sit
 * under, which is the most specific context available in the content.
 *
 * The logo is deliberately absent: it keeps the brand name as its alt and gets
 * no title, per the "logos and icons excluded" rule. Icons are Font Awesome
 * <i> elements, not <img>, so they never reach this map.
 *
 * Run: node scripts/build-image-meta.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const BRAND = 'نيو جولدن أوفيس';
const OUT = 'src/data/image-meta.json';

/* ---------- curated: site + stock photography ---------- */
const CURATED = {
  '/images/about-team.webp': ['فريق نيو جولدن أوفيس أثناء العمل مع أحد العملاء داخل المكتب', 'فريق العمل'],
  '/images/hero-office.webp': ['مكتب مجهز بالكامل بأجهزة ومستلزمات من نيو جولدن أوفيس', 'مكتب مجهز بالكامل'],
  '/images/og-image.jpg': ['صورة المشاركة الرسمية لموقع نيو جولدن أوفيس على وسائل التواصل', 'صورة المشاركة الرسمية'],
  '/images/ac-hub.webp': ['وحدة تكييف مكتبية ضمن خدمات بيع وتركيب وصيانة التكييفات', 'قسم التكييفات'],
  '/images/cameras-hub.webp': ['نظام كاميرات مراقبة متكامل لتأمين المنشآت والمحال', 'قسم كاميرات المراقبة'],
  '/images/cash-machines-hub.webp': ['ماكينة عد نقود وكشف تزييف للبنوك والمحال التجارية', 'قسم ماكينات النقود'],
  '/images/copiers-hub.webp': ['ماكينة تصوير مكتبية متعددة الوظائف للشركات', 'قسم ماكينات التصوير'],
  '/images/office-supplies-hub.webp': ['تشكيلة مستلزمات مكتبية من ورق وأقلام وملفات وأدوات تنظيم', 'قسم المستلزمات المكتبية'],
  '/images/printing-hub.webp': ['خدمات طباعة احترافية داخل مطبعة نيو جولدن أوفيس', 'قسم خدمات الطباعة'],

  '/images/copier-mfp-office-1784572494696-842827.jpg': ['ماكينة تصوير مكتبية متعددة الوظائف داخل بيئة عمل', 'ماكينة تصوير متعددة الوظائف'],
  '/images/copier-scanning-office-1784572494919-541980.jpg': ['مسح مستند ضوئيًا على ماكينة تصوير مكتبية', 'مسح المستندات ضوئيًا'],
  '/images/printer-paper-tray-desk-1784572494985-248504.jpg': ['درج ورق طابعة مكتبية أثناء تحميل الورق', 'درج ورق الطابعة'],

  '/images/webp-images/adjusting-air-conditioner-with-remote-control-in-h-2026-03-17-22-42-22-utc.webp':
    ['ضبط درجة حرارة التكييف بجهاز التحكم عن بُعد داخل الغرفة', 'ضبط حرارة التكييف'],
  '/images/webp-images/controlling-room-temperature-with-remote-control-d-2026-03-24-03-30-27-utc.webp':
    ['التحكم في حرارة الغرفة عبر ريموت التكييف الرقمي', 'التحكم في حرارة الغرفة'],
  '/images/webp-images/modern-air-conditioner-unit-on-wall-at-home-2026-03-25-06-57-47-utc.webp':
    ['وحدة تكييف سبليت حديثة مثبتة على جدار داخلي', 'وحدة تكييف سبليت داخلية'],
  '/images/webp-images/outdoor-air-conditioner-unit-on-the-wall-of-a-buil-2026-03-19-04-22-48-utc.webp':
    ['وحدة تكييف خارجية مثبتة على واجهة مبنى', 'الوحدة الخارجية للتكييف'],
  '/images/webp-images/approved-rubber-stamp-on-financial-bar-graph-repor-2026-03-19-23-56-51-utc.webp':
    ['ختم اعتماد مطاطي فوق تقرير مالي مطبوع', 'ختم اعتماد على تقرير مالي'],
  '/images/webp-images/business-professionals-meeting-at-conference-room-2026-01-05-00-29-12-utc.webp':
    ['اجتماع فريق عمل داخل قاعة مؤتمرات بمكتب حديث', 'اجتماع في قاعة مؤتمرات'],
  '/images/webp-images/cityscape-of-cairo-2026-03-25-06-11-05-utc.webp':
    ['منظر عام لمدينة القاهرة يظهر امتداد المباني', 'مدينة القاهرة'],
  '/images/webp-images/historic-bridge-towers-over-peaceful-waters-at-dus-2026-01-09-10-56-36-utc.webp':
    ['أبراج كوبري تاريخي فوق مياه هادئة وقت الغروب', 'كوبري فوق المياه وقت الغروب'],
  '/images/webp-images/close-up-of-large-format-printer-heads-in-action-2026-01-06-09-29-23-utc.webp':
    ['لقطة قريبة لرؤوس طابعة كبيرة الحجم أثناء الطباعة', 'رؤوس الطابعة الكبيرة'],
  '/images/webp-images/hi-tech-printing-equipment-in-print-workshop-2026-03-25-01-25-40-utc.webp':
    ['معدات طباعة حديثة داخل ورشة طباعة تجارية', 'معدات ورشة الطباعة'],
  '/images/webp-images/man-and-woman-working-with-printing-machine-2026-01-08-07-07-12-utc.webp':
    ['فنيان يشغّلان ماكينة طباعة داخل مطبعة', 'تشغيل ماكينة الطباعة'],
  '/images/webp-images/fiew-laser-printers-in-electronic-computer-store-2026-01-05-05-44-21-utc.webp':
    ['صف من طابعات الليزر معروضة داخل متجر أجهزة', 'طابعات ليزر معروضة'],
  '/images/webp-images/counting-cash-with-a-money-counter-machine-2026-03-25-00-56-49-utc.webp':
    ['عد أوراق نقدية باستخدام ماكينة عد النقود', 'عد النقود بالماكينة'],
  '/images/webp-images/hands-putting-cash-counter-close-up-worker-calcul-2026-03-11-01-02-02-utc.webp':
    ['يد موظف تضع حزمة نقود داخل ماكينة العد', 'تحميل النقود في الماكينة'],
  '/images/webp-images/modern-cctv-camera-on-a-wall-with-a-blurred-multi-2026-01-08-06-13-58-utc.webp':
    ['كاميرا مراقبة حديثة مثبتة على جدار مبنى سكني', 'كاميرا مراقبة على واجهة مبنى'],
  '/images/webp-images/modern-white-security-camera-technology-for-survei-2026-01-07-00-31-34-utc.webp':
    ['كاميرا مراقبة بيضاء حديثة لتأمين المنشآت', 'كاميرا مراقبة بيضاء حديثة'],
  '/images/webp-images/interior-of-empty-modern-office-with-desks-and-com-2026-01-09-08-28-40-utc.webp':
    ['مكتب حديث خالٍ بمكاتب وأجهزة كمبيوتر جاهزة للتشغيل', 'مكتب حديث جاهز للتشغيل'],
  '/images/webp-images/neat-stack-of-white-paper-on-a-black-surface-2026-04-07-00-06-05-utc.webp':
    ['رزمة ورق أبيض مرتبة على سطح داكن', 'رزمة ورق طباعة'],
};

/* ---------- blog context: which post, which section ---------- */
const blogCtx = {};
const BLOG = 'src/content/blog';
for (const f of fs.readdirSync(BLOG)) {
  const j = JSON.parse(fs.readFileSync(path.join(BLOG, f), 'utf8'));
  if (j.status !== 'published') continue;
  const $ = cheerio.load(j.body_html || '', null, false);
  let lastH = '';
  for (const n of $.root().contents().toArray()) {
    const tag = (n.tagName || '').toLowerCase();
    if (/^h[2-4]$/.test(tag)) lastH = $(n).text().trim().replace(/\s+/g, ' ');
    const imgs = tag === 'img' ? [n] : $(n).find('img').toArray();
    for (const im of imgs) {
      const src = ($(im).attr('src') || '').split('?')[0];
      if (src.startsWith('/images/') && !blogCtx[src]) {
        blogCtx[src] = { title: j.title, cat: j.category, section: lastH };
      }
    }
  }
  if (j.cover_image?.startsWith('/images/') && !blogCtx[j.cover_image]) {
    blogCtx[j.cover_image] = { title: j.title, cat: j.category, section: '' };
  }
}

const trim = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');

/**
 * A short, readable phrase for alt text: first clause only, capped at a word
 * count rather than a character count, and never ellipsised — a truncated
 * phrase mid-word reads badly to a screen reader.
 */
function phrase(s, maxWords = 7) {
  let out = String(s).split(/[:—–؟?]/)[0].split('،')[0].trim();
  // A whole clause that already fits reads better than any truncation of it.
  if (out.length <= 62) return out.replace(/[،:\-–—\s]+$/, '');
  let words = out.split(/\s+/).filter(Boolean);
  if (words.length > maxWords) words = words.slice(0, maxWords);
  // A cut can land on a connector ("…ودورها ضمن مستلزمات"), which reads as an
  // unfinished sentence. Drop trailing connectors until the phrase stands alone.
  const CONNECTOR = /^(ضمن|في|من|على|مع|عن|إلى|و|أو|التي|الذي|ودورها|بين|عند|حتى|كل|لكل|أي)$/;
  while (words.length > 2 && CONNECTOR.test(words[words.length - 1])) words.pop();
  return words.join(' ').replace(/[،:\-–—\s]+$/, '');
}

/* ---------- assemble ---------- */
const manifest = JSON.parse(fs.readFileSync('src/data/image-manifest.json', 'utf8'));
const meta = {};
for (const src of Object.keys(manifest).sort()) {
  if (/logo\./.test(src)) continue;               // logo keeps its brand alt, no title
  if (CURATED[src]) {
    meta[src] = { alt: CURATED[src][0], title: `${CURATED[src][1]} | ${BRAND}` };
    continue;
  }
  const c = blogCtx[src];
  const n = src.match(/-([123])-\d{10,}/)?.[1];   // -1 cover, -2/-3 inline
  if (c) {
    const topic = phrase(c.title, 7);
    // Generic or call-to-action headings ("الخاتمة", "هل تبحث عن…؟") describe
    // the article's structure, not the picture — skip them and fall back to a
    // positional label so the alt still says something about the image.
    const generic = /^(هل|خاتمة|الخاتمة|مقدمة|المقدمة|ملخص|الملخص|في النهاية|أسئلة|الأسئلة|نصائح ختامية)/;
    const usable = c.section && c.section.length >= 8 && !generic.test(c.section);
    const section = usable ? phrase(c.section, 6) : '';
    let alt, label;
    if (section)        { alt = `${section} ضمن ${topic}`;            label = `${section} — ${topic}`; }
    else if (n === '1') { alt = `${topic} — صورة الغلاف`;             label = topic; }
    else                { alt = `${topic} — صورة توضيحية ${n || 2}`;  label = `${topic} (${n || 2})`; }
    meta[src] = { alt, title: `${label} | ${BRAND}` };
    continue;
  }
  // no context at all — fall back to the (descriptive) filename slug
  const slug = src.split('/').pop().replace(/\.[^.]+$/, '').replace(/-\d{10,}-\d+$/, '').replace(/-/g, ' ');
  meta[src] = { alt: slug, title: `${slug} | ${BRAND}` };
}

/* ---------- guarantee uniqueness ---------- */
function dedupe(field) {
  const seen = new Map();
  for (const [src, m] of Object.entries(meta)) {
    let v = m[field], i = 1;
    while (seen.has(v)) {
      i++;
      const suffix = field === 'alt' ? ` (${i})` : ` (${i})`;
      v = m[field] + suffix;
    }
    seen.set(v, src);
    m[field] = v;
  }
}
dedupe('alt');
dedupe('title');

fs.writeFileSync(OUT, JSON.stringify(meta, null, 1));
const alts = new Set(Object.values(meta).map((m) => m.alt));
const titles = new Set(Object.values(meta).map((m) => m.title));
console.log('images with metadata :', Object.keys(meta).length);
console.log('unique alt texts     :', alts.size);
console.log('unique title texts   :', titles.size);
console.log('alt === title cases  :', Object.values(meta).filter((m) => m.alt === m.title).length);
console.log('written              :', OUT);
