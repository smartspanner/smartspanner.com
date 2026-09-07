import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.ASSESSMENT_URL || 'https://tenx.fraction.app/smartspanner.com/maintenance-assessment/';
const artifacts = '/tmp/smartspanner-assessment-gate';
await mkdir(artifacts,{recursive:true});
const browser = await chromium.launch();
const simple = {sector:'manufacturing',team:'solo',assets:'few',sites:'one',demands:['none'],system:'sheets',visibility:'clear',history:'clear',parts:'rare',required:'none',pains:['none'],impact:'low',hours:'low',growth:['none'],data:'good',owner:'ready',requirements:['assets','workorders'],access:'online'};
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  const submissions=[];
  let mode='error';
  let release;
  page.on('pageerror',err=>errors.push(err.message));
  // All HubSpot submissions are intercepted; no test leads are sent.
  await page.route('https://api.hsforms.com/**',async route=>{
    submissions.push(route.request().postDataJSON());
    assert.equal(route.request().url(),'https://api.hsforms.com/submissions/v3/integration/submit/9191859/977dfaef-f796-432e-a5c0-b614ff58d21d');
    assert.equal(route.request().method(),'POST');
    assert.equal(route.request().headers().cookie,undefined);
    assert.equal(route.request().headers().referer,undefined);
    if(mode==='pending') await new Promise(resolve=>{release=resolve;});
    if(mode==='network') {await route.abort();return;}
    await route.fulfill({status:mode==='error'?400:200,contentType:'application/json',body:mode==='error'?'{}':'{"inlineMessage":"Success"}'});
  });
  await page.addInitScript(()=>{window.printCount=0;window.print=()=>{window.printCount++;};});
  await page.goto(url+'?utm_source=private-test#private-value');
  await page.evaluate(answers=>sessionStorage.setItem('smartspanner-maintenance-assessment',JSON.stringify({version:'1.0.0',answers,cursor:'access',finished:true})),simple);
  await page.reload();
  await page.locator('#ma-resume').click();
  assert.equal(submissions.length,0);
  await page.locator('#ma-print').click();
  assert.equal(await page.locator('#ma-print-dialog').evaluate(el=>el.open),true);
  assert.equal(await page.evaluate(()=>window.printCount),0);
  await page.locator('#ma-print-submit').click();
  assert.equal(submissions.length,0,'Empty contact form must not submit');
  await page.locator('#ma-print-name').fill('Taylor');
  await page.locator('#ma-print-email').fill('invalid-email');
  await page.locator('#ma-print-submit').click();
  assert.equal(submissions.length,0,'Invalid email must not submit');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#ma-print-dialog').evaluate(el=>el.open),false);
  assert.equal(await page.locator('#ma-result').isVisible(),true);
  await page.locator('#ma-print').click();
  await page.locator('#ma-print-name').fill('Taylor');
  await page.locator('#ma-print-email').fill('taylor@example.invalid');
  await page.screenshot({path:artifacts+'/desktop-form.png'});
  await page.locator('#ma-print-submit').click();
  await page.locator('#ma-print-error').filter({hasText:'couldn’t confirm'}).waitFor();
  assert.equal(await page.locator('#ma-print-success').isVisible(),false);
  assert.equal(await page.evaluate(()=>window.printCount),0);
  mode='network';
  await page.locator('#ma-print-submit').click();
  await page.locator('#ma-print-submit:not([disabled])').waitFor();
  assert.equal(await page.locator('#ma-print-success').isVisible(),false);
  mode='pending';
  await page.locator('#ma-print-submit').click();
  await page.waitForFunction(()=>document.getElementById('ma-print-submit').disabled);
  const count=submissions.length;
  await page.locator('#ma-print-form').evaluate(el=>el.requestSubmit());
  assert.equal(submissions.length,count,'In-flight request cannot be duplicated');
  assert.ok(release);
  mode='success';
  release();
  await page.locator('#ma-print-ready').waitFor({state:'visible'});
  assert.deepEqual(submissions.at(-1),{
    fields:[{name:'firstname',value:'Taylor'},{name:'email',value:'taylor@example.invalid'},{name:'lead_gen_name',value:'Maintenance Assessment: Printable Report'}],
    context:{pageUri:url,pageName:'Smartspanner Maintenance Assessment'}
  });
  const saved=await page.evaluate(()=>JSON.stringify({...sessionStorage}));
  assert.ok(!saved.includes('Taylor') && !saved.includes('taylor@example.invalid'),'Contact details must not be persisted');
  await page.locator('#ma-print-ready').click();
  assert.equal(await page.evaluate(()=>window.printCount),1);
  await page.locator('#ma-print').click();
  assert.equal(await page.evaluate(()=>window.printCount),2);
  assert.equal(submissions.length,count);
  await page.reload();
  await page.locator('#ma-resume').click();
  await page.locator('#ma-print').click();
  assert.equal(await page.evaluate(()=>window.printCount),1,'Successful unlock survives reload in the same tab');
  assert.equal(submissions.length,count);
  assert.deepEqual(errors,[]);

  for(const width of [390,320]) {
    const mobile=await browser.newPage({viewport:{width,height:844}});
    await mobile.route('https://api.hsforms.com/**',route=>route.abort());
    await mobile.goto(url);
    await mobile.evaluate(answers=>sessionStorage.setItem('smartspanner-maintenance-assessment',JSON.stringify({version:'1.0.0',answers,cursor:'access',finished:true})),simple);
    await mobile.reload();
    await mobile.locator('#ma-resume').click();
    await mobile.locator('#ma-print').click();
    await mobile.screenshot({path:artifacts+`/mobile-${width}-form.png`});
    assert.ok(await mobile.locator('#ma-print-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth),'Dialog has no horizontal overflow');
    await mobile.locator('#ma-print-cancel').click();
    assert.equal(await mobile.locator('#ma-print-dialog').evaluate(el=>el.open),false);
    await mobile.close();
  }
  console.log('Passed report gate: validation, cancel, errors, retry, duplicate prevention, success-only unlock, private payload, tab persistence and mobile layout. No real HubSpot submissions.');
} finally {await browser.close();}
