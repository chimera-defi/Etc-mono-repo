# Wallets Module Moved

The `wallets/` module has moved to a standalone repository:

- **New repo:** `https://github.com/chimera-defi/walletradar`

This monorepo path is now a compatibility stub to preserve historical links and migration context.

## Why

- Independent release cadence
- Cleaner ownership boundaries
- Dedicated CI/deploy for the wallet comparison app

## Migration Notes

- Historical extraction used `git subtree split --prefix=wallets`.
- Original extraction runbook: `wallets/EXTRACT_STUB_PLAN.md`.

## Contributing

Please open issues and pull requests in the standalone repo.
