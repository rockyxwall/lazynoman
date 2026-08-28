# LazyNoman Specification

## Overview

LazyNoman (`https://lazynoman.com`) is a fast, static web application for webnovel reviews, recommendations, and tier lists.

## Architecture

- **Static Site Generator**: Astro
- **Styling**: Vanilla scoped CSS with custom tokens in `src/styles/global.css`
- **Deployment Target**: Cloudflare Pages (`dist/`)
- **Interactive Features**: Client-side search index (`/search/`), Waline comment system, Dark/Light theme toggle.

## Routing Contracts

- Post URLs: Explicit canonical URL ending in `/` (e.g. `/i-read-every-system-novel-so-you-dont-have-to-my-personal-rankings/`).
- Taxonomy routes:
  - Categories: `/categories/<slug>/`
  - Tags: `/tags/<slug>/`
- Feed endpoints:
  - Main RSS: `/index.xml`
  - Taxonomy RSS: `/<field>/<slug>/index.xml`
  - JSON Search Index: `/index.json`
  - Sitemap: `/sitemap.xml`
- Pages: `/archive/`, `/recommendations/`, `/newsletter/`, `/privacy/`, `/terms-conditions/`, `/search/`.

## Quality & Validation Gates

- `npm run check` - TypeScript and Astro schema validation.
- `npm test` - Vitest unit and route validation tests.
- `npm run build` - Full static production build in `dist/`.
- `npm run validate:routes` - Verification of generated static output.
