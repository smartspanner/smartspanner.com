# Concise Feature Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert feature-menu pages to concise product-research pages and improve feature navigation placement.

**Architecture:** Each feature page keeps a standalone Jekyll HTML file using the existing `default` layout and existing section/component classes. The pages should use a consistent short structure: hero, focused intro, practical feature workflow, capability cards, one topic-specific integration/context section, and final CTA.

**Tech Stack:** Jekyll, Liquid, Bootstrap-style grid classes, existing Smartspanner CSS and assets.

---

### Task 1: Navigation

**Files:**
- Modify: `_includes/header.html`

- [x] Move the top-level `Features` dropdown before `Industries`.
- [x] Move `/features` to the first item inside the Features dropdown and label it `All Features`.
- [x] Keep all existing feature page URLs.

### Task 2: Legacy Feature Pages

**Files:**
- Modify: `spare-part-inventory-software.html`
- Modify: `compliance-software.html`

- [x] Replace legacy `layout: feature` service-detail pages with the modern `layout: default` structure.
- [x] Use concise sections: hero, intro, how it works, focused capability cards, related module/context section, CTA.

### Task 3: Long Generic Feature Pages

**Files:**
- Modify: `work-order-management-software.html`
- Modify: `asset-management-software.html`
- Modify: `mobile-cmms.html`
- Modify: `multi-language-cmms-software.html`
- Modify: `permit-to-work-software.html`
- Modify: `fire-risk-assessment-software.html`

- [x] Remove generic FAQ, best-practice, who-needs, why-Smartspanner, and broad vs-CMMS sections where they do not add specific product research value.
- [x] Preserve topic-specific workflow, capability, integration, safety, and compliance information.
- [x] Keep final CTA sections concise.

### Task 4: Already Concise Feature Pages

**Files:**
- Review: `maintenance-procedure-software.html`
- Review: `reporting.html`

- [x] Leave pages unchanged unless they contain the generic repeated sections being removed elsewhere.

### Task 5: Verification

**Commands:**
- `docker exec websites bash -c "cd /srv/smartspanner.com && jekyll build --config _config.yml,_config_dev.yml"`
- `curl -I https://tenx.fraction.app/smartspanner.com/features/`
- `curl -I https://tenx.fraction.app/smartspanner.com/spare-part-inventory-software/`
- `curl -I https://tenx.fraction.app/smartspanner.com/compliance-software/`

- [x] Build exits 0.
- [x] Representative feature pages return HTTP 200.
- [x] `git diff` shows only planned content/nav changes.
