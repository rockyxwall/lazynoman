# LazyNoman: AI Context

**Stack:** Astro v6, TypeScript, MDX, Tailwind CSS v4, React, Shadcn UI, Cloudflare Pages, Bun.

**Structure & Rules:**
- `src/components/`: Reusable components. **Prefer Astro.** Use React ONLY for interactivity (`client:load`/`visible`).
- `src/components/ui/`: Shadcn UI (React).
- `src/content/`: MDX collections by category. Follow `src/content.config.ts` schema (`title`, `description`, `pubDate`, `updatedDate?`, `heroImage?`, `category`).
- `src/layouts/`: Astro layouts (e.g., `PostLayout.astro`).
- `src/styles/globals.css`: Global styles, contains YouTube-inspired `oklch` theme tokens.
- `src/consts.ts`: Site-wide strings (`SITE_TITLE`, etc).

**Commands (Bun):**
`bun install`, `bun dev` (localhost:4321), `bun build`, `bun preview`, `bun run generate-types`.
