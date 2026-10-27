(function () {
  'use strict';
  const configNode = document.getElementById('smartspanner-tracking-config');
  if (!configNode) return;
  const config = JSON.parse(configNode.textContent);
  const key = 'smartspanner_cookie_consent';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const denied = { analytics: false, experience: false, marketing: false };
  let choice = null;
  const loaded = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && saved.version === 1 && Number.isFinite(saved.savedAt) && saved.savedAt <= Date.now() && Date.now() - saved.savedAt < lifetime && ['analytics', 'experience', 'marketing'].every(name => typeof saved[name] === 'boolean')) choice = saved;
  } catch (_) { /* No optional tracking when preferences cannot be read. */ }
  function allowed(category) { return !!(choice && choice[category] === true); }
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    const args = Array.from(arguments);
    if (args[0] === 'event') {
      const advertising = args[2] && /^AW-/.test(args[2].send_to || '');
      if (!allowed(advertising ? 'marketing' : 'analytics')) return;
    }
    window.dataLayer.push(arguments);
  };
  function googleState() {
    return { ad_storage: allowed('marketing') ? 'granted' : 'denied', analytics_storage: allowed('analytics') ? 'granted' : 'denied', ad_user_data: allowed('marketing') ? 'granted' : 'denied', ad_personalization: allowed('marketing') ? 'granted' : 'denied' };
  }
  // Basic Consent Mode: no Google or other tracking script is fetched before consent.
  window.gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', security_storage: 'granted' });
  window.gtag('set', 'ads_data_redaction', true);
  function script(id, src) {
    if (loaded.has(id)) return;
    loaded.add(id);
    const node = document.createElement('script');
    node.id = id; node.async = true; node.src = src;
    document.head.appendChild(node);
  }
  function clearCookies(pattern) {
    const domains = ['', location.hostname, '.' + location.hostname];
    if (location.hostname.endsWith('.smartspanner.com')) domains.push('smartspanner.com', '.smartspanner.com');
    const paths = ['/', config.baseurl || '/'];
    document.cookie.split(';').map(cookie => cookie.split('=')[0].trim()).filter(name => pattern.test(name)).forEach(name => {
      domains.forEach(domain => paths.forEach(path => { document.cookie = name + '=; Max-Age=0; path=' + path + (domain ? '; domain=' + domain : '') + '; SameSite=Lax'; }));
    });
  }
  function clearDisallowedStorage() {
    if (!allowed('analytics')) {
      clearCookies(/^_ga|^_gid$|^_gat/);
      try { sessionStorage.removeItem('smartspanner_case_study_origin'); sessionStorage.removeItem('smartspanner_demo_submission'); } catch (_) {}
    }
    if (!allowed('experience')) clearCookies(/^_cs_|^_hj/);
    if (!allowed('marketing')) {
      clearCookies(/^_gcl_|^_fb[pc]$|^li_|^hubspotutk$|^__hstc$|^__hssc$|^__hssrc$/);
      try { sessionStorage.removeItem('smartspanner_campaign'); } catch (_) {}
    }
    if (!allowed('analytics') && !allowed('marketing')) { try { sessionStorage.removeItem('smartspanner_lead_submission'); } catch (_) {} }
  }
  function loadVendors() {
    const replayAllowed = config.replayAllowed && !document.querySelector('form');
    if (config.gtm) {
      if (allowed('analytics') || allowed('experience') || allowed('marketing')) {
        if (!loaded.has('smartspanner-gtm')) window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
        script('smartspanner-gtm', 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(config.gtm));
        window.dataLayer.push({ event: 'smartspanner_consent_update', consent_analytics: allowed('analytics'), consent_replay: allowed('experience') && replayAllowed, consent_marketing: allowed('marketing') });
      }
      return; // GTM owns tags when configured; never also run direct copies.
    }
    if (allowed('analytics') && config.ga4 && !loaded.has('smartspanner-ga4-config')) {
      loaded.add('smartspanner-ga4-config');
      window.gtag('js', new Date());
      const measuredUrl = new URL(location.origin + location.pathname);
      const query = new URLSearchParams(location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(name => { if (query.has(name)) measuredUrl.searchParams.set(name, query.get(name).slice(0, 512)); });
      if (allowed('marketing')) ['gclid', 'li_fat_id', 'fbclid'].forEach(name => { if (query.has(name)) measuredUrl.searchParams.set(name, query.get(name).slice(0, 512)); });
      window.gtag('config', config.ga4, { allow_google_signals: allowed('marketing'), allow_ad_personalization_signals: allowed('marketing'), page_location: measuredUrl.href });
      script('smartspanner-google-tag', 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.ga4));
    }
    if (allowed('experience') && config.contentsquare && replayAllowed) {
      window._uxa = window._uxa || [];
      if (!loaded.has('smartspanner-contentsquare')) {
        window._uxa.push(['setPIISelectors', { PIISelectors: ['input, textarea, select, form'] }]);
        window._uxa.push(['setQuery', '']);
      }
      script('smartspanner-contentsquare', config.contentsquare);
    }
    if (allowed('marketing') && config.hubspot) {
      window._hsq = window._hsq || [];
      if (!loaded.has('hs-script-loader')) window._hsq.push(['setPath', location.pathname]);
      script('hs-script-loader', 'https://js.hs-scripts.com/' + encodeURIComponent(config.hubspot) + '.js');
    }
    if (allowed('marketing') && /^AW-\d+$/.test(config.ads || '')) {
      if (!loaded.has('smartspanner-ads-config')) {
        loaded.add('smartspanner-ads-config');
        window.gtag('config', config.ads);
        script('smartspanner-google-tag', 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.ads));
      }
    }
    if (allowed('marketing') && /^\d+$/.test(config.linkedin || '')) {
      window._linkedin_partner_id = config.linkedin;
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      if (!window._linkedin_data_partner_ids.includes(config.linkedin)) window._linkedin_data_partner_ids.push(config.linkedin);
      script('smartspanner-linkedin', 'https://snap.licdn.com/li.lms-analytics/insight.min.js');
    }
    if (allowed('marketing') && /^\d+$/.test(config.meta || '') && !loaded.has('smartspanner-meta')) {
      const fbq = window.fbq = window.fbq || function () { fbq.queue.push(arguments); };
      fbq.queue = fbq.queue || []; fbq.loaded = true; fbq.version = '2.0'; window._fbq = window._fbq || fbq;
      fbq('consent', 'grant'); fbq('init', config.meta); fbq('track', 'PageView');
      script('smartspanner-meta', 'https://connect.facebook.net/en_US/fbevents.js');
    }
  }
  function track(name, parameters) {
    if (!allowed('analytics')) return false;
    const values = Object.assign({ transport_type: 'beacon' }, parameters || {});
    if (config.gtm) window.dataLayer.push(Object.assign({ event: name }, values));
    else window.gtag('event', name, values);
    return true;
  }
  function advertisingConversion(name, eventId) {
    if (!allowed('marketing') || !['demo_request', 'trial_signup'].includes(name)) return;
    if (config.gtm) { window.dataLayer.push({ event: 'smartspanner_ad_conversion', lead_type: name, event_id: eventId }); return; }
    const label = name === 'demo_request' ? config.adsDemo : config.adsTrial;
    if (config.ads && label) window.gtag('event', 'conversion', { send_to: config.ads + '/' + label, transaction_id: eventId });
    if (window.fbq && config.meta) window.fbq('track', name === 'trial_signup' ? 'CompleteRegistration' : 'Lead', {}, { eventID: eventId });
  }
  function apply(next) {
    const previous = choice || denied;
    const revoked = ['analytics', 'experience', 'marketing'].some(category => previous[category] && !next[category]);
    choice = { version: 1, savedAt: Date.now(), analytics: !!next.analytics, experience: !!next.experience, marketing: !!next.marketing };
    try { localStorage.setItem(key, JSON.stringify(choice)); } catch (_) {}
    window.gtag('consent', 'update', googleState());
    if (revoked) {
      if (!allowed('experience') && window._uxa) window._uxa.push(['optout']);
      if (!allowed('marketing') && window._hsq) window._hsq.push(['doNotTrack']);
      if (!allowed('marketing') && window.fbq) window.fbq('consent', 'revoke');
    }
    clearDisallowedStorage();
    document.getElementById('cookie-banner').hidden = true;
    const dialog = document.getElementById('cookie-settings');
    if (dialog.open) dialog.close();
    document.dispatchEvent(new CustomEvent('smartspanner:consent', { detail: Object.assign({}, choice) }));
    if (revoked) { location.reload(); return; }
    loadVendors();
  }
  function openSettings() {
    ['analytics', 'experience', 'marketing'].forEach(name => { document.getElementById('cookie-' + name).checked = allowed(name); });
    document.getElementById('cookie-settings').showModal();
  }
  window.SmartspannerConsent = { allowed, track, advertisingConversion, openSettings, config };
  clearDisallowedStorage();
  if (choice) window.gtag('consent', 'update', googleState());
  document.addEventListener('DOMContentLoaded', function () {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.hidden = !!choice;
    document.querySelectorAll('[data-cookie-action]').forEach(button => button.addEventListener('click', function () {
      const action = button.dataset.cookieAction;
      if (action === 'settings') openSettings();
      if (action === 'accept') apply({ analytics: true, experience: true, marketing: true });
      if (action === 'reject') apply(denied);
      if (action === 'close') document.getElementById('cookie-settings').close();
      if (action === 'save') apply({ analytics: document.getElementById('cookie-analytics').checked, experience: document.getElementById('cookie-experience').checked, marketing: document.getElementById('cookie-marketing').checked });
    }));
    loadVendors();
  });
})();
