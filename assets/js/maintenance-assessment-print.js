/* Contact capture only: never read or transmit assessment answers or results. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const dialog = $('ma-print-dialog');
  const form = $('ma-print-form');
  if (!dialog || !form) return;
  // Honour contact submissions already made through the original print gate.
  const unlockKey = 'smartspanner-assessment-print-unlocked-v1';
  let unlocked = false;
  let submitting = false;
  try {unlocked = sessionStorage.getItem(unlockKey) === 'yes';} catch (_) { /* In-memory fallback. */ }
  function updateAccess() {
    $('ma-full-report').hidden = !unlocked;
    $('ma-report-preview').hidden = unlocked;
  }
  function close() {
    dialog.close();
    if (!$('ma-result').hidden) (unlocked ? $('ma-full-report-title') : $('ma-unlock')).focus({preventScroll:true});
  }
  function print() {if (dialog.open) dialog.close();window.print();}
  updateAccess();
  function openGate() {
    if (unlocked) return;
    dialog.showModal();
    if (submitting) $('ma-print-close').focus();
    else $('ma-print-name').focus();
  }
  $('ma-unlock').addEventListener('click',openGate);
  $('ma-print').addEventListener('click',() => {if (unlocked) print();else openGate();});
  $('ma-print-close').addEventListener('click',close);
  $('ma-print-cancel').addEventListener('click',close);
  dialog.addEventListener('close',() => {if (!submitting) form.reset();});
  // The hidden report is also excluded from native printing until unlocked.
  form.addEventListener('submit',async event => {
    event.preventDefault();
    if (submitting || unlocked) return;
    const name = $('ma-print-name');
    const email = $('ma-print-email');
    name.value = name.value.trim();
    email.value = email.value.trim();
    if (!form.reportValidity()) return;
    const portalId = form.dataset.portalId;
    const formId = form.dataset.formId;
    if (!/^\d+$/.test(portalId) || !/^[a-f0-9-]{36}$/i.test(formId)) {
      $('ma-print-error').textContent = 'Report requests are temporarily unavailable. Your conclusion is still available on this page.';
      $('ma-print-error').focus();
      return;
    }
    // Explicit allowlist: no cookies, query strings, assessment DOM or saved answers.
    const payload = {
      fields:[
        {name:'firstname',value:name.value},
        {name:'email',value:email.value},
        {name:'lead_gen_name',value:'Maintenance Assessment: Full Report'}
      ],
      context:{pageUri:location.origin + location.pathname,pageName:'Smartspanner Maintenance Assessment'}
    };
    submitting = true;
    $('ma-print-error').textContent = '';
    $('ma-print-submit').disabled = true;
    $('ma-print-submit').textContent = 'Unlocking…';
    form.setAttribute('aria-busy','true');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(),15000);
    try {
      const response = await fetch('https://api.hsforms.com/submissions/v3/integration/submit/'+portalId+'/'+formId,{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),
        credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal
      });
      if (!response.ok) {
        let details = {};
        try {details = await response.json();} catch (_) { /* A proxy may return non-JSON errors. */ }
        const types = Array.isArray(details.errors) ? details.errors.map(item => item.errorType).filter(type => typeof type === 'string') : [];
        const failure = new Error('HubSpot did not accept the request');
        failure.status = response.status;
        failure.types = types;
        // Do not log submitted values or HubSpot's raw messages, which may repeat them.
        console.warn('Assessment form submission rejected', {status:response.status,types,reference:details.correlationId});
        throw failure;
      }
      unlocked = true;
      try {sessionStorage.setItem(unlockKey,'yes');} catch (_) { /* Do not retain contact details. */ }
      form.reset();
      updateAccess();
      close();
      if (!$('ma-result').hidden) $('ma-full-report-title').scrollIntoView({block:'start'});
    } catch (failure) {
      let message = 'We couldn’t confirm your request. Please try again.';
      if ((failure.types || []).includes('INVALID_EMAIL')) message = 'HubSpot could not accept that email address. Please check it and try again.';
      else if ((failure.types || []).includes('BLOCKED_EMAIL')) message = 'HubSpot could not accept that email address. Please try your work email.';
      else if (failure.status === 429) message = 'Too many requests have been made. Please wait a minute and try again.';
      else if (failure.name === 'AbortError') message = 'HubSpot took too long to respond. Please try again.';
      else if (failure instanceof TypeError) message = 'We couldn’t connect to HubSpot. Check your connection and whether your browser is blocking forms, then try again.';
      $('ma-print-error').textContent = message + ' Your conclusion is still available, and your answers have not been sent.';
      if (dialog.open) $('ma-print-error').focus();
    } finally {
      clearTimeout(timer);
      submitting = false;
      $('ma-print-submit').disabled = false;
      $('ma-print-submit').textContent = 'Unlock my full report →';
      form.removeAttribute('aria-busy');
      if (!dialog.open) form.reset();
    }
  });
})();
