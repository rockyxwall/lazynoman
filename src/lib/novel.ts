import fs from "node:fs";
import path from "node:path";

export interface NovelRating {
  score: number;
  max?: number;
  votes?: number;
  source?: string;
}

export interface NovelPublishers {
  original?: string;
  english?: string;
}

export interface NovelData {
  title: string;
  associatedNames?: string[];
  author?: string;
  type?: string;
  language?: string;
  year?: number | string;
  statusInCoo?: string;
  licensed?: boolean;
  translation?: string;
  wordCount?: string;
  publishers?: NovelPublishers;
  rating?: NovelRating;
  sourceUrl?: string;
  genres?: string[];
  tags?: string[];
  description?: string;
}

const cache = new Map<string, NovelData | null>();

export function getNovelData(slug: string): NovelData | null {
  if (cache.has(slug)) return cache.get(slug)!;

  const dataDir = path.join(process.cwd(), "src/data/novels");
  const filePath = path.join(dataDir, `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    cache.set(slug, null);
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as NovelData;
    cache.set(slug, parsed);
    return parsed;
  } catch (err) {
    console.error(`Error loading novel data for ${slug}:`, err);
    cache.set(slug, null);
    return null;
  }
}

