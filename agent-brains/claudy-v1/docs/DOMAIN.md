# Eth2/Staking Domain Knowledge

All eth2-specific knowledge encoded here. Agents reference this, not external docs.

## Key Concepts (Agent-Readable)

### Validators
- **Entry:** 32 ETH deposit
- **Activation:** ~1 epoch (1 day) after deposit
- **Penalty:** Slashing (0.5 ETH initial), inactivity leak
- **Exit:** 27 epochs (~3 hours) to withdrawable
- **Reference:** [Eth2 Spec](https://github.com/ethereum/consensus-specs)

### Node Stack
```
Execution Layer (Geth/Erigon)
         ↓
Consensus Layer (Prysm/Lighthouse)
         ↓
Validator Client
         ↓
MEV Boost (optional)
```

- **Execution:** Processes transactions
- **Consensus:** Produces blocks, manages validators
- **Validator:** Signs attestations + proposals
- **MEV:** Orders transactions for profit (optional)

### Critical Parameters
| Parameter | Value | Impact |
|-----------|-------|--------|
| Epoch length | 32 slots | Validator duties window |
| Slot duration | 12 seconds | Finality speed |
| Attestation inclusion | ±1 slot | Performance threshold |
| Slashing threshold | 0.5 ETH initial | Operator cost |
| Inactivity threshold | 21 days | Emergency recovery period |

---

## Deployment Scenarios

### Mainnet (Production)
- High availability requirement (>99.9%)
- Cold/hot validator setup
- Slashing-protected signing
- MEV boost recommended

### Testnet (Staging)
- Holesky (current standard)
- Low-cost testing
- Full validator lifecycle
- Used for eth2-quickstart tests

---

## Risk Matrix

```
Risk Level | Scenario | Mitigation
-----------|----------|------------
CRITICAL   | Slashing | Validator key isolation + signing guard
HIGH       | Miss 3+ attestations | Redundant clients + alerting
MEDIUM     | MEV extraction loss | Fallback to vanilla builder
LOW        | Slow sync | Checkpoint sync after 2h delay
```

---

## Schemas & Validation

### Validator Configuration
```json
{
  "validator_count": 0,      // [required] >0
  "keys": {...},              // [required] Signed + encrypted
  "graffiti": "string",       // [optional] UTF-8, <32 bytes
  "withdrawal_address": "0x..", // [required] Valid ETH address
  "fee_recipient": "0x..",    // [required] Valid ETH address
  "enable_mev": boolean,      // [optional] Default: false
  "slashing_protection": {
    "enabled": true,          // [required] Always true
    "db_path": "string"       // [required] Persistent
  }
}
```

Validated by: `linters/eth2_config.sh`

---

## Integration Points

1. **Node APIs**
   - `eth_blockNumber`, `eth_gasPrice`, `eth_getBalance`
   - Query interface: `domain/eth2/clients/query.sh`

2. **Validator Duties**
   - Duties endpoint: `GET /eth/v1/validator/duties/attester/{epoch}`
   - Sign interface: `domain/eth2/signing/sign.sh`

3. **Performance Monitoring**
   - Attestation inclusion: Query `GET /eth/v1/beacon/blocks/{block_id}/attestations`
   - Lag detection: Compare local vs network timestamp
   - Metrics exposed to OpenTelemetry

---

## Historical Context

- **eth2-quickstart:** Testing + validation framework for all of above
- **ChimeraDefi:** Production validator + MEV setup
- **Sharedstake:** Multi-operator pool infrastructure

---

_Last reviewed: 2026-02-15 | Next review: 2026-02-22_
