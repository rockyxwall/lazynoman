# LazyNoman Project Documentation

## Core Brand Identity
- **LazyNoman**: An acronym for **No**vel **M**anga **An**ime.
- **Purpose**: A personal display site for tracking media consumption stats and sharing honest reviews.

## Data Sources & Architecture

The site uses two distinct data sources depending on the category. Future development MUST adhere to these conventions to avoid broken stats.

### 1. Turso Database (SQLite/LibSQL)
- **Categories**: `novel`, `game`, and any other custom categories not listed below.
- **Source of Truth**: The `novels` table in the Turso database.
- **Fetching Utility**: `src/lib/parseNovels.ts` contains `getStats(db)` which queries the `stats_cache` table.

### 2. AniList Integration (Static JSON)
- **Categories**: `anime`, `manga`, `movie`.
- **Source of Truth**: `src/data/anilist.json`.
- **Mechanism**: Stats for these categories are synced from AniList via a separate script (`scripts/sync-anilist.ts`) and stored in a static JSON file to avoid API rate limits and improve performance.
- **Implementation Note**: When displaying stats for these categories, do NOT rely solely on the database. You MUST import and merge data from `src/data/anilist.json`.

## Implementation Patterns

### Stats Calculation Logic
When calculating "Global Stats" (e.g., on the Home page or Category index), follow this logic:

1. **Novel**: Fetch from `dbStats.novel`.
2. **Anime**: 
   - Completed: `anilistData.anime.statuses.find(s => s.status === 'COMPLETED')`.
   - Total: `anilistData.anime.count`.
   - Units: `anilistData.anime.episodesWatched`.
   - Rating: `anilistData.anime.meanScore / 10`.
3. **Manga**:
   - Completed: `anilistData.manga.statuses.find(s => s.status === 'COMPLETED')`.
   - Total: `anilistData.manga.count`.
   - Units: `anilistData.manga.chaptersRead`.
   - Rating: `anilistData.manga.meanScore / 10`.
4. **Movie**: Derived from AniList anime formats (`format === 'MOVIE'`).

**Rating Override**: For all categories, if there are local reviews with explicit ratings (`post.data.rating`), the average of these reviews should override the global average rating from the data source for better personal accuracy.

## Directory Structure & Routing
- `src/content/`: Contains review posts. Folders here define the dynamic categories.
- `src/lib/categories.ts`: Build-time utility that detects folders in `src/content/` to generate navigation and routes.
- `src/pages/[category]/index.astro`: Dynamic route handler for category landing pages.
- `src/pages/[...slug].astro`: Dynamic route handler for individual review posts.
