import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

// Check if we're in test mode or mock mode
const isTestMode = process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DB === 'true';

// Database connection URL with default for local development
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/cadence_dev';

// Create postgres client (only if not in test mode)
const client = isTestMode ? null : postgres(DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle database instance (only if not in test mode)
export const db = client ? drizzle(client, { schema }) : null;

// Export whether we're using mock storage
export const useMockStorage = isTestMode || !db;

// Export schema for use in queries
export { schema };

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.end();
  }
}
