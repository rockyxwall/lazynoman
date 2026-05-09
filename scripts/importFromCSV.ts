import { db } from '../src/lib/turso';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';

async function importFromCSV() {
  console.log('📦 Starting CSV import...');

  const dataDir = join(process.cwd(), 'src/data');
  const files = readdirSync(dataDir);
  
  const mainCsvFile = files.find(f => f.endsWith('.csv') && !f.endsWith('_all.csv'));
  const allCsvFile = files.find(f => f.endsWith('_all.csv'));

  if (!mainCsvFile || !allCsvFile) {
    console.error('❌ Could not find CSV files in src/data');
    return;
  }

  console.log(`Reading ${mainCsvFile} and ${allCsvFile}...`);

  const mainContent = readFileSync(join(dataDir, mainCsvFile), 'utf-8');
  const allContent = readFileSync(join(dataDir, allCsvFile), 'utf-8');

  // Use bom option to strip UTF-8 BOM if present
  const mainRecords = parse(mainContent, { columns: true, skip_empty_lines: true, bom: true });
  const allRecords = parse(allContent, { columns: true, skip_empty_lines: true, bom: true });

  console.log(`Parsed ${mainRecords.length} records from main CSV and ${allRecords.length} from all CSV.`);

  // Merge records by Name
  const mergedData = new Map();

  for (const record of allRecords) {
    if (record.Name && record.Name.trim()) {
      mergedData.set(record.Name.trim(), { ...record });
    }
  }

  for (const record of mainRecords) {
    if (record.Name && record.Name.trim()) {
      const name = record.Name.trim();
      if (mergedData.has(name)) {
        mergedData.set(name, { ...mergedData.get(name), ...record });
      } else {
        mergedData.set(name, record);
      }
    }
  }

  console.log(`Merged ${mergedData.size} unique novels.`);

  const batch = [];
  const genreSet = new Set<string>();
  
  // Prepare batch inserts
  for (const [name, data] of mergedData) {
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Clean genres: "Fantasy (https://...)" -> "Fantasy"
    const rawGenres = data.Genres || '';
    const genres = rawGenres.split(',')
      .map((g: string) => g.split('(')[0].trim())
      .filter((g: string) => g.length > 0);

    genres.forEach((g: string) => genreSet.add(g));

    // Handle "None" or invalid numbers
    const parseNum = (val: any) => {
        if (!val || val === 'None') return null;
        const n = parseInt(val);
        return isNaN(n) ? null : n;
    };

    const parseRating = (val: any) => {
        if (!val || val === 'None') return null;
        const n = parseFloat(val);
        return isNaN(n) ? null : n;
    };

    // Prepare novel insert
    batch.push({
      sql: `INSERT OR REPLACE INTO novels (
        name, slug, cover_url, read_chapters, total_chapters, pages_left, 
        start_date, end_date, rating, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        name,
        slug,
        data.Cover || null,
        parseNum(data['Read Chapters']) || 0,
        parseNum(data['Total Chapters']) || 0,
        parseNum(data['Pages Left']),
        data['Start Date'] || null,
        data['End Date'] || null,
        parseRating(data.Rating),
        data.Status || 'Plan to Read'
      ]
    });
  }

  try {
    console.log(`Inserting ${genreSet.size} genres...`);
    for (const genre of genreSet) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO genres (name) VALUES (?)',
        args: [genre]
      });
    }

    console.log(`Inserting ${batch.length} novels...`);
    // Split batch into chunks if it's too large (Turso limit is usually ~100 statements)
    const chunkSize = 50;
    for (let i = 0; i < batch.length; i += chunkSize) {
        const chunk = batch.slice(i, i + chunkSize);
        await db.batch(chunk, "write");
    }

    console.log('Mapping novel genres...');
    const mappingBatch = [];
    const dbNovels = await db.execute("SELECT id, name FROM novels");
    const dbGenres = await db.execute("SELECT id, name FROM genres");

    const novelMap = new Map(dbNovels.rows.map(r => [String(r.name), r.id]));
    const genreMap = new Map(dbGenres.rows.map(r => [String(r.name), r.id]));

    for (const [name, data] of mergedData) {
      const novelId = novelMap.get(name);
      const rawGenres = data.Genres || '';
      const genres = rawGenres.split(',')
        .map((g: string) => g.split('(')[0].trim())
        .filter((g: string) => g.length > 0);

      for (const gName of genres) {
        const genreId = genreMap.get(gName);
        if (novelId && genreId) {
          mappingBatch.push({
            sql: 'INSERT OR IGNORE INTO novel_genres (novel_id, genre_id) VALUES (?, ?)',
            args: [novelId, genreId]
          });
        }
      }
    }
    
    // Chunk mapping inserts too
    for (let i = 0; i < mappingBatch.length; i += chunkSize) {
        const chunk = mappingBatch.slice(i, i + chunkSize);
        await db.batch(chunk, "write");
    }

    console.log('✅ Import completed successfully!');
  } catch (err) {
    console.error('❌ Import failed:', err);
  }
}

importFromCSV();
