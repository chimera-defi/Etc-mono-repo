/**
 * DatabaseClient interface - minimal abstraction over PGLite for changeset helpers.
 */
export type DatabaseClient = {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
};
