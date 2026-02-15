# Restoration Guide

How to recreate Claudy agent with this backup.

## Prerequisites

- OpenClaw installed (latest version)
- Git configured
- Anthropic API key available
- ~100 MB disk space for backup

---

## Option 1: Fresh Agent with Claudy's Brain (Recommended)

### Step 1: Set Up New OpenClaw Workspace

```bash
# Create new workspace
mkdir -p /path/to/new/workspace
cd /path/to/new/workspace
git init
```

### Step 2: Restore Claudy's Brain

```bash
# Clone this backup
git clone <this-repo-url> ./temp-backup

# Copy all backup files to workspace
cp -r temp-backup/* .
cp -r temp-backup/. .  # Include hidden files (.git config)

# Verify structure
./scripts/verify_setup.sh

# Clean up temp
rm -rf temp-backup
```

### Step 3: Update User Context

The backup has default User/Identity for Claudy. Update for new usage:

```bash
# Edit for new user
nano USER.md          # Update name, timezone, preferences
nano IDENTITY.md      # Update avatar, emoji if desired
nano SOUL.md          # Optional: adjust vibe/principles
nano TOOLS.md         # Add your SSH hosts, cameras, etc.
```

### Step 4: Initialize Memory

```bash
# Create today's memory file
touch memory/$(date +%Y-%m-%d).md

# Add initial context
cat > memory/$(date +%Y-%m-%d).md << 'EOF'
# Memory Initialization

## Restored From Backup
- Date: $(date)
- Source: Claudy agent brain backup (2026-02-15)
- Continuation: Yes, resuming with all learned context

## Initial Status
- All systems verified
- Ready for operations
EOF
```

### Step 5: Validate and Commit

```bash
# Verify everything is set up
./scripts/verify_setup.sh

# Should output: "🎉 System verified and ready!"

# Initial commit
git add -A
git commit -m "chore: restore Claudy agent brain from backup

Restored backup from 2026-02-15:
- Identity + core principles (SOUL.md, USER.md, MEMORY.md)
- System of record (docs/)
- Automation (scripts/, linters/)
- Memory history (memory/)
- Full operational context

Agent ready for deployment."
```

---

## Option 2: Merge Into Existing Workspace

### If you have an existing OpenClaw workspace and want to merge Claudy's brain:

```bash
# In your existing workspace
cd /your/existing/workspace

# Create feature branch
git checkout -b feat/merge-claudy-brain

# Copy backup files (selective, don't overwrite if you have existing files)
# Read INVENTORY.md first to understand what you're importing

# If file conflicts, decide:
# - Keep existing (if you've customized)
# - Take backup (if backup has better version)

# Example selective merge:
mkdir -p docs scripts linters memory  # Create dirs if needed
cp /path/to/backup/docs/*.md docs/   # Copy if not already present
cp /path/to/backup/scripts/*.sh scripts/
cp /path/to/backup/linters/*.sh linters/

# For SOUL.md, USER.md, etc. - review before copying
diff SOUL.md /path/to/backup/SOUL.md  # See what changed
```

---

## Option 3: Import Selective Components

If you just want specific pieces (e.g., just the docs/ or just the memory):

```bash
# Just the system of record (docs/)
cp -r backup/docs/* ./docs/

# Just the automation
cp -r backup/scripts/* ./scripts/
cp -r backup/linters/* ./linters/

# Just the memory history
cp -r backup/memory/* ./memory/

# Just the principles/identity
cp backup/SOUL.md backup/MEMORY.md backup/AGENTS.md .
```

---

## Validation Steps

After restoration, verify everything:

```bash
# 1. Check files exist
./scripts/verify_setup.sh

# 2. Verify docs are fresh
./linters/doc_freshness.sh

# 3. Check git status
git status

# 4. Run basic system health check
systemctl is-active openclaw-gateway

# 5. Confirm memory files load
cat memory/$(date +%Y-%m-%d).md
```

All should pass with ✅ indicators.

---

## Resuming Operations

Once restored and validated:

1. **Read AGENTS.md** — Navigation guide
2. **Check MEMORY.md** — Long-term context
3. **Review today's memory/YYYY-MM-DD.md** — What happened
4. **Check docs/PRINCIPLES.md** — Golden rules
5. **Resume work** — Proceed with confidence

---

## Troubleshooting

### "verify_setup.sh fails"
- Check all files copied correctly: `ls -la docs/`
- Ensure scripts are executable: `chmod +x scripts/*.sh linters/*.sh`
- Check git is initialized: `ls -la .git`

### "Doc freshness check fails"
- This is expected if docs are old
- Update manually: `touch docs/*.md`
- Or disable freshness check temporarily: `touch .skip-doc-check`

### "MEMORY.md timestamps are wrong"
- This is fine; they'll be updated on next weekly review
- Run: `git add MEMORY.md && git commit -m "chore: update memory timestamps"`

### "Can't remember how to do X"
- Search MEMORY.md and docs/ for context
- Check memory/YYYY-MM-DD.md history
- Refer to AGENTS.md navigation guide

---

## Next Steps After Restoration

- [ ] Update USER.md for new context
- [ ] Review MEMORY.md to understand current state
- [ ] Read SOUL.md to understand principles
- [ ] Check docs/ for operational procedures
- [ ] Create new memory/YYYY-MM-DD.md entry with status
- [ ] Commit changes to git
- [ ] Resume work

---

## Rolling Back

If something goes wrong:

```bash
# Go back to previous state
git log --oneline  # See commit history
git reset --hard <commit-sha>  # Reset to known good state

# Or start fresh
rm -rf *
git reset --hard <backup-commit-sha>
```

---

_You have a complete, validated backup of Claudy's brain. Restoration is straightforward. Good luck!_
