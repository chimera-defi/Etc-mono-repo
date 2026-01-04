# Cadence Setup

> **One command to transform any VPS into an AI coding powerhouse**

```bash
npx cadence-setup
```

## What This Does

1. **Connects** to your VPS via SSH
2. **Installs** Node.js, Claude Code, and dependencies
3. **Deploys** the Cadence bridge server
4. **Configures** auto-start service and firewall
5. **Returns** your API endpoint and key

Total time: ~5 minutes

## Prerequisites

- A VPS running Ubuntu (20.04+ recommended)
- SSH access (key-based authentication)
- Anthropic API key

### Recommended VPS Providers

| Provider | Smallest VPS | Price/mo |
|----------|--------------|----------|
| [Hetzner](https://hetzner.cloud) | CX22 (2 vCPU, 4GB) | €4.49 |
| [Contabo](https://contabo.com) | VPS S (4 vCPU, 8GB) | €5.99 |
| [DigitalOcean](https://digitalocean.com) | Basic (1 vCPU, 2GB) | $12 |
| [Vultr](https://vultr.com) | Cloud (1 vCPU, 2GB) | $10 |

## Usage

### Interactive Setup

```bash
npx cadence-setup
```

You'll be prompted for:
- VPS IP address
- SSH username (default: root)
- SSH private key path
- Anthropic API key
- OpenAI API key (optional, for voice transcription)

### What Gets Installed

```
/opt/cadence/
├── server.js       # Cadence bridge server
├── package.json    # Dependencies
├── .env            # API keys and config
└── repos/          # Cloned repositories
```

### Systemd Service

The bridge runs as a systemd service:

```bash
# Check status
systemctl status cadence

# View logs
journalctl -u cadence -f

# Restart
systemctl restart cadence
```

## API Reference

### Health Check

```bash
curl http://YOUR_VPS_IP:3000/health
```

### Run a Task

```bash
curl -X POST http://YOUR_VPS_IP:3000/task \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Add a hello world function to index.ts",
    "repoUrl": "https://github.com/your/repo"
  }'
```

### Clone a Repository

```bash
curl -X POST http://YOUR_VPS_IP:3000/repos/clone \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/your/repo"}'
```

### List Repositories

```bash
curl http://YOUR_VPS_IP:3000/repos \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Security

- API key required for all endpoints (except /health)
- SSH key authentication only (no passwords)
- Firewall configured to allow only port 3000
- Consider adding HTTPS via Caddy or nginx for production

### Adding HTTPS (Optional)

```bash
# On your VPS
apt install caddy

# Create Caddyfile
cat > /etc/caddy/Caddyfile << 'EOF'
your-domain.com {
  reverse_proxy localhost:3000
}
EOF

# Restart Caddy
systemctl restart caddy
```

## Troubleshooting

### Can't connect via SSH

```bash
# Test SSH connection manually
ssh -i ~/.ssh/your_key root@YOUR_VPS_IP
```

### Service not starting

```bash
# Check logs
journalctl -u cadence -n 50

# Check if port is in use
ss -tlnp | grep 3000
```

### Claude not found

```bash
# Verify installation
ssh root@YOUR_VPS_IP "which claude"

# Reinstall if needed
ssh root@YOUR_VPS_IP "npm install -g @anthropic-ai/claude-code"
```

## Development

```bash
# Clone this repo
git clone https://github.com/your/cadence
cd cadence/cadence-setup

# Install dependencies
npm install

# Run locally
npm run dev
```

## Architecture

```
┌─────────────────┐     ┌─────────────────────────────────┐
│  Your Phone     │     │  Your VPS                       │
│  or Computer    │     │                                 │
│                 │     │  ┌─────────────────────────┐    │
│  Voice/Text  ───────────> Cadence Bridge (:3000)  │    │
│                 │     │  │                         │    │
│                 │     │  │   ┌─────────────────┐   │    │
│  <── Results ──────────── │   │  Claude Code    │   │    │
│                 │     │  │   │  (executes)     │   │    │
│                 │     │  │   └─────────────────┘   │    │
│                 │     │  └─────────────────────────┘    │
│                 │     │                                 │
│                 │     │  /opt/cadence/repos/            │
│                 │     │  └── your-project/              │
└─────────────────┘     └─────────────────────────────────┘
```

## License

MIT
