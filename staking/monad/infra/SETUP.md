# Monad Infra Full Setup (One Host)

This is the fastest end‑to‑end path to a hardened host with monitoring.

## 1) Prereqs

- Ubuntu/Debian host, sudo access.
- Docker + Docker Compose installed.
- Monad validator binary + config source available.

## 2) One‑shot Setup (recommended)

```bash
MONAD_BFT_BIN_SRC=/path/to/monad-bft \
MONAD_CONFIG_SRC=/path/to/config.toml \
./scripts/setup_server.sh --with-caddy --with-firewall
```

What this does:

- creates the `monad` system user and owns `/etc/monad` + `/opt/monad-status`
- installs sysctl tuning
- installs validator + status systemd units
- optionally installs Caddy + UFW rules
- runs preflight + e2e smoke checks

## 3) Enable Services

```bash
sudo systemctl enable --now monad-status.service
sudo systemctl enable --now monad-validator.service
```

## 4) Monitoring Stack

```bash
cd monitoring
sudo docker compose up -d
```

Access:

- Grafana: `http://<host>:3000` (default admin/admin)
- Prometheus: `http://<host>:9090`
- Loki: `http://<host>:3100`

Optional public exposure (Grafana only):

- Put Grafana behind auth using `monitoring.<domain>` in `config/Caddyfile.status.example`.
- Keep Prometheus/Loki unexposed.

## 5) Validate

```bash
curl -fsS http://localhost:8787/status
./scripts/check_rpc.sh http://localhost:8080 eth_blockNumber
./scripts/e2e_smoke_test.sh
```

## 6) Production Hardening Checklist

- Change Grafana admin password.
- Restrict monitoring ports by firewall or reverse proxy.
- Replace default domain/email references.
- Keep validator keys offline and root‑only (`chmod 600`).
