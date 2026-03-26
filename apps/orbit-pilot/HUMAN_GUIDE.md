# Orbit Pilot — human guide (end-to-end)

One page: **install → configure → generate packs → publish or mark-done → report**. Specs live in [`../../ideas/orbit-pilot/`](../../ideas/orbit-pilot/).

---

## 1. Setup (once per machine)

```bash
cd apps/orbit-pilot
pip install -e ".[dev]"          # add [browser] for Playwright assist
# or: uv pip install -e ".[dev]"
orbit --help                     # orbit <cmd> --help for flags; see AGENTS.md for agents
```

Optional: `git config` / `export` API tokens (`GITHUB_TOKEN`, `DEVTO_API_KEY`, …) — see README credentials table.

---

## 2. New launch workspace

```bash
mkdir ~/my-launch && cd ~/my-launch
orbit init                        # or: orbit init --preset walletradar
# Edit launch.yaml (product, URL, tagline, summary; add publish.github.repo, etc.)
```

---

## 3. Plan and doctor

```bash
orbit plan --launch launch.yaml --platforms seed_platforms.yaml
orbit doctor --launch launch.yaml --platforms seed_platforms.yaml
```

Fix anything missing (fields, tokens, repo slug).

**One-shot (optional):** `orbit pipeline --launch launch.yaml --platforms seed_platforms.yaml --out out/ --json` — fails fast with `ok_all` if something is wrong.

---

## 4. Generate the run

```bash
orbit generate --launch launch.yaml --platforms seed_platforms.yaml --out out/
# Note the path: out/<campaign>/run-<timestamp>/
orbit check-run --run out/<campaign>/run-* --json
```

Each platform folder has `payload.json`, `PROMPT_USER.txt`, `meta.json`.

---

## 5. Execute submissions

**API platforms** (when doctor says ready):

```bash
orbit publish --run out/.../run-* --platform github          # dry-run
orbit publish --run out/.../run-* --platform github --execute
```

**Manual / directory sites:** open `submit_url`, use the pack text, then:

```bash
orbit mark-done --run out/.../run-* --platform <slug> --live-url 'https://...' [--note '...']
```

**Queue:** `orbit next --run …`, `orbit guide --run …`, `orbit report --run …`.

---

## 6. Wrap up

```bash
orbit audit --run out/.../run-* --json
orbit export --run out/.../run-* --format html    # shareable report in run dir
```

Optional TUI: `pip install 'orbit-pilot[tui]'` then `orbit tui --run …`.

---

## Browser automation (logged-in profile)

Use when you want Playwright to drive **your** session (not for pasting private keys into random sites — use env/keyring for API tokens).

1. Policy: `risk.allow_browser_fallback`, `allow_browser_automation`, `allow_browser_autofill`; optionally **`allow_browser_auto_submit`** for click-to-submit (requires autofill path + submit selector; `orbit doctor` warns if misconfigured).
2. Registry: `browser_form_selectors` with CSS for `title`, `body`, `url`, and **`submit`** (or `submit_button`).
3. Env: `ORBIT_ALLOW_BROWSER_AUTOMATION=1`, secret pair, `ORBIT_ALLOW_BROWSER_AUTOFILL=1`; for auto-click `ORBIT_ALLOW_BROWSER_AUTO_SUBMIT=1`.
4. **Persistent login:** `ORBIT_BROWSER_USER_DATA_DIR=/path/to/empty-or-existing-profile` — log in once headed, then re-use.
5. `orbit publish --run … --platform <slug> --execute --browser` (sets automation allow flag; you still set secrets).

**Agents:** full flags and schemas → [`AGENTS.md`](./AGENTS.md).
