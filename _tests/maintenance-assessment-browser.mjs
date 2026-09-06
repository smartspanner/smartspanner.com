// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright module if needed.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.ASSESSMENT_URL || 'https://tenx.fraction.app/smartspanner.com/maintenance-assessment/';
const artifacts = process.env.ASSESSMENT_ARTIFACTS || '/tmp/smartspanner-assessment';
await mkdir(artifacts,{recursive:true});
const browser = await chromium.launch({headless:true});
const simple = {sector:'manufacturing',team:'solo',assets:'few',sites:'one',demands:['none'],system:'sheets',visibility:'clear',history:'clear',parts:'rare',required:'none',pains:['none'],impact:'low',hours:'low',growth:['none'],data:'good',owner:'ready',requirements:['assets','workorders'],access:'online'};
const high = {...simple,assets:'many',sites:'few',demands:['pm','procedures'],pm_volume:'many',pm_control:'missed',visibility:'poor',history:'gaps',parts:'often',required:'many',evidence:'gaps',pains:['pm','visibility','parts'],frequency:'daily',impact:'high',hours:'high',causes:['information'],requirements:['pm','workorders'],access:'offline'};
async function complete(page,answers) {
  let count=0;
  while(await page.locator('#ma-journey').isVisible()) {
    assert.ok(count++<30,'Question flow should terminate');
    const name=await page.locator('#ma-scene input').first().getAttribute('name');
    assert.ok(answers[name],`No test answer for ${name}`);
    for(const value of Array.isArray(answers[name])?answers[name]:[answers[name]]) {
      await page.locator(`input[name="${name}"][value="${value}"]`).check();
    }
    await page.locator('#ma-next').click();
  }
  await page.locator('#ma-result').waitFor({state:'visible'});
  return count;
}
async function noOverflow(page) {
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
}
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  const external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(new URL(request.url()).origin!==new URL(url).origin) external.push(request.url());});
  await page.goto(url);
  await page.locator('#ma-start').waitFor({state:'visible'});
  await noOverflow(page);
  await page.screenshot({path:artifacts+'/desktop-intro.png',fullPage:true});
  await page.locator('#ma-start').click();
  await page.locator('#ma-next').click();
  assert.match(await page.locator('#ma-error').innerText(),/Choose an answer/);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'ma-error');
  await page.locator('input[value="manufacturing"]').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('input:checked').inputValue(),'facilities');
  await page.screenshot({path:artifacts+'/desktop-question.png',fullPage:true});
  await complete(page,simple);
  assert.match(await page.locator('#ma-result-title').innerText(),/don’t see a strong case/);
  assert.equal(await page.locator('#ma-answer-list dt').count(),18);
  await page.screenshot({path:artifacts+'/desktop-result.png',fullPage:true});
  await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
  assert.equal(await page.locator('.ma-answer-details').getAttribute('open'),'');
  await page.pdf({path:artifacts+'/assessment-report.pdf',format:'A4',printBackground:true});
  await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
  await page.reload();
  await page.locator('#ma-resume').click();
  assert.match(await page.locator('#ma-result-title').innerText(),/don’t see a strong case/);
  await page.locator('#ma-restart').click();
  await page.locator('input[value="manufacturing"]').check();
  await page.locator('#ma-next').click();
  await page.reload();
  await page.locator('#ma-resume').click();
  assert.equal(await page.locator('#ma-scene input').first().getAttribute('name'),'team');
  await page.locator('#ma-back').click();
  assert.equal(await page.locator('input:checked').inputValue(),'manufacturing');
  await complete(page,high);
  assert.match(await page.locator('#ma-result-title').innerText(),/serious consideration/);
  assert.equal(await page.locator('#ma-fit-title').innerText(),'Unlikely fit');
  assert.match(await page.locator('#ma-system-type').innerText(),/offline/);
  await page.screenshot({path:artifacts+'/desktop-high-result.png',fullPage:true});
  await page.locator('#ma-edit').click();
  while(await page.locator('#ma-scene input').first().getAttribute('name')!=='demands') await page.locator('#ma-next').click();
  await page.locator('input[value="none"]').check();
  assert.equal(await page.locator('input:checked').count(),1);
  const saved=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('smartspanner-maintenance-assessment')));
  assert.equal(saved.answers.pm_volume,undefined);
  assert.equal(saved.answers.pm_control,undefined);
  await page.locator('#ma-next').click();
  assert.equal(await page.locator('#ma-scene input').first().getAttribute('name'),'system');
  while(await page.locator('#ma-scene input').first().getAttribute('name')!=='pains') await page.locator('#ma-next').click();
  await page.locator('input[value="admin"]').click();
  assert.match(await page.locator('#ma-error').innerText(),/up to 3/);
  assert.equal(await page.locator('input:checked').count(),3);
  assert.equal(external.length,0,'No third-party requests on assessment');
  assert.deepEqual(errors,[]);

  for(const width of [390,320]) {
    const mobile=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
    await mobile.goto(url);
    await noOverflow(mobile);
    await mobile.screenshot({path:artifacts+`/mobile-${width}-intro.png`,fullPage:true});
    await mobile.locator('#ma-start').click();
    await noOverflow(mobile);
    await mobile.screenshot({path:artifacts+`/mobile-${width}-question.png`,fullPage:true});
    await complete(mobile,high);
    await noOverflow(mobile);
    await mobile.screenshot({path:artifacts+`/mobile-${width}-result.png`,fullPage:true});
    await mobile.close();
  }
  const blocked=await browser.newPage();
  await blocked.addInitScript(()=>{
    Object.defineProperty(window,'sessionStorage',{get(){throw new Error('Storage disabled');}});
  });
  await blocked.goto(url);
  await blocked.locator('#ma-start').click();
  assert.match(await blocked.locator('#ma-storage-note').innerText(),/cannot save progress/);
  await complete(blocked,simple);
  const corrupt=await browser.newPage();
  await corrupt.goto(url);
  await corrupt.evaluate(()=>sessionStorage.setItem('smartspanner-maintenance-assessment','{invalid json'));
  await corrupt.reload();
  assert.equal(await corrupt.locator('#ma-resume').isVisible(),false);
  await corrupt.locator('#ma-start').click();
  assert.equal(await corrupt.locator('#ma-scene input').first().getAttribute('name'),'sector');
  const nojs=await browser.newPage({javaScriptEnabled:false});
  await nojs.goto(url);
  assert.match(await nojs.locator('main noscript').innerText(),/CMMS selection guide/);
  console.log('Passed desktop/mobile flows, keyboard, validation, report, print, resume, branch pruning, storage fallback, no-JS and privacy checks.');
  console.log('Artifacts: '+artifacts);
} finally {await browser.close();}
