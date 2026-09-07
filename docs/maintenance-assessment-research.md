# Maintenance assessment: research and design

Researched 6 September 2026. This is a Smartspanner-authored decision aid, not an independent certification, validated diagnostic instrument or financial business case.

## Evidence reviewed

- [US Department of Energy, O&M Best Practices, chapter 4](https://www1.eere.energy.gov/femp/pdfs/OM_4.pdf): assess work tracking, asset history, parts and documentation; evaluate vendor suitability, implementation ownership and training. These inform the topics and readiness checks. The guide does not establish numerical buying thresholds. Its historical savings figures are not used.
- [HSE, inspection of work equipment](https://www.hse.gov.uk/work-equipment-machinery/inspection.htm): inspection scope and frequency depend on risk; records can take different forms. Assess access to evidence without implying that legislation mandates CMMS or that software certifies compliance.
- [GOV.UK Design System, question pages](https://design-system.service.gov.uk/patterns/question-pages/): start with one thing per page, provide back navigation, and ask only relevant questions. Use one question per slide, explicit Continue, native controls and conditional follow-ups.
- [Smartspanner pricing](https://www.smartspanner.com/pricing/): documents work orders, assets, preventive schedules, multi-site, spare parts and mobile; procedures and contractors; further inspection, reporting and API capabilities. Browser and mobile access require internet. No plan or price recommendation is inferred from this assessment.
- [Preventive maintenance](https://www.smartspanner.com/preventative-maintenance-software/), [asset management](https://www.smartspanner.com/asset-management-software/) and [inventory](https://www.smartspanner.com/spare-part-inventory-software/): support the core workflow fit checks.
- [Integrations and API](https://www.smartspanner.com/integrations-api/) and [IoT maintenance](https://www.smartspanner.com/iot-maintenance-software/): these capabilities are marketed, but a particular integration, sensor deployment or predictive use case still needs technical verification. Do not classify every IoT requirement as unsupported or promise arbitrary compatibility.

## Fraction reference

Reviewed the sibling project's `erp-assessment.html`, `_layouts/assessment.html`, `_data/erp_assessment.json` and `assets/js/erp-assessment-model.js`. At review time the referenced interaction JS and assessment CSS were absent, and no dedicated assessment design notes were found. Reuse the structure: introduction, conditional question journey, reasons, practical next steps, distinct vendor fit, answer review and printing. Do not copy manufacturing ERP questions or treat that model as maintenance research.

## Decisions

- Positioning: “Should you actually buy a CMMS?” Be willing to recommend simple tools, improvement of an existing system, investigation, or a different supplier.
- 18–25 slides depending on answers, in three chapters: operation, current control, next step. Estimate 5–7 minutes, to be validated with real users.
- Assess observed control gaps and recurring impact together. Asset count and team size alone cannot trigger a strong buying recommendation. A small but critical operation can justify investigation.
- Ask about scheduled task volume in a typical month, not an ambiguous number of recurring templates.
- Separate maintenance coordination complexity, operational impact, implementation readiness and product fit. Use explained categories rather than unsupported 0–100 precision or the suggested arbitrary percentage weights.
- Treat unknown answers as uncertainty, not pain or proof of product suitability. Surface conflicting answers for clarification.
- Preserve “keep current system” and “review setup/adoption” outcomes. Capacity and supplier constraints require operational action; software cannot remove them alone.
- A required-inspection evidence gap receives a specific action even with few assets. This is a record-control prompt, not a compliance verdict or inspection schedule.
- Fit follows essential workflows and access requirements, not industry stereotypes. Offline/on-premise essentials indicate unlikely fit; specialist validation, enterprise governance, IoT and integrations require review. No undocumented scale cutoff.
- The conclusion is available without email. The full report, including its reasoning, priorities, product fit, methodology and printing, requires a successful HubSpot contact submission; see the report-gate contract below. Answers stay in session storage in the current browser tab, with an in-memory fallback; no answers in URLs, analytics, contact links or third-party requests. Dedicated assessment layout has no analytics/session replay scripts. Optional contact uses the existing contact page and does not transfer answers.
- Responsive cream, charcoal and Smartspanner amber presentation, generous type, a chapter rail, selectable cards, progress and subtle motion. Respect reduced motion; support keyboard navigation, visible focus, announced validation, print and JavaScript-disabled fallback.

## Validation

Use scenario tests for small/simple operations, high pain, critical small operations, successful existing CMMS, adoption problems, non-software causes, missing information, evidence gaps and hard fit constraints. Check conditional answers are pruned after edits, exclusive choices, limits, restored state and print output. Build Jekyll with the development configuration, test desktop/mobile in a browser, and verify development URLs and asset paths before committing.

Validated 6 September 2026:

- `node _tests/maintenance-assessment.test.cjs`: 16 passing tests, including evaluation of every defined answer option.
- `_tests/maintenance-assessment-browser.mjs`: complete low-need and high-need/offline journeys, desktop at 1440px, mobile at 390px and 320px, keyboard selection, empty-answer validation, maximum selections, conditional pruning, result and question resume, corrupt storage, blocked storage, printing and JavaScript-disabled fallback. No horizontal overflow or third-party requests observed.
- Browser runner uses an existing Playwright installation: `PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node _tests/maintenance-assessment-browser.mjs`. The default target is the development assessment URL; override with `ASSESSMENT_URL`. Screenshots and PDF go to `/tmp/smartspanner-assessment` by default.
- Build succeeds with `_config.yml,_config_dev.yml`. The documented `websites_jekyll` container no longer exists in this environment; its replacement is `websites`, with the same `/srv/smartspanner.com` mount and Jekyll command.
- Development assessment responds with HTTP 200. Static and generated report links resolve. Internal `_tests`, `_data` and `_layouts` directories are not published.

Remaining validation is real-user research: completion time, question comprehension and usefulness of recommendations. No conversion, savings or diagnostic accuracy claims have been inferred from automated testing.

## Report gate: 7 September 2026

Only the conclusion heading and short summary stay visible before submission, alongside an “Unlock my full report” prompt and answer-review controls. The detailed report is hidden by default in both screen and print styles. The prompt opens the dedicated HubSpot form requesting first name and email. A successful Forms API response immediately reveals the report and moves focus to its heading. The unlocked report includes the reasoning, need/readiness/fit categories, priorities, next steps, system guidance, methodology, answers and print/PDF button. The same-tab unlock marker from the earlier print gate is honoured, so existing submitters do not need to submit again. No report-delivery email is promised or configured. This client-side gate is a lead-capture flow, not a server-enforced access-control boundary.

The gate uses the dedicated assessment form supplied by the site owner: portal `9191859`, form `977dfaef-f796-432e-a5c0-b614ff58d21d`, region `na1`. Both IDs are page front-matter settings. It replaces the download form initially used for the gate. The custom dialog submits directly to the Forms API, preserving the existing styling and privacy controls without loading HubSpot's embed script. The form contract is first name, email and a hidden report-source field.

The payload is an explicit allowlist:

- `firstname`
- `email`
- `lead_gen_name`: `Maintenance Assessment: Full Report`
- Context: the assessment page's origin/path and fixed page title. Query strings, fragments, tracking cookies and referrers are omitted.

Answers, need/fit categories, recommendations and report text are never read by the gate script or submitted to HubSpot. Contact details are cleared from the form after success or dismissal and are not saved in browser storage. Only a boolean unlock marker is saved. Assessment answers still follow the tab-local storage rules above.

Failed, interrupted or timed-out requests keep the full report hidden and preserve the visible conclusion. Duplicate submissions while a request is in flight are blocked. Closing the dialog does not cancel an already submitted request. There is no new tracking script or email automation. Any follow-up behaviour configured for the dedicated form is managed in HubSpot.

Reference: [HubSpot's unauthenticated Forms API](https://developers.hubspot.com/docs/api-reference/legacy/marketing/forms/v3-legacy/submit-data-unauthenticated). Authenticated HubSpot configuration is not accessible in this workspace. The dedicated form IDs come from the owner-supplied embed code. A live submission and email automation behaviour were not tested.

Subsequent form-failure investigation (7 September): the public v4 render definition confirmed the form is published with `firstname`, optional `lastname`, required `email` and `lead_gen_name`. An empty live request returned the expected missing-email validation error. A browser diagnostic containing the expected fields and the deliberately invalid string `not-an-email` unexpectedly returned HTTP 200; no deliverable email address was used, but HubSpot may have recorded the diagnostic submission. This verifies endpoint reachability and field acceptance, not delivery or CRM workflow behaviour.

Replaying the previous print-gate script against the new full-report markup reproduced a JavaScript null-element error and an inert unlock button. Assessment script/style URLs now share a build timestamp, preventing a cached older asset URL from being reused by a new page. This reproduces a plausible cause, not confirmation of the visitor's specific browser state. The browser suite checks all four asset versions. Submission errors now distinguish connectivity, timeout, rate-limit and recognised email validation failures; rejected requests log only status, error types and a correlation reference, never submitted values or raw response messages.

Validation: `_tests/maintenance-assessment-print-browser.mjs` intercepts every HubSpot request, so it creates no real leads or emails. It verifies the exact dedicated-form endpoint, payload contents, omitted cookies/referrers/query strings, required fields, invalid email, dismissal, HTTP errors, network errors, retries, duplicate prevention, successful report reveal and focus, hidden details before unlock (including native printing), contact-data non-persistence, repeat printing, locked/unlocked tab reload and 390px/320px layouts. Run with the same `PLAYWRIGHT_MODULE` environment setting as the main browser suite. Review screenshots are in `/tmp/smartspanner-assessment-gate`.
