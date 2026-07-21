# Pochade Path

An English-language, mobile-first editorial MVP for practical plein-air painting gear guidance. The site uses plain HTML, CSS, and JavaScript with a dependency-free Node build step.

Production site: <https://pochade-path.pochade-path.workers.dev/>

## What is included

- Home, About, How We Review, Upcoming Reviews, Contact, Affiliate Disclosure, Privacy, and a custom 404 page
- Responsive design, accessible focus states, semantic landmarks, reduced-motion support, and a mobile menu
- Original SVG logo/favicon and a project-specific social sharing image
- Absolute canonical, Open Graph, Twitter/X, and structured-data URLs
- Root-relative internal page and asset links with a consistent trailing-slash convention
- `sitemap.xml`, `robots.txt`, GitHub Actions deployment, and automated URL/link checks
- Research, niche scoring, name screening, content plan, and a reusable review template

## Central URL configuration

The production address is stored once in `site.config.json` under `productionUrl`. The same file lists the public routes included in the sitemap and the social image path.

To change the domain later:

1. Change only `productionUrl` in `site.config.json`. Keep the final slash.
2. Run `npm run build`.
3. Run `npm run check`.
4. Commit the updated source files and configuration.

The build automatically synchronizes canonical URLs, `og:url`, Open Graph and Twitter images, homepage JSON-LD, `robots.txt`, and `sitemap.xml`. Internal links stay root-relative and therefore do not contain the domain.

## Project structure

```text
pochade-path/
|-- .github/workflows/deploy-pages.yml
|-- docs/
|   |-- asset-provenance.md
|   |-- content-plan.md
|   `-- review-template.md
|-- scripts/
|   |-- build.mjs
|   |-- check-site.mjs
|   |-- serve.mjs
|   `-- sync-site-url.mjs
|-- site/
|   |-- assets/
|   |-- about/index.html
|   |-- contact/index.html
|   |-- disclosure/index.html
|   |-- how-we-review/index.html
|   |-- privacy/index.html
|   |-- reviews/index.html
|   |-- 404.html
|   |-- favicon.svg
|   |-- index.html
|   |-- robots.txt
|   `-- sitemap.xml
|-- .gitignore
|-- package.json
|-- site.config.json
`-- RESEARCH-AND-STRATEGY.md
```

`dist/` is generated and intentionally ignored.

## Build and preview

Requirements: Node.js 20 or newer. No package installation is required.

```powershell
npm run build
npm run check
npm run preview
```

The preview server listens on port `4173`. Stop it with `Ctrl+C`.

## GitHub upload and deployment

1. Create a repository, preferably named `pochade-path`.
2. Upload the complete contents of this folder and use `main` as the default branch.
3. If using GitHub Pages, open **Settings -> Pages** and select **GitHub Actions** as the source.
4. Push a commit or run the included workflow manually.

The production configuration assumes the public site is served from the domain root. The current canonical domain remains the Workers address even when the same repository is used as the deployment source.

## Adding an article

1. Create a directory ending in `index.html`, such as `site/guides/setup-and-compatibility/article-slug/index.html`.
2. Use root-relative links, such as `/assets/css/styles.css`, `/about/`, and `/reviews/`.
3. Add a self-referencing absolute canonical and matching `og:url` for the article.
4. Add absolute HTTPS Open Graph and Twitter image URLs.
5. Add the article route, including its final slash, to `publicRoutes` in `site.config.json`.
6. Link to the relevant cornerstone, a related article, and a useful next action.
7. Run `npm run build` and `npm run check`.

## Required owner actions before commercial launch

1. Add a verified editorial inbox when contact by email is ready.
2. Confirm the site owner or business identity and add it where legally required.
3. Complete professional trademark clearance before publicly adopting the brand.
4. Review the current Amazon Associates agreement before adding affiliate links.
5. Add a clear link-level disclosure immediately before or beside every affiliate link.
6. Use a real Associate tag only after approval; never commit credentials or API secrets.
7. Do not manually copy retailer prices, star ratings, customer reviews, descriptions, or images.
8. Publish robust original content before applying to an affiliate program.
9. Update the privacy policy before adding analytics, ads, mailing lists, forms, comments, embeds, or cookies.

## Editorial safety checks

- Label physical testing, document review, specifications, owner-reported patterns, and editorial assessment separately.
- Keep a test and source log.
- Date specification and availability checks.
- Disclose samples, loans, discounts, sponsorships, and paid links.
- Avoid universal “best” claims when the comparison set or use case is undefined.
- Do not add Review or Product schema without real, page-visible supporting evidence.

## Performance notes

- No web fonts, framework runtime, analytics, or third-party JavaScript
- One deferred script, one stylesheet, one SVG logo, and one social image
- Explicit logo dimensions and a CSS-only hero treatment
- JavaScript is limited to the mobile menu and current-year text

## Research and planning

See [RESEARCH-AND-STRATEGY.md](./RESEARCH-AND-STRATEGY.md), [content-plan.md](./docs/content-plan.md), and [review-template.md](./docs/review-template.md).
