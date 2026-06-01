# LazyNoman — Agent Guide

Personal novel review blog at `lazynoman.com`. Reviews webnovels (Chinese/Korean cultivation/isekai) with honest, in-depth takes. 10 reviews published.

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
| Comments | Waline (self-hosted on Vercel) |
| Analytics | Google Tag Manager (GTM-WC6RL4N6) via Partytown |
| RSS | `@astrojs/rss` |
| Sitemap | `@astrojs/sitemap` |
| Package Manager | Bun |
| Runtime Types | Wrangler-generated (`worker-configuration.d.ts`) |

## Cloudflare Bindings

`SESSION` — KV Namespace · `IMAGES` — Cloudflare Images binding. Compatibility flags: `nodejs_compat`, `global_fetch_strictly_public`.

## Project Structure

```
src/
├── assets/img/novel/         # Hero images (webp, ESM imports)
├── components/
│   ├── BaseHead.astro         # <head> meta, OG tags, GTM, dark mode init
│   ├── Header.astro           # Sticky nav with logo + ModeToggle
│   ├── Footer.astro           # Copyright footer
│   ├── PostCard.astro         # Card for post listings
│   ├── ReviewCard.tsx         # React component for review blocks in MDX
│   ├── ModeToggle.tsx         # React dark/light/system theme switcher
│   ├── Comments.astro         # Waline comment integration
│   ├── FormattedDate.astro    # Date formatting
│   └── ui/                    # shadcn/ui primitives (button, dropdown-menu, badge, tag)
├── content/novel/             # MDX review files (kebab-case)
├── layouts/PostLayout.astro   # Full post page layout
├── lib/utils.ts               # cn() helper (clsx + tailwind-merge)
├── pages/
│   ├── index.astro            # Homepage (hero + 4 recent posts + about)
│   ├── about/index.astro
│   ├── rss.xml.js
│   └── [category]/
│       ├── index.astro        # Category listing (e.g. /novel)
│       └── [slug].astro       # Individual post page
├── styles/
│   ├── globals.css            # Tailwind + shadcn theme tokens (oklch)
│   └── markdown.css           # Prose styles for .markdown-body
└── consts.ts                  # SITE_TITLE, SITE_DESCRIPTION, WALINE_SERVER_URL
```

## Routing & Content Flow

URLs derive from content file paths: `src/content/novel/the-innkeeper-review.mdx` → `/novel/the-innkeeper-review/`. `[category]/[slug].astro` splits post ID on `/`. Content collection schema (`content.config.ts`) — `post` collection with `glob` loader + Zod. Required: `title`, `description`, `pubDate`. Optional: `updatedDate`, `heroImage`, `category`, `creator`, `medium`, `status`, `platform`, `progress`, `tags`, `summary`, `officialTitle`, `synonyms`.

## Key Design Decisions

- **Dark mode**: `localStorage` + CSS class on `<html>`. Inline script in `BaseHead.astro` prevents FOUC. `ModeToggle.tsx` (React island, `client:load`). Light/dark/system.
- **Theming**: Full `oklch()` color system. Dark theme inspired by YouTube dark (`#0f0f0f`). CSS custom properties consumed by both Tailwind and inline React styles.
- **Fonts**: Atkinson (headings), Geist Variable (monospace/UI), Inter (body).
- **ReviewCard**: React component used inside MDX. Renders structured review blocks with colored highlights, star ratings (1-5), "my reaction" callouts. Uses inline styles (not Tailwind).
- **Images**: Astro `<Image>` with `imageService: 'compile'`. Hero images as ESM imports from `src/assets/img/`.
- **Path alias**: `@/*` → `src/*` (tsconfig.json).

---

## Commands

```bash
bun run dev             # Start dev server (astro dev)
bun run build           # Production build (astro build)
bun run preview         # Preview production build
bun run generate-types  # Regenerate Cloudflare worker types (wrangler types)
bun run astro           # Passthrough to astro CLI
bun x @astrojs/check    # Type-check Astro files (no dedicated script)
```

There is **no test infrastructure** and **no linter/formatter** (no ESLint, Prettier, or Biome). Code style is maintained manually.

---

## Code Style Guidelines

### Imports

- **Order**: third-party → internal components → internal utils → styles
- **Type-only imports**: use `import type { X }` or inline `import { type X }` syntax
- **Astro pages/layouts**: use relative imports (`../components/...`)
- **React/TSX components**: use `@/` path alias (`@/components/ui/button`, `@/lib/utils`)
- **Astro components in `src/components/`**: use `@/` for components, `../` for non-component modules

### Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Component files | PascalCase | `ReviewCard.tsx`, `BaseHead.astro` |
| Config/utility files | kebab-case or camelCase | `astro.config.mjs`, `utils.ts` |
| Functions & variables | camelCase | `getIsActive`, `setThemeState` |
| Constants (module-level) | UPPER_SNAKE_CASE | `SITE_TITLE`, `WALINE_SERVER_URL` |
| Interfaces | PascalCase | `interface Props`, `interface NavLink` |
| CSS custom properties | kebab-case | `--background`, `--muted-foreground` |
| All exports | named unless single primary export | `export function`, `export default function` |

### TypeScript Conventions

- Use `interface` for component `Props` (named `Props` locally)
- Use `type` for unions, intersections, and combined types
- Do **not** write explicit return types on functions — rely on inference
- Use `React.useState<Type>` (generic annotation) when state type isn't trivially inferred
- Prefer `React.ComponentProps<"element">` for extending native HTML attributes
- Import React as `import * as React from "react"` (namespace) for UI components, `import React from 'react'` for simpler components
- Use `React.useState` / `React.useEffect` (namespaced, not destructured)

### React Component Patterns

- Use **function declarations** (not arrow functions)
- Destructure props in the function signature with inline `: Props` type
- Use `data-slot` attributes on UI primitives for styling hooks
- `client:load` directive for interactive React islands (ModeToggle, Nav, PostCard)
- No memo/useCallback/useMemo wrappers — keep it simple

### Astro Component Patterns

- `interface Props` declared in frontmatter
- `Astro.props` destructuring with default values: `const { headings = [] } = Astro.props`
- Use `getStaticPaths()` for dynamic routes
- `{/* ── Section Name ── */}` comments as visual section separators
- `<slot />` for content injection in layouts
- `<script>` blocks for client-side JS (inline scripts use `is:inline`)

### Error Handling

- **No try/catch** — use early returns, optional chaining, and guard clauses
- Default parameter values instead of runtime null checks where possible
- Conditional rendering: `{value && <Component />}`, ternary for alternate states
- No React Error Boundaries or error UI components

### CSS & Styling

- **Tailwind CSS v4** with `@tailwindcss/vite` plugin (no PostCSS)
- Theme tokens defined in `@theme inline` block in `globals.css`
- Colors use `oklch()` color space via CSS custom properties
- Tailwind class ordering (convention, not enforced): layout/display → sizing/spacing → typography → visual → interactive
- `ReviewCard.tsx` is the **only exception** — uses inline `React.CSSProperties` objects (legacy pattern, don't replicate for new components)

### Quoting & Punctuation

| File type | Quotes | Semicolons |
|---|---|---|
| `.astro` files | single quotes | no |
| `.ts` / `.mjs` | single quotes | no |
| `.tsx` (ui components, shadcn style) | double quotes | no |
| `.tsx` (other) | single quotes | inconsistent — match file's existing style |

### Comments

- Minimal — only add comments for non-obvious logic or architecture decisions
- Use JSX `{/* ── text ── */}` for section separation in templates
- JSDoc-style `/** ... */` for complex component purpose documentation

### File Organization

- One component per file, named after the component
- UI primitives in `src/components/ui/` (PascalCase filenames)
- `src/lib/utils.ts` for shared helpers — currently only `cn()` (clsx + tailwind-merge)
- `src/consts.ts` for global site constants
- `src/content/novel/` for MDX review files (kebab-case filenames)
