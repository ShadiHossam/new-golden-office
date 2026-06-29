const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { getUser, getUserById, updateUser, saveResetToken, getResetToken, deleteResetToken } = require('../lib/db');
const { clearSessionCookie } = require('../lib/session-cookie');

const router = express.Router();
const ADMIN_PREFIX = '/2ef65f179f12439e317a23628b016653';
const BCRYPT_COST = 12;

function pwFingerprint(hash) {
  return crypto.createHash('sha256').update(String(hash || '')).digest('hex').slice(0, 16);
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => (req.body.username ? req.body.username.toLowerCase() + ':' : '') + req.ip,
  message: 'Too many login attempts. Try again in 15 minutes.'
});

router.get('/login', (req, res) => {
  const userId = req.session.userId;
  const validUser = userId ? getUserById(userId) : null;

  if (userId && !validUser) {
    return req.session.destroy(() => {
      clearSessionCookie(res);
      res.render('login', { error: null, success: null, alreadyLoggedIn: false, loggedInAs: null });
    });
  }

  res.render('login', {
    error: null,
    success: null,
    alreadyLoggedIn: !!validUser,
    loggedInAs: validUser ? validUser.username : null
  });
});

const DUMMY_HASH = '$2b$12$u1BvHFIPCkknwaFzE1YX3.dee3HazxE3DRlrj0obOwZd2zMVkQUFa';

router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  const user = getUser(username);
  const passwordOk = bcrypt.compareSync(password || '', user ? user.password_hash : DUMMY_HASH);

  if (!user || !passwordOk) {
    return res.render('login', { error: 'Invalid username or password.', success: null, alreadyLoggedIn: false, loggedInAs: null });
  }

  const userId = user.id;
  const uname = user.username;
  const pwfp = pwFingerprint(user.password_hash);

  req.session.regenerate(err => {
    if (err) return res.render('login', { error: 'Session error. Please try again.', success: null, alreadyLoggedIn: false, loggedInAs: null });
    req.session.userId = userId;
    req.session.username = uname;
    req.session.pwfp = pwfp;
    req.session.createdAt = Date.now();
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    req.session.save(err2 => {
      if (err2) return res.render('login', { error: 'Session error. Please try again.', success: null, alreadyLoggedIn: false, loggedInAs: null });
      res.redirect(ADMIN_PREFIX);
    });
  });
});

function doLogout(req, res) {
  req.session.destroy(() => {
    clearSessionCookie(res);
    res.redirect(`${ADMIN_PREFIX}/login`);
  });
}
router.post('/logout', doLogout);
router.get('/logout', doLogout);

// Reset password
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

router.get('/reset-password', (req, res) => {
  if (req.session.userId) return res.redirect(ADMIN_PREFIX);
  res.render('auth/reset-request', { error: null, success: null });
});

router.post('/reset-password', resetLimiter, (req, res) => {
  const { username } = req.body;
  const user = getUser(username);
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    saveResetToken({ token, user_id: user.id, username: user.username, expires_at: expires, created_at: new Date().toISOString() });
    console.log(`[auth] Password reset token for: ${user.username}`);
    console.log(`[auth] Reset link: http://localhost:${process.env.PORT || 4001}${ADMIN_PREFIX}/reset-password/${token}`);
  }
  res.render('auth/reset-request', { error: null, success: 'If the account exists, a reset link has been printed to the server console.' });
});

router.get('/reset-password/:token', (req, res) => {
  const tokenData = getResetToken(req.params.token);
  if (!tokenData) return res.render('auth/reset-request', { error: 'Invalid or expired link.', success: null });
  res.render('auth/reset-form', { token: req.params.token, error: null });
});

router.post('/reset-password/:token', (req, res) => {
  const tokenData = getResetToken(req.params.token);
  if (!tokenData) return res.render('auth/reset-request', { error: 'Invalid or expired link.', success: null });

  const { new_password, confirm_password } = req.body;
  if (!new_password || new_password.length < 12) {
    return res.render('auth/reset-form', { token: req.params.token, error: 'Password must be at least 12 characters.' });
  }
  if (new_password !== confirm_password) {
    return res.render('auth/reset-form', { token: req.params.token, error: 'Passwords do not match.' });
  }

  const user = getUserById(tokenData.user_id);
  if (!user) return res.render('auth/reset-request', { error: 'User not found.', success: null });

  user.password_hash = bcrypt.hashSync(new_password, BCRYPT_COST);
  updateUser(user);
  deleteResetToken(req.params.token);
  res.render('login', { error: null, success: 'Password reset successfully. Please log in.', alreadyLoggedIn: false, loggedInAs: null });
});

// Change password (authenticated)
router.get('/password', (req, res) => {
  if (!req.session.userId) return res.redirect(`${ADMIN_PREFIX}/login`);
  const flash = req.flash('success')[0]
    ? { type: 'success', message: req.flash('success')[0] }
    : req.flash('danger')[0]
    ? { type: 'danger', message: req.flash('danger')[0] }
    : null;
  res.render('auth/change-password', {
    pageTitle: 'Change Password',
    headExtra: '',
    headerActions: '',
    user: req.session.username,
    currentPath: '/password',
    flash,
    csrfToken: req.session.csrfToken || ''
  });
});

router.post('/password', (req, res) => {
  if (!req.session.userId) return res.redirect(`${ADMIN_PREFIX}/login`);
  const token = req.body._csrf || req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) return res.status(403).send('Forbidden');

  const { current_password, new_password, confirm_password } = req.body;
  const user = getUserById(req.session.userId);

  if (!user || !bcrypt.compareSync(current_password, user.password_hash)) {
    req.flash('danger', 'Current password is incorrect.');
    return res.redirect(`${ADMIN_PREFIX}/password`);
  }
  if (!new_password || new_password.length < 12) {
    req.flash('danger', 'New password must be at least 12 characters.');
    return res.redirect(`${ADMIN_PREFIX}/password`);
  }
  if (new_password !== confirm_password) {
    req.flash('danger', 'Passwords do not match.');
    return res.redirect(`${ADMIN_PREFIX}/password`);
  }

  user.password_hash = bcrypt.hashSync(new_password, BCRYPT_COST);
  updateUser(user);
  const crypto = require('crypto');
  function pwFp(hash) { return crypto.createHash('sha256').update(String(hash || '')).digest('hex').slice(0, 16); }
  req.session.pwfp = pwFp(user.password_hash);
  req.flash('success', 'Password changed successfully.');
  res.redirect(ADMIN_PREFIX);
});

module.exports = router;
