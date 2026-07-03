const express = require('express');
const { getSettings, saveSettings } = require('../lib/db');
const { logActivity } = require('../lib/activity');
const { requirePermission } = require('../lib/permissions');

const router = express.Router();

function trimStr(v) { return typeof v === 'string' ? v.trim() : ''; }
function isOn(v) { return v === 'on' || v === true || v === 'true' || v === '1'; }

router.get('/', requirePermission('settings.view'), (req, res) => {
  const settings = getSettings();
  res.render('settings/index', {
    pageTitle: 'Settings',
    headExtra: '',
    headerActions: '',
    breadcrumb: null,
    settings
  });
});

router.post('/', requirePermission('settings.manage'), (req, res) => {
  const settings = getSettings();

  // Business info
  settings.siteName = trimStr(req.body.siteName);
  settings.siteUrl = trimStr(req.body.siteUrl);
  settings.locale = trimStr(req.body.locale) || 'ar-EG';

  settings.contact = settings.contact || {};
  settings.contact.email = trimStr(req.body.contact_email);
  settings.contact.phone = trimStr(req.body.contact_phone);
  settings.contact.whatsapp = trimStr(req.body.contact_whatsapp);
  settings.contact.address = trimStr(req.body.contact_address);

  settings.business = settings.business || {};
  settings.business.foundingYear = trimStr(req.body.business_founding_year);
  settings.business.openingHours = {
    days: trimStr(req.body.hours_days),
    opens: trimStr(req.body.hours_opens),
    closes: trimStr(req.body.hours_closes)
  };

  // Social
  settings.social = {
    facebook: trimStr(req.body.social_facebook),
    instagram: trimStr(req.body.social_instagram),
    youtube: trimStr(req.body.social_youtube),
    twitter: trimStr(req.body.social_twitter)
  };

  // Tracking
  settings.tracking = {
    gtmId: trimStr(req.body.gtm_id),
    gtmEnabled: isOn(req.body.gtm_enabled),
    ga4Id: trimStr(req.body.ga4_id),
    ga4Enabled: isOn(req.body.ga4_enabled),
    clarityId: trimStr(req.body.clarity_id),
    clarityEnabled: isOn(req.body.clarity_enabled)
  };

  saveSettings(settings);
  logActivity(req.session.username, 'Settings saved', 'Site settings updated');
  req.flash('success', 'Settings saved successfully.');
  res.redirect('/2ef65f179f12439e317a23628b016653/settings');
});

module.exports = router;
