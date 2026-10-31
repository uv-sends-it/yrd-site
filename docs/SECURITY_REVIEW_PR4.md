# Security review — source-level, Cloudflare methodology

Date: 31 October 2026. Base: main at cacdd28ab238dea0a918e41ba1de83ad93c670e2. Scope: browser app, deployment pipelines, client-side integrations, static site. Method inspired by Cloudflare's security-audit-skill reconnaissance, client-side, supply chain and cloud checklists. **Not a full six-phase, independently validated penetration test.**

## Trust boundaries
- Browser renders static Eleventy pages; local website data is published, and the browser may contact TeamApp, Revolutionise, Google Maps, Umami, Instagram and FormSubmit.
- GitHub Actions builds main with the private TeamApp ICS URL (production only), whereas PR builds use the repository's sanitised fallback.
- Preview deployment runs under scoped Cloudflare Pages secrets after static artifact build. External-origin PRs are excluded from the privileged deployment job.
- Ask YRD previously loaded third-party model runtime on WebGPU. Unknown requests now use the existing contact fallback, reducing third-party script exposure.

## Observations and changes
| Surface | Source evidence | Disposition |
|---|---|---|
| Dynamic model loader | `src/assets/chat.js` imported CDN JS for unknown questions | Removed in this PR. Reviewed FAQs remain; contact fallback for anything else |
| User-controlled chat links | `action.href` from assistant JSON was assigned to anchors without origin policy | Explicit allowlist to the site's origin, official YRD URL and Revolutionise. JSON remains repository-maintained |
| URL leaked in form metadata | `page: window.location.href` could carry tracking/query parameters to FormSubmit | Reduced to origin and pathname |
| Instagram embedded loader | Gallery immediately executed third-party Instagram embed script | Click-to-load gate plus an explicit direct profile link |
| Inline page JS | Nav and visibility handlers embedded in base layout | Moved to static same-origin `site.js` and added a restrictive CSP baseline |
| Unverified session | Saturday-specific event scoring could rank a later Saturday ahead of Wednesday | Chronological earliest named training session; daily production schedule sync; unconfirmed preview fallback |
| Cloudflare secrets in PR | Preview build and deploy steps use two jobs, fork guard, and secret-bound deploy | Existing separation retained; account permission boundaries remain owner-controlled |
| Dependency provenance | npm lockfile and GitHub actions tags are used | Requires future supply-chain review for mutable action tags and dependency audit |

## Verification limits
The Cloudflare auditing skill requires strict OS-enforced isolated execution and independent candidate validation to call something *confirmed*. No such full harness has been completed here. This report contains hardening observations, **not** confirmed CVEs or an assurance of no vulnerabilities.

Follow-up checks: real browser CSP reports, functional analytics / forms, whether all allowed third-party endpoints are necessary, GitHub branch protection and token scopes, production response headers (GitHub Pages may not honour Cloudflare `_headers`), and independent abuse-case tests with dummy data. The CSP permits Google Fonts CSS and inline styles for the published Eleventy pages; evaluate tightening after browser verification. Never run probes against live user data.

## Scheduling correction
The previous `eventScore` awarded Saturday +110 points and a further +80 for 8:15, then sorted by score, not time. In a 29 October production run the sync printed Saturday 31 October 8:20am. This did not establish that no Wednesday event exists; it established the ranking bug. The new selector chooses the earliest future event whose **summary** identifies training/paddling/come & try, without a weekday bonus. It intentionally skips races, committee meetings and social functions. Please confirm Wednesday's event title in TeamApp qualifies.
