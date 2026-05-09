import { db } from './turso';

export async function computeStats() {
  // Clear old cache to be safe
  await db.execute('DELETE FROM stats_cache');

  const mediaTypes = ['novel', 'anime', 'manga', 'movie', 'game'];

  for (const type of mediaTypes) {
    const result = await db.execute({
      sql: `
        SELECT 
          COUNT(*) as total_read,
          SUM(CASE WHEN status = 'Finished' THEN 1 ELSE 0 END) as total_finished,
          SUM(CASE WHEN status = 'Dropped' THEN 1 ELSE 0 END) as total_dropped,
          SUM(CASE WHEN status = 'Paused' THEN 1 ELSE 0 END) as total_paused,
          SUM(read_chapters) as total_chapters,
          AVG(rating) as avg_rating
        FROM novels
        WHERE media_type = ?
      `,
      args: [type]
    });

    if (result.rows.length > 0) {
      const stats = result.rows[0];
      // Use id as index: novel=1, anime=2, etc.
      const id = mediaTypes.indexOf(type) + 1;
      
      await db.execute({
        sql: `
          INSERT INTO stats_cache (id, total_read, total_finished, total_dropped, total_paused, total_chapters, avg_rating, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `,
        args: [
          id,
          Number(stats.total_read) || 0,
          Number(stats.total_finished) || 0,
          Number(stats.total_dropped) || 0,
          Number(stats.total_paused) || 0,
          Number(stats.total_chapters) || 0,
          stats.avg_rating !== null ? Number(stats.avg_rating) : 0
        ]
      });
    }
  }
}
