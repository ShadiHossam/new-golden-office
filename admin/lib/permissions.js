const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.ADMIN_DATA_DIR || path.join(__dirname, '..', 'data');
const PERMISSIONS_PATH = path.join(DATA_DIR, 'permissions.json');
const ADMIN_PREFIX = '/2ef65f179f12439e317a23628b016653';

// All permission keys grouped by section — scoped to what NGO admin actually has.
const PERMISSION_GROUPS = [
  {
    key: 'pages',
    label: 'Pages',
    permissions: [
      { key: 'pages.view', label: 'View pages' },
      { key: 'pages.create', label: 'Create pages' },
      { key: 'pages.edit', label: 'Edit pages' },
      { key: 'pages.delete', label: 'Delete pages' },
      { key: 'pages.publish', label: 'Publish / unpublish' }
    ]
  },
  {
    key: 'blog',
    label: 'Blog',
    permissions: [
      { key: 'blog.view', label: 'View blog posts' },
      { key: 'blog.create', label: 'Create posts' },
      { key: 'blog.edit', label: 'Edit posts' },
      { key: 'blog.delete', label: 'Delete posts' },
      { key: 'blog.publish', label: 'Publish / unpublish' }
    ]
  },
  {
    key: 'seo',
    label: 'SEO',
    permissions: [
      { key: 'seo.view', label: 'View SEO manager' },
      { key: 'seo.edit', label: 'Edit meta tags' },
      { key: 'seo.link_checker', label: 'Run link checker' }
    ]
  },
  {
    key: 'media',
    label: 'Media',
    permissions: [
      { key: 'media.view', label: 'View media library' },
      { key: 'media.upload', label: 'Upload files' },
      { key: 'media.delete', label: 'Delete files' }
    ]
  },
  {
    key: 'structure',
    label: 'Site Structure',
    permissions: [
      { key: 'redirects.view', label: 'View redirects' },
      { key: 'redirects.manage', label: 'Manage redirects' }
    ]
  },
  {
    key: 'system',
    label: 'System',
    permissions: [
      { key: 'calendar.view', label: 'View calendar' },
      { key: 'activity.view_all', label: 'View all activity' },
      { key: 'activity.view_own', label: 'View own activity' },
      { key: 'users.view', label: 'View users' },
      { key: 'users.manage', label: 'Manage users & roles' },
      { key: 'settings.view', label: 'View settings' },
      { key: 'settings.manage', label: 'Edit settings' }
    ]
  }
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key));

// Built-in defaults, used if permissions.json doesn't exist yet.
const BUILTIN_DEFAULTS = {
  admin: Object.fromEntries(ALL_PERMISSION_KEYS.map(k => [k, true])),
  editor: Object.fromEntries(ALL_PERMISSION_KEYS.map(k => {
    if (['users.view', 'users.manage', 'settings.view', 'settings.manage', 'activity.view_all'].includes(k)) return [k, false];
    return [k, true];
  })),
  viewer: Object.fromEntries(ALL_PERMISSION_KEYS.map(k => {
    const allowed = ['pages.view', 'blog.view', 'seo.view', 'media.view', 'redirects.view', 'calendar.view', 'activity.view_own'];
    return [k, allowed.includes(k)];
  }))
};

const BUILTIN_ROLE_META = {
  admin:  { label: 'Administrator', description: 'Full access to every feature' },
  editor: { label: 'Editor',        description: 'Manages pages, SEO, media and redirects' },
  viewer: { label: 'Viewer',        description: 'Read-only access to content areas' }
};
const BUILTIN_ROLE_KEYS = Object.keys(BUILTIN_ROLE_META);

function isBuiltinRole(role) {
  return BUILTIN_ROLE_KEYS.includes(role);
}

function slugifyRoleValue(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
}

function loadPermissions() {
  try {
    if (fs.existsSync(PERMISSIONS_PATH)) {
      return JSON.parse(fs.readFileSync(PERMISSIONS_PATH, 'utf-8'));
    }
  } catch (e) {}
  return null;
}

function savePermissions(data) {
  const tmpPath = PERMISSIONS_PATH + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, PERMISSIONS_PATH);
}

function getRoleDefaults(role) {
  const saved = loadPermissions();
  const builtIn = BUILTIN_DEFAULTS[role] || BUILTIN_DEFAULTS.viewer;
  if (saved && saved.roles && saved.roles[role]) {
    if (BUILTIN_DEFAULTS[role]) return { ...builtIn, ...saved.roles[role] };
    return saved.roles[role];
  }
  return builtIn;
}

function getAllRoleDefaults() {
  const saved = loadPermissions();
  const result = {};

  for (const role of BUILTIN_ROLE_KEYS) {
    const base = { ...BUILTIN_DEFAULTS[role] };
    if (saved && saved.roles && saved.roles[role]) Object.assign(base, saved.roles[role]);
    ALL_PERMISSION_KEYS.forEach(k => { if (!(k in base)) base[k] = false; });
    result[role] = base;
  }

  if (saved && saved.roles) {
    for (const role of Object.keys(saved.roles)) {
      if (BUILTIN_ROLE_KEYS.includes(role)) continue;
      const base = {};
      ALL_PERMISSION_KEYS.forEach(k => { base[k] = saved.roles[role][k] === true; });
      result[role] = base;
    }
  }

  return result;
}

function saveRoleDefaults(roleDefaults) {
  const saved = loadPermissions() || {};
  saved.roles = { ...(saved.roles || {}), ...roleDefaults };
  savePermissions(saved);
}

function getAllRoles() {
  const saved = loadPermissions() || {};
  const meta = saved.role_meta || {};
  const roleDefs = saved.roles || {};
  const list = [];

  for (const value of BUILTIN_ROLE_KEYS) {
    const m = meta[value] || {};
    list.push({
      value,
      label: m.label || BUILTIN_ROLE_META[value].label,
      description: m.description || BUILTIN_ROLE_META[value].description,
      builtin: true
    });
  }

  const customRoles = Object.keys(roleDefs)
    .filter(v => !BUILTIN_ROLE_KEYS.includes(v))
    .map(value => {
      const m = meta[value] || {};
      return { value, label: m.label || value, description: m.description || '', builtin: false };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return list.concat(customRoles);
}

function createCustomRole({ label, description, basedOnRole }) {
  const trimmedLabel = String(label || '').trim();
  if (!trimmedLabel) throw new Error('Role name is required.');

  let value = slugifyRoleValue(trimmedLabel);
  if (!value) throw new Error('Invalid role name.');
  if (BUILTIN_ROLE_KEYS.includes(value)) value = value + '_custom';

  const saved = loadPermissions() || {};
  saved.roles = saved.roles || {};
  saved.role_meta = saved.role_meta || {};

  let finalValue = value;
  let n = 2;
  while (saved.roles[finalValue]) { finalValue = value + '_' + n; n++; }

  const seedSource = basedOnRole && (BUILTIN_DEFAULTS[basedOnRole] || saved.roles[basedOnRole]);
  const seeded = {};
  ALL_PERMISSION_KEYS.forEach(k => { seeded[k] = seedSource ? seedSource[k] === true : false; });

  saved.roles[finalValue] = seeded;
  saved.role_meta[finalValue] = { label: trimmedLabel, description: String(description || '').trim() };

  savePermissions(saved);
  return finalValue;
}

function updateRoleMeta(value, { label, description }) {
  const saved = loadPermissions() || {};
  saved.role_meta = saved.role_meta || {};
  if (!saved.role_meta[value]) saved.role_meta[value] = {};
  if (label !== undefined) saved.role_meta[value].label = String(label || '').trim();
  if (description !== undefined) saved.role_meta[value].description = String(description || '').trim();
  savePermissions(saved);
}

function deleteCustomRole(value, { usersWithRole = [], reassignTo = null } = {}) {
  if (BUILTIN_ROLE_KEYS.includes(value)) throw new Error('Built-in roles cannot be deleted.');
  if (usersWithRole.length > 0 && !reassignTo) throw new Error('Users still have this role.');

  const saved = loadPermissions() || {};
  if (saved.roles) delete saved.roles[value];
  if (saved.role_meta) delete saved.role_meta[value];
  savePermissions(saved);
}

function getUserOverrides(userId) {
  const saved = loadPermissions();
  if (saved && saved.users && saved.users[String(userId)]) return saved.users[String(userId)];
  return null;
}

function saveUserOverrides(userId, overrides) {
  const saved = loadPermissions() || {};
  if (!saved.users) saved.users = {};
  if (overrides === null) delete saved.users[String(userId)];
  else saved.users[String(userId)] = overrides;
  savePermissions(saved);
}

function hasPermission(user, permissionKey) {
  if (!user) return false;
  const overrides = getUserOverrides(user.id);
  if (overrides && permissionKey in overrides) return overrides[permissionKey];
  const rolePerms = getRoleDefaults(user.role || 'viewer');
  return rolePerms[permissionKey] === true;
}

function getEffectivePermissions(user) {
  const rolePerms = getRoleDefaults(user.role || 'viewer');
  const overrides = getUserOverrides(user.id);
  const effective = { ...rolePerms };
  if (overrides) for (const key of Object.keys(overrides)) effective[key] = overrides[key];
  return effective;
}

function requirePermission(permissionKey) {
  return (req, res, next) => {
    const { loadJson } = require('./db');
    const users = loadJson('users.json');
    const user = users.find(u => u.id === req.session.userId);
    if (!user) return res.redirect(`${ADMIN_PREFIX}/login`);
    if (!hasPermission(user, permissionKey)) {
      req.flash('danger', 'You do not have permission to access this feature.');
      return res.redirect(ADMIN_PREFIX);
    }
    next();
  };
}

// Same check as requirePermission, but responds with JSON 403 instead of a
// redirect — for AJAX/API endpoints where a redirect would break the caller.
function requirePermissionJson(permissionKey) {
  return (req, res, next) => {
    const { loadJson } = require('./db');
    const users = loadJson('users.json');
    const user = users.find(u => u.id === req.session.userId);
    if (!user) return res.status(401).json({ success: false, error: 'Not authenticated.' });
    if (!hasPermission(user, permissionKey)) {
      return res.status(403).json({ success: false, error: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

module.exports = {
  PERMISSION_GROUPS,
  ALL_PERMISSION_KEYS,
  BUILTIN_DEFAULTS,
  BUILTIN_ROLE_META,
  BUILTIN_ROLE_KEYS,
  isBuiltinRole,
  getRoleDefaults,
  getAllRoleDefaults,
  saveRoleDefaults,
  getAllRoles,
  createCustomRole,
  updateRoleMeta,
  deleteCustomRole,
  getUserOverrides,
  saveUserOverrides,
  hasPermission,
  getEffectivePermissions,
  requirePermission,
  requirePermissionJson
};
