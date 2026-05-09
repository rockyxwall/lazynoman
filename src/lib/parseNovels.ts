import { db } from './turso';

export interface Novel {
  id: number;
  name: string;
  slug: string;
  cover_url: string | null;
  synopsis: string | null;
  author: string | null;
  origin: string | null;
  source_url: string | null;
  read_chapters: number;
  total_chapters: number;
  pages_left: number | null;
  start_date: string | null;
  end_date: string | null;
  rating: number | null;
  status: 'Reading' | 'Finished' | 'Dropped' | 'Paused' | 'Plan to Read';
  review_slug: string | null;
  media_type: string;
  genres: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CategoryStats {
  total_read: number;
  total_finished: number;
  total_dropped: number;
  total_paused: number;
  total_chapters: number;
  avg_rating: number;
}

export interface Stats {
  novel: CategoryStats;
  anime: CategoryStats;
  manga: CategoryStats;
  movie: CategoryStats;
  game: CategoryStats;
  achievements: {
    label: string;
    icon: string;
    unlocked: boolean;
    description: string;
    hint: string;
  }[];
}

export async function getAllNovels(): Promise<Novel[]> {
  const result = await db.execute(`
    SELECT n.*, 
           GROUP_CONCAT(DISTINCT g.name) as genre_list,
           GROUP_CONCAT(DISTINCT t.name) as tag_list
    FROM novels n
    LEFT JOIN novel_genres ng ON n.id = ng.novel_id
    LEFT JOIN genres g ON ng.genre_id = g.id
    LEFT JOIN novel_tags nt ON n.id = nt.novel_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    GROUP BY n.id
    ORDER BY n.updated_at DESC
  `);

  return result.rows.map(row => mapRowToNovel(row));
}

export async function getNovelBySlug(slug: string): Promise<Novel | null> {
  const result = await db.execute({
    sql: `
      SELECT n.*, 
             GROUP_CONCAT(DISTINCT g.name) as genre_list,
             GROUP_CONCAT(DISTINCT t.name) as tag_list
      FROM novels n
      LEFT JOIN novel_genres ng ON n.id = ng.novel_id
      LEFT JOIN genres g ON ng.genre_id = g.id
      LEFT JOIN novel_tags nt ON n.id = nt.novel_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.slug = ?
      GROUP BY n.id
    `,
    args: [slug]
  });

  if (result.rows.length === 0) return null;
  return mapRowToNovel(result.rows[0]);
}

export async function getNovelsByStatus(status: Novel['status']): Promise<Novel[]> {
  const result = await db.execute({
    sql: `
      SELECT n.*, 
             GROUP_CONCAT(DISTINCT g.name) as genre_list,
             GROUP_CONCAT(DISTINCT t.name) as tag_list
      FROM novels n
      LEFT JOIN novel_genres ng ON n.id = ng.novel_id
      LEFT JOIN genres g ON ng.genre_id = g.id
      LEFT JOIN novel_tags nt ON n.id = nt.novel_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.status = ?
      GROUP BY n.id
      ORDER BY n.updated_at DESC
    `,
    args: [status]
  });

  return result.rows.map(row => mapRowToNovel(row));
}

export async function getStats(): Promise<Stats> {
  const result = await db.execute("SELECT * FROM stats_cache ORDER BY id ASC");
  const mediaTypes = ['novel', 'anime', 'manga', 'movie', 'game'] as const;
  
  const categoryStats: any = {};
  
  mediaTypes.forEach((type, index) => {
    const row = result.rows.find(r => Number(r.id) === index + 1);
    categoryStats[type] = row ? {
      total_read: Number(row.total_read),
      total_finished: Number(row.total_finished),
      total_dropped: Number(row.total_dropped),
      total_paused: Number(row.total_paused),
      total_chapters: Number(row.total_chapters),
      avg_rating: Number(row.avg_rating)
    } : {
      total_read: 0,
      total_finished: 0,
      total_dropped: 0,
      total_paused: 0,
      total_chapters: 0,
      avg_rating: 0
    };
  });

  const novelStats = categoryStats.novel;
  const achievements = [
    {
      label: "First Step",
      icon: "🌱",
      unlocked: novelStats.total_read > 0,
      description: "Started your first novel!",
      hint: "Start reading a novel"
    },
    {
      label: "Finisher",
      icon: "🏆",
      unlocked: novelStats.total_finished > 0,
      description: "Finished your first novel!",
      hint: "Finish a novel"
    },
    {
      label: "Thousand Club",
      icon: "🔥",
      unlocked: novelStats.total_chapters >= 1000,
      description: "Read over 1,000 chapters!",
      hint: "Read 1,000 chapters"
    },
    {
      label: "Critics Choice",
      icon: "⭐",
      unlocked: novelStats.avg_rating >= 8,
      description: "Maintained a high average rating!",
      hint: "Rate novels highly"
    },
    {
      label: "Dedicated",
      icon: "📚",
      unlocked: novelStats.total_finished >= 5,
      description: "Finished 5 novels!",
      hint: "Finish 5 novels"
    }
  ];

  return { ...categoryStats, achievements };
}

export async function getSimilarNovels(novelId: number, limit = 6): Promise<Novel[]> {
  const result = await db.execute({
    sql: `
      SELECT n.*, 
             GROUP_CONCAT(DISTINCT g.name) as genre_list,
             GROUP_CONCAT(DISTINCT t.name) as tag_list
      FROM novels n
      INNER JOIN novel_embeddings e ON n.id = e.novel_id
      LEFT JOIN novel_genres ng ON n.id = ng.novel_id
      LEFT JOIN genres g ON ng.genre_id = g.id
      LEFT JOIN novel_tags nt ON n.id = nt.novel_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.id != ?
      ORDER BY vector_distance_cos(e.embedding, (SELECT embedding FROM novel_embeddings WHERE novel_id = ?))
      LIMIT ?
    `,
    args: [novelId, novelId, limit]
  });

  return result.rows.map(row => mapRowToNovel(row));
}

function mapRowToNovel(row: any): Novel {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    cover_url: row.cover_url ? String(row.cover_url) : null,
    synopsis: row.synopsis ? String(row.synopsis) : null,
    author: row.author ? String(row.author) : null,
    origin: row.origin ? String(row.origin) : null,
    source_url: row.source_url ? String(row.source_url) : null,
    read_chapters: Number(row.read_chapters),
    total_chapters: Number(row.total_chapters),
    pages_left: row.pages_left !== null ? Number(row.pages_left) : null,
    start_date: row.start_date ? String(row.start_date) : null,
    end_date: row.end_date ? String(row.end_date) : null,
    rating: row.rating !== null ? Number(row.rating) : null,
    status: row.status as Novel['status'],
    review_slug: row.review_slug ? String(row.review_slug) : null,
    media_type: String(row.media_type),
    genres: row.genre_list ? String(row.genre_list).split(',') : [],
    tags: row.tag_list ? String(row.tag_list).split(',') : [],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}
