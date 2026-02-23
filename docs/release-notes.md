# Release Notes Drafter

Use the repo-level release note drafter to generate an editable markdown draft from git history.

## Command

```bash
npm run release:notes -- --from v1.2.3 --to HEAD --output release-notes-draft.md
```

The command runs:

```bash
python3 scripts/draft_release_notes.py
```

## Options

- `--from <ref>`: start ref/tag (exclusive). If omitted, the script tries to use the most recent tag reachable from `--to`.
- `--to <ref>`: end ref/tag (inclusive). Default: `HEAD`.
- `--area <name>`: filter by top-level repo paths (repeat flag or pass comma-separated values).
- `--output <path>`: output markdown file. Default: stdout (`-`).

## Examples

Generate notes between two tags:

```bash
npm run release:notes -- --from v1.8.0 --to v1.9.0 --output release-v1.9.0.md
```

Generate notes for wallets and staking only:

```bash
npm run release:notes -- --from v1.8.0 --to HEAD --area wallets --area staking
```

Generate notes with inferred start tag:

```bash
npm run release:notes -- --to HEAD --output release-notes-draft.md
```

## Maintainer Workflow

1. Run the drafter for your release range.
2. Edit `Highlights` into user-facing language.
3. Review `Breaking Changes` manually (heuristic only).
4. Trim internal-only commits from `Full Changes`.
5. Publish release notes in your target channel (GitHub Release, changelog, docs).
