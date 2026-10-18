// Minifies the tracker + cookie banner sources in src/tracking/ into
// public/js/, which is what BaseLayout loads. Run after editing either source:
//   node scripts/build-tracking.mjs
// Commit both the source and the generated file (same pattern as
// build-icon-subset.mjs). target=es5 makes esbuild fail on any syntax old
// Android browsers can't run, so a passing build doubles as the ES5 check.
import { buildSync } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const BUDGET = 7 * 1024; // gzipped, both files together (main.js is ~3 KB, GTM ~100 KB)
let total = 0;

for (const name of ['ngo-track.js', 'ngo-consent.js']) {
  const outfile = join(root, 'public/js', name);
  buildSync({
    entryPoints: [join(root, 'src/tracking', name)],
    outfile,
    minify: true,
    target: 'es5',
    charset: 'utf8',
    legalComments: 'none',
    logLevel: 'error',
  });
  const gz = gzipSync(readFileSync(outfile)).length;
  total += gz;
  console.log(`${name}: ${gz} B gzipped`);
}

console.log(`total: ${total} B gzipped (budget ${BUDGET} B)`);
if (total > BUDGET) {
  console.error('Over the size budget.');
  process.exit(1);
}
