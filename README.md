# Sensefolks demo websites

Three fictional brands showing where a survey can fit into a real customer journey. Every deployed site is plain HTML, CSS, JavaScript, and local images. There are no application servers, payments, accounts, analytics trackers, or survey submissions.

| Folder | Brand | Pages |
| --- | --- | --- |
| `orbitdesk/` | Task-management SaaS | Home, pricing, workspace, help, subscription, survey examples |
| `moss-and-mug/` | Coffee equipment boutique | Shop, starter kit, cart, checkout, order, survey examples |
| `fieldnotes/` | Travel and outdoor magazine | Home, weekend guide, search, membership, newsletter, survey examples |

All six Sensefolks survey types appear **on every website**. Each site's `/survey-examples/` page combines supported variants, respondent fields, session data, and placements, with links to realistic page contexts. See the [complete coverage matrix and supported constraints](SURVEY-COVERAGE.md).

Business interactions work locally; survey placeholders do not collect answers. Fictional preferences and cart/task state last for the current browser tab. **Start again** resets that site's local demo state; shareable example selections remain in the URL.

## Preview

With Node 22 or newer:

```sh
npm run preview
```

- OrbitDesk: <http://127.0.0.1:4171>
- Moss & Mug: <http://127.0.0.1:4172>
- Fieldnotes: <http://127.0.0.1:4173>

No install is required for preview. Alternatively, serve any site folder as the root of an ordinary static HTTP server. Opening HTML through `file://` does not resolve the root-relative links. The preview script is a local development tool and is not part of the published sites.

## Deploy separately on Netlify

Import this repository three times, once per row:

| Netlify site | Base directory | Publish directory | Build command |
| --- | --- | --- | --- |
| OrbitDesk | `orbitdesk` | `.` | Leave empty |
| Moss & Mug | `moss-and-mug` | `.` | Leave empty |
| Fieldnotes | `fieldnotes` | `.` | Leave empty |

Each folder includes its own `netlify.toml`, headers, and assets. If selecting a package directory during import, select the same site folder. Publish only that folder. No environment variables, functions, plugins, or build step are required. See [Netlify's monorepo configuration](https://docs.netlify.com/build/configure-builds/monorepos/).

## Original survey scenarios

| Site / page | Action | Future survey / placement |
| --- | --- | --- |
| OrbitDesk / pricing | Ask to help price the Pro plan | PricePoint / dialog |
| OrbitDesk / workspace | Complete a task | FeaturePriority / roadmap drawer |
| OrbitDesk / help | Expand a help answer | Reaction / inline |
| OrbitDesk / subscription | Begin cancellation | FastPoll / optional cancellation feedback |
| Moss & Mug / starter kit | Help shape a bundle | UserChoice / product context |
| Moss & Mug / cart | Leave a nonempty cart inactive for 20 seconds | FastPoll / optional panel |
| Moss & Mug / order | Complete the fictional checkout | Reaction / confirmation page |
| Fieldnotes / article | Read 70% of the guide | Reaction / article footer |
| Fieldnotes / search | Search for an unavailable topic | OpenFeedback / empty state |
| Fieldnotes / membership | Explore member benefits | FastPoll / inline |
| Fieldnotes / newsletter | Unsubscribe from the fictional newsletter | OpenFeedback / after confirmation |

The websites control when and where a placeholder appears. Automatic prompts share a once-per-session limit within each site and avoid interrupting text entry. Explicit scenario controls let visitors try the placement immediately. Cancellation, checkout, and unsubscribe never depend on answering a survey.

The survey examples explorer adds the remaining types to each brand, including coffee pricing, editorial priorities, workspace OpenFeedback, and membership UserChoice. It shows supported categorical combinations; incompatible options, such as respondent fields on Reaction, are excluded and explained.

## Maintain and check

The small common presentation helper lives in `shared/`. Its committed copies inside each site's `assets/` keep deployments independent. After changing shared code:

```sh
npm run sync
npm ci --ignore-scripts
npm run check
npx playwright install chromium
npm test
```

GitHub Actions runs the static checks and desktop/mobile browser scenarios on Node 22. Shared-copy verification prevents deployments with stale helper code. `npm run check` also checks page links, script syntax, all six placeholder types, and common private-material patterns.

Keep this public repository limited to fictional content and browser assets. Live credentials, survey identifiers, account setup instructions, and internal infrastructure configuration belong elsewhere. Existing headers intentionally allow Google Fonts and block browser API connections; connecting real embeds is a separate future change.

Fonts use the [Google Fonts CSS API](https://developers.google.com/fonts/docs/css2). Locally stored photography is listed in [ASSETS.md](ASSETS.md).
