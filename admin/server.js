const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const helmet = require('helmet');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const flash = require('connect-flash');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const seoRoutes = require('./routes/seo');
const mediaRoutes = require('./routes/media');
const settingsRoutes = require('./routes/settings');
const activityRoutes = require('./routes/activity');
const redirectsRoutes = require('./routes/redirects');
const usersRoutes = require('./routes/users');
const calendarRoutes = require('./routes/calendar');
const { getUserById } = require('./lib/db');
const { getEffectivePermissions, getAllRoles } = require('./lib/permissions');

const app = express();
const PORT = process.env.PORT || 4001;
const ADMIN_PREFIX = '/2ef65f179f12439e317a23628b016653';

app.set('trust proxy', 1);

// Prevent admin from being cached or indexed
app.use((req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  next();
});

// CSP nonce
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`, "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Generate persistent session secret
const SECRET_PATH = path.join(__dirname, 'data', '.session-secret');
let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (fs.existsSync(SECRET_PATH)) {
    sessionSecret = fs.readFileSync(SECRET_PATH, 'utf-8').trim();
  } else {
    sessionSecret = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(SECRET_PATH, sessionSecret);
  }
}

const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });

// Idle timeout: force logout after 8h of inactivity (rolling: true resets on each response).
// Absolute cap: hard 3-day ceiling regardless of activity — checked in authRequired below.
const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000;
const ABSOLUTE_SESSION_MS = 3 * 24 * 60 * 60 * 1000;

app.use(session({
  store: new FileStore({ path: sessionsDir, ttl: IDLE_TIMEOUT_MS / 1000, retries: 1, logFn: () => {} }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  name: 'ngo_sid',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: IDLE_TIMEOUT_MS
  }
}));

app.use(flash());
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve admin static assets
app.use(`${ADMIN_PREFIX}/public`, express.static(path.join(__dirname, 'public')));

// Serve uploaded media from the site's images folder
app.use(`${ADMIN_PREFIX}/images`, express.static(path.join(__dirname, '..', 'images')));

// Auth middleware
function pwFingerprint(hash) {
  return crypto.createHash('sha256').update(String(hash || '')).digest('hex').slice(0, 16);
}

function authRequired(req, res, next) {
  if (!req.session.userId) {
    return res.redirect(`${ADMIN_PREFIX}/login`);
  }
  // Hard absolute session age cap — force re-login even for active sessions
  if (req.session.createdAt && (Date.now() - req.session.createdAt) > ABSOLUTE_SESSION_MS) {
    return req.session.destroy(() => res.redirect(`${ADMIN_PREFIX}/login`));
  }
  const user = getUserById(req.session.userId);
  if (!user) {
    req.session.destroy(() => res.redirect(`${ADMIN_PREFIX}/login`));
    return;
  }
  if (req.session.pwfp && req.session.pwfp !== pwFingerprint(user.password_hash)) {
    req.session.destroy(() => res.redirect(`${ADMIN_PREFIX}/login`));
    return;
  }
  res.locals.user = user.username;
  res.locals.currentPath = req.path;
  res.locals.flash = req.flash('success')[0]
    ? { type: 'success', message: req.flash('success')[0] }
    : req.flash('danger')[0]
    ? { type: 'danger', message: req.flash('danger')[0] }
    : null;
  req.currentUser = user;
  res.locals.permissions = getEffectivePermissions(user);
  const roleInfo = getAllRoles().find(r => r.value === (user.role || 'viewer'));
  res.locals.userRoleLabel = roleInfo ? roleInfo.label : (user.role || 'Viewer');
  next();
}

// Inject CSRF token into locals for all authenticated views
app.use((req, res, next) => {
  if (!res.locals.csrfToken) {
    if (!req.session.csrfToken) {
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
  }
  next();
});

// CSRF verification for POST/PUT/DELETE
function csrfCheck(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const token = req.body._csrf || req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).render('error', { pageTitle: 'Forbidden', statusCode: 403, message: 'Invalid CSRF token. Go back and try again.', user: res.locals.user || '', currentPath: '', flash: null, csrfToken: '' });
  }
  next();
}

// Rate limiter for all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(ADMIN_PREFIX, globalLimiter);

// Mount auth routes (no auth required)
app.use(ADMIN_PREFIX, authRoutes);

// Apply auth + CSRF to all protected routes
app.use(`${ADMIN_PREFIX}`, authRequired, csrfCheck);
app.use(`${ADMIN_PREFIX}`, dashboardRoutes);
app.use(`${ADMIN_PREFIX}/seo`, seoRoutes);
app.use(`${ADMIN_PREFIX}/media`, mediaRoutes);
app.use(`${ADMIN_PREFIX}/settings`, settingsRoutes);
app.use(`${ADMIN_PREFIX}/activity`, activityRoutes);
app.use(`${ADMIN_PREFIX}/redirects`, redirectsRoutes);
app.use(`${ADMIN_PREFIX}/users`, usersRoutes);
app.use(`${ADMIN_PREFIX}/calendar`, calendarRoutes);

// Root redirect
app.get('/', (req, res) => res.redirect(ADMIN_PREFIX));

// 404
app.use((req, res) => {
  res.status(404).render('error', {
    pageTitle: 'Page Not Found',
    statusCode: 404,
    message: 'The page you are looking for does not exist.',
    user: res.locals.user || '',
    currentPath: '',
    flash: null,
    csrfToken: res.locals.csrfToken || ''
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).render('error', {
    pageTitle: 'Server Error',
    statusCode: 500,
    message: 'An internal server error occurred.',
    user: res.locals.user || '',
    currentPath: '',
    flash: null,
    csrfToken: res.locals.csrfToken || ''
  });
});

app.listen(PORT, () => {
  console.log(`NGO Admin running at http://localhost:${PORT}${ADMIN_PREFIX}`);
  console.log(`Login at http://localhost:${PORT}${ADMIN_PREFIX}/login`);
});
