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

**Human queue (fast path):** opens your default browser to the next `submit_url`, prints `PROMPT_USER.txt`, and shows the exact `mark-done` command:

```bash
orbit work --run out/.../run-*
# JSON for agents: orbit work --run … --json  (includes operator_agent_guide for local Claude/Codex/Cursor MCP — Orbit does not bundle an LLM)
# browser_assisted + Playwright (same gates as publish): orbit work --run … --playwright
```

**Bring-your-own coding agent:** the Python package stays free of LLM dependencies. Pair **`orbit work --json`** with **Claude Code, Codex, Cursor**, or a **local model** that can drive the user’s browser; use only **public** copy from the pack. A future **paid “Launch OS”** bundle (registry + playbooks + support) can sit on top — see [`../../ideas/orbit-pilot/V2_ROADMAP.md`](../../ideas/orbit-pilot/V2_ROADMAP.md) §4.1.

**API platforms** (when doctor says ready):

```bash
orbit publish --run out/.../run-* --platform github          # dry-run
orbit publish --run out/.../run-* --platform github --execute
```

**Manual / directory sites:** use **`orbit work`** or open `submit_url`, use the pack text, then:

```bash
orbit mark-done --run out/.../run-* --platform <slug> --live-url 'https://...' [--note '...']
```

**Queue:** `orbit work --run …`, `orbit next --run …`, `orbit guide --run …`, `orbit report --run …`.

---

## 6. Wrap up

```bash
orbit audit --run out/.../run-* --json
orbit export --run out/.../run-* --format html    # shareable report in run dir
```

Optional TUI: `pip install 'orbit-pilot[tui]'` then `orbit tui --run …`.

---

## Browser automation (logged-in profile)

Use when you want Playwright (or **Kernel CDP**) to drive **your** session — or use **`orbit work`** and **Claude / Chrome MCP** to paste into the user’s browser. Do not put API tokens into third-party forms (use env/keyring for **official API** publishers).

**Directory sites (Product Hunt, Crunchbase, …):** in your risk policy set **`allow_browser_assist_manual: true`** and **`allow_browser_automation: true`** so `orbit plan` / `generate` treat those registry **`manual`** rows as **`browser_assisted`** (same `publish --execute --browser` path). Alternatively leave them **`manual`** and only use **`orbit work`** + MCP.

1. Policy: `allow_browser_automation` required for Playwright assist; **`allow_browser_fallback`** for `browser_fallback_opt_in` rows; **`allow_browser_assist_manual`** for upgrading normal **`manual`** rows; optional `allow_browser_autofill` / **`allow_browser_auto_submit`** (`orbit doctor` warns if misconfigured).
2. Registry: `browser_form_selectors` with CSS for `title`, `body`, `url`, and **`submit`** (or `submit_button`).
3. Env: `ORBIT_ALLOW_BROWSER_AUTOMATION=1`, secret pair, `ORBIT_ALLOW_BROWSER_AUTOFILL=1`; for auto-click `ORBIT_ALLOW_BROWSER_AUTO_SUBMIT=1`.
4. **Remote / hosted Chrome (CDP):** `ORBIT_BROWSER_CDP_URL=ws://…` or `http://…` — Playwright attaches via Chrome DevTools Protocol (e.g. [Kernel](https://www.kernel.sh/) or any CDP endpoint). Session cookies live on that browser; **do not** commit the URL if it embeds secrets.
5. **Persistent login (local):** `ORBIT_BROWSER_USER_DATA_DIR=/path/to/profile` — log in once headed, then re-use.
6. `orbit publish --run … --platform <slug> --execute --browser` (sets automation allow flag; you still set secrets).

**Agents:** full flags and schemas → [`AGENTS.md`](./AGENTS.md).
