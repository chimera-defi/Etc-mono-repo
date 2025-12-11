# Critical Self-Review: Amplify Deployment Fixes

## Honest Assessment

After a critical third review, I've identified several issues with my initial fixes:

## ❌ **WRONG ASSUMPTIONS**

### 1. Build Flags Are Incorrect
**What I did:** Added `--production --ignore-workspaces --legacy-peer-deps` to build command
**Reality:** 
- These are `npm install` flags, NOT `npm run build` flags
- When you run `npm run build --production`, the flag gets passed to `next build`, which ignores it
- `--ignore-workspaces` only makes sense for monorepos with npm workspaces
- **VERDICT: These flags do NOTHING and are wrong**

### 2. Artifacts Paths Are Wrong for This Structure
**What I did:** Copied `../node_modules/**/*` and `../../**/**/node_modules/**/*` from USDX
**Reality:**
- USDX is a **monorepo** with npm workspaces (has `usdx/package.json` with workspaces array)
- Wallets is **NOT a monorepo** (no root `package.json` with workspaces)
- The `../node_modules` paths make sense for USDX but NOT for wallets
- **VERDICT: These paths are unnecessary and potentially wrong**

### 3. Public Directory May Be Unnecessary
**What I did:** Created `public/` directory
**Reality:**
- Next.js doesn't require `public/` if you have no static assets
- It doesn't hurt, but it's not fixing any actual problem
- **VERDICT: Harmless but probably unnecessary**

## ✅ **WHAT MIGHT ACTUALLY BE WRONG**

### 1. Next.js Output Mode
**Issue:** Next.js by default creates a hybrid app (SSR + static). For Amplify, we might need:
```js
output: 'export'  // For fully static export
```
**BUT:** Amplify DOES support Next.js SSR, so this might not be the issue.

### 2. Markdown File Access During Build
**Issue:** The app reads markdown files from `../` (parent directory) at build time
**Critical Question:** When Amplify builds with `appRoot: wallets/frontend`, does it:
- Clone the entire repo? ✅ Markdown files accessible
- Clone only `wallets/frontend`? ❌ Markdown files NOT accessible

**Current code:** `path.join(process.cwd(), '..')` where `process.cwd()` = `wallets/frontend`
- So it looks for files in `wallets/` directory
- **This WILL work IF Amplify clones the whole repo**
- **This WILL FAIL IF Amplify only clones `wallets/frontend`**

### 3. Artifacts Configuration
**Issue:** The artifacts might not include everything Next.js needs
**Reality:** For Next.js SSR on Amplify, you typically need:
- `.next/` directory (the build output)
- `node_modules/` (for runtime dependencies)
- `package.json` and `package-lock.json`
- `next.config.js`
- `public/` (if it exists)

The current config has these, but the paths might be wrong.

## 🔍 **WHAT I DON'T KNOW**

1. **Does Amplify clone the entire repo or just appRoot?**
   - This is CRITICAL for markdown file access
   - I assumed it clones the whole repo, but I don't actually know

2. **What's the actual error in Amplify?**
   - Is it a build failure?
   - Is it a runtime error?
   - Is it a 404/page not found?
   - Without the actual error, I'm guessing

3. **Does Amplify support Next.js SSR or does it need static export?**
   - Amplify docs say it supports SSR
   - But maybe there's a configuration issue

## 🎯 **WHAT SHOULD ACTUALLY BE FIXED**

### Minimal Correct Fix:
1. **Remove incorrect build flags** - they don't do anything
2. **Remove monorepo-specific artifact paths** - wallets isn't a monorepo
3. **Keep the basic artifacts structure** - `.next/**/*`, `node_modules/**/*`, etc.
4. **Verify markdown file access** - add logging to see if files are found during build

### Better Fix (requires knowing the actual error):
1. Check Amplify build logs for the actual error
2. Verify if markdown files are accessible during build
3. Determine if Next.js needs `output: 'export'` for static hosting
4. Check if there are any runtime errors in browser console

## 📝 **RECOMMENDATION**

**Revert my changes and:**
1. Get the actual Amplify build logs/errors
2. Test locally with the same structure Amplify would have
3. Verify markdown file access works in the build environment
4. Only then make targeted fixes based on actual errors

## Files That Need Correction

1. `/workspace/amplify.yml` - Remove incorrect build flags and monorepo paths
2. Keep the error handling/logging in `markdown.ts` - that's actually useful
3. Public directory can stay (harmless) or be removed (unnecessary)
