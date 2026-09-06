(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const model = window.SmartspannerAssessment;
  let data;
  try {
    data = JSON.parse($('ma-data').textContent);
    if (!model || !Array.isArray(data.questions) || !data.questions.length) throw new Error('Assessment unavailable');
  } catch (_) {
    $('ma-load-status').textContent = 'The assessment could not load. Please refresh the page or use the CMMS selection guide linked below.';
    const link = document.createElement('a');
    link.href = $('main').dataset.baseurl + '/free-guide-choosing-your-cmms-vendors/';
    link.textContent = 'CMMS selection guide';
    $('ma-load-status').after(link);
    return;
  }
  const key = 'smartspanner-maintenance-assessment';
  const baseurl = $('main').dataset.baseurl;
  let answers = {};
  let cursor = data.questions[0].id;
  let finished = false;
  let storageAvailable = true;
  let printWasOpen = false;
  const visible = () => data.questions.filter(q => model.visible(q, answers));
  const node = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  };
  function storageFailure() {
    storageAvailable = false;
    $('ma-storage-note').textContent = 'Your answers stay on this page. This browser cannot save progress if you refresh.';
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(key));
    if (saved && saved.version === data.version) {
      answers = model.sanitise(saved.answers, data);
      cursor = visible().some(q => q.id === saved.cursor) ? saved.cursor : data.questions[0].id;
      finished = saved.finished === true && model.assess(answers, data).outcome !== 'incomplete';
    }
  } catch (_) { /* Invalid or unavailable storage must never prevent starting. */ }
  function save() {
    if (!storageAvailable) return;
    try { sessionStorage.setItem(key, JSON.stringify({version:data.version,answers,cursor,finished})); }
    catch (_) { storageFailure(); }
  }
  function show(id) {
    ['ma-intro','ma-journey','ma-result'].forEach(section => { $(section).hidden = section !== id; });
  }
  function focus(el) {
    el.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }
  function error(message) {
    $('ma-error').textContent = message;
    $('ma-error').focus();
  }
  function renderQuestion() {
    const list = visible();
    const q = list.find(item => item.id === cursor) || list[0];
    cursor = q.id;
    const index = list.indexOf(q);
    show('ma-journey');
    $('ma-stage').textContent = data.chapters[q.chapter];
    $('ma-step').textContent = 'Question '+(index + 1)+' of '+list.length;
    $('ma-progress').value = Math.round(index / list.length * 100);
    $('ma-chapters').replaceChildren(...data.chapters.map((title, chapter) => {
      const li = node('li', title);
      if (chapter === q.chapter) li.setAttribute('aria-current','step');
      return li;
    }));
    const fieldset = node('fieldset');
    fieldset.setAttribute('aria-describedby','ma-hint ma-error');
    const legend = node('legend');
    const heading = node('span',q.title,'ma-question-title');
    heading.tabIndex = -1;
    legend.append(heading);
    const hint = node('p',q.hint,'ma-hint');
    hint.id = 'ma-hint';
    const options = node('div',undefined,'ma-options');
    q.options.forEach(([value, label]) => {
      const option = node('label',undefined,'ma-option');
      const input = node('input');
      input.type = q.multi ? 'checkbox' : 'radio';
      input.name = q.id;
      input.value = value;
      input.checked = q.multi ? (answers[q.id] || []).includes(value) : answers[q.id] === value;
      input.addEventListener('change',() => {
        $('ma-error').textContent = '';
        if (q.multi) {
          let values = [...(answers[q.id] || [])].filter(v => v !== value);
          if (input.checked) {
            if (['none','unknown','ambition'].includes(value)) values = [value];
            else values = values.filter(v => !['none','unknown','ambition'].includes(v)).concat(value);
          }
          if (q.max && values.length > q.max) {
            input.checked = false;
            error('Choose up to '+q.max+' options. Deselect an answer before adding another.');
            return;
          }
          if (values.length) answers[q.id] = values;
          else delete answers[q.id];
        } else answers[q.id] = value;
        answers = model.sanitise(answers,data);
        options.querySelectorAll('input').forEach(el => {el.checked = q.multi ? (answers[q.id] || []).includes(el.value) : answers[q.id] === el.value;});
        finished = false;
        const updated = visible();
        $('ma-step').textContent = 'Question '+(updated.findIndex(item => item.id === cursor)+1)+' of '+updated.length;
        $('ma-progress').value = Math.round(updated.findIndex(item => item.id === cursor)/updated.length*100);
        $('ma-next').textContent = updated[updated.length-1].id === cursor ? 'See my recommendation →' : 'Continue →';
        save();
      });
      option.append(input,node('span',label));
      options.append(option);
    });
    fieldset.append(legend,hint,options);
    $('ma-scene').replaceChildren(fieldset);
    $('ma-error').textContent = '';
    $('ma-next').textContent = index === list.length - 1 ? 'See my recommendation →' : 'Continue →';
    save();
    focus(heading);
  }
  function renderResult() {
    answers = model.sanitise(answers,data);
    const result = model.assess(answers,data);
    if (result.outcome === 'incomplete') {cursor = result.missing[0];renderQuestion();return;}
    finished = true;
    save();
    show('ma-result');
    $('ma-result-title').textContent = result.title;
    $('ma-result-summary').textContent = result.summary;
    $('ma-verdicts').replaceChildren(...[['CMMS need',result.need],['Implementation readiness',result.readiness],['Smartspanner fit',result.fit]].map(([label,value]) => {
      const card = node('div',undefined,'ma-verdict');
      card.append(node('p',label),node('strong',value));
      return card;
    }));
    $('ma-reasons').replaceChildren(...result.reasons.map(text => node('li',text)));
    $('ma-actions').replaceChildren(...result.actions.map(text => node('li',text)));
    $('ma-focus').replaceChildren(...result.focus.map(item => {
      const article = node('article');
      const link = node('a','Explore this workflow →');
      link.href = baseurl + item.url;
      article.append(node('h3',item.title),node('p',item.action),link);
      return article;
    }));
    if (!result.focus.length) $('ma-focus').append(node('p','Keep your current controls consistent. Review due work, asset records and responsibilities together when your operation changes.'));
    $('ma-system-type').textContent = result.systemType;
    $('ma-fit-title').textContent = result.fit;
    $('ma-fit-reason').textContent = result.fitReason;
    $('ma-fit-link').href = baseurl + (result.fit === 'Unlikely fit' ? '/free-guide-choosing-your-cmms-vendors/' : result.fit === 'Needs a closer look' ? '/contact/' : '/features/');
    $('ma-fit-link').textContent = result.fit === 'Unlikely fit' ? 'Use the CMMS selection guide →' : result.fit === 'Needs a closer look' ? 'Discuss your requirements →' : 'Explore the capabilities →';
    const answerList = [];
    visible().forEach(q => {
      const values = q.multi ? answers[q.id] : [answers[q.id]];
      answerList.push(node('dt',q.title),node('dd',q.options.filter(o => values.includes(o[0])).map(o => o[1]).join('; ')));
    });
    $('ma-answer-list').replaceChildren(...answerList);
    focus($('ma-result-title'));
  }
  function reset() {
    answers = {};
    cursor = data.questions[0].id;
    finished = false;
    try {sessionStorage.removeItem(key);} catch (_) {storageFailure();}
    $('ma-resume').hidden = true;
    renderQuestion();
  }
  $('ma-question-form').addEventListener('submit',event => {
    event.preventDefault();
    if (!answers[cursor]) {error('Choose an answer to continue.');return;}
    const list = visible();
    const index = list.findIndex(q => q.id === cursor);
    if (index === list.length - 1) renderResult();
    else {cursor = list[index + 1].id;renderQuestion();}
  });
  $('ma-back').addEventListener('click',() => {
    const list = visible();
    const index = list.findIndex(q => q.id === cursor);
    if (index > 0) {cursor = list[index - 1].id;renderQuestion();}
    else {
      show('ma-intro');
      $('ma-resume').hidden = false;
      $('ma-start').textContent = 'Start a new assessment ↗';
      focus($('ma-resume'));
    }
  });
  $('ma-start').addEventListener('click',reset);
  $('ma-restart').addEventListener('click',reset);
  $('ma-resume').addEventListener('click',() => {if (finished) renderResult();else renderQuestion();});
  $('ma-edit').addEventListener('click',() => {finished=false;cursor=data.questions[0].id;renderQuestion();});
  const details = document.querySelector('.ma-answer-details');
  window.addEventListener('beforeprint',() => {printWasOpen=details.open;details.open=true;});
  window.addEventListener('afterprint',() => {details.open=printWasOpen;});
  $('ma-print').addEventListener('click',() => window.print());
  if (Object.keys(answers).length) {
    $('ma-resume').hidden = false;
    $('ma-resume').textContent = finished ? 'View your saved recommendation →' : 'Continue your saved assessment →';
    $('ma-start').textContent = 'Start a new assessment ↗';
  }
  $('ma-start').hidden = false;
  $('ma-load-status').hidden = true;
})();
