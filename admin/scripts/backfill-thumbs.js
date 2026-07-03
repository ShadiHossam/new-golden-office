// One-off: generate missing thumbnails for media uploaded before thumbnail
// generation existed. Run with: npm run media:thumbs
const path = require('path');
const { loadJson, saveJson } = require('../lib/db');
const { generateThumbnail } = require('../lib/image-variants');

const IMAGES_DIR = path.join(__dirname, '..', '..', 'images');

async function main() {
  const media = loadJson('media.json');
  let updated = 0;

  for (const item of media) {
    if (item.thumb_url) continue;
    const thumbUrl = await generateThumbnail(IMAGES_DIR, item.filename);
    if (thumbUrl) {
      item.thumb_url = thumbUrl;
      updated++;
      console.log(`✓ ${item.filename}`);
    } else {
      console.log(`✗ ${item.filename} (skipped — could not generate)`);
    }
  }

  if (updated) saveJson('media.json', media);
  console.log(`Done. ${updated}/${media.length} thumbnail(s) generated.`);
}

main();
