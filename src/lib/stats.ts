import { db } from './turso';

export async function computeStats() {
  const result = await db.execute(`
    SELECT 
      COUNT(*) as total_read,
      SUM(CASE WHEN status = 'Finished' THEN 1 ELSE 0 END) as total_finished,
      SUM(CASE WHEN status = 'Dropped' THEN 1 ELSE 0 END) as total_dropped,
      SUM(CASE WHEN status = 'Paused' THEN 1 ELSE 0 END) as total_paused,
      SUM(read_chapters) as total_chapters,
      AVG(rating) as avg_rating
    FROM novels
  `);

  if (result.rows.length > 0) {
    const stats = result.rows[0];
    await db.execute({
      sql: `
        INSERT OR REPLACE INTO stats_cache (id, total_read, total_finished, total_dropped, total_paused, total_chapters, avg_rating, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
      `,
      args: [
        Number(stats.total_read),
        Number(stats.total_finished),
        Number(stats.total_dropped),
        Number(stats.total_paused),
        Number(stats.total_chapters),
        stats.avg_rating !== null ? Number(stats.avg_rating) : 0
      ]
    });
  }
}
