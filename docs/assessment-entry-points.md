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
