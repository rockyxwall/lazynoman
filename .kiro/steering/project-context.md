# LazyNoman — Project Context

## What It Is

A personal novel review blog at `lazynoman.com`. The author reviews webnovels (primarily Chinese/Korean cultivation/isekai) with honest, in-depth takes. 10 reviews currently published.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro 6.x (`output: 'static'`) |
| Deployment | Cloudflare Pages via `@astrojs/cloudflare` adapter |
| Styling | Tailwind CSS v4 (Vite plugin) + shadcn/ui (radix-nova style) |
| UI Components | React 19 (islands architecture via `@astrojs/react`) |
| Component Library | shadcn/ui + Radix UI primitives + Lucide React icons |
| Content | MDX files via Astro Content Collections |
| Comments | Waline (self-hosted on Vercel at `waline-two-eosin.vercel.app`) |
| Analytics | Google Tag Manager (GTM-WC6RL4N6) via Partytown |
| RSS | `@astrojs/rss` |
| Sitemap | `@astrojs/sitemap` |
| Package Manager | Bun |
| Runtime Types | Wrangler-generated (`worker-configuration.d.ts`) |

---

## Cloudflare Bindings

Defined in `wrangler.jsonc` and typed in `worker-configuration.d.ts`:

- `SESSION` — KV Namespace (session storage, likely for future auth)
- `IMAGES` — Cloudflare Images binding (compile-time image optimization)

Compatibility flags: `nodejs_compat`, `global_fetch_strictly_public`

---

## Project Structure

```
src/
├── assets/img/novel/         # Hero images for posts (webp, imported as ESM)
├── components/
│   ├── BaseHead.astro         # <head> meta, OG tags, GTM script, dark mode init
│   ├── Header.astro           # Sticky nav with logo + ModeToggle
│   ├── Footer.astro           # Simple copyright footer
│   ├── PostCard.astro         # Card component for post listings
│   ├── ReviewCard.tsx         # React component for structured review blocks in MDX
│   ├── ModeToggle.tsx         # React dark/light/system theme switcher (client:load)
│   ├── Comments.astro         # Waline comment system integration
│   ├── FormattedDate.astro    # Date formatting helper
│   └── ui/                    # shadcn/ui primitives
│       ├── button.tsx
│       ├── dropdown-menu.tsx
│       ├── badge.tsx
│       └── tag.tsx
├── content/
│   └── novel/                 # 10 MDX review files
├── layouts/
│   └── PostLayout.astro       # Full post page layout (header, hero, markdown body, tags, comments)
├── lib/
│   └── utils.ts               # cn() helper (clsx + tailwind-merge)
├── pages/
│   ├── index.astro            # Homepage (hero + 4 recent posts + about blurb)
│   ├── about/index.astro      # About page
│   ├── rss.xml.js             # RSS feed endpoint
│   └── [category]/
│       ├── index.astro        # Category listing page (e.g. /novel)
│       └── [slug].astro       # Individual post page
├── styles/
│   ├── globals.css            # Tailwind + shadcn theme tokens (oklch color system)
│   └── markdown.css           # Prose styles for .markdown-body
└── consts.ts                  # SITE_TITLE, SITE_DESCRIPTION, WALINE_SERVER_URL, social image
```

---

## Routing & Content Flow

URL structure is derived from content file paths:
- `src/content/novel/the-innkeeper-review.mdx` → `/novel/the-innkeeper-review/`
- `[category]/[slug].astro` splits the post ID on `/` to extract category and slug
- `[category]/index.astro` generates listing pages per category (currently only `novel`)

**Content collection schema** (`content.config.ts`) — `post` collection uses `glob` loader, validated with Zod:
- Required: `title`, `description`, `pubDate`
- Optional: `updatedDate`, `heroImage`, `category`, `creator`, `medium`, `status`, `platform`, `progress`, `tags`, `summary`, `officialTitle`, `synonyms`

---

## Key Design Decisions

### Dark Mode
Implemented via `localStorage` + CSS class on `<html>`. `BaseHead.astro` has an inline script that runs before paint to prevent FOUC. `ModeToggle.tsx` (React island, `client:load`) handles user preference. Supports light/dark/system.

### Theming
Full oklch color system. Dark mode inspired by YouTube's dark theme (`#0f0f0f` equivalent). All colors are CSS custom properties consumed by both Tailwind and inline React styles.

### Fonts
- `Atkinson` (local woff) — headings and post titles
- `Geist Variable` (npm) — monospace/UI elements
- `Inter` (system) — body text

### ReviewCard Component
A custom React component used inside MDX files to render structured review blocks with colored highlights, star ratings (1–5), and "my reaction" callouts. Uses inline styles (not Tailwind) to work reliably inside MDX.

### Image Optimization
Uses Astro's `<Image>` component with `imageService: 'compile'` (Cloudflare compile-time processing). Hero images are imported as ESM assets from `src/assets/img/`.

### Path Alias
`@/*` maps to `src/*` (configured in `tsconfig.json`).

---

## Commands

```bash
bun run dev        # Start dev server (astro dev)
bun run build      # Production build (astro build)
bun run preview    # Preview build (astro preview)
bun run generate-types  # Regenerate Cloudflare worker types (wrangler types)
```
