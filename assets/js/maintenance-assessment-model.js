/* Versioned decision aid, not a validated numerical scoring instrument. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SmartspannerAssessment = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const has = (a, key, value) => Array.isArray(a[key]) && a[key].includes(value);
  const pains = a => (a.pains || []).filter(v => v !== 'none');
  const existing = a => ['cmms', 'erp', 'connected'].includes(a.system);
  function visible(q, a) {
    if (q.when === 'pm') return has(a, 'demands', 'pm');
    if (q.when === 'existing') return existing(a);
    if (q.when === 'required') return ['some', 'many'].includes(a.required);
    if (q.when === 'pain') return pains(a).length > 0;
    if (q.when === 'specialist') return ['iot', 'integration', 'specialist'].some(v => has(a, 'requirements', v));
    return true;
  }
  function sanitise(input, data) {
    const clean = {};
    if (!input || typeof input !== 'object' || Array.isArray(input)) return clean;
    data.questions.forEach(q => {
      if (!visible(q, clean)) return;
      const allowed = q.options.map(o => o[0]);
      const value = input[q.id];
      if (q.multi && Array.isArray(value)) {
        let values = [...new Set(value.filter(v => allowed.includes(v)))];
        const exclusive = values.find(v => ['none', 'unknown', 'ambition'].includes(v));
        if (exclusive) values = [exclusive];
        if (values.length) clean[q.id] = values.slice(0, q.max || allowed.length);
      } else if (!q.multi && allowed.includes(value)) clean[q.id] = value;
    });
    return clean;
  }
  const recommendations = {
    low: ['We don’t see a strong case for buying a CMMS yet.', 'Your answers suggest that a consistent task list, maintenance calendar and asset record may be enough for now. Check the effort and benefit before adding another system.'],
    investigate: ['A CMMS could help. Establish the case first.', 'There are maintenance workflows worth improving. Measure the disruption and check whether better routines, your current tools or a dedicated CMMS would address the cause.'],
    strong: ['A CMMS is worth serious consideration.', 'The control gaps and operational impact you described make a practical case for dedicated maintenance management. Compare systems against real jobs and the outcomes you need.'],
    prepare: ['There is a case for CMMS. Put the foundations in place.', 'Dedicated maintenance management could help, but dependable asset records and a project owner will be needed to make it work. Start those improvements alongside your requirements review.'],
    keep: ['Keep improving the system you already have.', 'You have not identified a significant reason to replace your current system. Review any upcoming changes and improve the workflows you already use before buying another platform.'],
    improve: ['Review your current system before replacing it.', 'Your answers point to setup, data or adoption issues in an existing system. Check what training and configuration can resolve, then compare alternatives against any remaining gaps.'],
    constraint: ['Address the operating constraint first.', 'You identified staffing, available time, suppliers or ageing equipment as the main causes. A CMMS may help coordinate the response, but software alone will not provide people, parts or reliable equipment.'],
    uncertain: ['Clarify a few things before deciding.', 'Some important answers are unknown or point in different directions. A short review with the maintenance team will give you a firmer basis for choosing tools.']
  };
  const priorities = {
    pm: ['Preventive maintenance control', 'Review a representative month of due and overdue tasks. Agree who owns each task and how missed work is followed up.', '/preventative-maintenance-software/'],
    visibility: ['Work requests and ownership', 'Follow a request from arrival to completion. Agree one place to record it, a named owner and when status is updated.', '/work-order-management-software/'],
    downtime: ['Understanding recurring failures', 'Review recent breakdowns and distinguish missing maintenance information from equipment condition, capacity and supplier delays.', '/equipment-maintenance-software/'],
    admin: ['Reducing repeated administration', 'Track where information is chased or entered twice during a typical week. Start with the most frequent handover.', '/maintenance-management-software/'],
    history: ['Dependable asset history', 'Choose a small set of important assets and bring their work history and documents into a consistent record.', '/asset-management-software/'],
    parts: ['Spare parts availability', 'Review recent jobs delayed by parts. Check stock accuracy, lead times and how parts are reserved or reordered.', '/spare-part-inventory-software/'],
    evidence: ['Retrievable inspection evidence', 'Review required tasks and missing completion records with the person responsible. Agree how evidence is captured and retrieved, regardless of the tool used.', '/maintenance-compliance-software/'],
    contractors: ['Contractor handovers', 'Agree how contractor jobs are assigned, how completion is confirmed and where service records are stored.', '/subcontractors/'],
    reporting: ['Useful maintenance reporting', 'Choose the decisions your reports need to support. Define which job records must be kept current to make those reports dependable.', '/reporting/']
  };
  function assess(input, data) {
    const a = sanitise(input, data);
    const missing = data.questions.filter(q => visible(q, a) && !a[q.id]);
    if (missing.length) return {outcome:'incomplete', missing:missing.map(q => q.id)};
    const pmGap = ['missed', 'invisible'].includes(a.pm_control);
    const workGap = ['gaps', 'poor'].includes(a.visibility);
    const historyGap = ['gaps', 'poor'].includes(a.history);
    const evidenceGap = ['gaps', 'poor'].includes(a.evidence);
    const partsGap = a.parts === 'often';
    const gapCount = [pmGap, workGap, historyGap, evidenceGap, partsGap].filter(Boolean).length;
    const highAdmin = ['high', 'extensive'].includes(a.hours);
    const recurring = ['weekly', 'daily'].includes(a.frequency);
    const critical = ['high', 'critical'].includes(a.impact);
    const structure = Number(['many', 'thousands', 'extensive'].includes(a.assets)) + Number(a.sites !== 'one') + Number(['many', 'extensive'].includes(a.pm_volume)) + Number((a.demands || []).filter(v => !['none','unknown'].includes(v)).length >= 2);
    const complexity = structure >= 2 ? 'High' : structure || has(a,'demands','pm') || a.assets === 'some' ? 'Moderate' : 'Low';
    const growth = ['assets', 'sites', 'controls', 'team'].some(v => has(a, 'growth', v));
    const prep = a.data === 'poor' || a.owner === 'none';
    const unknowns = Object.keys(a).filter(k => a[k] === 'unknown' || has(a, k, 'unknown'));
    const coreUnknowns = unknowns.filter(k => ['assets','demands','pm_volume','pm_control','visibility','history','parts','required','evidence','impact','hours'].includes(k));
    const contradiction = has(a, 'pains', 'none') && (gapCount > 0 || highAdmin);
    const physical = (a.causes || []).length > 0 && a.causes.every(v => ['capacity', 'external'].includes(v));
    // Scale, manual tools, reactive work and industry cannot independently trigger purchase.
    const strongCase = (gapCount >= 2 && (recurring || highAdmin || critical)) || (gapCount >= 1 && recurring && (complexity !== 'Low' || critical)) || (pmGap && critical) || (evidenceGap && a.required === 'many') || (highAdmin && recurring && ['information','software'].some(v => has(a,'causes',v)));
    let outcome = strongCase ? 'strong' : gapCount || recurring || highAdmin || growth || complexity !== 'Low' || pains(a).length ? 'investigate' : 'low';
    let need = strongCase ? 'High' : outcome === 'low' ? 'Low' : 'Worth investigating';
    if (strongCase && prep) outcome = 'prepare';
    if (physical) outcome = 'constraint';
    if (existing(a) && ['setup', 'adoption'].includes(a.existing_reason)) outcome = 'improve';
    if (existing(a) && a.existing_reason === 'none' && !gapCount && !recurring && !highAdmin && !pains(a).length) {
      outcome = 'keep'; need = 'Currently served';
    }
    if (coreUnknowns.length >= 2 || contradiction) {outcome = 'uncertain'; need = 'Needs clarification';}
    else if (coreUnknowns.length && outcome === 'low') {outcome = 'investigate'; need = 'Needs clarification';}
    const reasons = [];
    const label = (key) => data.questions.find(q => q.id === key).options.find(o => o[0] === a[key])[1];
    reasons.push(a.assets === 'unknown' ? 'You have not yet estimated the number of assets that need maintenance records.' : 'You maintain '+label('assets').toLowerCase()+' assets across '+label('sites').toLowerCase()+'. Team size is context, not a buying threshold.');
    if (a.pm_volume && a.pm_volume !== 'unknown') reasons.push('You estimate '+label('pm_volume').toLowerCase()+' planned maintenance tasks fall due in a typical month.');
    if (pmGap) reasons.push(a.pm_control === 'missed' ? 'You said planned tasks are regularly missed or overdue.' : 'You cannot reliably tell which planned tasks were missed.');
    if (workGap) reasons.push('Open work is not reliably visible or some requests and updates get lost.');
    if (historyGap) reasons.push('Your maintenance history is incomplete or depends on people remembering the work.');
    if (evidenceGap) reasons.push('You reported gaps in evidence for required maintenance. Review these even if you decide against buying software.');
    if (partsGap) reasons.push('Maintenance jobs are frequently delayed by unavailable spare parts.');
    if (recurring) reasons.push('The problems you selected disrupt work '+(a.frequency === 'daily' ? 'most days.' : 'every week.'));
    if (highAdmin) reasons.push('Your team spends '+label('hours').toLowerCase()+' a week chasing or re-entering information.');
    if (critical) reasons.push('An unexpected failure would have significant or critical consequences. This makes reliable control important even with few assets.');
    if (growth) reasons.push('You expect confirmed changes in assets, sites, team coordination or required controls.');
    if (!gapCount && !highAdmin && !recurring) reasons.push('Your answers do not show major control gaps or frequent operational disruption.');
    if (physical) reasons.unshift('You identified operating resources or external factors as the main causes of the problems.');
    if (outcome === 'keep') reasons.unshift('You use an existing system and selected no significant reason to change it.');
    if (outcome === 'improve') reasons.unshift('You identified setup or adoption as the reason for considering a change.');
    if (contradiction) reasons.unshift('You selected no significant problems but also reported control gaps or substantial administration. Review those answers together.');
    if (unknowns.length) reasons.push('Some details are not yet known. Treat this as a starting point and check those answers with your team.');
    let fit = 'Strong potential fit';
    let fitReason = 'Your essential workflows align with Smartspanner’s documented maintenance capabilities. Confirm the details and required plan using a representative job before deciding.';
    const specialist = ['iot', 'integration', 'specialist'].some(v => has(a,'requirements',v));
    if (specialist || has(a,'requirements','unknown') || a.access === 'unknown') {
      fit = 'Needs a closer look';
      fitReason = 'Your specialist requirements, undefined essentials or access needs require review. Smartspanner documents API and IoT capabilities, but a specific integration, sensor deployment, validation requirement or governance model must be demonstrated.';
    }
    if (['offline', 'onpremise'].includes(a.access)) {
      fit = 'Unlikely fit';
      fitReason = a.access === 'offline' ? 'You need technicians to work without internet. Smartspanner’s documented browser and mobile access require a connection. Shortlist systems with verified offline workflows.' : 'You require an installation on your own servers. Smartspanner is a cloud-hosted service; shortlist systems that support your hosting requirement.';
    }
    if (outcome === 'low' || outcome === 'keep') fitReason += ' A workflow match is not a reason to buy or replace a system when your needs are already met.';
    const priorityKeys = [...new Set([...(evidenceGap ? ['evidence'] : []), ...(pmGap ? ['pm'] : []), ...pains(a), ...(workGap ? ['visibility'] : []), ...(historyGap ? ['history'] : []), ...(partsGap ? ['parts'] : [])])].slice(0,3);
    const focus = priorityKeys.map(key => ({key,title:priorities[key][0],action:priorities[key][1],url:priorities[key][2]}));
    let actions = ['Record missed tasks, delayed jobs and time spent chasing information over a typical month.', 'Compare the effort of maintaining your current tools with the cost and setup effort of a CMMS.', 'Ask shortlisted suppliers to demonstrate one real maintenance workflow with your team.'];
    let systemType = 'A focused CMMS for work orders, preventive schedules and asset history';
    if (outcome === 'low') {systemType = 'A shared task list, maintenance calendar and consistent asset register'; actions = ['Keep one list of jobs, owners and due dates.', 'Keep maintenance history and required evidence with the relevant asset.', 'Reassess if tasks start slipping, records become hard to find or the operation changes.'];}
    if (outcome === 'keep' || outcome === 'improve') {systemType = 'Your existing system, with targeted improvements'; actions = ['Review the workflow and upcoming requirements with your current supplier.', 'Address training, configuration and record quality before judging the system’s limits.', 'Consider replacement only against a material requirement the existing system cannot reasonably meet.'];}
    if (outcome === 'constraint') actions = ['Review the staffing, supplier or equipment constraint behind recent delays.', 'Separate resource limitations from missing information and coordination problems.', 'Evaluate a CMMS only against the part of the problem it can actually address.'];
    if (outcome === 'uncertain') {systemType = 'Define the requirements before shortlisting software'; actions = ['Review the unknown or conflicting answers with the people doing the maintenance.', 'Sample a month of planned work, breakdowns and administrative effort.', 'Revisit this assessment with a shared view of the operation.'];}
    if (outcome === 'prepare') actions = ['Assign a project owner with time and management support.', 'Check asset identities, locations and the schedules for your priority assets.', 'Pilot one workflow with technicians before expanding the implementation.'];
    if (!['low','keep','improve','uncertain'].includes(outcome)) {
      if (specialist) systemType = 'A CMMS with your specialist requirements verified in a technical review';
      else if (a.sites !== 'one') systemType = 'A CMMS with shared maintenance control and reporting across sites';
      else if (evidenceGap || has(a,'requirements','evidence')) systemType = 'A CMMS with retrievable inspection records and maintenance history';
      if (a.access === 'offline') systemType = 'A CMMS with demonstrated offline mobile working and synchronisation';
      if (a.access === 'onpremise') systemType = 'A maintenance system with a supported on-premise deployment';
    }
    return {outcome,title:recommendations[outcome][0],summary:recommendations[outcome][1],need,complexity,fit,fitReason,
      readiness:prep ? 'Preparation needed' : a.owner === 'ready' && a.data === 'good' ? 'Foundations in place' : 'Review before implementation',
      reasons,focus,actions,systemType,unknowns,answers:a};
  }
  return {visible,sanitise,assess};
});
