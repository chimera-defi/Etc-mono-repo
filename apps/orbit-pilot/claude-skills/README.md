# Claude skills (Orbit Pilot)

Skills for **Claude Code** live next to the app so the whole **`apps/orbit-pilot/`** tree can be exported or published as one unit.

## Use in this monorepo

Copy or symlink into the repo’s Claude config:

```bash
# From repo root — example: symlink so edits stay in apps/orbit-pilot
mkdir -p .claude/skills
ln -sf ../../apps/orbit-pilot/claude-skills/orbit-pilot-operator .claude/skills/orbit-pilot-operator
```

Or copy the `orbit-pilot-operator` folder to `.claude/skills/orbit-pilot-operator`.

## After extracting Orbit Pilot to its own repo

Place `claude-skills/orbit-pilot-operator/` at `.claude/skills/orbit-pilot-operator` in that project (same symlink/copy pattern).
