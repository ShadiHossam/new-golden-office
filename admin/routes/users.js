const express = require('express');
const bcrypt = require('bcrypt');
const { loadJson, saveJson } = require('../lib/db');
const { logActivity } = require('../lib/activity');
const {
  PERMISSION_GROUPS,
  ALL_PERMISSION_KEYS,
  BUILTIN_ROLE_KEYS,
  isBuiltinRole,
  getAllRoleDefaults,
  saveRoleDefaults,
  getAllRoles,
  createCustomRole,
  updateRoleMeta,
  deleteCustomRole,
  getUserOverrides,
  saveUserOverrides,
  hasPermission,
  requirePermission
} = require('../lib/permissions');

const router = express.Router();
const ADMIN_PREFIX = '/2ef65f179f12439e317a23628b016653';
const BCRYPT_COST = 12;

router.use(requirePermission('users.view'));
const manage = requirePermission('users.manage');

function loadUsers() { return loadJson('users.json'); }
function saveUsers(users) { saveJson('users.json', users); }
function nextId(list) { return list.length ? Math.max(...list.map(u => u.id)) + 1 : 1; }

function countAdmins(users) {
  return users.filter(u => (u.role || 'viewer') === 'admin').length;
}
function wouldRemoveLastAdmin(users, id, newRole) {
  const target = users.find(u => u.id === id);
  if (!target || (target.role || 'viewer') !== 'admin') return false;
  if (newRole === 'admin') return false;
  return countAdmins(users) <= 1;
}
function publicUser(u) {
  return { id: u.id, username: u.username, role: u.role || 'viewer', created_at: u.created_at };
}
function countOverrides(userId) {
  const ov = getUserOverrides(userId);
  return ov ? Object.keys(ov).length : 0;
}

// ======================================================================
// USER LIST
// ======================================================================
router.get('/', (req, res) => {
  const ROLES = getAllRoles();
  const users = loadUsers().map(u => {
    const pu = publicUser(u);
    pu.overrideCount = countOverrides(u.id);
    return pu;
  });

  res.render('users/list', {
    pageTitle: 'Users',
    headExtra: '',
    headerActions: hasPermission(req.currentUser, 'users.manage')
      ? `<a href="${ADMIN_PREFIX}/users/roles" class="btn btn-outline-secondary btn-sm">Manage Roles</a> <a href="${ADMIN_PREFIX}/users/new" class="btn btn-primary btn-sm">Add User</a>`
      : '',
    breadcrumb: [{ label: 'Users' }],
    users,
    roles: ROLES,
    currentUserId: req.session.userId
  });
});

// ======================================================================
// CREATE
// ======================================================================
router.get('/new', manage, (req, res) => {
  res.render('users/editor', {
    pageTitle: 'Add User',
    headExtra: '',
    headerActions: '',
    breadcrumb: [{ label: 'Users', url: `${ADMIN_PREFIX}/users` }, { label: 'Add User' }],
    editUser: null,
    roles: getAllRoles(),
    permissionGroups: PERMISSION_GROUPS,
    effectivePerms: {},
    overrides: {}
  });
});

router.post('/new', manage, (req, res) => {
  const username = (req.body.username || '').trim().toLowerCase();
  const password = req.body.password || '';
  const role = (req.body.role || 'viewer').trim();

  if (!username || username.length < 3) {
    req.flash('danger', 'Username must be at least 3 characters.');
    return res.redirect(`${ADMIN_PREFIX}/users/new`);
  }
  if (!password || password.length < 12) {
    req.flash('danger', 'Password must be at least 12 characters.');
    return res.redirect(`${ADMIN_PREFIX}/users/new`);
  }

  const users = loadUsers();
  if (users.find(u => u.username === username)) {
    req.flash('danger', `Username "${username}" is already taken.`);
    return res.redirect(`${ADMIN_PREFIX}/users/new`);
  }

  const user = {
    id: nextId(users),
    username,
    password_hash: bcrypt.hashSync(password, BCRYPT_COST),
    role,
    created_at: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);

  logActivity(req.session.username, 'User created', `${username} (${role})`);
  req.flash('success', `User "${username}" created.`);
  res.redirect(`${ADMIN_PREFIX}/users`);
});

// ======================================================================
// EDIT
// ======================================================================
router.get('/:id/edit', manage, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const users = loadUsers();
  const editUser = users.find(u => u.id === id);
  if (!editUser) { req.flash('danger', 'User not found.'); return res.redirect(`${ADMIN_PREFIX}/users`); }

  const roleDefaults = getAllRoleDefaults()[editUser.role || 'viewer'] || {};
  const overrides = getUserOverrides(id) || {};
  const effectivePerms = { ...roleDefaults, ...overrides };

  res.render('users/editor', {
    pageTitle: `Edit User: ${editUser.username}`,
    headExtra: '',
    headerActions: '',
    breadcrumb: [{ label: 'Users', url: `${ADMIN_PREFIX}/users` }, { label: editUser.username }],
    editUser: publicUser(editUser),
    roles: getAllRoles(),
    permissionGroups: PERMISSION_GROUPS,
    effectivePerms,
    overrides
  });
});

router.post('/:id/edit', manage, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx < 0) { req.flash('danger', 'User not found.'); return res.redirect(`${ADMIN_PREFIX}/users`); }

  const username = (req.body.username || '').trim().toLowerCase();
  const role = (req.body.role || 'viewer').trim();
  const password = req.body.password || '';

  if (!username || username.length < 3) {
    req.flash('danger', 'Username must be at least 3 characters.');
    return res.redirect(`${ADMIN_PREFIX}/users/${id}/edit`);
  }
  if (users.find(u => u.username === username && u.id !== id)) {
    req.flash('danger', `Username "${username}" is already taken.`);
    return res.redirect(`${ADMIN_PREFIX}/users/${id}/edit`);
  }
  if (wouldRemoveLastAdmin(users, id, role)) {
    req.flash('danger', 'Cannot change this role — at least one Administrator must remain.');
    return res.redirect(`${ADMIN_PREFIX}/users/${id}/edit`);
  }

  users[idx].username = username;
  users[idx].role = role;
  if (password) {
    if (password.length < 12) {
      req.flash('danger', 'Password must be at least 12 characters.');
      return res.redirect(`${ADMIN_PREFIX}/users/${id}/edit`);
    }
    users[idx].password_hash = bcrypt.hashSync(password, BCRYPT_COST);
  }
  saveUsers(users);

  // Per-user permission overrides
  const overrides = {};
  ALL_PERMISSION_KEYS.forEach(key => {
    const fieldName = `override_${key}`;
    const val = req.body[fieldName]; // 'default' | 'allow' | 'deny'
    if (val === 'allow') overrides[key] = true;
    else if (val === 'deny') overrides[key] = false;
  });
  saveUserOverrides(id, Object.keys(overrides).length ? overrides : null);

  logActivity(req.session.username, 'User updated', `${username} (${role})`);
  req.flash('success', `User "${username}" updated.`);
  res.redirect(`${ADMIN_PREFIX}/users`);
});

router.post('/:id/delete', manage, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const users = loadUsers();
  const target = users.find(u => u.id === id);
  if (!target) { req.flash('danger', 'User not found.'); return res.redirect(`${ADMIN_PREFIX}/users`); }
  if (id === req.session.userId) {
    req.flash('danger', 'You cannot delete your own account.');
    return res.redirect(`${ADMIN_PREFIX}/users`);
  }
  if (wouldRemoveLastAdmin(users, id, null)) {
    req.flash('danger', 'Cannot delete the last Administrator account.');
    return res.redirect(`${ADMIN_PREFIX}/users`);
  }

  saveUsers(users.filter(u => u.id !== id));
  saveUserOverrides(id, null);
  logActivity(req.session.username, 'User deleted', target.username);
  req.flash('success', `User "${target.username}" deleted.`);
  res.redirect(`${ADMIN_PREFIX}/users`);
});

// ======================================================================
// ROLE MANAGEMENT
// ======================================================================
router.get('/roles', manage, (req, res) => {
  const roles = getAllRoles();
  const defaults = getAllRoleDefaults();
  const users = loadUsers();
  const usersByRole = {};
  users.forEach(u => {
    const r = u.role || 'viewer';
    usersByRole[r] = (usersByRole[r] || 0) + 1;
  });

  res.render('users/roles', {
    pageTitle: 'Roles & Permissions',
    headExtra: '',
    headerActions: '',
    breadcrumb: [{ label: 'Users', url: `${ADMIN_PREFIX}/users` }, { label: 'Roles' }],
    roles,
    defaults,
    usersByRole,
    permissionGroups: PERMISSION_GROUPS
  });
});

router.post('/roles/:role/save', manage, (req, res) => {
  const role = req.params.role;
  const roles = getAllRoles();
  if (!roles.find(r => r.value === role)) {
    req.flash('danger', 'Unknown role.');
    return res.redirect(`${ADMIN_PREFIX}/users/roles`);
  }

  const perms = {};
  ALL_PERMISSION_KEYS.forEach(key => { perms[key] = req.body[`perm_${key}`] === 'on'; });
  saveRoleDefaults({ [role]: perms });

  logActivity(req.session.username, 'Role permissions updated', role);
  req.flash('success', `Permissions for "${role}" saved.`);
  res.redirect(`${ADMIN_PREFIX}/users/roles`);
});

router.post('/roles/new', manage, (req, res) => {
  try {
    const value = createCustomRole({
      label: req.body.label,
      description: req.body.description,
      basedOnRole: req.body.basedOnRole || 'viewer'
    });
    logActivity(req.session.username, 'Role created', value);
    req.flash('success', 'Role created.');
  } catch (e) {
    req.flash('danger', e.message);
  }
  res.redirect(`${ADMIN_PREFIX}/users/roles`);
});

router.post('/roles/:role/delete', manage, (req, res) => {
  const role = req.params.role;
  const users = loadUsers();
  const usersWithRole = users.filter(u => u.role === role);
  const reassignTo = req.body.reassignTo || null;

  try {
    if (usersWithRole.length && reassignTo) {
      usersWithRole.forEach(u => { u.role = reassignTo; });
      saveUsers(users);
    }
    deleteCustomRole(role, { usersWithRole, reassignTo });
    logActivity(req.session.username, 'Role deleted', role);
    req.flash('success', 'Role deleted.');
  } catch (e) {
    req.flash('danger', e.message);
  }
  res.redirect(`${ADMIN_PREFIX}/users/roles`);
});

module.exports = router;
