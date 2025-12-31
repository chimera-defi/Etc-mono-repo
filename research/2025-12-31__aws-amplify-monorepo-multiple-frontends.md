## Question

Is it possible with AWS Amplify in a monorepo to have **multiple different frontends** (multiple different apps) with **different URLs** served out of the **same GitHub repo**?

## Answer (tl;dr)

**Yes.** The most straightforward pattern is: **create one Amplify Hosting app per frontend**, all connected to the same GitHub repo, and set each one’s **monorepo “app root”** / build settings so it builds and deploys only that frontend. Each Amplify app then gets its **own URL** (and you can attach custom domains/subdomains).

## Recommended approach (most common)

### Option A — Multiple Amplify “Apps” (recommended)

Create:
- **Amplify App #1** → targets `apps/app-a/` (or similar) → deploys to `app-a.example.com`
- **Amplify App #2** → targets `apps/app-b/` (or similar) → deploys to `app-b.example.com`

Each Amplify App:
- Connects to the **same GitHub repo**
- Can track the **same branch** (e.g. `main`) or different branches if you want
- Has its own build settings (including **app root** / working directory)
- Produces its own hosted site URL (`*.amplifyapp.com`) and can have its own **custom domain mapping**

Why this is usually best:
- Clean separation (independent builds, deploys, environment variables, domains)
- Easy to reason about and operate
- Minimal “routing glue” required

### Option B — One Amplify App hosting multiple SPAs under different paths (possible but often awkward)

Amplify Hosting is essentially “one site per Amplify app / branch” from a hosting perspective.

You *can* sometimes make a single build output host multiple apps if you:
- Build both frontends into one artifact folder, and
- Use rewrites/redirects so `/app-a/*` routes to App A and `/app-b/*` routes to App B

But caveats:
- This tends to be brittle for frameworks with their own routing assumptions (e.g., Next.js, React Router, asset paths).
- You often end up needing careful base paths, asset prefixes, and rewrite rules.
- Operationally it couples deploys (changing one app redeploys everything).

For “multiple apps with different URLs,” **Option A** is usually the better fit.

## Practical setup notes (Amplify Console)

What you typically configure per Amplify App:
- **Repository**: same GitHub repo for all apps
- **Branch**: usually `main`
- **Monorepo / App root**: set to the folder containing that frontend
- **Build commands**: run from that app root (often using workspaces / turbo / pnpm, depending on repo)
- **Build artifact directory**: the app’s output folder (`dist`, `build`, `.next`, etc.)
- **Custom domain**: map `app-a.example.com` or `app-b.example.com` to the corresponding Amplify app

## Notes / caveats

- **Different subdomains is easy**: `a.example.com` and `b.example.com` can be mapped to different Amplify apps.
- **Different paths on the same domain** (e.g., `example.com/app-a` and `example.com/app-b`) is *doable*, but is more often handled with a dedicated CloudFront distribution with multiple origins/behaviors (or a reverse proxy) if you want it “clean.”
- **Amplify backend vs hosting**: “Amplify Hosting” is separate from “Amplify backend (Gen 1/Gen 2).” You can host multiple frontends that share a backend, but you’ll want to be intentional about environment variables and per-app configuration.

