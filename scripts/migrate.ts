import { db } from '../src/lib/turso';
import { readFileSync } from 'fs';
import { join } from 'path';

async function migrate() {
  console.log('🚀 Starting migration...');
  
  try {
    const schemaPath = join(process.cwd(), 'src/lib/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    // This is a simple split that works for standard SQL
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await db.execute(statement);
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
