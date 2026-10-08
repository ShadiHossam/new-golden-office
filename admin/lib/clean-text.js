// Strips the marks that make generated copy read as AI-written, so every
// post/page the CMS publishes goes out clean without anyone having to remember.
//
// 1. Hidden characters (same set cleanpaste.site's basic clean targets):
//    zero-width spaces/joiners, bidi marks and embeddings, BOM, variation
//    selectors, tag characters, soft hyphen, private-use characters. Odd-width
//    spaces become a normal space; "…" becomes "...".
// 2. Em dashes. Arabic prose doesn't use them, so each one is swapped for what
//    a person would have typed in that spot: a comma in a sentence, a colon in
//    a heading/title or after a key-point <strong> title, "إلى" in a range.
//    The key-points card (enhance-post-html.ts) accepts the colon.

const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFE00-\uFE0F\uFEFF\uE000-\uF8FF]|[\u{E0000}-\u{E007F}]/gu;
const ODD_SPACES = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;

const DAYS = '(?:السبت|الأحد|الاثنين|الثلاثاء|الأربعاء|الخميس|الجمعة)';
const BRAND = '(?:نيو جولدن أوفيس|New Golden Office)';

function cleanInvisible(s) {
  return s
    .replace(/[\u2028\u2029]/g, '\n')
    .replace(INVISIBLE, '')
    .replace(ODD_SPACES, ' ')
    .replace(/\u2026/g, '...')
    .replace(/\u27F6/g, '->');
}

// Start index of the heading element the text before `pos` is still inside, or -1.
function openHeadingStart(text, pos) {
  const before = text.slice(Math.max(0, pos - 400), pos);
  const m = before.match(/<(h[1-6])\b[^>]*>(?:(?!<\/\1>)[\s\S])*$/);
  return m ? pos - before.length + m.index : -1;
}

function dedash(text, { isTitle = false } = {}) {
  // Paired dashes wrapping a comma list read best as parentheses.
  text = text.replace(
    /(?<![>\d])[ \u00A0]+\u2014[ \u00A0]+([^\u2014<>.؟!\n"]{3,120}?،[^\u2014<>.؟!\n"]{0,120}?)[ \u00A0]+\u2014[ \u00A0]+/g,
    (_, inner) => ` (${inner.trim()}) `,
  );

  const usedHeadings = new Set();
  let titleColonUsed = false;
  let out = '';
  let pos = 0;
  const re = /[ \t\u00A0]*\u2014[ \t\u00A0]*/g;
  let m;
  while ((m = re.exec(text))) {
    const prev = text.slice(0, m.index);
    const next = text.slice(m.index + m[0].length);
    let rep;
    if (/>\s*$/.test(prev) && /^\s*</.test(next)) {
      rep = m[0]; // empty table cell placeholder
    } else if (/<\/(strong|b)>\s*$/.test(prev)) {
      rep = ': ';
    } else if (/\d\s*$/.test(prev) && /^\s*\d/.test(next)) {
      rep = ' إلى ';
    } else if (new RegExp(DAYS + '\\s*$').test(prev) && new RegExp('^\\s*' + DAYS).test(next)) {
      rep = ' إلى ';
    } else if (/(\d|ص|م|صباحًا|صباحاً|مساءً)\s*$/.test(prev) && /^\s*\d/.test(next) && /\d/.test(prev.slice(-15))) {
      rep = ' إلى ';
    } else if (/^\s*\+?\d{8,}/.test(next)) {
      rep = ': ';
    } else if (/(&copy;|\u00A9)\s*\{?\w*\}?\s*$/.test(prev)) {
      rep = ' ';
    } else if (/[،,:؛.]\s*$/.test(prev)) {
      rep = ' ';
    } else if (/^\s*[،,.:؛]/.test(next)) {
      rep = '';
    } else if (new RegExp('^\\s*' + BRAND + '\\s+[^\\s"\'<|]').test(next)) {
      rep = '. ';
    } else if (!prev.trim() || /(["'`]|<[a-zA-Z][^>]*>)\s*$/.test(prev)) {
      rep = '';
    } else {
      const h = openHeadingStart(text, m.index);
      if (h >= 0 && !usedHeadings.has(h)) {
        usedHeadings.add(h);
        rep = ': ';
      } else if (h < 0 && isTitle && !titleColonUsed) {
        titleColonUsed = true;
        rep = ': ';
      } else {
        rep = '، ';
      }
    }
    out += text.slice(pos, m.index) + rep;
    pos = m.index + m[0].length;
  }
  out += text.slice(pos);
  return out.replace(/،\s*،/g, '،').replace(/:\s*،/g, ':').replace(/\.\s\./g, '.');
}

function cleanText(value, opts) {
  if (typeof value !== 'string' || !value) return value;
  return dedash(cleanInvisible(value), opts);
}

const TITLE_FIELDS = new Set(['title', 'seo_title', 'og_title']);
const TEXT_FIELDS = ['title', 'seo_title', 'og_title', 'body_html', 'excerpt', 'meta_description', 'og_description', 'meta_keywords', 'tags'];

// Returns a copy of a post/page record with every visible text field cleaned.
function cleanRecord(record) {
  const out = { ...record };
  for (const key of TEXT_FIELDS) {
    if (key in out) out[key] = cleanText(out[key], { isTitle: TITLE_FIELDS.has(key) });
  }
  return out;
}

module.exports = { cleanText, cleanRecord, cleanInvisible, dedash };
