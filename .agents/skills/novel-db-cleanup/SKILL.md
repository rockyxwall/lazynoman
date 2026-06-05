---
name: lazynoman-novel-db-cleanup
description: Use this skill whenever the user wants to clean up their Notion novel database CSV export and update the system novel rankings page. Trigger when user says "clean up the database", "update rankings", "sort novels", "rewrite rankings", "clean the csv", "update the novel list", "novel db cleanup", or provides a new CSV export and asks to process it.
---

# Novel Database & Rankings Cleanup Skill

Processes a Notion CSV export of the novel database, strips unnecessary columns, and regenerates the system novel rankings MDX page with correct sorting, system type labels, and review links.

---

## When to Use

- User provides a new or updated `novels_db *.csv` file (Notion export)
- User asks to "clean up" or "update" the novel database or rankings list
- User asks to re-sort the rankings or re-link reviews

---

## Input Requirements

- **CSV file**: A Notion export CSV located in the project root, named `novels_db *.csv`
- **MDX file**: `src/content/novel/i-read-every-system-novel-so-you-dont-have-to-my-personal-rankings.mdx`
- **Review files**: `src/content/novel/*-review.mdx` or `*-review.md`

---

## Execution Steps

### Step 1: Database Column Filtering
- Read the Notion CSV export (handle BOM, quoted fields with commas, and multiline values).
- Strip all metadata/columns except `Name`, `Rating`, and `Genres`.
- Write the cleaned table back to the **same** CSV file, ensuring fields with commas/quotes are properly escaped.

### Step 2: System Novel Filtering
- Filter the records to keep only novels whose `Genres` contains either `System` or `Universal System`.
- Non-system novels (e.g., pure Cultivation, Fantasy, Transmigration without System) are excluded from the rankings list.

### Step 3: Sorting & Tie-Breaking
- Sort the filtered system novels by `Rating` **descending** (highest first, parsed as integers).
- For novels with the same rating, sort them **alphabetically** by `Name` ascending (case-insensitive).

### Step 4: System Type Mapping
- Map the system type label based on the `Genres` column:
  - If genres contain `Universal System` → label as `[Universal System]`
  - Otherwise → label as `[Personal System]`

### Step 5: Matching and Linking Reviews
- Normalize the novel's `Name` to a kebab-case slug (lowercase, replace non-alphanumeric with hyphens, trim leading/trailing hyphens).
- Scan `src/content/novel/` for files ending in `-review.mdx` or `-review.md`.
- Match the novel slug against the base filename (excluding the `-review` suffix).
- If a match is found:
  - **Bold** the novel name with `**Name**`
  - Append a review link: `<a href="/novel/{filename_without_extension}" className="ml-2">Read Review</a>`

### Step 6: Rewriting MDX
- Rewrite the numbered list in `src/content/novel/i-read-every-system-novel-so-you-dont-have-to-my-personal-rankings.mdx`.
- **Preserve the existing frontmatter exactly as-is** (everything between the `---` delimiters).
- Each line follows the format:
  ```
  {rank}. {Name} [{System Type}]
  ```
  or with a review link:
  ```
  {rank}. **{Name}** [{System Type}] <a href="/novel/{slug}-review" className="ml-2">Read Review</a>
  ```

### Step 7: Build Verification
- Run `bun run build` to verify the static build completes successfully.
- Report results to the user.

---

## CSV Parsing Notes

Notion CSV exports have these quirks:
- **BOM**: The file may start with a UTF-8 BOM (`\ufeff`) — strip it from the first header.
- **Quoted fields**: Fields containing commas are wrapped in double quotes.
- **Notion URLs in Genres**: Genre values look like `System (https://app.notion.com/p/...)`. Match on the genre **name** before the parenthetical URL.
- **Duplicate novels**: The same novel may appear multiple times with different genre tags. Include all instances (they may have different ratings reflecting different reads).

---

## Output Summary

After execution, report:
1. Total records parsed from CSV
2. Total system novels after filtering
3. Number of review links matched
4. Build success/failure

---

## Common Mistakes to Avoid

- ❌ Overwriting the MDX frontmatter (always preserve it exactly)
- ❌ Including non-system novels in the rankings
- ❌ Sorting ascending instead of descending by rating
- ❌ Forgetting to handle CSV fields with commas (must parse quoted fields correctly)
- ❌ Using the full Notion URL in genre matching instead of just the genre name
- ❌ Skipping the build verification step
