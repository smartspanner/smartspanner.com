// Build first, then run with PLAYWRIGHT_MODULE pointing to an installed Playwright package.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SITE_URL || 'https://tenx.fraction.app/smartspanner.com';
const browser = await chromium.launch();
const artifacts = process.env.CONSENT_ARTIFACTS || '/tmp/smartspanner-consent';
await mkdir(artifacts, {recursive:true});
const key = 'smartspanner_cookie_consent';
const vendor = /googletagmanager|google-analytics|contentsquare|hs-scripts|hs-analytics|licdn|facebook/;
const leadNames = ['demo_request','trial_signup','guide_download','checklist_download','contact_form','generate_lead'];
async function fixture(choice, width=1440) {
  const context = await browser.newContext({viewport:{width,height:1000}});
  const requests = [], errors = [];
  await context.route(vendor, route => { requests.push(route.request().url());return route.fulfill({contentType:'application/javascript',body:''}); });
  if (choice) await context.addInitScript(({key,choice})=>localStorage.setItem(key,JSON.stringify({version:1,savedAt:Date.now(),...choice})),{key,choice});
  const page = await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  return {context,page,requests,errors};
}
async function events(page) {
  return page.evaluate(()=>window.dataLayer.filter(item=>item[0]==='event').map(item=>({name:item[1],parameters:item[2]})));
}
try {
  for (const width of [1440,390,320]) {
    const f=await fixture(null,width);
    await f.page.goto(base+'/');await f.page.waitForTimeout(300);
    assert.equal(f.requests.length,0,'No tracking requests before consent');
    assert.equal(await f.page.evaluate(()=>window.SmartspannerConsent.track('before_consent')),false);
    const defaults=await f.page.evaluate(()=>Array.from(window.dataLayer.find(item=>item[0]==='consent'&&item[1]==='default'))[2]);
    for(const name of ['ad_storage','analytics_storage','ad_user_data','ad_personalization']) assert.equal(defaults[name],'denied');
    assert.ok(await f.page.locator('#cookie-banner').isVisible());
    assert.ok(await f.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await f.page.locator('#cookie-banner').screenshot({path:artifacts+`/banner-${width}.png`});
    await f.page.locator('#cookie-banner [data-cookie-action="settings"]').click();
    assert.equal(await f.page.locator('#cookie-settings input:checked').count(),0);
    assert.ok(await f.page.locator('#cookie-settings').isVisible());
    await f.page.locator('#cookie-settings').screenshot({path:artifacts+`/settings-${width}.png`});
    await f.page.locator('#cookie-settings [data-cookie-action="reject"]').click();
    await f.page.reload();assert.equal(f.requests.length,0);
    assert.ok(!(await f.page.locator('#cookie-banner').isVisible()));
    assert.deepEqual(f.errors,[]);await f.context.close();
  }
  for (const category of ['analytics','experience','marketing']) {
    const f=await fixture();await f.page.goto(base+'/');
    await f.page.locator('#cookie-banner [data-cookie-action="settings"]').click();
    await f.page.locator('#cookie-'+category).check();
    await f.page.locator('#cookie-settings [data-cookie-action="save"]').click();
    await f.page.waitForTimeout(200);
    assert.equal(f.requests.some(url=>url.includes('googletagmanager')),category==='analytics');
    assert.equal(f.requests.some(url=>url.includes('contentsquare')),category==='experience');
    assert.equal(f.requests.some(url=>url.includes('hs-scripts')),category==='marketing');
    if(category==='analytics') {
      await f.page.evaluate(()=>window.SmartspannerConsent.track('after_consent'));
      assert.ok((await events(f.page)).some(event=>event.name==='after_consent'));
    }
    assert.deepEqual(f.errors,[]);await f.context.close();
  }
  {
    const f=await fixture();await f.page.goto(base+'/');
    await f.page.locator('#cookie-banner [data-cookie-action="accept"]').click();
    await f.page.waitForTimeout(200);assert.equal(f.requests.length,3);
    await f.page.evaluate(()=>{document.cookie='_ga_test=legacy; path=/';document.cookie='hubspotutk=legacy; path=/';});
    await f.page.locator('footer [data-cookie-action="settings"]').click();
    f.requests.length=0;
    await Promise.all([f.page.waitForNavigation(),f.page.locator('#cookie-settings [data-cookie-action="reject"]').click()]);
    assert.equal(f.requests.length,0,'Withdrawal reloads without optional scripts');
    assert.ok(!(await f.page.evaluate(()=>document.cookie)).includes('_ga_test'));
    assert.ok(!(await f.page.evaluate(()=>document.cookie)).includes('hubspotutk'));
    await f.page.goto(base+'/maintenance-assessment/');assert.equal(f.requests.length,0,'Assessment remains private');
    assert.equal(await f.page.locator('#smartspanner-tracking-config').count(),0);
    assert.deepEqual(f.errors,[]);await f.context.close();
  }
  const formPages=[['book-a-demo','demo_request'],['cmms-demo-video','demo_request'],['free-guide-choosing-your-cmms-vendors','guide_download'],['lp/replace-spreadsheets-with-cmms','guide_download'],['lp/director/audit-ready-maintenance-checklist','checklist_download'],['maintenance-compliance-software','checklist_download']];
  for(const [slug,type] of formPages) {
    const f=await fixture({analytics:true,experience:true,marketing:true});let payload;
    await f.context.route('https://api.hsforms.com/**',route=>{payload=route.request().postDataJSON();return route.fulfill({status:200,contentType:'application/json',body:'{}'});});
    await f.page.goto(base+'/'+slug+'/?utm_source=test&utm_campaign=consent-test&gclid=test-click');
    assert.ok(!f.requests.some(url=>url.includes('contentsquare')),'Replay disabled on every form page');
    const form=f.page.locator('form[data-lead-type="'+type+'"]').first();
    assert.equal(await form.locator('input[name="utm_source"]').inputValue(),'test');
    await form.locator('input[name="FirstName"],input[name="Name"]').fill('Browser test');
    await form.locator('input[type="email"]').fill('consent-test@example.invalid');
    const target=await form.getAttribute('data-hubspot-redirect');
    await Promise.all([f.page.waitForURL(url=>url.pathname.replace(/\/$/,'')===new URL(target).pathname.replace(/\/$/,'')),form.locator('[type="submit"]').click()]);
    const recorded=(await events(f.page)).filter(event=>leadNames.includes(event.name));
    assert.deepEqual(recorded.map(event=>event.name),[type]);
    assert.ok(!JSON.stringify(recorded).includes('consent-test@example.invalid'));
    assert.ok(!payload.context.pageUri.includes('?'));
    assert.ok(!payload.fields.some(field=>field.name==='utm_source'),'Unconfigured HubSpot properties are not submitted');
    await f.page.reload();assert.equal((await events(f.page)).filter(event=>leadNames.includes(event.name)).length,0,'No duplicate on refresh');
    assert.deepEqual(f.errors,[]);await f.context.close();
  }
  {
    const f=await fixture({analytics:false,experience:false,marketing:false});let payload;
    await f.context.route('https://api.hsforms.com/**',route=>{payload=route.request().postDataJSON();return route.fulfill({status:200,contentType:'application/json',body:'{}'});});
    await f.page.goto(base+'/book-a-demo/?utm_source=rejected&fbclid=rejected');
    const form=f.page.locator('form[data-lead-type="demo_request"]');
    assert.equal(await form.locator('input[name="utm_source"]').inputValue(),'');
    await form.locator('input[name="FirstName"]').fill('Browser test');await form.locator('input[type="email"]').fill('consent-test@example.invalid');
    await Promise.all([f.page.waitForURL(url=>url.pathname.replace(/\/$/,'').endsWith('/book-a-demo-thank-you')),form.locator('[type="submit"]').click()]);
    assert.equal(f.requests.length,0);assert.ok(payload.fields.some(field=>field.name==='email'));
    assert.equal(payload.context.hutk,undefined);assert.equal((await events(f.page)).length,0);
    await f.context.close();
  }
  for(const slug of ['book-a-demo-thank-you','guide-download','lp/replace-spreadsheets-with-cmms/thank-you','lp/director/audit-ready-maintenance-checklist/thank-you','maintenance-compliance-software/thank-you']) {
    const f=await fixture({analytics:true,experience:false,marketing:false});await f.page.goto(base+'/'+slug+'/');
    assert.equal((await events(f.page)).filter(event=>leadNames.includes(event.name)).length,0,'Direct thank-you visit is not a conversion');
    await f.context.close();
  }
  {
    const f=await fixture();
    await f.page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:1,savedAt:Date.now()-181*86400000,analytics:true,experience:true,marketing:true})),key);
    await f.page.goto(base+'/');assert.equal(f.requests.length,0);assert.ok(await f.page.locator('#cookie-banner').isVisible());await f.context.close();
  }
  {
    const f=await fixture({analytics:true,experience:false,marketing:true});let payload;
    await f.context.route('**/book-a-demo/**',async route=>{
      const response=await route.fetch();const body=await response.text();
      await route.fulfill({response,body:body.replace('"attributionFields": false','"attributionFields": true').replace('"ads": ""','"ads": "AW-111111"').replace('"adsDemo": ""','"adsDemo": "demo-test"').replace('"meta": ""','"meta": "111111"').replace('"linkedin": ""','"linkedin": "111111"')});
    });
    await f.context.route('https://api.hsforms.com/**',route=>{payload=route.request().postDataJSON();return route.fulfill({status:200,contentType:'application/json',body:'{}'});});
    await f.page.goto(base+'/book-a-demo/?utm_source=test&utm_medium=paid&utm_campaign=audit&utm_term=cmms&utm_content=demo&gclid=google-test&li_fat_id=linkedin-test&fbclid=meta-test');
    const form=f.page.locator('form[data-lead-type="demo_request"]');
    await form.locator('input[name="FirstName"]').fill('Browser test');await form.locator('input[type="email"]').fill('consent-test@example.invalid');
    // Record while the test configuration is active; actual HubSpot still uses the mocked endpoint.
    await f.page.evaluate(()=>window.SmartspannerConsent.advertisingConversion('guide_download','not-a-sale'));
    assert.equal((await events(f.page)).filter(event=>event.name==='conversion').length,0);
    assert.equal(f.requests.filter(url=>url.includes('/gtag/js')).length,1,'One Google library for GA4 and Ads');
    await Promise.all([f.page.waitForURL(url=>url.pathname.replace(/\/$/,'').endsWith('/book-a-demo-thank-you')),form.locator('[type="submit"]').click()]);
    for(const name of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','li_fat_id','fbclid']) assert.ok(payload.fields.some(field=>field.name===name&&field.value));
    await f.context.close();
  }
  {
    const f=await fixture({analytics:true,experience:false,marketing:false});
    await f.context.route('https://api.hsforms.com/**',route=>route.fulfill({status:400,contentType:'application/json',body:'{}'}));
    await f.page.goto(base+'/book-a-demo/');
    const form=f.page.locator('form[data-lead-type="demo_request"]');
    await form.locator('input[name="FirstName"]').fill('Browser test');await form.locator('input[type="email"]').fill('consent-test@example.invalid');
    await form.locator('[type="submit"]').click();await form.locator('.hubspot-form-error').waitFor();
    assert.equal(await f.page.evaluate(()=>sessionStorage.getItem('smartspanner_lead_submission')),null);
    assert.equal((await events(f.page)).filter(event=>leadNames.includes(event.name)).length,0);
    assert.ok(await form.locator('[type="submit"]').isEnabled());await f.context.close();
  }
  console.log('PASS: consent default/reject/granular acceptance/withdrawal, assessment privacy, six mocked form flows, correct single lead events, no PII in events, safe unconfigured attribution fields and direct-visit deduplication.');
} finally {await browser.close();}
