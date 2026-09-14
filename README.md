# Sensefolks demo websites

Three independent static websites with feedback invitations inside normal customer journeys. Each brand has native locations for all six survey types: no survey menu, configuration explorer, or appended example section.

**The forms are not connected yet.** Named mounts show their question and “This feedback form is coming soon.” until the generated Sensefolks embeds are installed. No survey answers are collected. Shopping, workspace, and newsletter actions use fictional data in the current browser tab.

| Folder | Brand | Business pages |
| --- | --- | --- |
| `orbitdesk/` | Team task management | Home, pricing, workspace, help, account |
| `moss-and-mug/` | Coffee equipment shop | Shop, starter kit, cart, checkout, order |
| `fieldnotes/` | Outdoor journal | Home, weekend guide, search, membership, newsletter |

See [survey locations and triggers](SURVEY-COVERAGE.md). Survey definitions and creation settings belong in the private creation reference; public `data-survey-key` values identify the mount, not a survey account or ID.

## Preview

With Node 22 or newer:

```sh
npm run preview
```

- OrbitDesk: <http://127.0.0.1:4171>
- Moss & Mug: <http://127.0.0.1:4172>
- Fieldnotes: <http://127.0.0.1:4173>

No install is required for preview. Each site folder can also be served as an HTTP root. Root-relative assets do not work through `file://`.

## Deploy separately on Netlify

Import this repository once per site:

| Site | Base directory | Publish directory | Build command |
| --- | --- | --- | --- |
| OrbitDesk | `orbitdesk` | `.` | Empty |
| Moss & Mug | `moss-and-mug` | `.` | Empty |
| Fieldnotes | `fieldnotes` | `.` | Empty |

Each folder contains its own `netlify.toml`, headers and assets. No build, environment variables, functions, or shared parent directory is needed at deployment. Publish only the selected site folder.

Existing `/survey-examples/?type=...` and `?example=1&type=...` URLs forward to the native invitation. They never create orders, change account state, or open feedback automatically. Without a known type, the old explorer URL returns visitors to the homepage.

## Maintain and check

Shared host helpers live in `shared/`; committed copies in each site's `assets/` keep deployment independent. After editing shared code:

```sh
npm run sync
npm ci --ignore-scripts
npm run check
npx playwright install chromium
npm test
```

GitHub Actions checks shared parity, local links and anchors, native coverage, script syntax, desktop/mobile journeys, and deployment boundaries on Node 22. Tests cover feedback timing, dismissal, completed checkout, cancellation, unsubscribe, and compatibility redirects.

Automatic invitations appear at most once per site session and do not interrupt typing. Earned article feedback stays available on return. Manual research invitations remain available, and every business action can finish without a survey answer. **Start again** resets the current site's fictional state.

## Connect real surveys

Replace the children of the matching `[data-survey-key]` mount with its generated embed. The shared initializer preserves installed children. Keep the existing host trigger and native dialog or inline container; do not add another survey launcher. Configure only the concrete study appropriate to that page, including its stated pricing period and currency.

Before enabling live forms, provide the real survey IDs/snippets, declare only needed script/API origins in that site's Content Security Policy, and verify submissions in the matching dashboard. The current headers intentionally allow Google Fonts and block API connections; no live provisioning is claimed by this repository.

Keep credentials, private infrastructure configuration and real customer data outside this public repository. [Photography credits](ASSETS.md).
