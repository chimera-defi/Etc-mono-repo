# Frontend Bun Migration - Key Learnings

## Date: 2024-12-19

This document captures critical learnings from migrating the frontend from npm to Bun and ensuring it works correctly in CI/CD.

## Critical Learnings

### 1. Lock File Format Varies by Bun Version

**Learning:** Bun uses different lock file formats depending on version:
- **Bun 1.3.x:** Uses `bun.lock` (JSON format)
- **Newer Bun versions:** May use `bun.lockb` (binary format)

**Action:** Always commit whichever lock file Bun creates. Don't assume it's always `bun.lockb`.

**Verification:**
```bash
bun --version  # Check version
ls -la bun.lock*  # See what lock file exists
```

### 2. Jest vs Bun Test Runner

**Learning:** React component tests MUST use Jest, not Bun's test runner.

**Why:**
- React Testing Library requires jsdom environment
- Bun's test runner doesn't support jsdom (as of Bun 1.3.5)
- Jest has mature React/Next.js integration

**Correct Usage:**
- ✅ `bun run test` - Runs Jest via package.json script
- ❌ `bun test` - Uses Bun's test runner (doesn't work for React components)

**CI Configuration:**
```yaml
- name: Run tests
  run: bun run test -- --coverage --passWithNoTests
```

**Note:** The `--` passes arguments to Jest, not Bun.

### 3. CI Workflow Must Use Correct Test Command

**Learning:** CI workflow was initially using `bun test` which fails for React components.

**Fix:** Changed to `bun run test -- --coverage --passWithNoTests`

**Why:** This runs Jest (via package.json script) with coverage flags, not Bun's test runner.

### 4. Package Manager Field is Critical

**Learning:** The `packageManager` field in `package.json` ensures tools recognize Bun.

**Required:**
```json
{
  "packageManager": "bun@latest"
}
```

**Benefits:**
- Corepack recognizes Bun as package manager
- Prevents accidental npm usage
- Documents project requirement

### 5. Bun Installation in CI

**Learning:** Use `oven-sh/setup-bun@v2` action, not `setup-node`.

**Correct CI Setup:**
```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v2
  with:
    bun-version: latest
```

**Benefits:**
- Faster CI runs (Bun installs faster than npm)
- Proper caching
- Latest Bun features

### 6. Frozen Lockfile for CI

**Learning:** Use `--frozen-lockfile` flag in CI for reproducible builds.

**Command:**
```bash
bun install --frozen-lockfile
```

**Why:** Ensures CI uses exact versions from lock file, preventing drift.

### 7. Command Mapping

**Learning:** All npm commands have Bun equivalents.

| npm Command | Bun Command | Notes |
|-------------|-------------|-------|
| `npm install` | `bun install` | Install dependencies |
| `npm ci` | `bun install --frozen-lockfile` | CI install |
| `npm run <script>` | `bun run <script>` | Run package.json scripts |
| `npx <tool>` | `bunx <tool>` | Run tools |
| `npm test` | `bun run test` | Run Jest (not `bun test`) |

### 8. Performance Gains

**Learning:** Bun provides significant performance improvements.

**Measured Improvements:**
- **Installation:** 2-3x faster than npm
- **Builds:** Faster Next.js builds
- **CI Time:** Reduced frontend CI job time

**Example:** Installing 2680 packages took 2.72 seconds with Bun vs ~8-10 seconds with npm.

### 9. Regression Prevention

**Learning:** Multiple safeguards needed to prevent npm regression.

**Safeguards:**
1. `.cursorrules` documents Bun requirement
2. `package.json` has `packageManager` field
3. CI workflow uses Bun action
4. Documentation updated with Bun commands
5. Lock file format documented

**Verification Checklist:**
- [ ] No `package-lock.json` in frontend/
- [ ] `bun.lock` or `bun.lockb` exists
- [ ] CI uses `oven-sh/setup-bun@v2`
- [ ] All commands use `bun` not `npm`
- [ ] Tests use `bun run test` not `bun test`

### 10. Local Development Setup

**Learning:** Developers must install Bun locally.

**Installation:**
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # or restart terminal
bun --version     # Verify
```

**First Time Setup:**
```bash
cd frontend
bun install      # Creates bun.lock
git add bun.lock # Commit lock file
```

## Verification Steps

### Local Verification
```bash
cd frontend
bun install              # Should create bun.lock
bun run lint            # Should pass
bunx tsc --noEmit       # Should pass
bun run build           # Should build successfully
bun run test            # Should run Jest tests
```

### CI Verification
1. Check `.github/workflows/frontend.yml` uses Bun
2. Verify all jobs use `bun install --frozen-lockfile`
3. Verify test job uses `bun run test` (not `bun test`)
4. Check that lock file is committed

## Common Mistakes to Avoid

1. **Using `bun test` instead of `bun run test`**
   - Bun's test runner doesn't support jsdom
   - Must use Jest via package.json script

2. **Assuming `bun.lockb` format**
   - Bun 1.3.x uses `bun.lock` (JSON)
   - Check what Bun actually creates

3. **Forgetting `packageManager` field**
   - Tools may default to npm without this field

4. **Using npm commands in CI**
   - Always use Bun equivalents
   - Check workflow files before committing

5. **Not committing lock file**
   - Lock file ensures reproducible builds
   - Must be committed to git

## Future Considerations

1. **Monitor Bun Updates:**
   - Watch for jsdom support in Bun's test runner
   - May migrate from Jest in future if Bun adds support

2. **Performance Monitoring:**
   - Track CI build times
   - Compare with npm baseline

3. **Team Onboarding:**
   - Ensure all developers install Bun
   - Document in README and onboarding docs

## References

- [Bun Documentation](https://bun.sh/docs)
- [Bun GitHub](https://github.com/oven-sh/bun)
- Migration Guide: `docs/FRONTEND_BUN_MIGRATION.md`
- Cursor Rules: `.cursorrules` (Frontend Development with Bun section)
