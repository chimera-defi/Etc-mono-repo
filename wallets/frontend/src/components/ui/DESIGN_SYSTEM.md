# Wallet Radar UI Foundation

This folder is now the source of truth for reusable UI primitives used by the frontend.

## Current primitives

- `button.tsx`: semantic button variants (`primary`, `secondary`, `outline`, `ghost`) with consistent focus and active states.
- `badge.tsx`: status and taxonomy badges (`neutral`, `accent`, `success`, `warning`, `danger`).
- `panel.tsx`: surface container abstraction with tone variants (`default`, `muted`, `accent`).

## Token source

- Global tokens live in `src/app/globals.css` (`--background`, `--foreground`, `--primary`, surface and border tokens).
- Tailwind maps these in `tailwind.config.js` so component variants stay token-driven.

## Migration direction (off-the-shelf ready)

The new primitives intentionally mirror common headless/component-library patterns. This makes the codebase ready for incremental adoption of off-the-shelf building blocks (for example, Radix primitives) without another full visual rewrite.

Recommended next migrations:

1. Replace custom dropdown internals in `WalletFilters` with headless/select primitives.
2. Replace custom tab switchers in `ExploreContent` with accessible tab primitives.
3. Move repeated table badges/feature indicators in `WalletTable` into `ui/` primitives.
