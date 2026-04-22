# Project Extraction Playbook (Monorepo -> Standalone)

Last updated: 2026-04-22

## 1) Extract repo history

From monorepo root:

```bash
./wallets/scripts/extract_wallets_subtree.sh https://github.com/<owner>/<new-repo>.git main
```

Or generic subtree split:

```bash
git subtree split --prefix=<subdir> -b split/<subdir>-$(date +%Y%m%d%H%M%S)
git push https://github.com/<owner>/<new-repo>.git <split-branch>:main
```

## 2) Verify standalone repo

```bash
git ls-remote --heads https://github.com/<owner>/<new-repo>.git
git clone --depth 1 https://github.com/<owner>/<new-repo>.git /tmp/<new-repo>-check
```

Confirm expected top-level files and app directories exist.

## 3) Keep a local sibling checkout

Clone under `/root/.openclaw/workspace/dev/<new-repo>` so it is a sibling of monorepo.

## 4) Register in Takopi (projects config)

Preferred (from repo root):

```bash
cd /root/.openclaw/workspace/dev/<new-repo>
takopi init <alias>
```

Fallback:

```bash
takopi config set projects.<alias>.path /root/.openclaw/workspace/dev/<new-repo>
```

Validate:

```bash
takopi config get projects.<alias>.path
takopi config list | rg '^projects\.<alias>\.'
```

## 5) Make it appear in Takopi sidebar (Telegram topics)

Important: sidebar entries are driven by `/root/.takopi/telegram_topics_state.json` thread mappings, not only `projects.*` config.

Steps:
1. Create a forum topic in the configured Telegram supergroup (name: `<alias> @<branch>`).
2. Add a thread entry keyed as `<chat_id>:<message_thread_id>` with context:
   - `project`: `<alias>`
   - `branch`: `<branch>`
   - `topic_title`: `<alias> @<branch>`
3. Validate JSON and confirm entry exists.

Minimal shape:

```json
{
  "context": { "branch": "main", "project": "<alias>" },
  "default_engine": null,
  "engine_overrides": {},
  "sessions": {},
  "topic_title": "<alias> @main",
  "trigger_mode": null
}
```

## 6) Monorepo stub and migration PR

- Replace old monorepo subtree with a stub README that links to standalone repo.
- Open PR with:
  - extraction commit SHA
  - split branch name
  - standalone repo URL
  - rollback notes

## 7) Rollback

If extraction/deploy fails:
- Keep monorepo implementation untouched.
- Do not merge stub PR.
- Fix standalone pipeline and rerun from split branch.
