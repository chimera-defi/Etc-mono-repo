# AWS Amplify Deployment Analysis

## Comparison: USDX Frontend vs Wallets Frontend

### Key Differences Found

#### 1. **amplify.yml Configuration**

**USDX (Working):**
- Located at repo root
- `appRoot: usdx/frontend`
- Build command: `npm run build --production --ignore-workspaces --legacy-peer-deps`
- Artifacts include specific paths: `.next/**/*`, `node_modules/**/*`, `package.json`, etc.

**Wallets (Current):**
- Located at workspace root (`/workspace/amplify.yml`)
- `appRoot: wallets/frontend`
- Build command: `npm run build` (no flags)
- Artifacts use wildcards: `**/*` which might be too broad

#### 2. **Next.js Configuration**

**USDX:**
- No `trailingSlash` setting
- Webpack fallbacks: `fs: false`, `net: false`, `tls: false`
- Simpler config

**Wallets:**
- `trailingSlash: true` (enabled)
- Webpack fallbacks: `fs: false`, `path: false`
- More complex config

#### 3. **Build-Time File Access**

**USDX:**
- Pure client-side app
- No filesystem access at build time
- No markdown file reading

**Wallets:**
- Uses `fs.readFileSync` in `markdown.ts` to read markdown files from parent directory
- Files accessed via `path.join(process.cwd(), '..')`
- This runs during `generateStaticParams()` at build time
- **Potential Issue**: If markdown files aren't in the build context, this will fail

#### 4. **Layout Differences**

**USDX:**
- Simple layout: `<html suppressHydrationWarning>`
- No Navigation/Footer components

**Wallets:**
- Complex layout with Navigation and Footer components
- Uses `getAllDocuments()` in page.tsx which calls `fs.readFileSync`

## Identified Issues

### Issue 1: amplify.yml Artifacts Configuration
The current artifacts configuration uses `**/*` which might not correctly capture all necessary files. The USDX version uses more specific paths.

### Issue 2: Build Command Flags
The USDX build uses flags that might help with dependency resolution:
- `--production`: Ensures production build
- `--ignore-workspaces`: Prevents workspace issues
- `--legacy-peer-deps`: Helps with peer dependency conflicts

### Issue 3: Markdown File Access
The wallets app reads markdown files at build time. If these files aren't available in the Amplify build context, the build will fail silently or produce empty pages.

### Issue 4: Artifacts Path References
The current amplify.yml references `../package.json` but the actual files are in `wallets/frontend/`, not `wallets/`. This might cause issues.

## Recommended Fixes

1. **Update amplify.yml** to match USDX structure more closely
2. **Add build flags** to the build command
3. **Verify markdown files** are included in git and accessible during build
4. **Fix artifacts paths** to correctly reference files
5. **Consider adding error handling** for missing markdown files

## Next Steps

1. Update `/workspace/amplify.yml` with corrected configuration
2. Test build locally to ensure markdown files are accessible
3. Verify all markdown files are committed to git
4. Check Amplify build logs for specific errors
