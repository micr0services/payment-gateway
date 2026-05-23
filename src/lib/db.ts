import postgres from 'postgres';

/**
 * Create a new database connection for each request
 * Cloudflare Workers require per-request connections due to request isolation
 * @param databaseUrl - PostgreSQL connection string
 * @returns New database connection for this request
 */
export function getDbConnection(databaseUrl: string): ReturnType<typeof postgres> {
  return postgres(databaseUrl, {
    max: 1, // Single connection per request
    idle_timeout: 5, // Close idle connections quickly
    max_lifetime: 30, // Short lifetime for serverless
  });
}

/**
 * Legacy function for backward compatibility - now creates per-request connections
 * @deprecated Use getDbConnection instead
 */
export function getDbPool(databaseUrl: string): ReturnType<typeof postgres> {
  return getDbConnection(databaseUrl);
}
