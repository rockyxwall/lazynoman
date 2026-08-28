# LazyNoman

The source for [lazynoman.com](https://lazynoman.com), a webnovel review, tier list, and progression fantasy recommendation hub built with Astro and deployed on Cloudflare Pages.

## Requirements

- Node.js 24
- npm (or bun)

Install dependencies and run the complete local gate:

```bash
npm ci
npm run check
npm test
npm run build
```

Development commands:

```bash
npm run dev          # production-eligible content only
npm run dev:content  # include draft and future content locally
npm run build        # static output in dist/
npm run preview      # serve the production artifact
```

## Create a post

Create a new novel review or article with the interactive scaffolder:

```bash
npm run new:post -- "Lord of the Mysteries: Review & Analysis"
```

For non-interactive use, pass one or more exact category names:

```bash
npm run new:post -- "Lord of the Mysteries: Review & Analysis" \
  --category Novel \
  --category Recommendations
```

The command renders `templates/post.md.tmpl` into `src/content/posts/<year>/<slug>.md`, defaults the post to `draft: true`, and verifies route uniqueness. Available categories include: `Animation`, `Anime`, `Game`, `List`, `Manga`, `Manhwa`, `Misc`, `Novel`, `Recommendations`, and `Top Picks`.

## Repository layout

- `src/pages/` - Public routes, RSS feeds, sitemap, and search.
- `src/layouts/` & `src/components/` - Shell layouts, Waline comments, cards, pagination.
- `src/content/` - Novel reviews (`posts/`) and standalone page Markdown.
- `src/styles/` - Global styling, tokens, and dark theme variables.
- `public/` - Static assets, images, brand logos, favicons, and redirects.
- `scripts/` - Content preparation, route validation, and post scaffolder.
- `tests/` - Vitest unit and route-contract tests.
