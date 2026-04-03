# User Flows

## Flow 1: Mint And Inspect

1. Connect wallet
2. Prove humanness
3. Deposit collateral
4. Mint `aUSG`
5. View current yield source and health factor

## Flow 2: Choose Tranche

1. Compare senior / mezz / junior
2. Select tranche
3. Confirm expected yield, first-loss exposure, and lock duration
4. View updated allocation and exit terms

## Flow 2a: Request Exit

1. Open tranche position
2. Review current lock status and queue priority
3. Request exit
4. See whether exit is immediately queued, delayed, or blocked by lock
5. Claim exit when eligible

## Flow 3: Agent Rotation

1. Agent surfaces better source
2. User reviews rationale
3. Sensitive action is identity-gated if needed
4. Agent executes
5. UI shows before/after yield and audit log

## Flow 4: Peg Stress Demo

1. Simulate mild depeg
2. Surface policy response
3. Adjust emissions or rebalance
4. Show effect on tranche exposure and projected recovery
