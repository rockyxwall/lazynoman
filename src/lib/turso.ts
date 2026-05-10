import { createClient, type Client } from '@libsql/client';

const url = import.meta.env.TURSO_DATABASE_URL;
const authToken = import.meta.env.TURSO_AUTH_TOKEN;

// During build/prerendering, these might be undefined.
// Libsql will throw if url is undefined.
export const db: Client = createClient({
  url: url ?? 'libsql://dummy-url-for-build-time.turso.io',
  authToken: authToken ?? 'dummy-token',
});

