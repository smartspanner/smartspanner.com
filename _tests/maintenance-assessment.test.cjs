const {test} = require('node:test');
const assert = require('node:assert/strict');
const model = require('../assets/js/maintenance-assessment-model.js');
const data = require('../_data/maintenance_assessment.json');

const simple = {
  sector:'manufacturing',team:'solo',assets:'few',sites:'one',demands:['none'],
  system:'sheets',visibility:'clear',history:'clear',parts:'rare',required:'none',
  pains:['none'],impact:'low',hours:'low',growth:['none'],data:'good',owner:'ready',
  requirements:['workorders','assets'],access:'online'
};
const high = {
  ...simple,assets:'many',sites:'few',demands:['pm','procedures'],pm_volume:'many',
  pm_control:'missed',visibility:'poor',history:'gaps',parts:'often',required:'many',
  evidence:'gaps',pains:['pm','visibility','parts'],frequency:'daily',impact:'high',
  hours:'high',causes:['information'],requirements:['pm','workorders','parts']
};
const assess = overrides => model.assess({...simple,...overrides},data);

test('a small well-controlled operation can receive a no-buy result',() => {
  const result = assess({});
  assert.equal(result.outcome,'low');
  assert.equal(result.fit,'Strong potential fit');
  assert.match(result.fitReason,/not a reason to buy/);
});
test('headcount, industry and manual tools do not manufacture a strong need',() => {
  for (const sector of data.questions[0].options.map(o=>o[0])) {
    assert.equal(assess({sector,team:'extensive',system:'informal'}).outcome,'low');
  }
  assert.equal(assess({assets:'extensive',sites:'extensive'}).outcome,'investigate');
});
test('recurring control gaps and impact justify serious consideration',() => {
  const result = assess(high);
  assert.equal(result.outcome,'strong');
  assert.equal(result.need,'High');
  assert.equal(result.focus[0].key,'evidence');
  assert.match(result.reasons.join(' '),/101–500 planned/);
});
test('a small critical operation with missed PM is not screened out',() => {
  const result=assess({demands:['pm'],pm_volume:'few',pm_control:'missed',pains:['pm'],frequency:'monthly',causes:['information'],impact:'critical'});
  assert.equal(result.outcome,'strong');
});
test('good existing CMMS is retained, even at large scale',() => {
  const result=assess({assets:'extensive',sites:'many',system:'cmms',existing_reason:'none'});
  assert.equal(result.outcome,'keep');
  assert.equal(result.need,'Currently served');
});
test('existing-system adoption and setup get an improvement recommendation',() => {
  for(const existing_reason of ['adoption','setup']) {
    assert.equal(assess({...high,system:'cmms',existing_reason}).outcome,'improve');
  }
});
test('poor records or no owner trigger implementation preparation',() => {
  assert.equal(assess({...high,data:'poor'}).outcome,'prepare');
  assert.equal(assess({...high,owner:'none'}).outcome,'prepare');
});
test('physical constraints are not presented as solved by software',() => {
  assert.equal(assess({...high,causes:['capacity','external']}).outcome,'constraint');
});
test('unknowns and contradictions cannot produce confident buying advice',() => {
  assert.equal(assess({assets:'unknown',hours:'unknown'}).outcome,'uncertain');
  assert.equal(assess({assets:'unknown'}).need,'Needs clarification');
  assert.equal(assess({visibility:'poor'}).outcome,'uncertain');
  assert.equal(assess({...high,pains:['none']}).outcome,'uncertain');
});
test('required evidence gaps remain a priority with a small asset count',() => {
  const result=assess({required:'some',evidence:'poor',pains:['evidence'],frequency:'rare',causes:['process']});
  assert.equal(result.focus[0].key,'evidence');
  assert.notEqual(result.outcome,'low');
});
test('offline and hosting needs affect fit independently of CMMS need',() => {
  for (const access of ['offline','onpremise']) {
    const result=assess({...high,access});
    assert.equal(result.outcome,'strong');
    assert.equal(result.fit,'Unlikely fit');
    assert.equal(assess({access}).outcome,'low');
  }
});
test('specialist requirements require verification, not automatic exclusion',() => {
  for(const requirement of ['iot','integration','specialist']) {
    const result=assess({...high,requirements:[requirement],specialist:['unknown']});
    assert.equal(result.fit,'Needs a closer look');
    assert.equal(result.outcome,'strong');
  }
  assert.equal(assess({requirements:['unknown']}).fit,'Needs a closer look');
});
test('changing upstream answers removes hidden follow-ups',() => {
  const clean=model.sanitise({...high,demands:['none'],system:'sheets',existing_reason:'setup',pains:['none'],required:'none',specialist:['validation']},data);
  for(const key of ['pm_volume','pm_control','existing_reason','frequency','causes','evidence','specialist']) assert.equal(clean[key],undefined,key);
});
test('saved input is restricted to valid options, exclusives and limits',() => {
  assert.deepEqual(model.sanitise(null,data),{});
  const clean=model.sanitise({...simple,sector:'<script>',pains:['pm','pm','admin','parts','evidence'],growth:['assets','none'],requirements:['unknown','iot'],injected:'bad'},data);
  assert.equal(clean.sector,undefined);
  assert.equal(clean.injected,undefined);
  assert.deepEqual(clean.pains,['pm','admin','parts']);
  assert.deepEqual(clean.growth,['none']);
  assert.deepEqual(clean.requirements,['unknown']);
});
test('partial questionnaires cannot generate a completed diagnosis',() => {
  assert.equal(model.assess({},data).outcome,'incomplete');
  const result=assess({demands:['pm']});
  assert.deepEqual(result.missing,['pm_volume','pm_control']);
});
test('all defined answers can be evaluated without invalid output',() => {
  for(const q of data.questions) {
    for(const [value] of q.options) {
      const input={...high,system:'cmms',existing_reason:'capability',requirements:['iot'],specialist:['iot'],[q.id]:q.multi?[value]:value};
      const result=model.assess(input,data);
      assert.notEqual(result.outcome,'incomplete',q.id+': '+value);
      assert.ok(result.title && result.fit && result.actions.length,q.id+': '+value);
      assert.ok(result.reasons.every(reason => typeof reason === 'string' && reason.length > 0));
    }
  }
});
