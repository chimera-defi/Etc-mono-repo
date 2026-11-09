# Wallets Module Moved

The `wallets/` module has moved to a standalone repository:

- New repo: `https://github.com/chimera-defi/walletradar`

This path is now a compatibility stub to preserve historical links from the monorepo.

walletradar.org builds from the standalone repo since 2026-11-09. The full old folder stays in this
repo's history: last at `d8c1b80`, or `git log --full-history -- wallets/`.

## Migration Summary

- Extraction method: `git subtree split --prefix=wallets`
- Extraction date: 2026-04-21
- Monorepo source commit: `33e487b` (rewritten on 2026-10-24 and again on 2026-11-09 for author attribution; same content)
- Standalone split commit pushed to `chimera-defi/walletradar:main`: `812830b9123b4e0425c72a2924cb7619d350be07`

## Contributing

Please open issues and pull requests in the standalone repository.
