# Monad Validator Runbook (MVP)

## Scope

Single validator + local RPC + uptime proof. Expand after stability.

## Paths

- Config root: `/etc/monad` (or `~/.monad`, choose one)
- Logs: `/var/log/monad/`
- Service: `monad-validator.service`

## Daily Checks (5 minutes)

1. `systemctl status monad-validator`
2. `journalctl -u monad-validator -n 200 --no-pager`
3. `scripts/healthcheck.sh`
4. Disk: `df -h` (alert at 80%+)
5. Time sync: `timedatectl status` (NTP active)

## Restart (safe)

```bash
sudo systemctl restart monad-validator
sudo systemctl status monad-validator
```

## Rollback (binary/config)

1. Stop service.
2. Restore previous binary + config from backup.
3. Start service and watch logs.

```bash
sudo systemctl stop monad-validator
# restore binaries/config here
sudo systemctl start monad-validator
journalctl -u monad-validator -n 200 --no-pager
```

## Uptime Proof

- Monitor link: `TBD`
- Status page: `TBD`
- Public status JSON: `TBD`

## Incident Log Template

```
Date:
Duration:
Impact:
Root cause:
Fix:
Preventative action:
```
