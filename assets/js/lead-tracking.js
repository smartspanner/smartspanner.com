(function () {
  'use strict';
  const consent = window.SmartspannerConsent;
  if (!consent) return;
  const campaignKey = 'smartspanner_campaign';
  const submissionKey = 'smartspanner_lead_submission';
  const maxAge = 30 * 60 * 1000;
  const parameterNames = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'li_fat_id', 'fbclid'];
  const leadTypes = ['demo_request', 'trial_signup', 'guide_download', 'checklist_download', 'contact_form'];
  function read(key) { try { return JSON.parse(sessionStorage.getItem(key)); } catch (_) { return null; } }
  function write(key, value) { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function campaign() {
    if (!consent.allowed('marketing')) return {};
    const saved = read(campaignKey);
    return saved && Date.now() - saved.timestamp >= 0 && Date.now() - saved.timestamp < maxAge ? saved.values : {};
  }
  function captureCampaign() {
    if (!consent.allowed('marketing')) return;
    const query = new URLSearchParams(location.search);
    const values = {};
    parameterNames.forEach(name => { const value = query.get(name); if (value) values[name] = value.slice(0, 512); });
    if (Object.keys(values).length) write(campaignKey, { timestamp: Date.now(), values });
  }
  function populateFields() {
    const values = campaign();
    document.querySelectorAll('.js-hubspot-lead-form, .js-hubspot-demo-form').forEach(form => {
      parameterNames.forEach(name => {
        let input = form.querySelector('input[name="' + name + '"]');
        if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = name; form.appendChild(input); }
        input.value = values[name] || '';
      });
    });
  }
  function record(form) {
    if (!consent.allowed('analytics') && !consent.allowed('marketing')) return;
    const leadType = form.dataset.leadType;
    if (!leadTypes.includes(leadType) || !form.dataset.hubspotRedirect) return;
    const target = new URL(form.dataset.hubspotRedirect, location.href);
    if (target.origin !== location.origin) return;
    let origin = null;
    if (consent.allowed('analytics')) {
      const saved = read('smartspanner_case_study_origin');
      if (saved && Date.now() - saved.timestamp < maxAge) origin = saved;
    }
    write(submissionKey, { leadType, formId: form.dataset.hubspotFormId, target: target.pathname.replace(/\/$/, ''), timestamp: Date.now(), eventId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2), origin });
  }
  function confirm() {
    const confirmation = document.querySelector('[data-lead-confirmation]');
    if (!confirmation) return;
    const saved = read(submissionKey);
    if (!saved || saved.leadType !== confirmation.dataset.leadConfirmation || saved.target !== location.pathname.replace(/\/$/, '') || !leadTypes.includes(saved.leadType) || Date.now() - saved.timestamp < 0 || Date.now() - saved.timestamp > maxAge) return;
    try { sessionStorage.removeItem(submissionKey); } catch (_) { return; }
    const parameters = { lead_type: saved.leadType, form_id: saved.formId, event_id: saved.eventId };
    if (saved.origin) { parameters.entry_content = saved.origin.caseStudy; parameters.entry_industry = saved.origin.industry; }
    consent.track(saved.leadType, parameters);
    consent.advertisingConversion(saved.leadType, saved.eventId);
  }
  window.SmartspannerLeads = {
    recordSuccessfulSubmission: record,
    attributionFields: function () {
      if (!consent.config.attributionFields || !consent.allowed('marketing')) return [];
      const values = campaign();
      return parameterNames.filter(name => values[name]).map(name => ({ name, value: values[name] }));
    }
  };
  function initialize() { captureCampaign(); populateFields(); confirm(); }
  document.addEventListener('smartspanner:consent', function () { captureCampaign(); populateFields(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
