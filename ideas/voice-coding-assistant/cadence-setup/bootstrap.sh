#!/bin/bash
#
# Cadence Bootstrap Script
#
# Run this on your VPS to prepare it for Cadence setup.
# This starts a temporary setup server that the Cadence app connects to.
#
# Usage: curl -fsSL https://raw.githubusercontent.com/.../bootstrap.sh | bash
#

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  🎙️  Cadence - VPS Bootstrap                              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root: sudo bash -c \"\$(curl -fsSL ...)\""
  exit 1
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "✅ Node.js $(node --version)"

# Create temporary setup directory
SETUP_DIR="/tmp/cadence-bootstrap"
mkdir -p "$SETUP_DIR"
cd "$SETUP_DIR"

# Create the bootstrap server
cat > server.js << 'EOFSERVER'
const http = require('http');
const { execSync, spawn } = require('child_process');
const crypto = require('crypto');

const PORT = 3000;
let setupComplete = false;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ready', setupComplete }));
    return;
  }

  // Setup endpoint
  if (req.method === 'POST' && req.url === '/setup') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { anthropicKey, openaiKey } = JSON.parse(body);

        if (!anthropicKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'anthropicKey is required' }));
          return;
        }

        console.log('🚀 Starting setup...');

        // Install dependencies
        console.log('📦 Installing dependencies...');
        execSync('apt-get update && apt-get install -y git build-essential', { stdio: 'inherit' });

        // Install Claude Code
        console.log('🤖 Installing Claude Code...');
        execSync('npm install -g @anthropic-ai/claude-code', { stdio: 'inherit' });

        // Create cadence directory
        console.log('📁 Creating Cadence environment...');
        execSync('mkdir -p /opt/cadence/repos');

        // Generate API key
        const apiKey = 'cad_' + crypto.randomBytes(24).toString('hex');

        // Write environment file
        const envContent = `ANTHROPIC_API_KEY=${anthropicKey}
OPENAI_API_KEY=${openaiKey || ''}
CADENCE_API_KEY=${apiKey}
CADENCE_PORT=3000
REPOS_DIR=/opt/cadence/repos`;

        require('fs').writeFileSync('/opt/cadence/.env', envContent);

        // Write the bridge server
        console.log('🌉 Installing Cadence bridge...');
        const bridgeCode = `
const http = require('http');
const { spawn } = require('child_process');
require('dotenv').config();

const PORT = process.env.CADENCE_PORT || 3000;
const API_KEY = process.env.CADENCE_API_KEY;
const REPOS_DIR = process.env.REPOS_DIR || '/opt/cadence/repos';

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Auth check (skip for health)
  if (req.url !== '/health') {
    const auth = req.headers.authorization;
    if (!auth || auth !== 'Bearer ' + API_KEY) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  if (req.method === 'POST' && req.url === '/task') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { task, repoUrl, repoPath } = JSON.parse(body);
        if (!task) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'task is required' }));
          return;
        }

        let workDir = repoPath || REPOS_DIR;

        // Clone repo if URL provided
        if (repoUrl) {
          const repoName = repoUrl.split('/').pop().replace('.git', '');
          workDir = REPOS_DIR + '/' + repoName;
          try {
            require('child_process').execSync('git clone ' + repoUrl + ' ' + workDir + ' 2>/dev/null || (cd ' + workDir + ' && git pull)');
          } catch (e) {}
        }

        // Run claude
        const claude = spawn('claude', ['-p', task, '--yes'], {
          cwd: workDir,
          shell: true,
          env: { ...process.env }
        });

        let output = '';
        claude.stdout.on('data', d => output += d);
        claude.stderr.on('data', d => output += d);

        claude.on('close', code => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: code === 0, output }));
        });
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Cadence bridge listening on port ' + PORT);
});
`;

        require('fs').writeFileSync('/opt/cadence/server.js', bridgeCode);

        // Write package.json
        const pkg = { name: 'cadence-bridge', type: 'commonjs', dependencies: { dotenv: '^16.3.1' } };
        require('fs').writeFileSync('/opt/cadence/package.json', JSON.stringify(pkg, null, 2));

        // Install bridge dependencies
        execSync('cd /opt/cadence && npm install', { stdio: 'inherit' });

        // Create systemd service
        console.log('⚙️ Creating systemd service...');
        const serviceContent = `[Unit]
Description=Cadence Bridge Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/cadence
ExecStart=/usr/bin/node /opt/cadence/server.js
Restart=on-failure
RestartSec=10
EnvironmentFile=/opt/cadence/.env

[Install]
WantedBy=multi-user.target`;

        require('fs').writeFileSync('/etc/systemd/system/cadence.service', serviceContent);
        execSync('systemctl daemon-reload');
        execSync('systemctl enable cadence');
        execSync('systemctl start cadence');

        // Configure firewall
        console.log('🔥 Configuring firewall...');
        try { execSync('ufw allow 3000/tcp'); } catch (e) {}

        console.log('✅ Setup complete!');
        setupComplete = true;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          endpoint: 'http://' + req.headers.host.split(':')[0] + ':3000',
          apiKey
        }));

        // Shutdown bootstrap server after a delay
        setTimeout(() => {
          console.log('👋 Bootstrap complete, shutting down...');
          process.exit(0);
        }, 2000);

      } catch (e) {
        console.error('Setup failed:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('✅ Bootstrap server ready on port ' + PORT);
  console.log('');
  console.log('Now open the Cadence app and enter this VPS IP address.');
  console.log('The app will connect and complete the setup automatically.');
  console.log('');
  console.log('Waiting for connection...');
});
EOFSERVER

# Start the bootstrap server
echo ""
echo "🚀 Starting bootstrap server..."
echo ""
node server.js
