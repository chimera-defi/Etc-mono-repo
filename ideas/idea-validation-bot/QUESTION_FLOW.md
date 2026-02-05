## IdeaBot Question Flow (Interview Script + State Machine)

### Overview
The “bot” should not be a single prompt. It should be a **state machine** that ensures coverage of:
- Problem and user
- Proposed solution and differentiation
- Constraints / feasibility
- Business model and GTM
- Adversarial tests and kill criteria
- Output confirmation (PRD/spec)

### Stage 0: Setup
- What should I call this idea (working title)?
- What’s your goal today: validate / refine / generate PRD / prepare to build?
- What’s your current context: solo builder / team / timeline / budget?

### Stage 1: Problem Definition (force specificity)
- Who specifically has the problem? (describe one real person)
- What job are they trying to get done?
- How do they solve it today? What’s the workaround?
- What’s the cost of the problem (time, money, risk, frustration)?
- What evidence do you already have that this is painful?

**Exit criteria**: clear ICP + problem statement + “current alternative”.

### Stage 2: Solution Definition
- What is the smallest version that delivers value in < 2 minutes of use?
- What are the top 3 user actions in the happy path?
- What must be true for this to work? (data, permissions, integrations, behavior change)

**Exit criteria**: MVP user journey and key dependencies.

### Stage 3: Differentiation / Moat
- Why is this 10x better than current alternatives?
- Why can’t a generic LLM chat do this?
- What will you do that’s hard to copy? (workflow, data, distribution)

**Exit criteria**: at least one crisp wedge.

### Stage 4: Feasibility (technical + execution)
- What platforms are required day 1? (iOS/Android/web)
- What external APIs or models are required?
- What are the privacy constraints? (PII, recordings, business data)
- What failure modes are unacceptable? (hallucinations, wrong advice)

**Exit criteria**: feasibility notes + risk register.

### Stage 5: Business Model
- Who pays? Why will they pay?
- What’s the pricing anchor? (time saved, revenue gained, risk avoided)
- What’s the cost driver? (STT/LLM usage, support)
- What’s the minimum viable margin?

**Exit criteria**: plausible pricing + unit economics sketch.

### Stage 6: GTM (distribution realism)
- Where do these users already hang out?
- What’s the acquisition wedge? (content, community, partnerships, SEO, app store)
- What’s the activation “aha moment”?
- What loop makes it grow? (templates, sharing PRDs, community reviews)

**Exit criteria**: a concrete first channel + activation metric.

### Stage 7: Adversarial Mode (Red-Team)
Run these as explicit, labeled tests:
- **Tar pit test**: if it’s valuable, why don’t incumbents already do it?
- **DIY test**: can users get 80% value by prompting ChatGPT for free?
- **Distribution test**: if product is ready today, how do you get 100 users next week?
- **Wedge test**: what is the 1 feature you’d refuse to cut?
- **Truth test**: list the 10 assumptions; which 2, if false, kill the idea?

**Exit criteria**: kill criteria + top experiments.

### Stage 8: Output Confirmation
Show a generated outline and ask for fast corrections:
- What’s wrong / missing?
- Rank the risks (1-5).
- Confirm MVP scope boundaries.

**Exit criteria**: lock PRD + agent spec.

