const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.ADMIN_DATA_DIR || path.join(__dirname, '..', 'data');

function loadJson(filename, fallback) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return fallback !== undefined ? fallback : [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return fallback !== undefined ? fallback : [];
  }
}

function saveJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

// Users
function getUser(username) {
  const users = loadJson('users.json');
  return users.find(u => u.username === username);
}

function getUserById(id) {
  const users = loadJson('users.json');
  return users.find(u => u.id === id);
}

function updateUser(user) {
  const users = loadJson('users.json');
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  saveJson('users.json', users);
}

// Media
function getMedia() { return loadJson('media.json'); }
function saveMedia(media) { saveJson('media.json', media); }

function addMedia(item) {
  const media = getMedia();
  item.id = media.length ? Math.max(...media.map(m => m.id)) + 1 : 1;
  item.created_at = new Date().toISOString();
  media.push(item);
  saveMedia(media);
  return item;
}

function deleteMedia(id) {
  const media = getMedia().filter(m => m.id !== id);
  saveMedia(media);
}

function getMediaById(id) {
  return getMedia().find(m => m.id === id);
}

// SEO pages
function getSeoPages() { return loadJson('seo.json'); }
function saveSeoPages(pages) { saveJson('seo.json', pages); }

function getSeoPageById(id) {
  return getSeoPages().find(p => p.id === id);
}

function updateSeoPage(page) {
  const pages = getSeoPages();
  const idx = pages.findIndex(p => p.id === page.id);
  if (idx >= 0) {
    pages[idx] = { ...pages[idx], ...page, updated_at: new Date().toISOString() };
  }
  saveSeoPages(pages);
  return pages[idx];
}

// Settings
function getSettings() {
  return loadJson('settings.json', {});
}

function saveSettings(data) {
  saveJson('settings.json', data);
}

// Reset tokens
const RESET_TOKENS_PATH = path.join(DATA_DIR, '.reset-tokens.json');

function getResetTokens() {
  if (!fs.existsSync(RESET_TOKENS_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(RESET_TOKENS_PATH, 'utf-8')); }
  catch (e) { return []; }
}

function hashToken(token) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

function saveResetToken(token) {
  const tokens = getResetTokens().filter(t => t.expires_at > new Date().toISOString());
  tokens.push({
    token_hash: hashToken(token.token),
    user_id: token.user_id,
    username: token.username,
    expires_at: token.expires_at,
    created_at: token.created_at
  });
  fs.writeFileSync(RESET_TOKENS_PATH, JSON.stringify(tokens, null, 2), 'utf-8');
}

function getResetToken(tokenValue) {
  const tokens = getResetTokens();
  const hashed = hashToken(tokenValue);
  return tokens.find(t => t.token_hash === hashed && t.expires_at > new Date().toISOString());
}

function deleteResetToken(tokenValue) {
  const hashed = hashToken(tokenValue);
  const tokens = getResetTokens().filter(t => t.token_hash !== hashed);
  fs.writeFileSync(RESET_TOKENS_PATH, JSON.stringify(tokens, null, 2), 'utf-8');
}

module.exports = {
  loadJson, saveJson,
  getUser, getUserById, updateUser,
  getMedia, saveMedia, addMedia, deleteMedia, getMediaById,
  getSeoPages, saveSeoPages, getSeoPageById, updateSeoPage,
  getSettings, saveSettings,
  saveResetToken, getResetToken, deleteResetToken
};
