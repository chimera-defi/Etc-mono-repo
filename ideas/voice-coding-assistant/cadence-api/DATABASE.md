# Database Setup Guide

This project uses PostgreSQL with Drizzle ORM for task persistence.

## Prerequisites

- PostgreSQL installed locally or accessible via connection string
- Node.js and npm installed

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```bash
createdb cadence_dev
```

Or use your preferred PostgreSQL client.

### 3. Configure Environment

Copy `.env.example` to `.env` and update the `DATABASE_URL`:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://localhost:5432/cadence_dev
```

For production or custom setups, use the full connection string format:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### 4. Run Migrations

Apply the database schema:

```bash
npm run db:push
```

Or generate and run migrations manually:

```bash
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations
```

## Available Database Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Apply pending migrations to database
- `npm run db:push` - Push schema changes directly (development only)
- `npm run db:studio` - Launch Drizzle Studio (visual database browser)

## Schema

The `tasks` table includes:

- `id` (uuid, primary key) - Unique task identifier
- `task` (text, not null) - Task description
- `status` (enum) - Task status: pending, running, completed, failed, cancelled
- `repo_url` (text, nullable) - Repository URL
- `repo_path` (text, nullable) - Local repository path
- `output` (text, nullable) - Task execution output
- `error` (text, nullable) - Error message if task failed
- `created_at` (timestamp) - Task creation time
- `updated_at` (timestamp) - Last update time
- `completed_at` (timestamp, nullable) - Task completion time

## Development Workflow

1. **Make schema changes** in `src/db/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Review migration** in `drizzle/` directory
4. **Apply migration**: `npm run db:migrate`

## Production Deployment

For production (e.g., Fly.io with Postgres):

1. Set `DATABASE_URL` via secrets:
   ```bash
   fly secrets set DATABASE_URL=postgresql://...
   ```

2. Migrations will be applied automatically on deployment, or run manually:
   ```bash
   npm run db:migrate
   ```

## Troubleshooting

### Connection Issues

If you see connection errors:

1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL is correct in `.env`
3. Ensure database exists: `psql -l`
4. Check user permissions

### Migration Issues

If migrations fail:

1. Check database connection
2. Review migration SQL in `drizzle/` directory
3. Manually inspect database schema: `psql cadence_dev`
4. Reset development database if needed: `dropdb cadence_dev && createdb cadence_dev`

## Testing

Tests use the same database connection. For isolated test environments, consider:

1. Creating a separate test database
2. Setting `DATABASE_URL` in test configuration
3. Running `tasks.clear()` in test setup to reset state

Note: Tests currently use async database operations. Ensure test code uses `await` with database operations.
