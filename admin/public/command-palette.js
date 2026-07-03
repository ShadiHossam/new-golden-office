/* Command palette — Cmd+K / Ctrl+K quick navigation overlay. */
(function () {
  'use strict';

  var PREFIX = '/2ef65f179f12439e317a23628b016653';
  var palette = null;
  var allCommands = [];
  var filteredCommands = [];
  var selectedIndex = 0;

  function perm(key) {
    var perms = window.__ngoPermissions || {};
    return perms[key] === true;
  }

  function getCommands() {
    var cmds = [];

    cmds.push({ id: 'nav-dashboard', label: 'Go to Dashboard', desc: PREFIX, icon: 'home', category: 'Navigate', href: PREFIX });
    if (perm('pages.view')) cmds.push({ id: 'nav-pages', label: 'Go to Pages', desc: PREFIX + '/pages', icon: 'file', category: 'Navigate', href: PREFIX + '/pages' });
    if (perm('seo.view')) cmds.push({ id: 'nav-seo', label: 'Go to SEO Manager', desc: PREFIX + '/seo', icon: 'search', category: 'Navigate', href: PREFIX + '/seo' });
    if (perm('seo.link_checker')) cmds.push({ id: 'nav-linkchecker', label: 'Run Link Checker', desc: PREFIX + '/seo/link-checker', icon: 'link', category: 'Navigate', href: PREFIX + '/seo/link-checker' });
    if (perm('media.view')) cmds.push({ id: 'nav-media', label: 'Go to Media Library', desc: PREFIX + '/media', icon: 'image', category: 'Navigate', href: PREFIX + '/media' });
    if (perm('redirects.view')) cmds.push({ id: 'nav-redirects', label: 'Go to Redirects', desc: PREFIX + '/redirects', icon: 'link', category: 'Navigate', href: PREFIX + '/redirects' });
    if (perm('calendar.view')) cmds.push({ id: 'nav-calendar', label: 'Go to Calendar', desc: PREFIX + '/calendar', icon: 'calendar', category: 'Navigate', href: PREFIX + '/calendar' });
    if (perm('activity.view_own') || perm('activity.view_all')) cmds.push({ id: 'nav-activity', label: 'Go to Activity Log', desc: PREFIX + '/activity', icon: 'activity', category: 'Navigate', href: PREFIX + '/activity' });
    if (perm('users.view')) cmds.push({ id: 'nav-users', label: 'Go to Users', desc: PREFIX + '/users', icon: 'users', category: 'Navigate', href: PREFIX + '/users' });
    if (perm('users.manage')) cmds.push({ id: 'nav-roles', label: 'Manage Roles & Permissions', desc: PREFIX + '/users/roles', icon: 'shield', category: 'Navigate', href: PREFIX + '/users/roles' });
    if (perm('settings.view')) cmds.push({ id: 'nav-settings', label: 'Go to Settings', desc: PREFIX + '/settings', icon: 'settings', category: 'Navigate', href: PREFIX + '/settings' });

    cmds.push({ id: 'act-view-site', label: 'View Website', desc: 'Open the live site in a new tab', icon: 'external', category: 'Actions', action: function () { window.open('/', '_blank'); } });
    if (perm('media.upload')) cmds.push({ id: 'act-upload', label: 'Upload Media', desc: PREFIX + '/media', icon: 'upload', category: 'Actions', href: PREFIX + '/media' });
    if (perm('pages.create')) cmds.push({ id: 'act-new-page', label: 'New Page', desc: PREFIX + '/pages/new', icon: 'plus', category: 'Actions', href: PREFIX + '/pages/new' });
    if (perm('users.manage')) cmds.push({ id: 'act-new-user', label: 'Add User', desc: PREFIX + '/users/new', icon: 'plus', category: 'Actions', href: PREFIX + '/users/new' });
    cmds.push({ id: 'act-password', label: 'Change Password', desc: PREFIX + '/password', icon: 'lock', category: 'Actions', href: PREFIX + '/password' });
    cmds.push({ id: 'act-logout', label: 'Log Out', desc: '', icon: 'logout', category: 'Actions', action: function () {
      var form = document.querySelector('form[action$="/logout"]');
      if (form) form.submit();
    } });

    return cmds;
  }

  var ICONS = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>',
    file: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>',
    link: '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    activity: '<polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>',
    users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
    external: '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
    logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>'
  };

  function iconSvg(name) {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + (ICONS[name] || ICONS.file) + '</svg>';
  }

  function createPalette() {
    var el = document.createElement('div');
    el.className = 'cmdk';
    el.innerHTML =
      '<div class="cmdk-backdrop"></div>' +
      '<div class="cmdk-dialog" role="dialog" aria-label="Command palette">' +
        '<div class="cmdk-search">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<input type="text" class="cmdk-input" placeholder="Search pages and actions…" autocomplete="off">' +
          '<kbd class="cmdk-kbd">Esc</kbd>' +
        '</div>' +
        '<div class="cmdk-results"></div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function initPalette() {
    if (palette) return;
    palette = createPalette();
    var input = palette.querySelector('.cmdk-input');
    var results = palette.querySelector('.cmdk-results');

    input.addEventListener('input', function () {
      filterCommands(this.value);
      renderResults();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
        renderResults();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        renderResults();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) executeCommand(filteredCommands[selectedIndex]);
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });

    results.addEventListener('click', function (e) {
      var item = e.target.closest('.cmdk-item');
      if (item) {
        var cmd = filteredCommands[parseInt(item.dataset.index, 10)];
        if (cmd) executeCommand(cmd);
      }
    });

    palette.querySelector('.cmdk-backdrop').addEventListener('click', closePalette);
  }

  function filterCommands(query) {
    var q = query.toLowerCase().trim();
    filteredCommands = !q
      ? allCommands.slice(0, 15)
      : allCommands.filter(function (cmd) {
          return cmd.label.toLowerCase().indexOf(q) !== -1 ||
            (cmd.desc || '').toLowerCase().indexOf(q) !== -1 ||
            cmd.category.toLowerCase().indexOf(q) !== -1;
        }).slice(0, 12);
    selectedIndex = 0;
  }

  function renderResults() {
    var results = palette.querySelector('.cmdk-results');
    if (!filteredCommands.length) {
      results.innerHTML = '<div class="cmdk-empty">No matching commands</div>';
      return;
    }
    var currentCategory = '';
    var html = '';
    filteredCommands.forEach(function (cmd, idx) {
      if (cmd.category !== currentCategory) {
        currentCategory = cmd.category;
        html += '<div class="cmdk-category">' + currentCategory + '</div>';
      }
      html += '<div class="cmdk-item' + (idx === selectedIndex ? ' active' : '') + '" data-index="' + idx + '">' +
        '<span class="cmdk-item-icon">' + iconSvg(cmd.icon) + '</span>' +
        '<div class="cmdk-item-text">' +
          '<span class="cmdk-item-label">' + cmd.label + '</span>' +
          (cmd.desc ? '<span class="cmdk-item-desc">' + cmd.desc + '</span>' : '') +
        '</div>' +
      '</div>';
    });
    results.innerHTML = html;
    var active = results.querySelector('.cmdk-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function executeCommand(cmd) {
    closePalette();
    if (cmd.href) window.location.href = cmd.href;
    else if (cmd.action) cmd.action();
  }

  function openPalette() {
    initPalette();
    allCommands = getCommands();
    filterCommands('');
    renderResults();
    palette.classList.add('visible');
    var input = palette.querySelector('.cmdk-input');
    input.value = '';
    setTimeout(function () { input.focus(); }, 30);
  }

  function closePalette() {
    if (palette) palette.classList.remove('visible');
  }

  document.addEventListener('keydown', function (e) {
    var mod = /Mac/.test(navigator.platform) ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (palette && palette.classList.contains('visible')) closePalette();
      else openPalette();
    }
  });

  var trigger = document.getElementById('cmdk-trigger');
  if (trigger) trigger.addEventListener('click', openPalette);

  window.openCommandPalette = openPalette;
  window.closeCommandPalette = closePalette;
})();
