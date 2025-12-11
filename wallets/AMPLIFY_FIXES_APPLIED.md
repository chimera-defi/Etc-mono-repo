# AWS Amplify Deployment Fixes Applied

## Summary

Compared the wallets frontend with the working USDX frontend and identified several configuration differences that could prevent proper deployment in AWS Amplify.

## Changes Made

### 1. Updated `/workspace/amplify.yml`

**Key Changes:**
- ✅ Added build flags: `--production --ignore-workspaces --legacy-peer-deps`
- ✅ Updated artifacts configuration to match USDX structure
- ✅ Added node_modules paths from parent directories (for monorepo support)
- ✅ Ensured public directory is included in artifacts

**Before:**
```yaml
build:
  commands:
    - npm run build
artifacts:
  files:
    - '**/*'  # Too broad
```

**After:**
```yaml
build:
  commands:
    - npm run build --production --ignore-workspaces --legacy-peer-deps
artifacts:
  files:
    - '.next/**/*'
    - '../node_modules/**/*'
    - '../../**/**/node_modules/**/*'
    - 'node_modules/**/*'
    - 'package.json'
    - 'package-lock.json'
    - 'next.config.js'
    - 'public/**/*'
```

### 2. Created `public/` Directory

- ✅ Created `/workspace/wallets/frontend/public/` directory
- ✅ Added `.gitkeep` file to ensure directory is tracked in git
- ✅ Next.js requires this directory for static assets

### 3. Enhanced Error Handling in `markdown.ts`

- ✅ Added debug logging for build environments (AWS_AMPLIFY, VERCEL)
- ✅ Added try-catch around file reading operations
- ✅ Added warnings when markdown files are not found
- ✅ Logs document count after loading

This will help diagnose issues if markdown files aren't accessible during build.

## Key Differences Found

### USDX Frontend (Working)
- ✅ Uses build flags for dependency resolution
- ✅ Has specific artifacts paths (not wildcards)
- ✅ Includes node_modules from parent directories
- ✅ Pure client-side app (no filesystem access at build time)

### Wallets Frontend (Before Fixes)
- ❌ No build flags (could cause dependency issues)
- ❌ Used `**/*` wildcard (too broad, might miss files)
- ❌ No public directory
- ⚠️ Reads markdown files at build time (potential issue if files not accessible)

## Potential Remaining Issues

### 1. Markdown File Access
The wallets app reads markdown files from `../` (parent directory) at build time. This should work if:
- ✅ The entire repo is cloned by Amplify
- ✅ The `appRoot: wallets/frontend` doesn't prevent access to parent directory
- ✅ Markdown files are committed to git

**To Verify:**
- Check Amplify build logs for `[markdown]` debug messages
- Ensure all `.md` files are committed to git
- Verify build logs show markdown files being loaded

### 2. Next.js Static Generation
The app uses `generateStaticParams()` which runs at build time. If markdown files aren't accessible:
- Pages won't be generated
- App might appear broken or show 404s

**Solution:** The added error handling will log warnings if files aren't found.

### 3. Build Context
When `appRoot: wallets/frontend` is set, Amplify:
- Changes working directory to `wallets/frontend`
- `process.cwd()` = `wallets/frontend`
- `path.join(process.cwd(), '..')` = `wallets/` ✅

This should work correctly as long as the repo structure is maintained.

## Testing Recommendations

1. **Check Build Logs:**
   - Look for `[markdown]` debug messages
   - Verify markdown files are being found
   - Check for any file reading errors

2. **Verify Artifacts:**
   - Ensure `.next/` directory is created
   - Check that all necessary files are included

3. **Test Deployment:**
   - Deploy to Amplify and check if pages load
   - Verify markdown content is rendered correctly
   - Check browser console for errors

## Next Steps

1. ✅ Commit these changes to git
2. ⏭️ Trigger a new Amplify build
3. ⏭️ Review build logs for `[markdown]` messages
4. ⏭️ Verify the app loads correctly in Amplify
5. ⏭️ If issues persist, check:
   - Are markdown files committed to git?
   - Are build logs showing file access errors?
   - Is the Amplify app configured correctly (Node version, etc.)?

## Files Modified

- `/workspace/amplify.yml` - Updated build configuration
- `/workspace/wallets/frontend/src/lib/markdown.ts` - Added error handling and logging
- `/workspace/wallets/frontend/public/.gitkeep` - Created public directory

## Reference

Comparison with USDX frontend:
- Repository: https://github.com/chimera-defi/ethglobal-argentina-25/tree/main/usdx/frontend
- Working amplify.yml configuration used as reference
