/* ---- GOOGLE ADS: "Submit lead form" conversion ----
   Flow: form page -> Formspree confirms the send -> stashLead() + redirect to /thank-you
         -> /thank-you calls fireStoredLead().
   The token is deleted the moment /thank-you reads it, so a refresh, the back button, a second tab or a
   direct visit to /thank-you can never count a conversion. transaction_id lets Google drop repeats too.
   Needs the Google tag (gtag) in the page <head>; without it (ad blocker) nothing fires and nothing breaks. */
(function () {
  // Copied from the owner's Google Ads "Submit lead form" event snippet. Change it here only.
  // No value or currency on purpose: one successful form submission = one conversion, no made-up revenue.
  var SEND_TO = 'AW-18541240167/6ve3CKSg468dEOe-k4lF';

  var KEY = 'anasLead';
  var MAX_AGE_MS = 10 * 60 * 1000;   // a token older than this is ignored

  function newToken() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }

  // Sends the conversion. `done` runs once Google has the hit, or after 1s at the latest.
  function fire(token, done) {
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      if (done) done();
    }
    if (typeof window.gtag !== 'function') { finish(); return; }
    try {
      window.gtag('event', 'conversion', {
        send_to: SEND_TO,
        transaction_id: token,
        event_callback: finish
      });
    } catch (err) {
      finish();
      return;
    }
    setTimeout(finish, 1000);
  }

  window.anasAds = {
    // Form page, after Formspree confirmed success. true = token saved, false = storage is blocked.
    stashLead: function () {
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ token: newToken(), ts: Date.now() }));
        return true;
      } catch (err) {
        return false;
      }
    },

    // Form page, only when storage is blocked: count it right here, once, then continue.
    fireNow: function (done) {
      fire(newToken(), done);
    },

    // /thank-you page: counts the conversion once for a freshly stashed lead, never otherwise.
    fireStoredLead: function () {
      var raw = null;
      try {
        raw = sessionStorage.getItem(KEY);
        sessionStorage.removeItem(KEY);   // consume first: a refresh finds nothing
      } catch (err) {
        return false;
      }
      if (!raw) return false;

      var lead = null;
      try { lead = JSON.parse(raw); } catch (err) { return false; }
      if (!lead || !lead.token || Date.now() - lead.ts > MAX_AGE_MS) return false;

      fire(lead.token);
      return true;
    }
  };
})();
