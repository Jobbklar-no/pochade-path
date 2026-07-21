# Pochade Path

An English-language, mobile-first editorial MVP for practical plein-air painting gear guidance. It is designed for GitHub Pages and uses plain HTML, CSS, and JavaScript with a dependency-free Node build step.

## What is included

- Home, About, How We Review, Upcoming Reviews, Contact, Affiliate Disclosure, Privacy, and custom 404 pages
- Responsive design system, keyboard focus styles, skip links, semantic landmarks, and reduced-motion support
- Original SVG logo/favicon and a project-specific Open Graph image
- Canonical, Open Graph, Twitter/X, description, title, and WebSite/Organization metadata
- No false Product or Review structured data
- Generated `sitemap.xml` and `robots.txt`
- GitHub Actions deployment with the actual Pages base URL injected at build time
- Link, asset, metadata, unresolved-token, and affiliate-statement checks
- Research, niche scoring, name screening, content plan, and reusable review template

## Why plain static files

The site has no account, database, live search, comments, or server-side form. A framework would add a dependency and maintenance surface without improving the MVP. The small build script solves the one real GitHub Pages problem: project sites may live under `/repository-name/`, while canonical URLs, social metadata, sitemap entries, and the custom 404 page need the correct deployed base path.

## Project structure

```text
pochade-path/
├── .github/workflows/deploy-pages.yml
├── docs/
│   ├── asset-provenance.md
│   ├── content-plan.md
│   └── review-template.md
├── scripts/
│   ├── build.mjs
│   ├── check-site.mjs
│   └── serve.mjs
├── site/
│   ├── assets/
│   │   ├── css/styles.css
│   │   ├── img/logo.svg
│   │   ├── img/og-card.png
│   │   └── js/main.js
│   ├── about/index.html
│   ├── contact/index.html
│   ├── disclosure/index.html
│   ├── how-we-review/index.html
│   ├── privacy/index.html
│   ├── reviews/index.html
│   ├── 404.html
│   ├── favicon.svg
│   ├── index.html
│   ├── robots.txt
│   └── sitemap.xml
├── .gitignore
├── package.json
└── RESEARCH-AND-STRATEGY.md
```

`dist/` is generated and intentionally ignored.

## Local setup

Requirements: Node.js 20 or newer. No package installation is required.

```powershell
npm run build
npm run check
npm run preview
```

Open `http://127.0.0.1:4173`.

To test a repository-style base path locally, build with a matching URL:

```powershell
$env:SITE_URL='http://127.0.0.1:4173/pochade-path'
npm run build
Remove-Item Env:SITE_URL
```

The included preview server serves the artifact root, so normal visual preview should use the default localhost build. The repository-path build is primarily for inspecting generated canonical, sitemap, robots, and 404 values.

## GitHub Pages deployment

1. Create a repository, preferably named `pochade-path`.
2. Add these files to the repository and push the default branch as `main`.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. Open **Actions** and run “Deploy static site to GitHub Pages,” or push a commit to `main`.
6. The workflow obtains the real Pages `base_url`, builds `dist/`, checks it, uploads the artifact, and deploys it.

No username or repository name is hard-coded. This is why the same source works at both `https://USER.github.io/` and `https://USER.github.io/REPOSITORY/`.

## Required pre-launch edits

1. Replace every `hello@example.com` in `site/contact/index.html` with an inbox you control.
2. Confirm the site owner/business identity and add it to the Privacy and Contact pages where legally required.
3. Perform a current trademark and domain check before purchasing or publicly adopting “Pochade Path.” The July 21, 2026 screen is not legal clearance.
4. Review the current Amazon Associates agreement before adding any affiliate link.
5. Add a clear link-level disclosure immediately before or beside every affiliate link.
6. Use a real Associate tag only after approval; never commit credentials or API secrets.
7. Do not manually copy Amazon prices, star ratings, customer reviews, descriptions, or images.
8. Publish robust original content before applying to the Associates program. The MVP deliberately contains no fake reviews.
9. Update the privacy policy before adding analytics, ads, a mailing list, forms, comments, embeds, or cookies.

## Adding an article

1. Create a folder under the appropriate future category, such as `site/guides/setup-and-compatibility/article-slug/index.html`.
2. From a two-level-deep article, reference shared assets with `../../assets/...` and top-level pages with `../../about/`.
3. Add a self-referencing canonical using `{{SITE_URL}}/guides/setup-and-compatibility/article-slug/`.
4. Add title, description, Open Graph, and Twitter metadata.
5. Add the URL to `site/sitemap.xml` with a real last-modified date.
6. Link to the cornerstone, one sibling article, and the next useful action.
7. Run `npm run build` and `npm run check`.

## Editorial safety checks

Before publishing a commercial article:

- label physical testing, documentation review, specifications, owner-reported patterns, and editorial assessment separately;
- keep a test/source log;
- date specification and availability checks;
- disclose samples, loans, discounts, sponsorship, and paid links;
- avoid universal “best” claims when the comparison set or use case is undefined;
- verify product model/revision and link destination;
- do not add Review or Product schema without real, page-visible evidence that meets search-engine policies.

## Custom domain

After acquiring a cleared domain, configure it in **Settings → Pages** and follow GitHub’s DNS instructions. The workflow’s `base_url` output will then generate canonical, social, sitemap, robots, and 404 paths for that domain automatically. Do not add a `CNAME` file until the domain is owned and configured.

## Performance notes

- No web fonts, framework runtime, analytics, or third-party JavaScript
- One deferred script, one stylesheet, one SVG logo, and one social image
- Explicit image dimensions for the repeated logo
- CSS-only hero artwork; the social image is not loaded in the page body
- Layout is usable without JavaScript on desktop; JavaScript only controls the mobile menu and year

## Research and planning

See [RESEARCH-AND-STRATEGY.md](./RESEARCH-AND-STRATEGY.md), [content-plan.md](./docs/content-plan.md), and [review-template.md](./docs/review-template.md).
