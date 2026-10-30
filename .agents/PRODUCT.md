# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Webnovel, light novel, progression fantasy, and eastern fiction readers seeking authentic, high-signal reviews, curated tier lists, and recommendations without clickbait, promotional fluff, or content-mill summaries.

## Product Purpose

Serve as an independent, authoritative review hub and recommendation directory (https://lazynoman.com) for webfiction enthusiasts. Success means visitors discover high-quality stories matching their tastes and trust the critical analysis.

## Positioning

Direct, candid, hype-free critique grounded in exhaustive personal reading experience (e.g. "I Read Every System Novel So You Don't Have To"), contrasting with algorithmic aggregators and uncritical promotion.

## Operating Context

- Web reading on desktop and mobile viewports.
- Static site generated with Astro and delivered globally via Cloudflare Pages.
- Reader interaction and discourse via integrated Waline comment system.
- Taxonomy navigation through curated categories and tags.
- Fast client-side search index (`/search/`) and RSS feeds.

## Capabilities and Constraints

- Static Astro architecture with TypeScript, scoped CSS, and zero client JS bloat.
- Strict route contracts: canonical trailing slash, unique URL slugs.
- Allowed categories: `Animation`, `Anime`, `Game`, `List`, `Manga`, `Manhwa`, `Misc`, `Novel`, `Recommendations`, `Top Picks`.
- Content contracts: Frontmatter requires `title`, `date`, `url`, `category`. Drafts and future dates filtered in production builds.
- Integrated Waline comment system (`https://waline-two-eosin.vercel.app/`).
- Dark theme default with light theme toggle.

## Brand Commitments

- Name: LazyNoman
- Author: rockyxwall
- Voice: Honest, sharp, critical, knowledgeable, unpretentious, no clickbait.
- Identity: Dark-mode default, crimson/red accent (`#e63946`), clean reading typography (PT Sans).

## Evidence on Hand

- Published long-form reviews and tier lists in `src/content/posts/`.
- Site metadata and taxonomy rules in `src/data/site.json` and `.agents/SPEC.md`.
- Static site assets, favicons, and brand graphics in `public/`.
- Working routes, search index (`/index.json`), and RSS feeds (`/index.xml`).

## Product Principles

1. Substance over hype: Cut through webfiction tropes with candid assessments of pacing, character growth, and narrative payoff.
2. Reading ergonomics first: Prioritize legibility, comfortable typography, responsive line lengths, and distraction-free dark theme.
3. Fast, durable static architecture: Static-first Cloudflare Pages deployment with strict build-time validation.
4. High-signal discovery: Structure stories with clear categories, tags, and honest ranking tiers.

## Accessibility & Inclusion

WCAG 2.2 AA conformance with semantic HTML, keyboard accessibility, strong color contrast in both dark and light themes, and `prefers-reduced-motion` compliance.

