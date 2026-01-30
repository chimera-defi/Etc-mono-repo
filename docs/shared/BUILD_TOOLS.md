# Build tools and automation

A shared baseline to keep builds predictable across repos.

## 1) Standard entry points
- `make setup` for bootstrapping.
- `make lint` for static checks.
- `make test` for unit/integration tests.
- `make run` for local dev.

If a repo isn’t using `make`, provide a `scripts/` equivalent and document it in README.

## 2) Environment management
- Use `.env.example` for required variables.
- Keep a `scripts/check-env` to validate required vars.

## 3) CI defaults
- Lint + unit tests on every PR.
- Smoke test for critical paths (API up, DB reachable, sample request).

## 4) Scripts
- Prefer small, composable scripts over giant “do-everything” scripts.
- Name scripts by function (e.g., `provision-host`, `start-services`).

## 5) Artifacts
- Avoid committing build artifacts.
- Add `dist/`, `build/`, and `logs/` to `.gitignore` when applicable.

## 6) Observability
- Provide a `scripts/health-check` or documented curl checks.
- Standardize on `/healthz` and `/metrics` when exposing HTTP.
