## Orbit Pilot Platform Matrix

**Seed registry parity:** bundled `apps/orbit-pilot/src/orbit_pilot/bundled/seed_platforms.yaml` is intended to match this table (one row per platform). Extend the YAML when you add rows here.

| Platform | Category | Automation feasibility | Best format | Risk | Official URL |
|---|---|---|---|---|---|
| Medium | Content | Existing integration tokens only; else manual | article | Medium | https://help.medium.com/hc/en-us/articles/213480228-API-Importing |
| Reddit | Community | Mixed; default manual unless approved credentials and workflow exist | native text post | Medium-High | https://developers.reddit.com/docs/capabilities/server/reddit-api |
| GitHub | Developer | Strong official APIs | release/discussion | Low | https://docs.github.com/en/rest/releases/releases |
| LinkedIn | Social | Official member posting available with valid scopes | short post | Low-Medium | https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin |
| X | Social | Official API, policy and access sensitive | short post/thread | Medium | https://docs.x.com/overview |
| DEV / Forem | Content | Official API available | developer article | Low-Medium | https://developers.forem.com/api |
| Product Hunt | Launch | Read API clear; write path should be treated carefully | launch page + maker comment | Medium-High | https://api.producthunt.com/v2/docs |
| Crunchbase | Company profile | Treat as manual unless confirmed approved write path exists | company profile | Medium | https://support.crunchbase.com/hc/en-us/articles/115011823988-How-do-I-create-a-Crunchbase-profile |
| Hacker News | Community | Manual submission | concise title + link | Medium | https://github.com/HackerNews/API |
| Tiny Startups | Directory | Public submit flow found; no confirmed public write API | listing blurb | Medium | https://www.tinystartups.com/submit-your-startup |
| TrustMRR | Directory | Verified revenue leaderboard; use on-site “Add startup”; default manual | profile / verification flow | Medium | https://trustmrr.com/ |
| BetaList | Launch directory | Manual by default | launch listing | Medium | https://betalist.com/ |
| Indie Hackers | Community | Manual by default | launch thread | Medium | https://www.indiehackers.com/ |
| Uneed | Launch directory | Manual by default | product listing | Medium | https://www.uneed.best/ |
| SaaSHub | Directory | Manual by default | product listing | Medium | https://www.saashub.com/ |
| AlternativeTo | Directory | Manual profile suggestion path | alternative listing | Medium | https://alternativeto.net/ |
| Startup Stash | Directory | Manual by default | tool listing | Medium | https://startupstash.com/ |
| Futurepedia | AI directory | Manual by default | AI tool listing | Medium | https://www.futurepedia.io/ |
| There’s An AI For That | AI directory | Manual by default | AI tool listing | Medium | https://theresanaiforthat.com/ |
| Peerlist | Community/profile | Manual by default | launch/profile | Medium | https://peerlist.io/ |
| Microlaunch | Launch directory | Manual by default; public submit page | product launch | Medium | https://microlaunch.net/ |
| OpenAlternative | Directory | Manual by default; community submit flow | open-source alternative listing | Medium | https://openalternative.co/ |

If exact write support is uncertain, Orbit Pilot should classify the platform as `manual`.
