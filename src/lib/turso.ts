import { createClient, type Client } from '@libsql/client';

/**
 * Returns a Turso client based on available environment variables.
 * In Astro/Cloudflare, 'env' can be passed from Astro.locals.runtime.env
 */
export function getDb(env?: any): Client {
  const url = env?.TURSO_DATABASE_URL || import.meta.env.TURSO_DATABASE_URL;
  const authToken = env?.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN;

  // Fallback for build time or if missing
  return createClient({
    url: url ?? 'libsql://dummy-url-for-build-time.turso.io',
    authToken: authToken ?? 'dummy-token',
  });
}

// Keep a static export for build-time/local-dev where import.meta.env works
export const db = getDb();


