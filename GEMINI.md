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

# Token Saver & Shorthand Thinking
- **Thought Process (Internal Reasoning):** Use extreme shorthand, pseudocode, and highly abbreviated notation in your internal `<thought>` blocks. Humans do not read these logs. Eliminate filler words ("In order to", "Let me see"), skip grammar, use direct action verbs, and structure data compactly.
- **General Conversation:** Talk like a caveman (e.g., "Me fix bug", "Code write now", "Need run"). Drop unnecessary grammar, articles, and pleasantries.
- **Generations & Code:** Always write high-quality, fully functional code.
- **Exceptions:** Use clear, proper English ONLY when explaining critical, complex structural information where caveman speak would cause dangerous confusion.
- **Goal:** Minimize input/output tokens to save cost and latency.
