# Acceptance Test Matrix

| Flow | Preconditions | Action | Expected Result | Evidence |
|---|---|---|---|---|
| Mint senior tranche | healthy adapter state | user mints senior | shares issued with low-risk flags, shorter lock terms, and higher queue priority | senior position visible |
| Mint junior tranche | healthy adapter state | user mints junior | shares issued with junior risk flags, longer lock terms, and subordinated queue rights | junior position visible |
| TRD spike | active tranche positions exist | adapter TRD rises | redemption policy degrades visibly | warning + queue update |
| Cap stress | cap usage high | user tries new mint | mint capped or blocked | cap warning |
| Concentration drift | one sleeve dominates | allocator drifts | diversification warning appears | allocation panel warning |
| Extend junior lock | junior shares exist | user increases lock commitment | extra yield source changes to lock premium bucket | lock state visible |
| Redeem senior | queue healthy | request redeem | senior request enters queue | queue ticket |
| Junior tries to outrank senior | unlocked senior and junior requests exist | junior requests redeem | junior remains behind senior in payout order | queue ordering visible |
| ve wrapper disabled | lock semantics unsafe | user tries ve wrap | ve path blocked | explicit disable message |
