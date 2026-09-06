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
- Full results require no email. Answers stay in session storage in the current browser tab, with an in-memory fallback; no answers in URLs, analytics, contact links or third-party requests. Dedicated assessment layout has no analytics/session replay scripts. Optional contact uses the existing contact page and does not transfer answers.
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
