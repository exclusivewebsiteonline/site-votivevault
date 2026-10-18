/* Signup forms -> EWO Email Signups (Google Sheet via Apps Script web app). main.js posts to form.action;
   this sends the same fields as a simple urlencoded POST and hands main.js a JSON reply. */
(function () {
  'use strict';
  var EXEC = 'https://script.google.com/macros/s/AKfycbwM8969U-0HjBFBlDRyBb0HBU5hyh1Fn8ZZG0k0yXCxzpXP4FOaskpl7tL14DuU6Gcr/exec';
  var realFetch = window.fetch;
  if (!realFetch || !window.Response || !window.FormData || !window.URLSearchParams) return;
  function ok(msg) {
    return new Response(JSON.stringify({ ok: true, message: msg || 'Thank you!' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || String(input);
    if (url.indexOf(EXEC) !== 0 || !init || !init.body || !init.body.forEach) return realFetch.apply(this, arguments);
    var body = new URLSearchParams();
    init.body.forEach(function (v, k) { if (typeof v === 'string') body.append(k, v); });
    body.set('page', location.href.split('#')[0]);
    var opts = { method: 'POST', body: body, redirect: 'follow', credentials: 'omit' };
    return realFetch(EXEC, opts).then(function (res) {
      return res.clone().json().then(function () { return res; }, function () { return ok(); });
    }, function () {
      // CORS blocked the readable reply: send opaquely (the sheet de-duplicates) and assume success
      opts.mode = 'no-cors';
      return realFetch(EXEC, opts).then(function () { return ok(); });
    });
  };
})();
