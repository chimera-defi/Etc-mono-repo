# Wallets Standalone Extraction + Monorepo Stub Plan

This plan moves `wallets/` into a standalone repository while keeping a minimal monorepo stub so existing links do not break.

## Scope

- Extract full git history for `wallets/`.
- Push extracted history into standalone repo (for example `chimera-defi/walletradar`).
- Replace monorepo `wallets/` with a stub that points to the new repo.

## Preconditions

- Standalone GitHub repo exists and is writable.
- You have a clean branch in monorepo for the migration PR.
- CI/deploy settings for standalone repo are ready (or accepted as follow-up).

## Step 1: Split History

From monorepo root:

```bash
./wallets/scripts/extract_wallets_subtree.sh https://github.com/chimera-defi/walletradar.git
```

This creates a split branch from `wallets/` history and prints push commands.

## Step 2: Push to Standalone Repo

Example commands printed by the script:

```bash
git push https://github.com/chimera-defi/walletradar.git <split-branch>:main
```

Then clone and verify standalone repo:

```bash
git clone https://github.com/chimera-defi/walletradar.git /tmp/walletradar-check
cd /tmp/walletradar-check
git log --oneline --decorate -n 20
```

## Step 3: Monorepo Stub Commit

After standalone repo is live, in monorepo branch:

1. Remove implementation content under `wallets/`.
2. Add a stub README based on `wallets/STUB_README_TEMPLATE.md`.
3. Keep optional migration notes (`wallets/EXTRACT_STUB_PLAN.md`) for future contributors.

Suggested stub commit message:

```bash
chore(wallets): move wallets module to standalone repo and leave monorepo stub
```

## Step 4: Redirects + Link Hygiene

Update references to point to standalone repo:

- `wallets` GitHub links in app/docs
- contribution links
- CI badges and deploy docs

Keep an explicit migration note in the stub for at least one release cycle.

## Step 5: Validation Checklist

- Standalone repo builds and deploys.
- Monorepo passes CI with stub.
- Old monorepo links resolve to migration notice.
- New repo links are live across docs/footer/navigation.

## Rollback

If standalone migration fails:

- Do not merge the monorepo stub commit.
- Keep `wallets/` in monorepo unchanged.
- Fix standalone pipeline and retry extraction push from split branch.
