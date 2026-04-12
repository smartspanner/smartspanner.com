# Landing Page: Replace Spreadsheets with CMMS in 30 Days

## Overview

A conversion-focused landing page for SmartSpanner targeting maintenance teams still using spreadsheets. The page offers a downloadable 30-day CMMS implementation guide in exchange for lead capture. Lives under a new `/lp/` directory.

**URL:** `/lp/replace-spreadsheets-with-cmms/`
**Goal:** Lead capture via guide download form
**Target audience:** Maintenance managers/teams using spreadsheets

## Files to Create

### 1. `_layouts/landing.html`

Minimal landing page layout with no main navigation or footer. Structure:

- `_includes/head.html` (reuse existing — gets SEO, fonts, analytics)
- **Minimal header:** Logo only (links to homepage), no nav menu, no CTA buttons
- `{{ content }}` block
- **Slim footer:** Single line copyright, e.g. "2026 SmartSpanner. All rights reserved."
- `_includes/scripts.html` (reuse existing — gets scroll-to-top, etc.)
- Additional `<script>` block for sticky CTA show/hide on scroll

### 2. `/lp/replace-spreadsheets-with-cmms.html`

The landing page content using `layout: landing`.

**Front matter:**
```yaml
layout: landing
title: "How to Replace Spreadsheets with a CMMS in 30 Days | Smartspanner"
description: "A practical guide to replacing spreadsheets with a CMMS in 30 days. Improve visibility, reduce downtime, and modernise your maintenance operations."
keywords: "CMMS implementation, replace spreadsheets maintenance, maintenance management system, CMMS guide, maintenance software"
```

## Section Breakdown

### Section 1: Hero (Above the Fold)

- **Pattern:** `.hero` section, centered text, dark/gradient background
- **Headline (h1):** "Still Managing Maintenance in Spreadsheets?"
- **Subheadline (p):** "Replace spreadsheets with a modern CMMS in just 30 days -- without disrupting your operations."
- **CTA:** Single `.btn-primary` button: "Download the 30-Day CMMS Guide" (anchor link to `#download` form section)
- **Bullets:** Three supporting points with Font Awesome checkmark icons:
  - Eliminate manual tracking
  - Gain real-time visibility
  - Implement without complexity

### Section 2: Trust + Relevance

- **Pattern:** `.section-bg` (light gray background)
- **Header (h2):** "Maintenance teams don't choose spreadsheets -- they inherit them."
- **Body text** explaining how spreadsheets fail, with bullet list:
  - Multiple versions of the truth
  - Missed maintenance tasks
  - No real-time visibility
  - Time-consuming reporting
- **Closing line (bold/italic):** "Spreadsheets don't fail overnight -- they fail silently."

### Section 3: Problem Agitation

- **Pattern:** 3-column grid using `.icon-box` components
- **Header (h2):** "The hidden cost of spreadsheet-based maintenance"
- **Three columns:**
  - **Operational Impact** (icon: `fa-gears`) -- Missed preventive maintenance, Poor job tracking, Reactive workflows
  - **Financial Impact** (icon: `fa-sterling-sign`) -- Increased downtime, Inefficient labour usage, Unplanned repair costs
  - **Strategic Impact** (icon: `fa-chart-line`) -- No scalability, No integrations, No data-driven decisions

### Section 4: Solution (Soft Transition)

- **Pattern:** Standard section with `.service-item` style list
- **Header (h2):** "There's a better way to manage maintenance"
- **Body intro** text, then 5 items with Font Awesome icons:
  - Centralised asset management (`fa-cubes`)
  - Real-time work order tracking (`fa-clipboard-list`)
  - Preventive maintenance automation (`fa-calendar-check`)
  - Mobile access for technicians (`fa-mobile-screen`)
  - Integrated reporting and dashboards (`fa-chart-pie`)
- **Closing line:** "The challenge isn't whether to change -- it's how to do it without disruption."

### Section 5: 30-Day Plan (Core Value)

- **Pattern:** `.section-bg`, custom timeline using grid layout + `.icon-box` styling
- **Header (h2):** "A practical 30-day implementation plan"
- **Intro text**, then 4-step horizontal timeline:
  - **Week 1:** Build your asset foundation (`fa-database`)
  - **Week 2:** Replace spreadsheet job tracking (`fa-list-check`)
  - **Week 3:** Implement preventive maintenance (`fa-wrench`)
  - **Week 4:** Introduce reporting and integrations (`fa-chart-bar`)
- Timeline uses 4-column grid (`col-lg-3 col-md-6`), each with icon, week label, and description
- Visual connector line between steps via CSS border/pseudo-element

### Section 6: What's Inside the Guide

- **Pattern:** Standard section, checklist layout
- **Header (h2):** "What's inside the guide"
- **List items** with `fa-circle-check` icons (green/primary colored):
  - Step-by-step 30-day implementation plan
  - CMMS setup framework
  - Practical maintenance workflows
  - Common pitfalls to avoid
  - 30-day implementation checklist (ready to use)
  - Templates to accelerate your rollout
- **Mid-page CTA button:** "Download the Checklist + Guide" (anchor to `#download`)

### Section 7: Outcomes

- **Pattern:** `.section-bg`
- **Header (h2):** "What you can expect in the first 30 days"
- **Bullet list** with `fa-check` icons:
  - Full visibility of maintenance activity
  - Elimination of spreadsheet tracking
  - Improved team coordination
  - Structured preventive maintenance
  - Better reporting and insights

### Section 8: Credibility / Positioning

- **Pattern:** Standard section, text-focused
- **Header (h2):** "Built for modern maintenance teams"
- **Body text** explaining how platforms like SmartSpanner:
  - Deploy quickly (not months)
  - Adapt to your workflows
  - Integrate with tools like Power BI, ERP systems, and IoT platforms
  - Provide real-time operational visibility
- Subtle positioning, no hard sell

### Section 9: Lead Capture Form (`id="download"`)

- **Pattern:** Styled like `/book-a-demo` form section, primary color background
- **Header (h2):** "Download the guide"
- **Form fields** (UI only, no Formspree wiring):
  - First Name (text input, required)
  - Work Email (email input, required)
  - Company Name (text input, optional)
- **CTA Button:** `.btn-primary` "Get the Guide + Checklist"
- **Microcopy:** "No spam. Just practical insights."

### Section 10: Secondary CTA

- **Pattern:** Simple centered text section
- **Header (h3):** "Not ready to download?"
- **Link/button:** "Book a quick demo and see how it works in practice" linking to `/book-a-demo`

## Sticky CTA Bar

- Fixed to bottom of viewport
- Hidden initially, appears after scrolling past the hero
- Contains: "Download the 30-Day CMMS Guide" button (anchor to `#download`)
- Background: white with box-shadow, z-index above content
- Hides when the form section (`#download`) is in viewport

## Custom CSS

Minimal `<style>` block in the landing page for elements not covered by existing classes:

- **Timeline connector:** Horizontal line connecting the 4 week boxes (CSS `::before` pseudo-element on the container)
- **Checklist styling:** Green checkmark icons with consistent spacing
- **Sticky CTA bar:** Fixed positioning, show/hide transitions
- **Form section:** Primary-color background with white text/inputs
- **Slim footer:** Reduced padding, single-line layout

All other styling uses existing site CSS variables and classes.

## SEO

- **Page title:** "How to Replace Spreadsheets with a CMMS in 30 Days | Smartspanner"
- **Meta description:** "A practical guide to replacing spreadsheets with a CMMS in 30 days. Improve visibility, reduce downtime, and modernise your maintenance operations."
- **Keywords:** CMMS implementation, replace spreadsheets maintenance, maintenance management system, CMMS guide, maintenance software
- Schema.org markup inherited from `_includes/head.html`

## Out of Scope

- Form backend / Formspree wiring (to be connected later)
- Downloadable PDF assets (future step)
- Exit-intent popup
- Analytics/tracking events beyond what's already in `head.html`
