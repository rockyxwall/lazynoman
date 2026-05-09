import { db } from '../src/lib/turso';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import { computeStats } from '../src/lib/stats';

async function reimport() {
  console.log('🚀 Starting Database Purge and Re-import...');
  
  try {
    // 1. Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.execute('DELETE FROM novel_genres');
    await db.execute('DELETE FROM novel_tags');
    await db.execute('DELETE FROM novel_embeddings');
    await db.execute('DELETE FROM novels');
    await db.execute('DELETE FROM genres');
    await db.execute('DELETE FROM tags');
    // Reset auto-increment
    await db.execute("DELETE FROM sqlite_sequence WHERE name IN ('novels', 'genres', 'tags')");

    // 2. Read CSV
    const csvPath = join(process.cwd(), 'src/data/All Novels 216c9852cdba8135bdffc55522a0aacb.csv');
    const csvContent = readFileSync(csvPath, 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });

    console.log(`📖 Found ${records.length} records in CSV. Starting import...`);
    if (records.length > 0) {
      console.log('Sample record keys:', Object.keys(records[0]));
    }

    for (const record of records) {
      const name = record['Name'];
      if (!name) {
        console.warn('⚠️ Skipping record without Name:', record);
        continue;
      }
      const readChapters = parseInt(record['Read Chapters']) || 0;
      const rating = record['Rating'] ? parseInt(record['Rating']) : null;
      let status = record['Status'];
      
      // Map "To Read" to "Plan to Read" as per schema
      if (status === 'To Read') {
        status = 'Plan to Read';
      }

      // Format Date: CSV is DD/MM/YYYY, SQLite likes YYYY-MM-DD
      let startDate = null;
      if (record['Start Date']) {
        const parts = record['Start Date'].split('/');
        if (parts.length === 3) {
          startDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      // Generate base slug
      let baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      let slug = baseSlug;
      let counter = 1;

      // Check for duplicate slugs within the current session's import
      // (Simple check: since we cleared the DB, we only care about duplicates in the CSV)
      while (true) {
        const existing = await db.execute({
          sql: 'SELECT id FROM novels WHERE slug = ?',
          args: [slug]
        });
        if (existing.rows.length === 0) break;
        slug = `${baseSlug}-${counter++}`;
      }

      console.log(`📥 Importing: ${name} (${slug})`);

      await db.execute({
        sql: `
          INSERT INTO novels (
            name, slug, read_chapters, start_date, rating, status, media_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          name, 
          slug, 
          readChapters, 
          startDate, 
          rating, 
          status, 
          'novel' // Lowercase 'novel'
        ]
      });
    }

    console.log('📊 Updating stats cache...');
    await computeStats();

    console.log('✅ Re-import completed successfully!');
  } catch (error) {
    console.error('❌ Re-import failed:', error);
    process.exit(1);
  }
}

reimport();
