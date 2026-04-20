# GEMINI.md - LazyNoman Project

## Project Overview
This project is **LazyNoman**, a personal space for sharing thoughts, projects, and ideas. It is built with a focus on simplicity, efficiency, and clean content delivery.

### Key Technologies
- **Astro**: The core web framework (v6.x).
- **TypeScript**: Used for type safety throughout the project.
- **MDX**: Support for Markdown with embedded components.
- **Astro Content Collections**: Type-safe management of content in `src/content`.
- **Bun**: The recommended package manager and runtime.
- **Sitemap & RSS**: Integrated for SEO and content distribution.

## Project Structure
- `src/components/`: Reusable Astro components (Header, Footer, etc.).
- `src/content/`: Content source files (Markdown and MDX).
- `src/layouts/`: Common page layouts (e.g., `BlogPost.astro`).
- `src/pages/`: File-based routing for the website.
- `src/styles/`: Global CSS styles.
- `public/`: Static assets like favicons and fonts.
- `astro.config.mjs`: Astro project configuration.
- `src/content.config.ts`: Content collection schema definitions.
- `src/consts.ts`: Site-wide constants (Title, Description).

## Building and Running
The project uses `bun` for managing dependencies and running scripts.

- **Install Dependencies:** `bun install`
- **Development Server:** `bun dev` (Starts at `localhost:4321`)
- **Build for Production:** `bun build`
- **Preview Production Build:** `bun preview`
- **Astro CLI:** `bun astro ...`

## Development Conventions
### Content Management
- Content is stored in `src/content/`.
- Frontmatter must follow the schema defined in `src/content.config.ts`:
  - `title`: string
  - `description`: string
  - `pubDate`: Date
  - `updatedDate`: Date (optional)
  - `heroImage`: string/image (optional)

### Global Constants
- Update `src/consts.ts` to change the `SITE_TITLE` and `SITE_DESCRIPTION` used across the site.

### Styling
- Global styles are located in `src/styles/global.css`. Component-specific styles are encouraged to be scoped within `.astro` files.

### Components
- Use Astro components for maximum performance. Complex interactive components can be added using supported UI frameworks if needed.
