### End-to-end workflow

1) Provision and access the host
- Ubuntu 20.04+ with a public SSH key
- SSH as root

2) Clone and prepare
```bash
git clone https://github.com/chimera-defi/eth2-quickstart
cd eth2-quickstart
chmod +x run_1.sh run_2.sh
```

3) Stage 1: Harden and base setup (root)
```bash
# IMPORTANT: Add your SSH key to root first: ssh-copy-id root@<server>
# run_1 migrates root's keys to LOGIN_UNAME — no keys = lockout risk
./run_1.sh
# Review handoff info, then:
sudo reboot
```

4) Configure environment (non-root user)
```bash
ssh LOGIN_UNAME@<server-ip>
nano exports.sh
# Update: SERVER_NAME, FEE_RECIPIENT, GRAFITTI, PRYSM_CPURL (optional), MAX_PEERS, MEV_RELAYS (optional)
```

5) Stage 2: Install clients and services
```bash
./run_2.sh
```

6) Start services and verify
```bash
sudo systemctl start eth1 cl validator mev
sudo systemctl status eth1 cl validator mev --no-pager
./extra_utils/stats.sh
```

7) Optional: Public RPC with Nginx + SSL
```bash
./install_nginx.sh                  # HTTP only, local testing
# or, with SSL (run as root via sudo su):
./install_acme_ssl.sh               # Preferred (acme.sh)
# or
./install_ssl_certbot.sh            # Certbot manual DNS
```
Test locally:
```bash
curl -X POST http://$(curl -s v4.ident.me)/rpc \
  -H 'Content-Type: application/json' \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

8) Sync tips
- Prysm supports checkpoint sync via `prysm_beacon_conf.yaml` (already set from `PRYSM_CPURL`)
- To resync from included SSZ files (optional), stop CL/validator, run one-time `prysm.sh beacon-chain` with the provided `--checkpoint-*` flags, then `systemctl restart cl validator`

9) Routine operations
- Start/stop: `sudo systemctl [start|stop|restart|status] eth1 cl validator mev`
- Refresh all: `./extra_utils/refresh.sh`
- Update stack: `./extra_utils/update.sh`

10) Security verification
- Run security verification: `./docs/verify_security.sh`
- Test security implementations: `./test_security_fixes.sh`
- Monitor security logs: `sudo tail -f /var/log/security_monitor.log`
- Check AIDE logs: `sudo tail -f /var/log/aide_check.log`

11) Security reminders
- Keep `jwt.hex` private; Engine API must not be exposed publicly
- UFW denies inbound 8545/8551 by default; expose RPC only via Nginx if needed
- Consider disabling root SSH login after confirming stability
- All services bind to localhost only for security

