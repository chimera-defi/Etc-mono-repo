# GitHub Name Scan (Spec Studio Rename)

Generated: 2026-04-08

## Scope

Focused repository-name collision scan for the rename finalists:

- `ScopeSpec`
- `ScopeFrame`
- `FrameSpec`
- `BuildSpec`
- `SpecTrack`

## Findings

1. `ScopeSpec`
   - Query: `scopespec`
   - Result: no direct repository-name collision found in returned GitHub search set.
   - Status: low GitHub collision signal.

2. `ScopeFrame`
   - Query: `scopeframe`
   - Result: no direct repository-name collision found in returned GitHub search set.
   - Status: low GitHub collision signal.

3. `FrameSpec`
   - Query: `framespec`
   - Result: no direct `FrameSpec` repo collision in returned set, but nearby names (`framespector`) exist.
   - Status: watch (near-name ambiguity).

4. `BuildSpec`
   - Query: `buildspec`
   - Result: no single dominant exact repo brand, but heavy generic ecosystem usage around AWS CodeBuild buildspec naming.
   - Status: watch (high term saturation).

5. `SpecTrack`
   - Query: `spectrack`
   - Result: direct exact-name repo collision exists (`complight/SpecTrack`) plus multiple near-name repos.
   - Status: block.

## Recommendation

- Keep `ScopeSpec` and `ScopeFrame` as top rename candidates from a GitHub uniqueness perspective.
- De-prioritize `BuildSpec` and `FrameSpec` as watch candidates.
- Remove `SpecTrack` from external-name consideration.
