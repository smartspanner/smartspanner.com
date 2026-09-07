/* Contact capture only: never read or transmit assessment answers or results. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const dialog = $('ma-print-dialog');
  const form = $('ma-print-form');
  if (!dialog || !form) return;
  const unlockKey = 'smartspanner-assessment-print-unlocked-v1';
  let unlocked = false;
  let submitting = false;
  try {unlocked = sessionStorage.getItem(unlockKey) === 'yes';} catch (_) { /* In-memory fallback. */ }
  function updateButton() {
    $('ma-print').textContent = unlocked ? 'Save or print your report ↗' : 'Unlock your printable report ↗';
  }
  function close() {dialog.close();$('ma-print').focus({preventScroll:true});}
  function print() {if (dialog.open) dialog.close();window.print();}
  updateButton();
  $('ma-print').addEventListener('click',() => {
    if (unlocked) {print();return;}
    dialog.showModal();
    if (submitting) $('ma-print-close').focus();
    else $('ma-print-name').focus();
  });
  $('ma-print-close').addEventListener('click',close);
  $('ma-print-cancel').addEventListener('click',close);
  $('ma-print-ready').addEventListener('click',print);
  dialog.addEventListener('close',() => {if (!submitting) form.reset();});
  // Native browser printing remains available because the complete report is public.
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
      $('ma-print-error').textContent = 'Report requests are temporarily unavailable. Your full recommendation is still available on this page.';
      $('ma-print-error').focus();
      return;
    }
    // Explicit allowlist: no cookies, query strings, assessment DOM or saved answers.
    const payload = {
      fields:[
        {name:'firstname',value:name.value},
        {name:'email',value:email.value},
        {name:'lead_gen_name',value:'Maintenance Assessment: Printable Report'}
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
      if (!response.ok) throw new Error('HubSpot did not accept the request');
      unlocked = true;
      try {sessionStorage.setItem(unlockKey,'yes');} catch (_) { /* Do not retain contact details. */ }
      form.reset();
      form.hidden = true;
      $('ma-print-success').hidden = false;
      $('ma-print-cancel').hidden = true;
      updateButton();
      if (dialog.open) $('ma-print-ready').focus();
    } catch (_) {
      $('ma-print-error').textContent = 'We couldn’t confirm your request. Please try again. Your assessment is still available, and your answers have not been sent.';
      if (dialog.open) $('ma-print-error').focus();
    } finally {
      clearTimeout(timer);
      submitting = false;
      $('ma-print-submit').disabled = false;
      $('ma-print-submit').textContent = 'Unlock printable report →';
      form.removeAttribute('aria-busy');
      if (!dialog.open) form.reset();
    }
  });
})();
