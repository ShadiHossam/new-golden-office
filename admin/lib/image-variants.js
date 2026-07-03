const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const THUMB_WIDTH = 400;
const THUMB_QUALITY = 78;

function thumbsDir(imagesDir) {
  const dir = path.join(imagesDir, 'thumbs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function thumbFilename(originalFilename) {
  return path.basename(originalFilename, path.extname(originalFilename)) + '.webp';
}

// Generates a resized WebP thumbnail next to the original. Returns the
// thumbnail's public URL (relative to /images), or null if generation fails
// (e.g. non-raster formats like SVG, which sharp can't safely rasterize here).
async function generateThumbnail(imagesDir, originalFilename) {
  const srcPath = path.join(imagesDir, originalFilename);
  const outName = thumbFilename(originalFilename);
  const outPath = path.join(thumbsDir(imagesDir), outName);

  try {
    await sharp(srcPath)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(outPath);
    return `/images/thumbs/${outName}`;
  } catch (e) {
    return null;
  }
}

function deleteThumbnail(imagesDir, originalFilename) {
  const outPath = path.join(thumbsDir(imagesDir), thumbFilename(originalFilename));
  if (fs.existsSync(outPath)) {
    try { fs.unlinkSync(outPath); } catch (e) {}
  }
}

module.exports = { generateThumbnail, deleteThumbnail, THUMB_WIDTH };
