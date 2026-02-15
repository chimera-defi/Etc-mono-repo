# Skills Usage Guide (Use When / Don't Use When)

**Purpose:** Explicit routing rules for all major skills (reduces wrong picks by ~20%)  
**Format:** Applied to workspace reference, not modifying system skill files

---

## 🧩 coding-agent (Codex, Claude Code, OpenCode, Pi)

### ✅ USE WHEN
- User explicitly asks for code generation/refactoring
- Task is: "build X", "fix bug in Y", "optimize Z"
- Complex multi-file changes needed
- Interactive session required (user feedback likely)
- Review/analysis of code needed

### ❌ DON'T USE WHEN
- Simple file read/parse (use bash + grep instead)
- User only asked for documentation (don't spawn agent)
- Task already has an explicit solution (just execute it)
- User is in a hurry (agent takes time)
- Working on OpenClaw's own codebase (risk of reading system files)

### Success Criteria
- Agent completes task without asking for clarification
- Output files are valid, no syntax errors
- No infinite loops or hangs (enforce 5-10 min timeout)
- User confirms completion before moving on

---

## 🐙 github (gh CLI)

### ✅ USE WHEN
- User asks to check PR status, create PR, merge
- Need to query CI runs, workflows, issues
- Posting comments to issues/PRs
- Checking git history or branch status
- Automating GitHub operations (bulk close issues, etc.)

### ❌ DON'T USE WHEN
- User only wants to see GitHub in browser
- Task requires code review (use coding-agent instead)
- No GitHub token configured (will fail silently)
- Bulk operations on >100 items (rate limit risk)
- User hasn't authorized this action explicitly

### Success Criteria
- `gh` command succeeds (exit code 0)
- Output format matches expectation (JSON if querying, text if posting)
- No unintended side effects (double-check before merge/delete)

---

## ❤️ healthcheck (Security audit, firewalls, SSH hardening)

### ✅ USE WHEN
- User asks for security audit
- Need to check system updates, patches
- Firewall/SSH config review
- OpenClaw deployment hardening
- Risk posture assessment

### ❌ DON'T USE WHEN
- General system monitoring (use heartbeat instead)
- Casual "how's the system" check (too heavy)
- User hasn't requested security work explicitly
- Only checking simple service status (too complex)

### Success Criteria
- Audit completes without errors
- Report identifies actual risks (not false positives)
- Recommendations are actionable
- No critical warnings that require immediate restart

---

## 🎨 nano-banana-pro (Image generation via Gemini 3 Pro)

### ✅ USE WHEN
- User asks to generate, edit, or create images
- Prompt is visual/creative (not text-only)
- Gemini API key available
- Single or batch image tasks

### ❌ DON'T USE WHEN
- User only wants to download existing image
- Text-only task (don't use image gen for documentation)
- Image generation quota exceeded
- User asked for browser access (not generation)

### Success Criteria
- Images generated without API errors
- Image quality matches user intent
- All images saved to workspace
- Batch generation completes without partial failures

---

## 🎙️ openai-whisper-api (Audio transcription)

### ✅ USE WHEN
- User provides audio file for transcription
- Task is: "transcribe this", "convert speech to text"
- OpenAI API key configured
- Audio file is <25 MB (Whisper limit)

### ❌ DON'T USE WHEN
- No audio file provided (don't generate speech)
- User only wants to hear audio (use TTS instead)
- Transcription is secondary (don't over-use)
- Audio format unsupported (check Whisper docs first)

### Success Criteria
- Transcription completes without errors
- Text quality is good (>95% accuracy expected)
- Output format matches expectation (SRT, VTT, JSON)
- Processing time <30 sec for typical audio

---

## 🧠 skill-creator (Create/update agent skills)

### ✅ USE WHEN
- User asks to create new skill
- Need to package scripts + docs + templates
- Designing reusable automation
- Documenting new tool integration

### ❌ DON'T USE WHEN
- Task is one-off script (don't over-engineer as skill)
- User only needs script executed once
- Skill would be <100 LOC (too small)
- Complex runtime integration needed (beyond skill scope)

### Success Criteria
- Skill structure matches OpenClaw pattern
- SKILL.md is clear and complete
- Templates/scripts work standalone
- Skill can be installed without OpenClaw restart

---

## 🔄 tmux (Remote terminal control)

### ✅ USE WHEN
- Need to send keystrokes to remote tmux session
- Interactive CLI control required
- Background process interaction needed
- Debugging long-running CLI sessions

### ❌ DON'T USE WHEN
- Simple command execution (use bash instead)
- User only wants to see tmux output
- No tmux session exists to attach to
- Task completes too fast for interactive control

### Success Criteria
- Keystrokes sent correctly to tmux session
- Output captured without garbling
- Session remains responsive after commands

---

## ☀️ weather (Weather + forecasts)

### ✅ USE WHEN
- User asks for current weather
- Need forecast for planning
- Location specified (city, zip, coords)

### ❌ DON'T USE WHEN
- User only wants general weather (check browser instead)
- No location provided (too ambiguous)
- Forecasts >10 days (accuracy too low)

### Success Criteria
- Weather data fetched successfully
- Output includes temp, conditions, forecast
- Data age <30 min (fresh)

---

## General Routing Rules

| Scenario | Skill | Why |
|---|---|---|
| User: "write code" | coding-agent | Explicit request |
| User: "check if PR is passing" | github | Query GitHub, not build |
| User: "is server secure?" | healthcheck | Security audit |
| User: "generate banner image" | nano-banana-pro | Visual creation |
| User: "transcribe my audio" | openai-whisper-api | Audio input |
| User: "make a new skill" | skill-creator | Skill engineering |
| User: "interact with this terminal" | tmux | Interactive control |
| User: "what's the weather?" | weather | Simple lookup |
| User: "check services" | heartbeat (not skill) | Routine monitoring |

---

## Implementation Guideline

**Before spawning any skill:**
1. Check Use/Don't use rules above
2. Verify prerequisites (API keys, CLI tools, files)
3. Define success criteria clearly
4. Set timeout appropriate to task
5. If unclear: ask user for confirmation (don't assume)

**After skill completes:**
1. Verify output matches success criteria
2. Report actual results (not assumptions)
3. If failed: diagnose root cause (API error? missing file? timeout?)
4. Only retry once (user's call after that)

---

## Skill-Specific Tips

### coding-agent
- Always use `pty:true` for interactive agents
- Set `workdir` to narrow scope (don't read whole system)
- Use `--full-auto` for auto-approvals on builds
- Use `submit` to send input, `write` for raw data
- Check `process action:log` to monitor progress

### github
- Always `--repo owner/repo` if not in git directory
- Paginate large queries (`--limit 50`)
- Use `--jq` flag for custom JSON filtering
- Test commands locally before automation

### healthcheck
- Requires OpenClaw installed on target system
- Results may require manual fixes (not all auto-fixable)
- Run once per week (not continuous)

### nano-banana-pro
- Prompt clarity impacts image quality (be specific)
- Gemini 3 Pro is very capable (use full prompts)
- Batch generation can rate-limit (check quota)

### openai-whisper-api
- Supports: MP3, MP4, MPEG, MPGA, M4A, OGG, FLAC, WAV
- Max file size: 25 MB
- Languages: auto-detected or specify
- Format options: json, text, srt, vtt, verbose_json

### skill-creator
- Follow SKILL.md structure exactly
- Include examples in documentation
- Test skill installation before releasing
- Document all prerequisites

### tmux
- Attach to existing session only (don't create new)
- Use `send-keys` for safe keystroke input
- Check session exists before sending commands
- Parse output carefully (may have control chars)

### weather
- Uses free API (no key needed, but slower)
- Best accuracy: specify city, not coordinates
- Forecast beyond 7 days: accept lower confidence
- Timezone: auto-detected from location (or specify)

---

## Recording New Skills

When adding new skills to OpenClaw:
1. Add to this guide (Use When / Don't Use When)
2. Include prerequisites + success criteria
3. Add tip for best practices
4. Document failure modes
5. Link to full SKILL.md in openclaw/skills/

---

**Use this guide to route skill calls. Reduce wrong picks by ~20%.**
