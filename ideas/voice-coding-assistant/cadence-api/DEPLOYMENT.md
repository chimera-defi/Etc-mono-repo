# Deployment Guide

This guide covers deploying the Cadence API to Fly.io.

## Prerequisites

1. Install [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/)
2. Create a Fly.io account: `fly auth signup` or `fly auth login`
3. Have your OpenAI API key ready

## Initial Setup

### 1. Launch the Application

From the `cadence-api` directory:

```bash
fly launch
```

This command will:
- Detect the Dockerfile
- Read fly.toml configuration
- Create the app on Fly.io
- Ask if you want to deploy now (say "no" - we need to set secrets first)

**Note:** If prompted to tweak settings, you can accept the defaults from `fly.toml`.

### 2. Set Environment Secrets

Set your OpenAI API key as a secret (never commit this to git):

```bash
fly secrets set OPENAI_API_KEY=sk-your-actual-api-key
```

If you have a VPS endpoint configured:

```bash
fly secrets set VPS_ENDPOINT=https://your-vps-endpoint.com
fly secrets set VPS_API_KEY=your-vps-api-key
```

### 3. Deploy

```bash
fly deploy
```

This will:
- Build the Docker image
- Deploy to Fly.io
- Run health checks
- Make your API available at `https://cadence-api.fly.dev`

### 4. Verify Deployment

Check that the API is running:

```bash
# View status
fly status

# View logs
fly logs

# Test health endpoint
curl https://cadence-api.fly.dev/api/health
```

## Configuration

### Environment Variables

Public environment variables are set in `fly.toml`:
- `NODE_ENV=production`
- `PORT=3001`
- `HOST=0.0.0.0`
- `LOG_LEVEL=info`

Secrets must be set via CLI:
- `OPENAI_API_KEY` (required)
- `VPS_ENDPOINT` (optional)
- `VPS_API_KEY` (optional)

### Scaling

**Adjust VM size:**

```bash
# List available sizes
fly scale show

# Change to a different size
fly scale vm shared-cpu-2x
```

**Adjust memory:**

```bash
fly scale memory 1024
```

**Auto-scaling:**

The app is configured with:
- `min_machines_running = 1` - Always keep at least 1 machine
- `auto_stop_machines = "stop"` - Stop when idle
- `auto_start_machines = true` - Auto-start on requests

To adjust:

```bash
# Edit fly.toml and redeploy
fly deploy
```

### Regions

Current region: `iad` (US East - Ashburn)

To change or add regions:

```bash
# List available regions
fly regions list

# Add a region
fly regions add lax

# Remove a region
fly regions remove lax
```

## Monitoring

### View Logs

```bash
# Real-time logs
fly logs

# Filter by level
fly logs --filter error
```

### Check Status

```bash
# App status
fly status

# VM metrics
fly dashboard
```

### Health Checks

The app has two health checks:
1. HTTP check on `/api/health` (every 30s)
2. TCP check on port 3001 (every 15s)

If health checks fail, Fly.io will restart the machine.

## Updates

### Deploy New Version

```bash
# Build and deploy
fly deploy

# Deploy with specific Dockerfile
fly deploy --dockerfile Dockerfile
```

### Rollback

```bash
# List releases
fly releases

# Rollback to previous version
fly releases rollback
```

## Secrets Management

### List Secrets

```bash
fly secrets list
```

### Update Secret

```bash
fly secrets set OPENAI_API_KEY=sk-new-key
```

**Note:** Updating secrets triggers a deployment.

### Remove Secret

```bash
fly secrets unset SECRET_NAME
```

## Cost Optimization

Current configuration is optimized for low cost:
- Shared CPU (cheapest option)
- 512MB memory
- Auto-stop when idle
- 1 machine minimum

To further reduce costs:

```bash
# Suspend the app when not in use
fly apps suspend cadence-api

# Resume when needed
fly apps resume cadence-api
```

## Troubleshooting

### Build Failures

```bash
# Build locally to test
docker build -t cadence-api .

# Run locally
docker run -p 3001:3001 -e OPENAI_API_KEY=sk-... cadence-api
```

### Logs Not Showing

```bash
# SSH into the machine
fly ssh console

# Check logs inside container
cat /var/log/*.log
```

### Health Check Failures

Check the health endpoint:

```bash
fly logs --filter health
```

Verify the endpoint works:

```bash
curl https://cadence-api.fly.dev/api/health
```

### Out of Memory

Increase memory allocation:

```bash
fly scale memory 1024
```

## Production Checklist

- [ ] OpenAI API key is set via secrets
- [ ] Health check endpoint (`/api/health`) returns 200
- [ ] HTTPS is enforced (configured in fly.toml)
- [ ] Logs are flowing (`fly logs`)
- [ ] Test all endpoints after deployment
- [ ] Monitor costs in Fly.io dashboard
- [ ] Set up monitoring/alerting if needed

## CI/CD Integration

To automate deployments with GitHub Actions:

1. Get a Fly.io API token:
   ```bash
   fly tokens create deploy
   ```

2. Add token to GitHub secrets as `FLY_API_TOKEN`

3. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to Fly.io

   on:
     push:
       branches: [main]
       paths:
         - 'ideas/voice-coding-assistant/cadence-api/**'

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: superfly/flyctl-actions/setup-flyctl@master
         - run: |
             cd ideas/voice-coding-assistant/cadence-api
             flyctl deploy --remote-only
           env:
             FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
   ```

## Support

- Fly.io Docs: https://fly.io/docs/
- Community Forum: https://community.fly.io/
- Status Page: https://status.fly.io/

## API Endpoints (Production)

Replace `localhost:3001` with your Fly.io URL:

- Health: `https://cadence-api.fly.dev/api/health`
- Tasks: `https://cadence-api.fly.dev/api/tasks`
- Voice: `https://cadence-api.fly.dev/api/voice/command`

See `README.md` for complete API documentation.
