# Yarra River Dragons

Static site for yarrariverdragons.com.au, built with [Eleventy](https://www.11ty.dev/).

## Develop

```
npm install
npm run serve
```

## Build

```
npm run build
```

Output goes to `_site/`. Pushing to `main` deploys automatically via GitHub Actions
(`.github/workflows/deploy.yml`) to GitHub Pages.

## Content

Editable data lives in `content/*.json`. Anything still marked `"TODO"` renders with a
visible "content coming soon" tag on the site — replace the value to make it live.

Newsletter issues: see [CONTRIBUTING.md](./CONTRIBUTING.md).

Design rules and the rationale behind the visual system live in [DESIGN.md](./DESIGN.md).

## UI checks

GitHub Actions runs Playwright interaction, responsive-layout and visual-regression checks.
The workflow installs Playwright without adding it to the production dependency graph.

For local browser checks:

```
npm install --no-save --package-lock=false @playwright/test@1.63.0
npx playwright install chromium
npx playwright test tests/site.spec.js
```

The first CI run establishes the cached visual baseline. When an intentional redesign should
become the new baseline, increment the visual baseline version in
`.github/workflows/ui-tests.yml`.

## Calendar subscriptions

The public website links to Team App's calendar subscription helper and advertises only the
`non_member=public_events_only` feed. Never commit a member-specific Team App calendar URL
containing a `secret=` parameter; those URLs are scoped to that member's access groups.

## Deferred to v1.1

- Admin content editor (Decap/Tina CMS)
- Structured `races.json` extracted from newsletters
- Home page stat strip and member testimonials
- Standalone blog/news section
