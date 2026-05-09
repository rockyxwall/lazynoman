export interface Novel {
  name: string;
  readChapters: number;
  totalChapters: number;
  startDate: string | null;
  endDate: string | null;
  rating: number;
  status: string;
  coverUrl: string | null;
  pagesLeft: string | null;
  genres: string[];
  slug: string;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseGenres(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((g) => g.replace(/\s*\(https?:\/\/[^)]+\)/g, '').trim())
    .filter(Boolean);
}

/**
 * Modern, Easy Way:
 * We use Vite's import.meta.glob to load the CSV files.
 * This avoids all 'fs' path resolution issues in different environments.
 */
export async function loadNovels(): Promise<Novel[]> {
  // Get all CSV files in src/data
  const csvFiles = import.meta.glob('../data/*.csv', { eager: true });
  
  const filePaths = Object.keys(csvFiles);
  const novelsAllPath = filePaths.find(p => p.endsWith('_all.csv'));
  const novelsPath = filePaths.find(p => !p.endsWith('_all.csv') && p.endsWith('.csv'));

  if (!novelsPath) {
    console.warn('[NovelTracker] Warning: No base CSV found in src/data');
    return [];
  }

  // The @rollup/plugin-dsv returns an array of objects for the CSV data
  const base = (csvFiles[novelsPath] as any).default || [];
  const full = novelsAllPath ? ((csvFiles[novelsAllPath] as any).default || []) : [];
  
  if (!Array.isArray(base)) {
    console.error('[NovelTracker] Error: Base CSV data is not an array', base);
    return [];
  }

  const fullMap = Object.fromEntries(
    Array.isArray(full) ? full.map((r: any) => [r.Name?.trim() || '', r]) : []
  );

  return base.map((row: any) => {
    const name = row.Name || '';
    const extra = fullMap[name.trim()] || {};

    return {
      name: name,
      readChapters: Number(row['Read Chapters'] || extra['Read Chapters'] || 0),
      totalChapters: Number(extra['Total Chapters'] || 0),
      startDate: row['Start Date'] || extra['Start Date'] || null,
      endDate: extra['End Date'] || null,
      rating: Number(row.Rating || extra.Rating || 0),
      status: row.Status || extra.Status || '',
      coverUrl: extra['Cover URL'] || null,
      pagesLeft: extra['Pages Left'] || null,
      genres: parseGenres(extra.Genres || row.Genres || ''),
      slug: slugify(name),
    };
  });
}
