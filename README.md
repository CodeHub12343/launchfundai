# LaunchFund AI — Next.js scaffold

Next.js 14 (app router) + styled-components rendering the 10 artboards from the canvas as real routes. Dark SaaS theme, violet primary (`#7C5CFF`) + lime accent (`#D4FF4A`), Inter + Instrument Serif.

## Install & run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Routes

| Path | Artboard |
|---|---|
| `/` | Homepage (01) |
| `/explore` | Explore Campaigns (02) |
| `/campaigns/[id]` | Campaign Details (03) |
| `/creator` | Creator Dashboard (04) |
| `/investor` | Investor / Sponsor Dashboard (05) |
| `/studio` | AI Marketing Studio (06) |
| `/proposals/[id]` | Funding Proposal (07) |
| `/admin` | Admin Dashboard (08) |

Mobile layouts are handled responsively via media-queried styled-components (the dedicated Mobile Home and Mobile Dashboard artboards informed the sub-640px views of `/` and `/creator`).

## Structure

```
app/
  layout.js            # fonts + Providers wrapper
  page.js              # homepage
  explore/page.js
  campaigns/[id]/page.js
  creator/page.js
  investor/page.js
  studio/page.js
  proposals/[id]/page.js
  admin/page.js
components/
  providers.js         # ThemeProvider + GlobalStyles + registry
  GlobalStyles.js
  ui.js                # Card, Chip, buttons, ProgressBar, headings, etc.
  Logo.js
  Nav.js               # marketing top nav
  Footer.js
  DashboardShell.js    # sidebar + topbar for creator/investor/admin
  CampaignCard.js
lib/
  registry.js          # styled-components SSR registry
  theme.js             # design tokens (colors, fonts, radii, breakpoints)
```

## Design tokens

Edit `lib/theme.js` to swap the palette or type scale globally; every styled component reads from the theme.

## Notes

- Every monetary surface carries the risk-disclosure pattern (never-guaranteed, milestone-gated).
- The funding calculator inputs are illustrative controls only; wire them to state once backend math is defined.
- No backend / auth / payments included — this is a UI scaffold.
# launchfundai
