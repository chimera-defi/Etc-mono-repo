# Source Notes

Primary protocol sources used for this idea:

1. YieldBasis Hybrid Vault guide
   - https://docs.yieldbasis.com/user/guides/using-hybrid-vaults
   - Relevant facts:
     - users must deposit `crvUSD` or `scrvUSD` first
     - hybrid deposits create personal cap
     - crypto side is leveraged
     - withdrawals are order-dependent and sensitive to TRD
2. YieldBasis veYB docs
   - https://docs.yieldbasis.com/user/veyb
   - Relevant facts:
     - veYB is a time-locked vote-escrowed YB token
     - max locks and transfer conditions matter
     - fee distribution and gauge voting are first-class
3. YieldBasis audit summary
   - https://docs.yieldbasis.com/pdf/audit/electisec.pdf
   - Relevant risk surfaces:
     - voting-escrow transfer bug
     - gauge inflation attack surface
     - infinite-lock merge issues
     - lock / transfer edge-case complexity

Design implication:
- this idea should treat YieldBasis as a productive but fault-heavy substrate, not as a clean base layer for naive stablecoin issuance.
