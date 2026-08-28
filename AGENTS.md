# Repository Instructions

## Command execution

- Prefix shell commands with `rtk` when it is installed. If a command or flag is rejected by RTK, retry it raw.
- Use raw commands when exact stdout, stderr, or exit status is the behavior being tested.
- Preserve unrelated worktree changes and inspect `git status --short` before editing.
- Do not expose secrets, tokens, private keys, sessions, or environment files.

## Project overview

- This repository builds `https://lazynoman.com/` as a fully static Astro site deployed to Cloudflare Pages.
- The site is a tech publication and review hub for webnovels, light novels, progression fantasy, manga/manhwa, recommendations, tier lists, and feeds.
- Astro components, TypeScript, custom CSS, and vanilla browser JavaScript are the preferred implementation.
- Comments are powered by Waline client.

## Toolchain

- The runtime is Node.js 24 with npm and committed lockfile (or Bun for local dev).
- Run checks with `npm run check`, `npm test`, and `npm run build`.
- Astro production output is `dist/`; `.astro/` is generated metadata. Never edit or commit either directory as source.

## Content contracts

- Post front matter requires `title`, `date`, `url`, and at least one `category`.
- `image`, `tags`, `draft`, `description`, `author`, and `featuredOrder` are optional.
- Create posts with `npm run new:post -- "<title>" [--date YYYY-MM-DD] [--category "<name>" ...]`.
- Allowed categories are: `Animation`, `Anime`, `Game`, `List`, `Manga`, `Manhwa`, `Misc`, `Novel`, `Recommendations`, and `Top Picks`.
- Production captures one build instant. Drafts (`draft: true`) and future dates are filtered out of production builds.

## Frontend conventions

- Semantic HTML and WCAG 2.2 AA accessibility behavior.
- Dark theme default with full theme toggling support.
- Scoped component styles and CSS design tokens.
