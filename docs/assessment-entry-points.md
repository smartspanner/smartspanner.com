# Maintenance assessment entry points

Implemented 8 September 2026. The assessment is the next step for visitors considering whether they need CMMS, defining their maintenance requirements or deciding whether to investigate further. It is not a prerequisite for a demo or trial.

## Placement map

| Visitor's decision | Entry point | Placement and message |
| --- | --- | --- |
| “Do I need this?” | Homepage hero | Secondary text link beneath trial/video choices: “Not sure you need a CMMS?” |
| “These problems sound familiar” | Homepage problem section | Existing assessment callout updated with explicit report-gate disclosure |
| “Where should I start?” | Resources navigation and blog directory | “Do You Need a CMMS?” is first in Resources under “Start Here”; also listed under CMMS basics |
| “Would this help my operation?” | What is a CMMS? article | End-of-article assessment replaces the generic product callout |
| “Which benefits matter to us?” | CMMS benefits article | End-of-article prompt focused on maintenance priorities |
| “Are we too small for CMMS?” | Small-business maintenance article | Prompt explains that team size alone does not establish need |
| “What should we improve first?” | Reactive vs preventive article | Prompt focused on routines, control gaps and software need |
| “Do these gaps justify software?” | CMMS software page | Callout after the maintenance-information problems are explained |
| “Have we outgrown spreadsheets?” | Spreadsheet migration guide | Callout after the introduction, before migration guidance and the download |
| “What requirements should we compare?” | How to choose CMMS article | End-of-article requirements assessment |
| “Which system should we shortlist?” | Best CMMS software comparison | Requirements callout before the comparison table |
| “Is CMMS worth buying at all?” | Pricing | Quiet text link below the existing plan/demo advice |
| General discovery | Footer | Existing assessment link retained |

The five selected articles use the assessment as their next-step callout. Other articles retain the existing demo/trial callout. Global demo and trial navigation, product-page primary CTAs, pricing-plan trial buttons, enquiry forms and guide-download flows remain available.

## Implementation and copy

`_data/assessment_prompts.yml` holds the contextual messages. `_includes/assessment-cta.html` renders a full callout or compact text link. `assessment_cta` front matter loads the small, versioned stylesheet only where needed; for the selected blog articles it also chooses the prompt for their next-step callout.

Each callout states that the conclusion is available without email and name/email unlock the full report. Full callouts also state that assessment answers stay private. No internal campaign parameters or answer data are added to destination URLs.

## Measurement

The existing marketing-page GA4 integration records `assessment_cta_click` with:

- `placement`: `home-hero`, `home-problem`, `cmms-problem`, `spreadsheet-decision`, `comparison-intro`, `pricing-unsure`, `article-next-step`, `resource-directory`, `navigation` or `footer`.
- `source_path`: the pathname of the marketing page, excluding query strings.

Compare event counts by placement and source page in GA4 to see which entry points attract assessment visits. These are click counts, not confirmed assessment starts, completions or report requests. The assessment page still has no analytics/session replay integration and does not transmit answers or results.

## Verification

Development build uses `_config.yml,_config_dev.yml` in the current `websites` container. Browser checks cover the 12 contextual placements at 1440px and 390px widths, correct development-baseurl destinations, one analytics event per click, retained demo navigation, unchanged callout behaviour on an unselected technical article and navigation from the homepage into the assessment. Analytics services and form submissions are blocked during click-measurement checks. Review screenshots are saved in `/tmp/smartspanner-assessment-entries`.

Placement is based on page content and visitor intent, not observed conversion data. Review the entry-click data before adding more callouts or promoting the assessment more heavily on buying pages.

## Search and AI discovery

Updated 8 September 2026. The assessment has a dedicated search title, description, Open Graph and Twitter card metadata, canonical URL, links to both AI context files, and a separate JSON-LD graph for its WebPage, WebApplication, publisher, website and breadcrumbs. It describes the assessment itself rather than reusing the paid CMMS product schema. Public introductory copy and background-reading links are available in the generated HTML without JavaScript; individual answers, conclusions and report details are not placed in metadata.

Both `llms.txt` and `llms-full.txt` describe the assessment's purpose, possible directions, browser-only report delivery, email gate and answer privacy. The longer file explains its limitations and includes it among the site's calls to action. Resource-directory, selection-guide, comparison and spreadsheet-migration descriptions now mention the relevant assessment step.

The existing `jekyll-sitemap` plugin already includes `/maintenance-assessment/`. The assessment now explicitly opts in and supplies `last_modified_at`; the eleven pages updated with contextual links also carry their actual modification date. Do not hand-edit `_site/sitemap.xml` or change these dates on every build. `robots.txt` already allows the assessment and advertises the production sitemap and AI files, so no crawler-rule changes were required.

Verification covered separate production and development builds: all twelve affected sitemap entries and dates, canonical URLs, metadata, parsed JSON-LD, local assessment links and AI context files. The production sitemap contains production URLs only. The existing assessment browser suite passed desktop/mobile journeys, keyboard navigation, validation, result gating, print, resume, conditional questions, storage fallback, no-JavaScript fallback and privacy checks. The development assessment returned HTTP 200.

Implementation references: [Jekyll sitemap lastmod support](https://github.com/jekyll/jekyll-sitemap#lastmod-tag) and [Schema.org WebApplication](https://schema.org/WebApplication). These files describe the tool for crawlers; indexing and search appearance remain controlled by the search providers.
