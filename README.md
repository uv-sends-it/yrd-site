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

## Production domain

The Pages build is configured for the production root domain:

`https://yarrariverdragons.com.au`

The old repository path prefix (`/yrd-site/`) is deliberately not used in production.
The repository uses a custom GitHub Actions Pages workflow, so GitHub's custom-domain setting
is authoritative and a repository `CNAME` file is neither required nor used.

Before changing DNS at VentraIP:

1. Open **Repository Settings → Pages**.
2. Set **Custom domain** to `yarrariverdragons.com.au`.
3. Save it and leave the DNS check pending.
4. Then change only the website DNS records at VentraIP.
5. Once DNS passes in GitHub Pages, enable **Enforce HTTPS**.

For the apex domain use GitHub Pages' current `A` records, and point `www` by CNAME to
`uv-sends-it.github.io`. Do not modify mail-related MX, SPF, DKIM or DMARC records.

## Content

Editable data lives in `content/*.json`. Anything still marked `"TODO"` renders with a
visible "content coming soon" tag on the site — replace the value to make it live.

No public newsletter archive is currently exposed on the site.

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

## TeamApp schedule sync

The site can refresh its next-session display from the private TeamApp ICS feed without exposing
that feed to visitors.

Add a GitHub Actions repository secret named `TEAMAPP_PRIVATE_ICS_URL`. The deploy workflow runs
twice a week, around Monday and Thursday mornings in Melbourne, fetches the private ICS feed during
the build, extracts only the next likely training session's day, time and cancellation state, then
deploys the sanitised result.

For an unusual or last-minute change, run the same workflow manually from GitHub Actions instead
of increasing the automatic polling frequency.

The private ICS URL is never written into the repository, HTML or browser JavaScript.

If the secret is unavailable or the feed cannot identify a likely training session, the site uses
the repository fallback schedule in `content/schedule.json`.

TeamApp remains the source of truth for members and late changes.

## Deferred to v1.1

- Admin content editor (Decap/Tina CMS)
- Home page stat strip and member testimonials

## Local chat fallback

Ask YRD uses a two-layer approach:

1. Reviewed FAQ matches answer common visitor questions immediately.
2. A local Llama 3.2 1B Instruct q4f16 model is used only for unmatched questions on browsers
   with WebGPU. It receives only the current question plus reviewed YRD facts.

The local model is lazy-loaded, so it does not affect normal page load or common FAQ replies.
It is constrained to short answers and may return `NEED_CONTACT`; unsupported browsers go
straight to the contact fallback.

## Committee and coaches

Maintain office bearers and the general committee in `content/committee.json`.
Entries with `"role": "General"` appear by name under **General committee**;
other entries display their office-bearer titles. Individual contact details
are not published. Visitors contact the club using `content/site.json`.

Maintain coaching names and roles in `content/coaches.json`. The initial list
comes from the club's former public Who are we? page; please confirm it remains
current with the committee. A verified, permission-cleared photo can be added
to either data file using `"photo": "/assets/filename.jpg"` after uploading it
to `src/assets/`. Never substitute someone else's portrait.
