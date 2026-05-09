# LazyNoman Map

**Stack:** Astro 5+, Bun, TW4, React, CF Pages.

**Tree:**
.
├── src/
│   ├── components/
│   │   ├── ui/ (Shadcn/React)
│   │   └── custom-ui/ (Astro/Logic)
│   ├── content/ (MDX: novel, manga, game)
│   ├── layouts/ (PostLayout, WriterLayout)
│   ├── lib/ (utils, stats, parseNovels)
│   ├── pages/ (slug-based routing)
│   └── styles/ (globals, markdown)
├── public/ (assets, img, fonts)
└── *config* (astro, wrangler, package, tsconfig)

**Data:**
- `src/content.config.ts`: Defines MDX schemas.
- `src/data/`: CSV sources for novel parsing.
- `src/lib/parseNovels.ts`: Logic for CSV -> UI.

**Dev:** `bun dev`. **Deploy:** CF Pages via `wrangler.jsonc`.
