# Infra Ideas (Future Enhancements)

## Security Hardening

- SSH hardening script (keys only, disable password auth, optional non‑22 port).
- Automatic unattended upgrades + reboot window.
- Fail2ban for SSH + status endpoint.
- Dedicated least‑privilege user for status server, separate from validator.

## SaaS Offering

- Customer provisioning flow: region selection → config generation → deployment.
- SLA tiering tied to uptime metrics + response SLAs.
- Public status JSON per validator + consolidated dashboard.
- Delegation waitlist + intake form linked to evidence artifacts.

## Observability

- Prometheus exporters for disk, process, and RPC health.
- Loki/Promtail for log shipping.
- Alert routing: email + Telegram + Discord.

## Automation

- One‑click bootstrap script for fresh hosts.
- Safe upgrade flow (pin version, smoke test, rollback).
- Periodic backups of `/etc/monad` with encryption.
