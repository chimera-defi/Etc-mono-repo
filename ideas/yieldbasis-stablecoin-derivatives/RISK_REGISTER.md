# Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---:|---|
| TRD spikes make redemptions ugly | High | High | queue + UI warning + senior gating |
| Backing rules change upstream | Medium | High | cap and backing monitor in adapter |
| Emissions fall and junior economics break | High | Medium | separate base carry from emissions in pricing |
| veYB transfer / merge semantics break assumptions | Medium | High | keep ve wrapper optional and constrained |
| Gauge accounting bugs or inflation attacks distort share math | Medium | High | adapter-side sanity checks and limits |
| Cross-protocol diversification is fake because sleeves share one hidden dependency | Medium | High | show shared-dependency warnings and concentration limits |
