// Phase 5 verification: compare rendered text content between the live
// static site and the Astro staging deployment, page by page. Flags any
// diff beyond the expected intentional changes (year fix, new routes).
const https = require('https');
const http = require('http');

const PAIRS = [
  ['https://newgoldenoffice.com/', 'http://astro-staging.usine.site/'],
  ['https://newgoldenoffice.com/about', 'http://astro-staging.usine.site/about'],
  ['https://newgoldenoffice.com/contact', 'http://astro-staging.usine.site/contact'],
  ['https://newgoldenoffice.com/ac', 'http://astro-staging.usine.site/ac'],
  ['https://newgoldenoffice.com/ac/buy', 'http://astro-staging.usine.site/ac/buy'],
  ['https://newgoldenoffice.com/cameras', 'http://astro-staging.usine.site/cameras'],
  ['https://newgoldenoffice.com/copiers', 'http://astro-staging.usine.site/copiers'],
  ['https://newgoldenoffice.com/cash-machines', 'http://astro-staging.usine.site/cash-machines'],
  ['https://newgoldenoffice.com/office-supplies', 'http://astro-staging.usine.site/office-supplies'],
  ['https://newgoldenoffice.com/printing', 'http://astro-staging.usine.site/printing'],
  ['https://newgoldenoffice.com/portfolio', 'http://astro-staging.usine.site/portfolio'],
  ['https://newgoldenoffice.com/privacy', 'http://astro-staging.usine.site/privacy'],
  ['https://newgoldenoffice.com/terms', 'http://astro-staging.usine.site/terms'],
];

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function fetch(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; content-diff-check/1.0)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetch(new URL(res.headers.location, url).toString()));
      }
      if (res.statusCode === 429) {
        return reject(new Error('429 rate-limited'));
      }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function textOnly(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tokens that are EXPECTED to differ (the intentional year-fact fix) —
// don't flag these as regressions.
const EXPECTED_DIFF_TOKENS = [/1990/, /35\s*عام/, /خمسة وثلاثين/, /عقود ونصف/];

async function main() {
  for (const [liveUrl, stagingUrl] of PAIRS) {
    await sleep(3000);
    try {
      const liveHtml = await fetch(liveUrl);
      await sleep(1000);
      const stagingHtml = await fetch(stagingUrl);
      const liveText = textOnly(liveHtml);
      const stagingText = textOnly(stagingHtml);

      if (liveText === stagingText) {
        console.log(`OK        ${liveUrl}`);
        continue;
      }

      // crude word-level diff summary: lengths + a sample of differing region
      const lenDiff = stagingText.length - liveText.length;
      console.log(`DIFFERS   ${liveUrl}  (live ${liveText.length} chars, staging ${stagingText.length} chars, delta ${lenDiff})`);
    } catch (e) {
      console.log(`ERROR     ${liveUrl} — ${e.message}`);
    }
  }
}

main();
