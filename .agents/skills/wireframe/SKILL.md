---
name: lazynoman-wireframe
description: Generates homepage wireframes for lazynoman.com matching the site's dark oklch theme and shadcn/ui patterns in a single HTML file. Trigger: "wireframe", "make a wireframe", "homepage wireframe", "draw wireframe", "wireframe the homepage", "layout mockup".
---

# LazyNoMan Wireframe Skill

One file. One output dir. No build step. No frameworks. Match the exact design tokens.

## Output

`wireframes/wireframe.html` — standalone, inline `<style>`, no JS, no build.

## Tokens (copy exactly)

- `<html class="dark">`, container `max-width: 896px`, `font-family: Inter, Atkinson, Geist`
- Base: 20px, lh 1.7, tracking -0.011em, radius 0.625rem
- Colors below — use as CSS custom properties in `:root.dark`:

| Token | Value |
|---|---|
| `--bg` | `oklch(0.19 0 0)` |
| `--fg` | `oklch(0.92 0 0)` |
| `--card` | `oklch(0.23 0 0)` |
| `--card-fg` | `oklch(0.92 0 0)` |
| `--primary` | `oklch(0.92 0 0)` |
| `--secondary` | `oklch(0.28 0 0)` |
| `--secondary-fg` | `oklch(0.92 0 0)` |
| `--muted` | `oklch(0.28 0 0)` |
| `--muted-fg` | `oklch(0.7 0 0)` |
| `--border` | `oklch(0.35 0 0)` |

Font: Inter via `<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap" rel="stylesheet">`.

## Ponytail rules

- One file only. Not two. `wireframes/wireframe.html`. Open existing if present, edit in place.
- `<style>` block. No Tailwind, no PostCSS, no webpack.
- No React — just divs with classes. `class="card"`, `class="badge"`, `class="btn"`. Style them in CSS.
- `aspect-ratio: 16/9` for hero placeholders. `background: linear-gradient(oklch(...), oklch(...))`.
- 16:9 gradient placeholder for card images. Wrap in `<a>`.

## Sections (homepage)

1. **Header** — Logo · Nav (Novels, About) · Theme toggle icon (just a sun/moon unicode, no JS)
2. **Mission blurb** — `<p class="mission">` one-liner
3. **Post grid** — 2-col grid. Each `.card`: 16:9 hero · metadata (Author · Date · Read time · Views) · title · 2-line desc clamp · `.badge` (Review/Comparison/List/Guide)
4. **Pagination** — `‹ Prev · 1 · 2 · 3 · Next ›`
5. **Footer** — Copyright line

## Iteration

User says "change X" → edit the same `wireframes/wireframe.html`. Never create `v2`, `final`, or any second file.
