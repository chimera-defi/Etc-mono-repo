# Skills Launchpad Research Notes

**Research date:** March 27, 2026

## Executive Read

Jeffrey's Skills.md is a strong example of **productized skill distribution**. The most valuable learnings are:

1. package the lifecycle, not just the markdown
2. show proof, examples, and install paths immediately
3. keep human-facing marketing separate from agent-facing setup
4. use local search, verification, and machine-readable outputs everywhere

The open-source value is mostly in the adjacent tools and patterns around the marketplace, not the hosted marketplace backend itself.

## What Was Inspected

Website and docs:

- `https://jeffreys-skills.md/pricing`
- `https://jeffreys-skills.md/help/cli`
- `https://jeffreys-skills.md/docs/skills/authoring`
- `https://jeffreys-skills.md/docs/skills/sharing`
- `https://jeffreys-skills.md/help/guidelines`
- `https://jeffreys-skills.md/skills`
- `https://jeffreys-skills.md/jsm`

CLI:

- installed `jsm 0.1.5` locally for inspection
- checked public install script behavior
- inspected `jsm --help`
- inspected `jsm compile --help`
- inspected offline `jsm tools list --json --offline`

GitHub / OSS repos:

- `https://github.com/Dicklesworthstone/jeffreysprompts.com`
- `https://github.com/Dicklesworthstone/coding_agent_session_search`
- `https://github.com/Dicklesworthstone/coding_agent_usage_tracker`
- `https://github.com/Dicklesworthstone/destructive_command_guard`
- `https://github.com/Dicklesworthstone/cross_agent_session_resumer`
- `https://github.com/Dicklesworthstone/fastmcp_rust`
- `https://github.com/Dicklesworthstone/agent_settings_backup_script`

## What jsm Appears To Productize Well

### Install surface

- one-liner installers for Unix and PowerShell
- platform-aware binary install
- checksum / verification support
- PATH modification and completions
- optional telemetry

### Lifecycle surface

- login / auth
- search / show / examples / why / related
- install / sync / upgrade / pin / unpin / rollback / diff
- workspace and project install modes
- verify and doctor commands

### Packaging surface

- category / tag / version metadata
- local/offline search
- deterministic versioning language
- integrity and update story
- compatibility with Claude / Codex / Gemini skill directories

### Distribution surface

- public catalog
- moderation workflow
- team/private org path
- marketplace-style listing UX

## What Is Likely Closed / Non-Reusable

- hosted auth and billing
- cloud sync backend
- moderation/review system
- subscriber-only catalog access rules
- marketplace ranking and account state

Conclusion: we can learn from this, but we should not build our launchpad assuming access to this infrastructure.

## Can We List Skills There?

**Yes, probably, for selected skills.**

The public docs indicate:

- local validation
- push for review with attestation
- moderation before publication

Important constraints:

- public catalog appears subscriber-visible
- no unlisted/private mode for public catalog submissions
- there are content rules and reserved names
- meta-skill content is explicitly restricted in their guidelines

Implication:

- a concrete skill like `token-reduce` may be listable
- a skill-launchpad or skill-authoring framework may be harder to get approved
- treat listing as an optional channel, not a dependency

## OSS Reuse Matrix

| Project | Relevance | Why it matters | Recommendation |
|---|---|---|---|
| `coding_agent_session_search` (`cass`) | High | Measures what agents actually did, supports prompt/session archaeology, useful for proving skill adoption | Investigate first |
| `coding_agent_usage_tracker` (`caut`) | High | Measures provider usage and subscription impact; strong fit for token-efficiency proof | Investigate first |
| `destructive_command_guard` (`dcg`) | Medium | Good pattern for hook install, safety packaging, and agent-specific configuration | Borrow patterns |
| `fastmcp_rust` | Medium | Useful if we want a Rust-native MCP framework or bundle compiler later | Evaluate later |
| `cross_agent_session_resumer` (`casr`) | Medium | Useful for cross-provider continuity; adjacent to launchpad value | Nice-to-have |
| `agent_settings_backup_script` | Low / Medium | Good operational utility; helps power users preserve agent config state | Optional |
| `jeffreysprompts.com` | High (marketing), low (code reuse) | Strong reference for packaging, UX, and human-facing presentation | Copy presentation patterns |

## Highest-Value Takeaways For Our Launchpad

### 1. Treat install / verify / update as first-class features

This is the strongest contrast with a normal GitHub skill repo. A launchpad should feel like software, not a pile of markdown and shell snippets.

### 2. Keep human docs and agent docs separate

Jeffrey's stack does this well:

- product pages for humans
- command docs for operators
- authoring docs for contributors

We should do the same.

### 3. Productize proof

Benchmarks, examples, compatibility, and verification should live close to install flows. This is especially important for anything claiming token reduction or productivity gains.

### 4. Make machine-readable output a design rule

The adjacent tools repeatedly expose JSON modes and low-noise robot flows. We should keep doing that in any launchpad CLI.

### 5. Think in ecosystem layers

The strongest pattern is not "one tool." It is:

- skills
- prompts
- tools
- workflows
- MCP surfaces
- install manager

That stack framing is useful for our launchpad.

## Risks

### Strategic

- building a launchpad that is really just docs, not product
- depending on third-party marketplace acceptance
- claiming token savings without enough end-to-end proof

### Technical

- overbuilding sync/versioning before install friction is solved
- weak compatibility across Claude / Codex / MCP flows
- poor benchmark instrumentation

### GTM

- too technical for humans
- not agent-friendly enough for actual runtime use
- unclear difference between "skills catalog" and "skill launchpad"

## Recommended Direction

1. Build our own launchpad CLI and catalog surfaces
2. Use `cass` and `caut` to measure real invocation and subscription impact
3. Add marketplace export compatibility later
4. Position third-party listing as discovery, not infrastructure
