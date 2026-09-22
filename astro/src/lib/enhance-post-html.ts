import * as cheerio from 'cheerio';
import manifest from '../data/image-manifest.json';
import imageMeta from '../data/image-meta.json';

type Entry = { w: number; h: number; variants: [number, string][] };
type Meta = { alt: string; title: string };
const MANIFEST = manifest as Record<string, Entry>;
const META = imageMeta as Record<string, Meta>;

/** Matches the `content` preset in src/components/Img.astro. */
const DEFAULT_SIZES = '(max-width: 860px) 100vw, 772px';

/**
 * Rewrites <img> tags inside stored post HTML (blog body_html, which the admin
 * CMS writes) so they get the same treatment as images in .astro templates:
 * lazy loading, async decoding, intrinsic width/height, and a srcset pointing
 * at the generated variants.
 *
 * Images not in the manifest still get loading/decoding — they just don't get
 * a srcset, so an image added through the CMS after the last
 * `node scripts/optimize-images.mjs` run degrades gracefully instead of breaking.
 */
export function enhanceImages(html: string, sizes: string = DEFAULT_SIZES): string {
  if (!html) return html;
  const $ = cheerio.load(html, null, false);

  $('img').each((_, el) => {
    const $el = $(el);
    if (!$el.attr('loading')) $el.attr('loading', 'lazy');
    if (!$el.attr('decoding')) $el.attr('decoding', 'async');

    const src = ($el.attr('src') || '').split('?')[0];
    const key = src.replace(/^https?:\/\/(www\.)?newgoldenoffice\.com/, '');

    // Same per-image alt/title map the .astro templates use, so a picture reads
    // identically whether it came from a template or from stored post HTML.
    const meta = META[key];
    if (meta) {
      $el.attr('alt', meta.alt);
      $el.attr('title', meta.title);
    }

    const entry = MANIFEST[key];
    if (!entry) return;

    $el.attr('width', String(entry.w));
    $el.attr('height', String(entry.h));

    if (entry.variants.length) {
      $el.attr('src', entry.variants[entry.variants.length - 1][1]);
      $el.attr('srcset', entry.variants.map(([w, u]) => `${u} ${w}w`).join(', '));
      $el.attr('sizes', sizes);
    }
  });

  return $.html();
}

/**
 * Wraps every <table> in stored post HTML in a horizontally scrollable div, so
 * a wide comparison table scrolls inside the article on a phone instead of
 * pushing the whole page wider than the screen.
 */
export function wrapTables(html: string): string {
  if (!html) return html;
  const $ = cheerio.load(html, null, false);
  $("table").each((_, el) => {
    const $el = $(el);
    if (!$el.parent().hasClass("bp-table-wrap")) $el.wrap("<div class=\"bp-table-wrap\"></div>");
  });
  return $.html();
}

/**
 * Removes heading-level skips inside stored post HTML.
 *
 * The page's own <h1> is the post title, so the first heading in the body must
 * be an <h2>. A few posts open with an <h3>"أهم النقاط" summary before the first
 * real <h2>, which reads as h1 -> h3 to a screen reader or a crawler. Each
 * heading is pulled up to at most one level below the previous one; nothing is
 * ever pushed deeper, so real sub-sections keep their nesting.
 */
export function normalizeHeadings(html: string): string {
  if (!html) return html;
  const $ = cheerio.load(html, null, false);

  let prev = 1; // the page <h1>
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = Number((el as { tagName: string }).tagName[1]);
    const fixed = level > prev + 1 ? prev + 1 : level;
    prev = fixed;
    if (fixed !== level) {
      const $el = $(el);
      $el.replaceWith(`<h${fixed}${attrString($el)}>${$el.html() ?? ''}</h${fixed}>`);
    }
  });

  return $.html();
}

function attrString($el: cheerio.Cheerio<any>): string {
  const attrs = $el.attr() ?? {};
  return Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join('');
}

export interface KeyPoint { title: string; detail: string }

/**
 * Pulls the "أهم النقاط" summary out of stored post HTML so the page can render
 * it as the expandable key-points card instead of an ordinary numbered chapter.
 *
 * Only the post's first heading counts, and only when a <ul> follows it within
 * a lead-in paragraph or two — a later section that happens to use the phrase
 * stays in the article. Each <li> written as "<strong>title</strong> — detail"
 * becomes a point that opens to show the detail; a <li> with no bold title is
 * kept as a plain point with nothing to open.
 */
export function extractKeyPoints(html: string): { html: string; points: KeyPoint[] } {
  if (!html) return { html, points: [] };
  const $ = cheerio.load(html, null, false);

  const heading = $.root().children('h1, h2, h3, h4, h5, h6').first();
  if (!heading.length || !heading.text().includes('أهم النقاط')) return { html, points: [] };

  const leadIns: cheerio.Cheerio<any>[] = [];
  let next = heading.next();
  while (next.length && next.is('p') && leadIns.length < 2) {
    leadIns.push(next);
    next = next.next();
  }
  if (!next.is('ul')) return { html, points: [] };

  const points: KeyPoint[] = [];
  next.children('li').each((_, li) => {
    const $li = $(li);
    const first = $li.contents().filter((_, n) => !(n.type === 'text' && !$(n).text().trim())).first();
    if (first.is('strong') || first.is('b')) {
      const title = first.html()?.trim() ?? '';
      first.remove();
      const detail = ($li.html() ?? '').trim().replace(/^[—–\-:،]\s*/, '').trim();
      points.push({ title, detail });
    } else {
      points.push({ title: ($li.html() ?? '').trim(), detail: '' });
    }
  });
  if (!points.length) return { html, points: [] };

  heading.remove();
  leadIns.forEach((p) => p.remove());
  next.remove();
  return { html: $.html(), points };
}
