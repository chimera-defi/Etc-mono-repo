# Monad Config Layout

- Base config lives in `/etc/monad/` (or `~/.monad/` if you choose that root).
- Keep base config immutable; use per-node overrides only.

## Structure

- `config.toml.example`: populate from official docs, then copy to `/etc/monad/config.toml`.
- `nodes/validator-1/` and `nodes/validator-2/`: per-node overrides.
