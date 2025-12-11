# Corrected Amplify Deployment Fixes

## What Was Wrong With My Initial Fixes

After critical review, I identified several issues:

1. **❌ Build flags were wrong**: `--production --ignore-workspaces --legacy-peer-deps` are npm install flags, not build flags. They get passed to `next build` which ignores them.

2. **❌ Artifacts paths were wrong**: Copied monorepo-specific paths (`../node_modules`) from USDX, but wallets is NOT a monorepo.

3. **⚠️ Public directory**: Created unnecessarily (Next.js doesn't require it if empty), but harmless.

## What I've Corrected

### Fixed `/workspace/amplify.yml`

**Removed:**
- Incorrect build flags (`--production --ignore-workspaces --legacy-peer-deps`)
- Monorepo-specific artifact paths (`../node_modules`, `../../**/**/node_modules`)
- Unnecessary preBuild commands (`echo "node-linker=hoisted"`, `npm install next` - already installed by `npm install`)

**Kept:**
- Basic build structure
- Essential artifacts (`.next/**/*`, `node_modules/**/*`, config files)
- Cache configuration

**Result:** Cleaner, simpler config that should actually work.

### Kept Useful Changes

- ✅ Error handling/logging in `markdown.ts` - This is actually useful for debugging
- ✅ Public directory - Harmless, can stay or be removed

## What We Still Don't Know

1. **Does Amplify clone the entire repo or just `wallets/frontend`?**
   - If it clones everything: Markdown files accessible ✅
   - If it only clones `wallets/frontend`: Markdown files NOT accessible ❌
   - **This is the CRITICAL unknown**

2. **What's the actual error in Amplify?**
   - Build failure?
   - Runtime error?
   - 404/page not found?
   - **Need actual error logs to diagnose**

3. **Does Next.js need `output: 'export'` for Amplify?**
   - Amplify docs say it supports Next.js SSR
   - But maybe static export is needed for this use case?

## Recommended Next Steps

1. **Deploy with corrected `amplify.yml`** - Much simpler, removes incorrect parts
2. **Check Amplify build logs** - Look for:
   - `[markdown]` debug messages (from our logging)
   - Any file access errors
   - Build failures
3. **Verify markdown file access** - The logs will show if files are found
4. **If markdown files aren't accessible:**
   - Option A: Move markdown files into `wallets/frontend/` directory
   - Option B: Copy markdown files during preBuild phase
   - Option C: Use a different approach (API, database, etc.)

## Current State

- ✅ `amplify.yml` - Corrected (removed wrong parts)
- ✅ `markdown.ts` - Has useful error handling/logging
- ⚠️ `public/` - Exists but may be unnecessary
- ❓ **Unknown**: Will markdown files be accessible during Amplify build?

## Testing Recommendation

Before deploying, test locally:
```bash
cd /workspace/wallets/frontend
npm install
npm run build
```

Check if build succeeds and markdown files are found (look for `[markdown]` logs).
