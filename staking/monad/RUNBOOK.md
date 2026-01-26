# Monad Validator MVP Runbook

## 1. Start Services

1) Apply sysctl tuning:

```bash
sudo staking/monad/scripts/install_sysctl.sh
```

2) Start status server:

```bash
sudo staking/monad/scripts/install_status_service.sh
sudo systemctl enable --now monad-status.service
```

3) Local devnet (if hardware allows):

```bash
cd /root/monad-bft/docker/single-node
./nets/run.sh --use-prebuilt
```

## 2. Quick Health Checks

- Status JSON:

```bash
curl -fsS http://localhost:8787/status
```

- RPC check:

```bash
staking/monad/scripts/check_rpc.sh http://localhost:8080 eth_blockNumber
```

- E2E smoke test:

```bash
staking/monad/scripts/e2e_smoke_test.sh
```

## 3. Restart / Recovery

- Restart status server:

```bash
sudo systemctl restart monad-status.service
```

- Check logs:

```bash
journalctl -u monad-status.service -n 200 --no-pager
```

## 4. Rollback (MVP)

- If a new config breaks status checks, restore `/etc/monad/status.env` from backup and restart.

## 5. Notes

- Local devnet requires hugepages; ensure >= 8–16 GiB RAM for reliable startup.
