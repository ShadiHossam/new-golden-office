/* Cookie banner for the first-party tracker (ngo-track.js).
 * Tracking runs unless the visitor clicks رفض (Refuse). The choice is kept in
 * the ngo_consent cookie for a year. Any element with [data-ngo-cc] (the footer
 * "إعدادات الكوكيز" button) reopens the banner.
 * ES5, no dependencies, injected after idle as position:fixed so it never
 * shifts page content.
 */
(function () {
  'use strict';
  var W = window, D = document;

  function getChoice() {
    var m = D.cookie.match(/(?:^|; )ngo_consent=([^;]*)/);
    return m ? m[1] : null;
  }
  function setChoice(v) {
    D.cookie = 'ngo_consent=' + v + '; Max-Age=31536000; Path=/; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '');
  }

  var bar = null;
  function hide() {
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    bar = null;
  }
  function show() {
    if (bar) return;
    bar = D.createElement('div');
    bar.className = 'ngo-cc';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'ملفات تعريف الارتباط');
    bar.innerHTML =
      '<p>نستخدم ملفات تعريف الارتباط لتحسين تجربتك ومعرفة كيف وصلت إلينا. ' +
      '<a href="/privacy#cookies">سياسة الخصوصية</a></p>' +
      '<div class="ngo-cc-btns">' +
      '<button type="button" class="ngo-cc-ok">موافق</button>' +
      '<button type="button" class="ngo-cc-no">رفض</button>' +
      '</div>';
    bar.addEventListener('click', function (e) {
      try {
        var t = e.target;
        if (t.className === 'ngo-cc-ok') {
          setChoice('accepted');
          if (W.NGO_TRACK && W.NGO_TRACK.start) W.NGO_TRACK.start();
          hide();
        } else if (t.className === 'ngo-cc-no') {
          setChoice('refused');
          if (W.NGO_TRACK && W.NGO_TRACK.optout) W.NGO_TRACK.optout();
          hide();
        }
      } catch (er) { hide(); }
    });
    D.body.appendChild(bar);
  }

  D.addEventListener('click', function (e) {
    try {
      var t = e.target;
      while (t && t.nodeType === 1 && !t.hasAttribute('data-ngo-cc')) t = t.parentNode;
      if (t && t.nodeType === 1) { e.preventDefault(); show(); }
    } catch (er) {}
  });

  function boot() { try { if (!getChoice()) show(); } catch (e) {} }
  if (W.requestIdleCallback) W.requestIdleCallback(boot, { timeout: 2500 });
  else setTimeout(boot, 1);
})();
