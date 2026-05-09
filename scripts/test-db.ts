import { createClient } from '@libsql/client';
import 'dotenv/config';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log('--- Turso Connection Test ---');
console.log('URL:', url);
console.log('Token Length:', authToken?.length);

const db = createClient({
  url: url!,
  authToken: authToken,
});

try {
  const result = await db.execute('SELECT 1');
  console.log('SUCCESS: Connection established.');
  console.log('Result:', result.rows);
} catch (error) {
  console.error('FAILURE: Could not connect to Turso.');
  console.error(error);
}
