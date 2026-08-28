---
name: wireframe-reviews
description: Wireframe guidelines, design tokens, and layout conventions for the LazyNoman review site homepage. Trigger when user asks to wireframe or prototype review site pages.
---

# Wireframe: Review Site Homepage

## Project Context

Personal novel review blog at `LazyNoman.com`. Reviews webnovels (Chinese/Korean cultivation, isekai, progression fantasy). 10 reviews published.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro 6.x (`output: 'static'`) |
| Styling | Tailwind CSS v4 + shadcn/ui (radix-nova) |
| UI Islands | React 19 via `@astrojs/react` |
| Content | MDX via Astro Content Collections |
| Package manager | Bun |

## Design System (use these exact tokens in wireframes)

**Dark theme (default):**
```css
--background: oklch(0.19 0 0)
--foreground: oklch(0.92 0 0)
--card: oklch(0.23 0 0)
--card-foreground: oklch(0.92 0 0)
--primary: oklch(0.92 0 0)
--primary-foreground: oklch(0.19 0 0)
--secondary: oklch(0.28 0 0)
--secondary-foreground: oklch(0.92 0 0)
--muted: oklch(0.28 0 0)
--muted-foreground: oklch(0.7 0 0)
--border: oklch(0.35 0 0)
```

**Fonts:** Inter (body), Atkinson (headings), Geist (mono)
**Base font:** 20px, line-height 1.7, letter-spacing -0.011em
**Radius:** 0.625rem

## Wireframe Convention

- Create a single `wireframe.html` file in project root.
- Use standalone inline CSS (no build step), embedded `<style>` block.
- Match the site's exact oklch design tokens.
- Use shadcn/ui component patterns: Card, Badge, Button.
- Dark mode only (`<html class="dark">`).
- Container max-width: 896px (single col) or 1024px (with sidebar).
- Google Fonts (Inter) via `<link>`.

## Typical Homepage Sections (personal review blog)

1. **Header** — Logo, nav (Novels, About), theme toggle placeholder.
2. **Search** — Search bar in header or below nav.
3. **Mission blurb** — Short value prop ("Honest reviews, comparisons, recommendations...").
4. **Post grid** — 2-column card grid. Each card shows:
   - Hero image (16:9 aspect ratio, gradient placeholder)
   - Author · Date · Read time · Views
   - Title
   - Description (2-line clamp)
   - Content-type badge (Review / Comparison / List / Guide)
5. **Recent sidebar** (desktop right, mobile below pagination) — Vertical list with date + title.
6. **Pagination** — Prev, numbered pages, Next.
7. **Footer** — Copyright.

## Common Feedback Loop

User will request changes in iteratively. Common changes:
- Reorder/remove sections
- Toggle between card vs list view
- Adjust grid columns
- Move sidebar position / mobile behavior
- Add/remove metadata fields on cards
