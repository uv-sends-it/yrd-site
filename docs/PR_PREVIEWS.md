# Per-pull-request preview websites

YRD uses **GitHub Actions** to build each internal PR and publish an independent
Cloudflare Pages preview. The existing production site continues to deploy from
`main` to GitHub Pages at `https://yarrariverdragons.com.au`. This workflow
never invokes `actions/deploy-pages` and cannot replace the public Pages artifact.

## One-time connection (required)

1. In Cloudflare, create an API token with **Account → Cloudflare Pages → Edit**
   permission, scoped to the account that will hold the preview project.
2. Find the **Cloudflare account ID** under the account overview.
3. In GitHub, visit
   [yrd-site → Settings → Secrets and variables → Actions](https://github.com/uv-sends-it/yrd-site/settings/secrets/actions)
   and create these repository **secrets**:
   - `CLOUDFLARE_API_TOKEN` — the token from Cloudflare.
   - `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID.
4. Open the [PR website preview workflow](https://github.com/uv-sends-it/yrd-site/actions/workflows/pr-preview.yml)
   in GitHub Actions. Re-run the last failed run (or push an ordinary commit to
   the PR branch). On the first successful run, the workflow will **create**
   the dedicated Cloudflare Pages project `yrd-site-pr-previews` if missing.
   No domain or DNS changes are needed.

Once connected, opening or updating an internal pull request triggers the build
and a preview deploy automatically. The workflow posts the live URL in the PR
conversation and the GitHub Actions run summary.

Cloudflare assigns a persistent URL by PR number (usually
`https://pr-2.yrd-site-pr-previews.pages.dev` for PR #2). Use the actual URL
returned by GitHub Actions, not the example, because Cloudflare may assign a
different project subdomain.

## What the workflow does

- Trigger: `pull_request` opened, reopened, or updated (`synchronize`).
- Build with Node 20, `npm ci`, `npm run build`, static output `_site/`.
- The build runs **without Cloudflare secrets**, then uploads only static files.
- A separate deployment job downloads the artifact, gets narrowly scoped
  Cloudflare credentials, and deploys to branch `pr-N` of the dedicated project.
- Emits a stable preview link, updates a single PR comment and adds a run summary.
- Adds `X-Robots-Tag: noindex, nofollow` and disables production Umami tracking.
- Does **not** fetch private TeamApp ICS secrets in PR builds; it uses the
  repository's documented fallback schedule. Preview contact form submissions,
  however, still go to the configured club endpoint; avoid test submissions.
- GitHub PRs from forks are not deployed because repository secrets must never
  be made available to untrusted fork code; they still receive normal UI CI.
- PR previews are not automatically deleted when PRs close. Retention/cleanup
  can be added after the workflow has been tested.

## Troubleshooting

- **Missing credentials**: GitHub Actions deploy job reports which two secrets
  must be configured. Re-run the job after adding them.
- **Token permission error**: create a Cloudflare token with Pages Edit scope.
- **Project name already taken**: choose an unused name and change both the
  `CF_PAGES_PROJECT` environment variable and the Wrangler `--project-name`
  argument in `.github/workflows/pr-preview.yml`.
- **Preview build fails**: inspect the build job and the existing UI checks.
- **URL missing from comment**: check the deploy job's summary. The comment
  step is best-effort in case GitHub restricts its write permissions.

## Security and reliability

Only PR branches **inside** `uv-sends-it/yrd-site` are eligible.
Secrets are isolated in the deploy job, which does not check out or execute PR
source files. Do not change the trigger to `pull_request_target` with PR code
checkout. Consider restricted GitHub Actions permissions and Cloudflare API
token scopes part of the deployment boundary.

When a preview is reviewed and the PR is merged, the standard production
deployment remains unchanged.

## Activation note

The preview workflow is now also installed on `main`, so GitHub can register the `pull_request` trigger. The preview and its Cloudflare project stay separate from production; the live site's design/content is unchanged.
