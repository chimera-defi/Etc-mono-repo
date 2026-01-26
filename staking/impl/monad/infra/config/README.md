# Config Layout

- `config/` is the base config source of truth.
- `config/nodes/validator-1/` and `config/nodes/validator-2/` hold overrides.

Keep base config immutable; only override per-node values.
