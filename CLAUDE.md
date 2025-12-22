# Claude Code Instructions

This file contains instructions for Claude Code when working in this repository.

## Quick Reference

- **Rules Location:** `.cursorrules` - contains comprehensive AI assistant guidelines
- **Artifacts:** Place generated files in `.cursor/artifacts/`
- **Always verify:** Run linting, type checking, and tests before marking tasks complete

## Core Principles

1. **Follow `.cursorrules`** - All rules in `.cursorrules` apply to Claude Code as well as Cursor AI
2. **Verify before completing** - Always run verification commands (`npm run lint`, `npm run build`, `npm test`)
3. **No data loss** - When editing tables or documents, preserve all existing data
4. **Document sources** - Include verification dates and source links for any data

## Project-Specific Notes

### Wallets Frontend (`wallets/frontend/`)

```bash
# Development
cd wallets/frontend
npm install
npm run dev

# Verification (run before marking complete)
npm run build          # Build for production
npm run lint           # ESLint checks
npm run type-check     # TypeScript verification
npm run validate-cards # Twitter Card validation (after build)
```

### Key Files

| Area | File | Purpose |
|------|------|---------|
| SEO | `src/lib/seo.ts` | SEO utility functions |
| Metadata | `src/app/layout.tsx` | Global metadata, structured data |
| Pages | `src/app/docs/[slug]/page.tsx` | Dynamic page metadata |
| Social | `src/components/SocialShare.tsx` | Social sharing buttons |
| OG Images | `public/og-*.png` | Open Graph images for social |
| OG Generator | `scripts/generate-og-images.js` | Generates OG images |
| Validation | `scripts/validate-twitter-cards.js` | Twitter Card validator |

### OG Image Workflow

When adding a new page that needs a custom OG image:

1. **Add generator function** to `scripts/generate-og-images.js`:
   ```javascript
   function generateMyNewPageImage() {
     const canvas = createCanvas(WIDTH, HEIGHT);
     // ... draw image
     return canvas;
   }
   ```

2. **Add to main()** in the same file:
   ```javascript
   saveCanvas(generateMyNewPageImage(), 'og-my-new-page.png');
   ```

3. **Regenerate images:**
   ```bash
   cd wallets/frontend
   npm run generate-og
   ```

4. **Add metadata to page** (use existing pattern from explore/page.tsx or layout.tsx):
   ```typescript
   const ogImageUrl = `${baseUrl}/og-my-new-page.png?${ogImageVersion}`;
   ```

5. **Commit the PNG** - CI will fail if generated images don't match committed ones

**CI Verification:** The GitHub Actions workflow compares committed images against freshly generated ones. If they differ, CI fails with instructions to regenerate.

### Verification Checklist

Before completing any frontend task:

- [ ] `npm run build` succeeds
- [ ] `npm run lint` shows no errors
- [ ] `npm run type-check` passes
- [ ] OG images exist and are 1200x630 pixels
- [ ] Twitter metadata includes: card, title, description, image
- [ ] All image URLs are absolute (include base URL)

## Meta Learnings (from .cursorrules)

### Critical Rules for Data Work

- **Rule #46:** No data loss on restructure - verify ALL columns preserved
- **Rule #47:** Chains ≠ tokens - count blockchain networks, not tokens
- **Rule #52:** When uncertain, be vague not specific
- **Rule #53:** Line-by-line verification before finalizing tables

### Critical Rules for Code Work

- **Rule #20:** Think about runability - code must actually run
- **Rule #24:** Multi-tool verification - run ALL checks (lint, types, tests)
- **Rule #61:** Verify build after cleanup - always confirm nothing breaks
- **Rule #70:** Regenerate OG images when adding pages - CI will fail if images are out of sync

### Critical Rules for Documentation

- **Rule #31:** Add columns, don't remove rows
- **Rule #32:** Never consolidate by deletion
- **Rule #35:** Concise ≠ shorter - remove redundancy, not information

## Common Commands

```bash
# Root level
git status                    # Check changes
git diff                      # Review changes before commit

# Wallets frontend
cd wallets/frontend
npm run dev                   # Development server
npm run build                 # Production build
npm run lint                  # Lint check
npm run type-check            # TypeScript check
npm run generate-og           # Regenerate OG images
npm run validate-cards        # Validate Twitter Cards (after build)

# Wallet data refresh
cd wallets/scripts
./refresh-github-data.sh      # Refresh wallet activity data
```

## PR Review Checklist

When reviewing or creating PRs, verify:

1. **Build passes:** `npm run build` succeeds
2. **Linting passes:** `npm run lint` shows no errors
3. **Types pass:** `npm run type-check` has no errors
4. **No unused code:** All imports and functions are used
5. **Data preserved:** No accidental deletion of table rows/columns
6. **Sources documented:** Data changes include verification sources
7. **Commit messages:** Clear, descriptive commit messages

## External Resources

| Resource | URL | Use For |
|----------|-----|---------|
| Twitter Card Validator | https://cards-dev.twitter.com/validator | Test Twitter Cards |
| Facebook Debugger | https://developers.facebook.com/tools/debug/ | Test OG tags |
| LinkedIn Inspector | https://www.linkedin.com/post-inspector/ | Test LinkedIn shares |
| WalletBeat | https://walletbeat.fyi | Wallet technical data |
