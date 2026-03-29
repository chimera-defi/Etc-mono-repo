/**
 * Acceptance Test Database Client
 * Returns the raw database client for use in acceptance test helpers.
 */
import { getDatabase } from "./store";

export async function getAcceptanceTestDb() {
  return getDatabase();
}
