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

## Deferred to v1.1

- Admin content editor (Decap/Tina CMS)
- Structured `races.json` extracted from newsletters
- Home page stat strip and member testimonials
- Standalone blog/news section
