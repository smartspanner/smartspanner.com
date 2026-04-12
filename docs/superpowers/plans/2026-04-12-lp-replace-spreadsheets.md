# Landing Page: Replace Spreadsheets with CMMS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a conversion-focused landing page at `/lp/replace-spreadsheets-with-cmms/` with a minimal layout (logo only, no nav), all 10 content sections, a lead capture form (UI only), and a sticky CTA bar.

**Architecture:** New `_layouts/landing.html` layout with minimal chrome (logo + slim footer). Single page file `lp/replace-spreadsheets-with-cmms.html` using existing CSS classes from `style.css` plus a scoped `<style>` block for landing-page-specific elements (timeline, checklist, sticky bar, form section background).

**Tech Stack:** Jekyll, HTML, CSS (existing site variables/classes), Font Awesome 6.4.0 icons

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `_layouts/landing.html` | Minimal layout: head include, logo-only header, content block, slim copyright footer, scripts include, sticky CTA bar |
| Create | `lp/replace-spreadsheets-with-cmms.html` | All 10 landing page sections with inline `<style>` block for LP-specific CSS |

---

### Task 1: Create the landing page layout

**Files:**
- Create: `_layouts/landing.html`

This layout strips the full site nav and footer, replacing them with a logo-only header and a slim copyright line.

- [ ] **Step 1: Create `_layouts/landing.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  {% include head.html %}
</head>
<body>
  <!-- Minimal header: logo only -->
  <header class="lp-header">
    <div class="container">
      <a href="{{ '/' | relative_url }}" class="logo">
        <img src="{{ '/assets/img/logo.png' | relative_url }}" alt="Smartspanner">
      </a>
    </div>
  </header>

  {{ content }}

  <!-- Slim footer -->
  <footer class="lp-footer">
    <div class="container">
      &copy; {{ site.time | date: '%Y' }} {{ site.company.name }}. All Rights Reserved.
    </div>
  </footer>

  <div class="scroll-top" id="scroll-top">
    <i class="fa-solid fa-arrow-up"></i>
  </div>

  {% include scripts.html %}
</body>
</html>
```

- [ ] **Step 2: Build the site and verify the layout renders**

```bash
docker exec websites bash -c "cd /srv/smartspanner.com && jekyll build --config _config.yml,_config_dev.yml"
```

Expected: Build succeeds with "done" message. The layout file is now available but not yet used by any page.

- [ ] **Step 3: Commit**

```bash
cd /home/dev/tenx/apps/websites/smartspanner.com && git add _layouts/landing.html && git commit -m "feat: add minimal landing page layout"
```

---

### Task 2: Create the landing page file with hero section

**Files:**
- Create: `lp/replace-spreadsheets-with-cmms.html`

Create the page file with front matter, all LP-specific CSS in a `<style>` block, and the hero section. Subsequent tasks append remaining sections.

- [ ] **Step 1: Create the directory**

```bash
mkdir -p /home/dev/tenx/apps/websites/smartspanner.com/lp
```

- [ ] **Step 2: Create `lp/replace-spreadsheets-with-cmms.html` with front matter, styles, and hero**

```html
---
layout: landing
title: "How to Replace Spreadsheets with a CMMS in 30 Days"
description: "A practical guide to replacing spreadsheets with a CMMS in 30 days. Improve visibility, reduce downtime, and modernise your maintenance operations."
keywords: "CMMS implementation, replace spreadsheets maintenance, maintenance management system, CMMS guide, maintenance software"
---

<style>
/* Landing page layout */
.lp-header {
  background: rgba(0, 0, 0, 0.9);
  padding: 15px 0;
}

.lp-header .logo img {
  max-height: 36px;
}

.lp-footer {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  color: #6c757d;
  border-top: 1px solid #eee;
}

/* Hero */
.lp-hero {
  background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%);
  padding: 100px 0 80px;
  text-align: center;
  color: #fff;
}

.lp-hero h1 {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #fff;
}

.lp-hero .lp-hero-sub {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.85);
  max-width: 640px;
  margin: 0 auto 30px;
}

.lp-hero .lp-hero-bullets {
  list-style: none;
  padding: 0;
  margin: 0 0 30px;
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.lp-hero .lp-hero-bullets li {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.lp-hero .lp-hero-bullets li i {
  color: var(--color-primary);
  margin-right: 8px;
}

/* Problem columns */
.lp-problem-col h4 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 15px;
  color: var(--color-secondary);
}

.lp-problem-col h4 i {
  color: var(--color-primary);
  margin-right: 10px;
}

.lp-problem-col ul {
  list-style: none;
  padding: 0;
}

.lp-problem-col ul li {
  padding: 6px 0;
  font-size: 15px;
  color: var(--color-default);
}

.lp-problem-col ul li i {
  color: #dc3545;
  margin-right: 10px;
}

/* Solution items */
.lp-solution-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.lp-solution-item i {
  color: var(--color-primary);
  font-size: 24px;
  margin-right: 15px;
  min-width: 30px;
  margin-top: 2px;
}

.lp-solution-item span {
  font-size: 16px;
}

/* Timeline */
.lp-timeline {
  position: relative;
}

.lp-timeline-item {
  text-align: center;
  padding: 20px 15px;
}

.lp-timeline-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 24px;
  margin: 0 auto 15px;
}

.lp-timeline-item h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.lp-timeline-item p {
  font-size: 15px;
  margin-bottom: 0;
}

.lp-timeline-line {
  display: none;
}

@media (min-width: 992px) {
  .lp-timeline-line {
    display: block;
    position: absolute;
    top: 52px;
    left: 15%;
    right: 15%;
    height: 3px;
    background: var(--color-primary);
    z-index: 0;
  }

  .lp-timeline-item {
    position: relative;
    z-index: 1;
  }
}

/* Checklist */
.lp-checklist {
  list-style: none;
  padding: 0;
  max-width: 560px;
  margin: 0 auto;
}

.lp-checklist li {
  padding: 10px 0;
  font-size: 17px;
  display: flex;
  align-items: center;
}

.lp-checklist li i {
  color: var(--color-primary);
  margin-right: 12px;
  font-size: 20px;
  min-width: 24px;
}

/* Outcome list */
.lp-outcomes {
  list-style: none;
  padding: 0;
  max-width: 560px;
  margin: 0 auto;
}

.lp-outcomes li {
  padding: 8px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.lp-outcomes li i {
  color: var(--color-primary);
  margin-right: 12px;
  font-size: 18px;
  min-width: 24px;
}

/* Credibility list */
.lp-credibility ul {
  list-style: none;
  padding: 0;
}

.lp-credibility ul li {
  padding: 6px 0;
  font-size: 16px;
}

.lp-credibility ul li i {
  color: var(--color-primary);
  margin-right: 10px;
}

/* Form section */
.lp-form-section {
  background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%);
  color: #fff;
}

.lp-form-section .section-header h2 {
  color: #fff;
}

.lp-form-section .section-header h2:before,
.lp-form-section .section-header h2:after {
  background: var(--color-primary);
}

.lp-form-box {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  max-width: 480px;
  margin: 0 auto;
}

.lp-form-box .form-group {
  margin-bottom: 20px;
}

.lp-form-box label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--color-default);
}

.lp-form-box input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  font-size: 14px;
  border-radius: 4px;
}

.lp-form-box input:focus {
  border-color: var(--color-primary);
  outline: none;
}

.lp-form-box .lp-form-micro {
  font-size: 12px;
  color: #6c757d;
  margin-top: 10px;
}

/* Secondary CTA */
.lp-secondary-cta {
  text-align: center;
  padding: 50px 0;
}

.lp-secondary-cta h3 {
  font-size: 22px;
  margin-bottom: 15px;
}

/* Sticky CTA bar */
.lp-sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 12px 0;
  text-align: center;
  z-index: 999;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.lp-sticky-bar.visible {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .lp-hero h1 {
    font-size: 28px;
  }

  .lp-hero .lp-hero-sub {
    font-size: 17px;
  }

  .lp-hero .lp-hero-bullets {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .lp-form-box {
    padding: 25px;
  }

  .section-header h2 {
    font-size: 24px;
  }
}
</style>

<!-- Section 1: Hero -->
<section class="lp-hero">
  <div class="container">
    <h1>Still Managing Maintenance in Spreadsheets?</h1>
    <p class="lp-hero-sub">Replace spreadsheets with a modern CMMS in just 30 days — without disrupting your operations.</p>
    <ul class="lp-hero-bullets">
      <li><i class="fa-solid fa-check"></i> Eliminate manual tracking</li>
      <li><i class="fa-solid fa-check"></i> Gain real-time visibility</li>
      <li><i class="fa-solid fa-check"></i> Implement without complexity</li>
    </ul>
    <a href="#download" class="btn btn-primary" style="padding: 14px 40px; border-radius: 50px; font-size: 17px;">Download the 30-Day CMMS Guide</a>
  </div>
</section>
```

- [ ] **Step 3: Build and verify the hero renders**

```bash
docker exec websites bash -c "cd /srv/smartspanner.com && jekyll build --config _config.yml,_config_dev.yml"
```

Visit `https://tenx.fraction.app/smartspanner.com/lp/replace-spreadsheets-with-cmms/` and confirm:
- Minimal header with logo only (no nav)
- Hero section with headline, subtitle, bullets, and CTA button
- Slim copyright footer at bottom

- [ ] **Step 4: Commit**

```bash
cd /home/dev/tenx/apps/websites/smartspanner.com && git add lp/replace-spreadsheets-with-cmms.html && git commit -m "feat: add LP hero section with styles"
```

---

### Task 3: Add sections 2-3 (Trust + Problem Agitation)

**Files:**
- Modify: `lp/replace-spreadsheets-with-cmms.html`

Append sections 2 and 3 after the hero section closing tag.

- [ ] **Step 1: Add Section 2 (Trust + Relevance) and Section 3 (Problem Agitation)**

Insert after the hero `</section>` closing tag:

```html
<!-- Section 2: Trust + Relevance -->
<section class="section-bg">
  <div class="container">
    <div class="section-header">
      <h2>Maintenance teams don't choose spreadsheets — they inherit them</h2>
    </div>
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <p>What starts as a simple solution quickly becomes:</p>
        <ul>
          <li><i class="fa-solid fa-xmark" style="color: #dc3545; margin-right: 10px;"></i> Multiple versions of the truth</li>
          <li><i class="fa-solid fa-xmark" style="color: #dc3545; margin-right: 10px;"></i> Missed maintenance tasks</li>
          <li><i class="fa-solid fa-xmark" style="color: #dc3545; margin-right: 10px;"></i> No real-time visibility</li>
          <li><i class="fa-solid fa-xmark" style="color: #dc3545; margin-right: 10px;"></i> Time-consuming reporting</li>
        </ul>
        <p style="margin-top: 20px; font-style: italic; font-weight: 600;">Spreadsheets don't fail overnight — they fail silently.</p>
      </div>
    </div>
  </div>
</section>

<!-- Section 3: Problem Agitation -->
<section>
  <div class="container">
    <div class="section-header">
      <h2>The hidden cost of spreadsheet-based maintenance</h2>
    </div>
    <div class="row gy-4">
      <div class="col-lg-4 col-md-6 lp-problem-col">
        <h4><i class="fa-solid fa-gears"></i> Operational Impact</h4>
        <ul>
          <li><i class="fa-solid fa-xmark"></i> Missed preventive maintenance</li>
          <li><i class="fa-solid fa-xmark"></i> Poor job tracking</li>
          <li><i class="fa-solid fa-xmark"></i> Reactive workflows</li>
        </ul>
      </div>
      <div class="col-lg-4 col-md-6 lp-problem-col">
        <h4><i class="fa-solid fa-sterling-sign"></i> Financial Impact</h4>
        <ul>
          <li><i class="fa-solid fa-xmark"></i> Increased downtime</li>
          <li><i class="fa-solid fa-xmark"></i> Inefficient labour usage</li>
          <li><i class="fa-solid fa-xmark"></i> Unplanned repair costs</li>
        </ul>
      </div>
      <div class="col-lg-4 col-md-6 lp-problem-col">
        <h4><i class="fa-solid fa-chart-line"></i> Strategic Impact</h4>
        <ul>
          <li><i class="fa-solid fa-xmark"></i> No scalability</li>
          <li><i class="fa-solid fa-xmark"></i> No integrations</li>
          <li><i class="fa-solid fa-xmark"></i> No data-driven decisions</li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build and verify**

```bash
docker exec websites bash -c "cd /srv/smartspanner.com && jekyll build --config _config.yml,_config_dev.yml"
```

Verify sections 2 and 3 render correctly with proper styling.

- [ ] **Step 3: Commit**

```bash
cd /home/dev/tenx/apps/websites/smartspanner.com && git add lp/replace-spreadsheets-with-cmms.html && git commit -m "feat: add trust and problem agitation sections to LP"
```

---

### Task 4: Add sections 4-5 (Solution + 30-Day Plan)

**Files:**
- Modify: `lp/replace-spreadsheets-with-cmms.html`

Append sections 4 and 5 after section 3.

- [ ] **Step 1: Add Section 4 (Solution) and Section 5 (30-Day Plan)**

Insert after section 3's `</section>` closing tag:

```html
<!-- Section 4: Solution -->
<section class="section-bg">
  <div class="container">
    <div class="section-header">
      <h2>There's a better way to manage maintenance</h2>
    </div>
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <p>Modern maintenance teams are moving to CMMS platforms that provide:</p>
        <div style="margin-top: 25px;">
          <div class="lp-solution-item">
            <i class="fa-solid fa-cubes"></i>
            <span>Centralised asset management</span>
          </div>
          <div class="lp-solution-item">
            <i class="fa-solid fa-clipboard-list"></i>
            <span>Real-time work order tracking</span>
          </div>
          <div class="lp-solution-item">
            <i class="fa-solid fa-calendar-check"></i>
            <span>Preventive maintenance automation</span>
          </div>
          <div class="lp-solution-item">
            <i class="fa-solid fa-mobile-screen"></i>
            <span>Mobile access for technicians</span>
          </div>
          <div class="lp-solution-item">
            <i class="fa-solid fa-chart-pie"></i>
            <span>Integrated reporting and dashboards</span>
          </div>
        </div>
        <p style="margin-top: 25px; font-style: italic; font-weight: 600;">The challenge isn't whether to change — it's how to do it without disruption.</p>
      </div>
    </div>
  </div>
</section>

<!-- Section 5: 30-Day Plan -->
<section>
  <div class="container">
    <div class="section-header">
      <h2>A practical 30-day implementation plan</h2>
      <p>This guide walks you through a proven, step-by-step approach:</p>
    </div>
    <div class="lp-timeline">
      <div class="lp-timeline-line"></div>
      <div class="row">
        <div class="col-lg-3 col-md-6 lp-timeline-item">
          <div class="lp-timeline-icon"><i class="fa-solid fa-database"></i></div>
          <h4>Week 1</h4>
          <p>Build your asset foundation</p>
        </div>
        <div class="col-lg-3 col-md-6 lp-timeline-item">
          <div class="lp-timeline-icon"><i class="fa-solid fa-list-check"></i></div>
          <h4>Week 2</h4>
          <p>Replace spreadsheet job tracking</p>
        </div>
        <div class="col-lg-3 col-md-6 lp-timeline-item">
          <div class="lp-timeline-icon"><i class="fa-solid fa-wrench"></i></div>
          <h4>Week 3</h4>
          <p>Implement preventive maintenance</p>
        </div>
        <div class="col-lg-3 col-md-6 lp-timeline-item">
          <div class="lp-timeline-icon"><i class="fa-solid fa-chart-bar"></i></div>
          <h4>Week 4</h4>
          <p>Introduce reporting and integrations</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build and verify**

```bash
docker exec websites bash -c "cd /srv/smartspanner.com && jekyll build --config _config.yml,_config_dev.yml"
```

Verify section 4 shows the solution items with icons, and section 5 shows the 4-week timeline with connecting line on desktop.

- [ ] **Step 3: Commit**

```bash
cd /home/dev/tenx/apps/websites/smartspanner.com && git add lp/replace-spreadsheets-with-cmms.html && git commit -m "feat: add solution and 30-day plan sections to LP"
```

---

### Task 5: Add sections 6-8 (Checklist + Outcomes + Credibility)

**Files:**
- Modify: `lp/replace-spreadsheets-with-cmms.html`

Append sections 6, 7, and 8 after section 5.

- [ ] **Step 1: Add Sections 6, 7, and 8**

Insert after section 5's `</section>` closing tag:

```html
<!-- Section 6: What's Inside -->
<section class="section-bg">
  <div class="container">
    <div class="section-header">
      <h2>What's inside the guide</h2>
    </div>
    <ul class="lp-checklist">
      <li><i class="fa-solid fa-circle-check"></i> Step-by-step 30-day implementation plan</li>
      <li><i class="fa-solid fa-circle-check"></i> CMMS setup framework</li>
      <li><i class="fa-solid fa-circle-check"></i> Practical maintenance workflows</li>
      <li><i class="fa-solid fa-circle-check"></i> Common pitfalls to avoid</li>
      <li><i class="fa-solid fa-circle-check"></i> 30-day implementation checklist (ready to use)</li>
      <li><i class="fa-solid fa-circle-check"></i> Templates to accelerate your rollout</li>
    </ul>
    <div class="text-center" style="margin-top: 30px;">
      <a href="#download" class="btn btn-primary" style="padding: 12px 36px; border-radius: 50px; font-size: 16px;">Download the Checklist + Guide</a>
    </div>
  </div>
</section>

<!-- Section 7: Outcomes -->
<section>
  <div class="container">
    <div class="section-header">
      <h2>What you can expect in the first 30 days</h2>
    </div>
    <ul class="lp-outcomes">
      <li><i class="fa-solid fa-check"></i> Full visibility of maintenance activity</li>
      <li><i class="fa-solid fa-check"></i> Elimination of spreadsheet tracking</li>
      <li><i class="fa-solid fa-check"></i> Improved team coordination</li>
      <li><i class="fa-solid fa-check"></i> Structured preventive maintenance</li>
      <li><i class="fa-solid fa-check"></i> Better reporting and insights</li>
    </ul>
  </div>
</section>

<!-- Section 8: Credibility -->
<section class="section-bg lp-credibility">
  <div class="container">
    <div class="section-header">
      <h2>Built for modern maintenance teams</h2>
    </div>
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <p>Platforms like Smartspanner are designed to:</p>
        <ul>
          <li><i class="fa-solid fa-check"></i> Deploy quickly (not months)</li>
          <li><i class="fa-solid fa-check"></i> Adapt to your workflows</li>
          <li><i class="fa-solid fa-check"></i> Integrate with tools like Power BI, ERP systems, and IoT platforms</li>
          <li><i class="fa-solid fa-check"></i> Provide real-time operational visibility</li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build and verify**

```bash
docker exec websites bash -c "cd /srv/smartspanner.com && jekyll build --config _config.yml,_config_dev.yml"
```

Verify all three sections render with correct icons and styling.

- [ ] **Step 3: Commit**

```bash
cd /home/dev/tenx/apps/websites/smartspanner.com && git add lp/replace-spreadsheets-with-cmms.html && git commit -m "feat: add checklist, outcomes, and credibility sections to LP"
```

---

### Task 6: Add sections 9-10 (Form + Secondary CTA) and sticky bar

**Files:**
- Modify: `lp/replace-spreadsheets-with-cmms.html`

Append the lead capture form, secondary CTA, and sticky CTA bar after section 8.

- [ ] **Step 1: Add Section 9 (Form), Section 10 (Secondary CTA), and Sticky Bar**

Insert after section 8's `</section>` closing tag:

```html
<!-- Section 9: Lead Capture Form -->
<section id="download" class="lp-form-section">
  <div class="container">
    <div class="section-header">
      <h2>Download the guide</h2>
    </div>
    <div class="lp-form-box">
      <form>
        <div class="form-group">
          <label for="first-name">First Name *</label>
          <input type="text" id="first-name" name="FirstName" required>
        </div>
        <div class="form-group">
          <label for="work-email">Work Email *</label>
          <input type="email" id="work-email" name="WorkEmail" required>
        </div>
        <div class="form-group">
          <label for="company-name">Company Name</label>
          <input type="text" id="company-name" name="CompanyName">
        </div>
        <div class="text-center">
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px; border-radius: 50px; font-size: 17px;">Get the Guide + Checklist</button>
          <p class="lp-form-micro">No spam. Just practical insights.</p>
        </div>
      </form>
    </div>
  </div>
</section>

<!-- Section 10: Secondary CTA -->
<section class="lp-secondary-cta">
  <div class="container">
    <h3>Not ready to download?</h3>
    <a href="{{ '/book-a-demo' | relative_url }}" class="btn btn-secondary" style="padding: 12px 36px; border-radius: 50px; font-size: 16px;">Book a quick demo and see how it works in practice</a>
  </div>
</section>

<!-- Sticky CTA Bar -->
<div class="lp-sticky-bar" id="lp-sticky-bar">
  <div class="container">
    <a href="#download" class="btn btn-primary" style="padding: 10px 30px; border-radius: 50px;">Download the 30-Day CMMS Guide</a>
  </div>
</div>

<script>
(function() {
  var stickyBar = document.getElementById('lp-sticky-bar');
  var hero = document.querySelector('.lp-hero');
  var formSection = document.getElementById('download');
  var ticking = false;

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var heroBottom = hero.getBoundingClientRect().bottom;
        var formTop = formSection.getBoundingClientRect().top;
        var windowHeight = window.innerHeight;

        if (heroBottom < 0 && formTop > windowHeight) {
          stickyBar.classList.add('visible');
        } else {
          stickyBar.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
})();
</script>
```

- [ ] **Step 2: Build and verify**

```bash
docker exec websites bash -c "cd /srv/smartspanner.com && jekyll build --config _config.yml,_config_dev.yml"
```

Verify:
- Form section renders with dark background, white form box, 3 fields, and submit button
- Secondary CTA shows "Book a quick demo" link
- Sticky bar appears when scrolling past hero, disappears when form is in view

- [ ] **Step 3: Commit**

```bash
cd /home/dev/tenx/apps/websites/smartspanner.com && git add lp/replace-spreadsheets-with-cmms.html && git commit -m "feat: add form, secondary CTA, and sticky bar to LP"
```

---

### Task 7: Final build and verify complete page

**Files:** (no changes — verification only)

- [ ] **Step 1: Full rebuild**

```bash
docker exec websites bash -c "cd /srv/smartspanner.com && jekyll build --config _config.yml,_config_dev.yml"
```

- [ ] **Step 2: Verify the complete page at `https://tenx.fraction.app/smartspanner.com/lp/replace-spreadsheets-with-cmms/`**

Check all 10 sections render in order:
1. Hero with headline, subtitle, bullets, CTA
2. Trust section with bullet list on gray background
3. Problem agitation with 3 columns
4. Solution with icon items on gray background
5. 30-day timeline with 4 week steps
6. Checklist with green checkmarks on gray background
7. Outcomes list
8. Credibility section on gray background
9. Form with dark background and white box
10. Secondary CTA with demo link

Also verify:
- Logo-only header (no navigation)
- Slim copyright footer
- Sticky bar appears/disappears correctly on scroll
- Page is responsive on mobile widths
- All anchor links (`#download`) scroll to the form

- [ ] **Step 3: Fix any visual issues found during review**

Address any spacing, alignment, or responsive problems discovered.

- [ ] **Step 4: Final commit (if any fixes were needed)**

```bash
cd /home/dev/tenx/apps/websites/smartspanner.com && git add -A && git commit -m "style: polish landing page layout and responsiveness"
```
