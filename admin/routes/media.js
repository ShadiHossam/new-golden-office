const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { addMedia, getMedia, saveMedia, deleteMedia, getMediaById } = require('../lib/db');
const { logActivity } = require('../lib/activity');

const router = express.Router();

const IMAGES_DIR = path.join(__dirname, '..', '..', 'images');
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;
const PER_PAGE = 24;

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${base}-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only images are allowed.'));
  }
});

router.get('/', (req, res) => {
  const all = getMedia().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const search = req.query.q || '';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const filtered = search
    ? all.filter(m =>
        (m.filename || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.alt || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.title || '').toLowerCase().includes(search.toLowerCase())
      )
    : all;

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const media = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  res.render('media/library', {
    pageTitle: 'Media Library',
    headExtra: '',
    headerActions: '',
    breadcrumb: null,
    media,
    search,
    totalCount,
    pagination: { page: safePage, totalPages, total: totalCount, hasPrev: safePage > 1, hasNext: safePage < totalPages }
  });
});

// AJAX upload — returns JSON
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.json({ success: false, error: 'No file received.' });
  const item = addMedia({
    filename: req.file.filename,
    original_name: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/images/${req.file.filename}`,
    alt: '',
    title: '',
    caption: ''
  });
  logActivity(req.session.username, 'Media uploaded', req.file.originalname);
  res.json({ success: true, id: item.id, url: `/images/${req.file.filename}`, filename: req.file.filename });
});

// Update alt/title/caption via API (lightbox save)
router.post('/api/:id/update', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const all = getMedia();
  const idx = all.findIndex(m => m.id === id);
  if (idx < 0) return res.json({ success: false, error: 'Not found.' });
  if (req.body.alt_text !== undefined) all[idx].alt = (req.body.alt_text || '').trim();
  if (req.body.title !== undefined) all[idx].title = (req.body.title || '').trim();
  if (req.body.caption !== undefined) all[idx].caption = (req.body.caption || '').trim();
  saveMedia(all);
  res.json({ success: true });
});

// Bulk delete API
router.post('/api/bulk-delete', (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number) : [];
  if (!ids.length) return res.json({ success: false, error: 'No IDs provided.' });
  let deleted = 0;
  ids.forEach(id => {
    const m = getMediaById(id);
    if (m) {
      const fp = path.join(IMAGES_DIR, m.filename);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
      deleteMedia(id);
      deleted++;
    }
  });
  logActivity(req.session.username, 'Media deleted', `${deleted} file(s) bulk deleted`);
  res.json({ success: true, deleted });
});

// Delete single file
router.post('/:id/delete', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const media = getMediaById(id);
  if (!media) { req.flash('danger', 'File not found.'); return res.redirect('/2ef65f179f12439e317a23628b016653/media'); }
  const filePath = path.join(IMAGES_DIR, media.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  deleteMedia(id);
  logActivity(req.session.username, 'Media deleted', media.filename);
  req.flash('success', `"${media.filename}" deleted.`);
  res.redirect('/2ef65f179f12439e317a23628b016653/media');
});

// Legacy alt update
router.post('/:id/alt', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const all = getMedia();
  const idx = all.findIndex(m => m.id === id);
  if (idx >= 0) { all[idx].alt = (req.body.alt || '').trim(); saveMedia(all); }
  res.json({ success: true });
});

module.exports = router;
