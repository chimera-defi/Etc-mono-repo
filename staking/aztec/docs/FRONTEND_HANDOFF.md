# Frontend Handoff: Liquid Aztec Staking

## Overview
This document outlines the design, user journeys, and technical requirements for the Liquid Aztec Staking frontend. It serves as a guide for the next agent to build the UI.

## Research & Design Requirements
Based on analysis of leading liquid staking protocols (Lido, Rocket Pool, Jito), the UI should prioritize trust, simplicity, and clear feedback.

### User Journeys
1. **The Staker**: Connects wallet -> Enters AZTEC amount -> Stakes -> Receives stAZTEC.
2. **The Unstaker**: Connects wallet -> Enters stAZTEC amount -> Requests Withdrawal -> Waits (Unbonding) -> Claims AZTEC.
3. **The Monitor**: Checks Portfolio (Staked balance, Rewards, Exchange Rate).

### Key Components
1. **Stake/Unstake Widget**:
   - Tabbed interface (Stake | Unstake).
   - "Unstake" tab has sub-tabs or states for "Request" and "Claim".
   - Input/Output fields with max button and USD approximation.
   - Transaction summary (Exchange Rate, Fees, Time to arrival).
2. **Stats Bar**: Global TVL, APY, Exchange Rate (1 stAZTEC = X.XX AZTEC).
3. **Portfolio Dashboard**: User specific stats.
4. **Wallet Connection**: Button handling connection states (Disconnected, Connecting, Connected, Wrong Network).

## Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Wallet**: Aztec Wallet Adapter (or mock interface if not ready)

## Task Breakdown

### Phase 1: Setup & Scaffolding
- [ ] Initialize Next.js project in `staking/aztec/frontend`
- [ ] Configure Tailwind CSS and Lucide React
- [ ] Create basic Layout (Navbar, Footer, Background)

### Phase 2: Core Components
- [ ] **UI Kit**: Button (variants), Input (with Max button), Card, Modal, Tabs, Loader.
- [ ] **Connect Wallet**: Button component that simulates connection states.
- [ ] **Stats Display**: Component for APY, TVL, Exchange Rate.

### Phase 3: Feature Implementation
- [ ] **Stake Widget**: 
    - Toggle Stake/Unstake
    - Amount inputs with validation
    - Summary view (Rate, Fee, Receive Amount)
- [ ] **Withdrawal Queue**:
    - List of pending withdrawals
    - "Claim" button for ready items
    - Progress indicator for unbonding
- [ ] **Portfolio**:
    - Total Staked Balance
    - Rewards Earned (mocked/calculated)

### Phase 4: Integration (Mock)
- [ ] Create `useStaking` hook (mock implementation)
- [ ] Create `useWallet` hook (mock implementation)
- [ ] Wire up UI to mock hooks to demonstrate flow

## Prompts for Coding Agents

Use the following prompts to guide the AI in generating the code.

### Prompt 1: Project Setup
```text
I need to set up the frontend for the Aztec Liquid Staking protocol. 
Please create a new Next.js 14 application in `staking/aztec/frontend`.
Use TypeScript, Tailwind CSS, and ESLint.
Install `lucide-react` for icons and `clsx` `tailwind-merge` for class management.
Clean up the default boilerplate to a blank slate.
Create a `src/components/ui` directory for our atomic components.
```

### Prompt 2: Core UI Components
```text
We need a set of atomic UI components for our dark-themed DeFi app.
Please create the following components in `src/components/ui` using Tailwind CSS:
1. `Button.tsx`: Variants (primary, secondary, outline, ghost), sizes (sm, md, lg), loading state.
2. `Input.tsx`: Dark background, border focus state, optional "Max" button inside, helper text.
3. `Card.tsx`: A container with a subtle border and dark background, for the staking widget.
4. `Tabs.tsx`: A segmented control to switch between "Stake" and "Unstake".
5. `Badge.tsx`: For status indicators (e.g., "Unbonding", "Ready").
Ensure they are accessible and responsive.
```

### Prompt 3: Stake Widget Layout
```text
Now let's build the main `StakeWidget` component.
It should be a Card containing:
1. A Tab switcher (Stake / Unstake).
2. An Input field for the amount to stake (AZTEC).
3. A display of the estimated output (stAZTEC) based on a hardcoded exchange rate (e.g., 1.02).
4. A Summary section showing: Exchange Rate, Transaction Cost, Reward Fee.
5. A primary "Stake" button (disabled if amount is 0 or wallet not connected).
Use the atomic components created previously. Mock the wallet connection state for now.
```

### Prompt 4: Withdrawal & Queue
```text
Implement the "Unstake" tab view within the Widget, and a separate "WithdrawalQueue" component.
1. Unstake Tab: Input for stAZTEC, shows "Receive AZTEC" estimate. Warning about 7-day unbonding.
2. WithdrawalQueue: A list of pending requests. Each item shows: Amount, Status (Unbonding/Claimable), Time remaining.
3. Add a "Claim" button for items that are ready.
```

### Prompt 5: Page Assembly
```text
Assemble the `page.tsx`.
1. Header: Logo (Text), Nav Links, Connect Wallet Button.
2. Hero Section: Title "Liquid Stake your Aztec", Subtitle.
3. Stats Bar: TVL ($10M), APY (8.5%), Exchange Rate (1.025).
4. Main Content: Centered `StakeWidget`.
5. Below Widget: `WithdrawalQueue` (only visible if there are pending items).
6. Footer: Links to Docs, Twitter, Terms.
Use a dark gradient background.
```
