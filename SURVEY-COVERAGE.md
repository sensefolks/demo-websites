# Survey coverage — every site

OrbitDesk, Moss & Mug, and Fieldnotes each include all six survey types at `/survey-examples/`. A visitor chooses a combination, previews it inline/in a dialog/in a drawer, and opens that same combination on a relevant page. Homepages, footers, and existing placeholders link to the explorer.

Everything remains HTML/CSS/JavaScript with **placeholders only**. No answers, real respondent details, bot challenges, or survey service calls are collected or loaded. Variant selections are serialized into shareable page URLs; sample data is fictional.

## Supported combination axes

| Type | Variants on every website | Extra-data combinations |
| --- | --- | --- |
| FastPoll | Single / multiple choice × no follow-up / selected-answer follow-up / any-configured-answer follow-up. Any nonempty subset of the three example choices can trigger follow-up. Preview triggering, non-triggering, Other, and multi-choice + Other paths. | None / respondent / session / both |
| Reaction | Expressive / thumbs up-down / Favourite. Illustrate select, change, and remove (Favourite has select/remove). | None / session |
| OpenFeedback | One free-text mode; suggestion, problem, and leaving contexts demonstrate different questions. | None / respondent / session / both |
| UserChoice | Lite / Full × with / without None of these × product / service context. Lite includes 3–4 attributes; Full includes 4–7. | None / respondent / session / both |
| FeaturePriority | All answer-dependent paths: Kano → finish (0–2 survivors); Kano → pairwise (3); Kano → MaxDiff → pairwise (4+). Product/service context; 4–7 features; 3–5 items per trial; valid shortlist below feature count. | None / respondent / session / both |
| PricePoint | One-time / monthly / quarterly / annual × discovery VW+NMS / calibration VW+NMS / calibration single-price GG / validation VW+NMS / validation single-price GG / legacy automatic-currency VW. Fixed-currency examples USD/EUR/INR; cost assumptions on/off. | None / respondent / session / both |

All supported type variants combine with the permitted data modes, three host placements, and bot protection off/on where supported. Each respondent input type is independently **off / optional / required**, allowing any nonempty subset of text, email, number, dropdown, radio, and checkbox fields. Each typed session field can independently be included or omitted: string, number, boolean. Session examples cover declared schemas and safe schema-less values. At least one field remains when its data mode is enabled.

This covers meaningful configuration categories and their combinations, rather than every possible question, option label, currency, price, or number of repeated fields. Choice fields show three fictional options; the current implementation permits 2–50. Examples stay below the embed's 25 respondent-field limit and 20 session-key limit. Input controls in the explorer configure the example; sample respondent values are displayed as text, never editable contact fields.

## Site-specific context for all six types

| Type | OrbitDesk | Moss & Mug | Fieldnotes |
| --- | --- | --- | --- |
| FastPoll | Cancellation reasons on account page | Cart hesitation before checkout | Member benefits on membership page |
| Reaction | Help answer usefulness | Post-purchase checkout experience | Article usefulness after reading |
| OpenFeedback | Workspace friction and ideas | Starter-kit improvements | Missing search topics |
| UserChoice | Workspace plan bundles | Coffee bundle trade-offs | Reader membership bundles |
| FeaturePriority | Product roadmap after a task | Next coffee collection and services | Next editorial/product features |
| PricePoint | Pro plan or workspace setup pack | One-time kit or coffee subscription | Standalone guide or recurring membership |

The original click, first-task completion, inactivity, scroll, empty-search, and unsubscribe journeys remain. Contextual combination links add an explicit preview action at the chosen page; those controls demonstrate the placement without triggering a real business operation. Original natural triggers retain their timing and dismissal behavior.

## Constraints and deferred variants

- **Reaction:** no respondent fields, combined respondent/session mode, configurable hCaptcha, or thank-you page. “No extra data” does not promise anonymity for a future live embed, which may still record standard metadata.
- **Favourite Gallery:** planned in the product specification but absent from the current Reaction embed and creation schema. Track future examples for workspace templates, coffee collections, and reading lists; do not pretend it is supported now.
- **FastPoll:** one conditional free-text follow-up, required when shown. Other is available by default and requires its own text; it cannot be configured as a follow-up trigger. Selecting Other alongside a normal triggering choice can still show follow-up in multiple-choice mode.
- **FeaturePriority:** methods are stages of one adaptive funnel, not independently chosen survey types. The runtime caps MaxDiff trial size to available items. The explorer's branch selection illustrates an answer outcome.
- **PricePoint:** phase/cohort is assigned by the service, not the host. One GG price per respondent; no VW questions before that GG response. Legacy auto currency stays VW-only. Cost assumptions affect analysis, not the questions shown.
- **Session data:** use flat, non-personal values; supply every declared field before mounting the future embed. Avoid key collisions with respondent fields. No nested objects, nulls, or arrays.

## Maintenance and acceptance

`shared/survey-catalog.js` defines the available axes, valid combinations, and fictional contexts. `shared/survey-examples.js` renders them; `shared/survey-examples.css` preserves each site's brand. Run `npm run sync` after editing shared files.

CI checks all six types **per website**, scenario destinations, shared-file parity, responsive pages, combination preservation through context links, conditional FastPoll paths, unsupported-mode exclusions, and independent respondent-field rules.

Live provisioning remains separate: define real survey configurations for the combinations selected for launch, install embeds, supply matching session schemas, and verify responses/insights. Demo credentials and internal account setup stay outside this public repository.
