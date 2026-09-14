# Native survey placements

Each site has six survey types in its normal pages. Fieldnotes also asks for feedback after newsletter unsubscribe. The named mounts are ready for generated embeds; they currently show an unconfigured form notice and collect no answers.

| Type | OrbitDesk | Moss & Mug | Fieldnotes |
| --- | --- | --- | --- |
| FastPoll | `/account/#cancellation-section` — optional reason after **Cancel subscription**, before confirmation | `/cart/#cart-title` — optional panel after **20 seconds inactive** with items in the bag | `/membership/#membership-poll` — preferred benefit beneath membership benefits |
| Reaction | `/help/#help-start` — usefulness beneath each expanded help answer | `/order/#checkout-reaction` — checkout experience after completing a local order | `/articles/weekend-guide/#reader-feedback` — usefulness after **70% reading progress** |
| OpenFeedback | `/workspace/#workspace-feedback` — **Send feedback** drawer from workspace tools | `/products/starter-kit/#kit-suggestions` — suggestions beside product details | `/search/?q=camping#empty-state` — missing topics when search has no matches |
| UserChoice | `/pricing/#team-plan-research` — **Compare future plans**, voluntary plan research dialog | `/products/starter-kit/#bundle-lab` — **Help choose the next kit**, bundle comparison dialog | `/membership/#reader-package-invitation` — reader-package research within membership benefits |
| FeaturePriority | `/workspace/#workspace-roadmap` — first completed task or **Shape the roadmap**, drawer | `/#next-collection` — collection planning after the current assortment, dialog | `/newsletter/#newsletter-priorities-invitation` — editor’s next-season invitation, drawer |
| PricePoint | `/pricing/#pro-pricing-feedback` — **Help price Pro**, USD per person/month | `/#coffee-club` — planned two-bag coffee club, USD per household/month including delivery | `/membership/#membership-value-invitation` — annual membership research, USD per person for 12 months |

Additional Fieldnotes OpenFeedback: `/newsletter/#unsubscribe-area`. Unsubscribe completes first, then the optional form appears in its confirmation. Returning to a paused subscription retains that feedback.

## Journey rules

- Normal page links and anchors lead to the invitation or the business step that earns it. They do not inject a separate example area or bypass checkout.
- Empty carts never prompt. Visiting order confirmation without an order returns a useful shopping entry point; it does not create a sample purchase.
- Help feedback is inside its answer. Missing-topic feedback disappears when search results exist. Article feedback persists after the reader has reached the threshold.
- Research invitations open only on request; the first completed workspace task may offer roadmap feedback once. Closing a dialog returns focus to its opener.
- Checkout, cancellation, and unsubscribe never require a survey answer. Automatic invitations share a once-per-session limit, avoid typing and existing dialogs, and remain dismissible.
- The old explorer routes only forward to the native destinations. Configuration choices, fake response paths, and “Try this scenario” controls are removed from public pages.

## Maintenance and verification

`shared/survey-placements.js` maps the six type names to native page anchors and existing `data-survey-key` values. It supports old-link forwarding and coverage checks, without rendering visitor controls. `shared/demo.js` owns host visibility, dialog dismissal and fictional tab state. Run `npm run sync` after changing either file.

CI verifies all six types in actual business-page markup, unique keys, route/anchor validity, shared-copy parity and independent deployments. Browser checks exercise native invitations, timing, state persistence, no-answer continuation, responsive pages, legacy links and preservation of installed embeds.

Live embed scripts, survey IDs, API access and submission validation remain prerequisites for collecting responses. Supported survey variants belong in the creation reference, not a visitor-facing configuration page.
