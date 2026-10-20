/* EWO click/funnel events -> GoatCounter (2026-10-20). Events: popup-open-<slug>, signup-<slug>, etsy-click-<slug>.
   Never blocks links: counts via sendBeacon (survives navigation); if GoatCounter is blocked, links just work. */
(function () {
  'use strict';
  var me = document.currentScript || document.querySelector('script[data-ewo-slug]');
  var slug = (me && me.getAttribute('data-ewo-slug')) || location.hostname.split('.')[0];
  var EP = 'https://exclusivewebsite.goatcounter.com/count';
  function send(name, title) {
    try {
      var gc = window.goatcounter;
      if (gc && typeof gc.count === 'function') { gc.count({ path: name, title: title, event: true }); return true; }
      if (navigator.sendBeacon && !navigator.webdriver)
        return navigator.sendBeacon(EP + '?p=' + encodeURIComponent(name) + '&t=' + encodeURIComponent(title) +
          '&e=true&s=' + screen.width + '&rnd=' + Math.random().toString(36).slice(2, 7));
    } catch (e) {}
    return false;
  }
  var modal = document.getElementById('shop-modal');
  if (modal && window.MutationObserver) {
    var wasOpen = modal.open;
    new MutationObserver(function () {
      if (modal.open && !wasOpen) send('popup-open-' + slug, 'Signup popup opened (' + slug + ')');
      wasOpen = modal.open;
    }).observe(modal, { attributes: true, attributeFilter: ['open'] });
  }
  if (window.MutationObserver) Array.prototype.forEach.call(document.querySelectorAll('form.js-signup[data-success]'), function (f) {
    var s = document.querySelector(f.getAttribute('data-success'));
    if (!s) return;
    var done = !s.hidden;
    new MutationObserver(function () {
      if (!s.hidden && !done) { done = true; send('signup-' + slug, 'Email signup (' + slug + ', ' + (f.getAttribute('data-context') || 'page') + ')'); }
    }).observe(s, { attributes: true, attributeFilter: ['hidden'] });
  });
  function onClick(e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || !/(^|\.)etsy\.com$/i.test(a.hostname)) return;
    if (e.defaultPrevented) return; // e.g. Shop button that opened the popup instead
    if (e.type === 'click' && e.button !== 0) return;
    if (e.type === 'auxclick' && e.button !== 1) return;
    var how = a.classList.contains('js-skip-top') ? 'skip top' : a.classList.contains('js-skip') ? 'no thanks' : a.classList.contains('js-continue') ? 'after signup' : 'direct';
    var sent = send('etsy-click-' + slug, 'Went to Etsy (' + slug + ', ' + how + ')');
    // Only if the hit can't outlive the page (no sendBeacon): hold a same-tab click briefly, then go anyway.
    if (sent && !navigator.sendBeacon && e.type === 'click' && !a.target && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
      e.preventDefault();
      setTimeout(function () { location.href = a.href; }, 250);
    }
  }
  document.addEventListener('click', onClick, false);
  document.addEventListener('auxclick', onClick, false);
})();
