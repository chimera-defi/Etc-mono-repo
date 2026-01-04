#!/usr/bin/env node
/**
 * Cadence Setup CLI
 *
 * One-command setup for Cadence voice coding assistant.
 * Takes SSH credentials and automatically provisions a VPS
 * with Claude Code and the Cadence bridge server.
 */

import { NodeSSH } from 'node-ssh';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { nanoid } from 'nanoid';

interface SetupConfig {
  host: string;
  username: string;
  privateKeyPath: string;
  anthropicKey: string;
  openaiKey?: string;
}

const BANNER = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold('🎙️  Cadence')} - Voice-Enabled AI Coding Assistant         ${chalk.cyan('║')}
${chalk.cyan('║')}                                                           ${chalk.cyan('║')}
${chalk.cyan('║')}  Transform your VPS into an AI coding powerhouse          ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════╝')}
`;

async function main() {
  console.log(BANNER);

  // Gather configuration
  const config = await gatherConfig();

  // Connect and setup
  const ssh = new NodeSSH();
  const spinner = ora();

  try {
    // Connect to VPS
    spinner.start('Connecting to VPS...');
    await ssh.connect({
      host: config.host,
      username: config.username,
      privateKeyPath: config.privateKeyPath,
    });
    spinner.succeed('Connected to VPS');

    // Check OS
    spinner.start('Checking system...');
    const osInfo = await ssh.execCommand('cat /etc/os-release');
    if (!osInfo.stdout.includes('Ubuntu')) {
      spinner.warn('Non-Ubuntu system detected. Proceeding anyway...');
    } else {
      spinner.succeed('Ubuntu detected');
    }

    // Install dependencies
    spinner.start('Installing system dependencies...');
    await ssh.execCommand('apt-get update && apt-get install -y curl git build-essential', {
      execOptions: { pty: true }
    });
    spinner.succeed('Dependencies installed');

    // Install Node.js (via nvm)
    spinner.start('Installing Node.js...');
    const nodeCheck = await ssh.execCommand('node --version');
    if (nodeCheck.code !== 0) {
      await ssh.execCommand('curl -fsSL https://deb.nodesource.com/setup_20.x | bash -');
      await ssh.execCommand('apt-get install -y nodejs');
    }
    spinner.succeed('Node.js ready');

    // Install Claude Code
    spinner.start('Installing Claude Code...');
    const claudeCheck = await ssh.execCommand('which claude');
    if (claudeCheck.code !== 0) {
      await ssh.execCommand('npm install -g @anthropic-ai/claude-code');
    }
    spinner.succeed('Claude Code installed');

    // Create cadence user and directory
    spinner.start('Creating Cadence environment...');
    await ssh.execCommand('mkdir -p /opt/cadence');
    await ssh.execCommand('mkdir -p /opt/cadence/repos');
    spinner.succeed('Environment ready');

    // Generate API key for the bridge
    const apiKey = `cad_${nanoid(32)}`;

    // Write environment file
    spinner.start('Configuring environment...');
    const envContent = `
ANTHROPIC_API_KEY=${config.anthropicKey}
OPENAI_API_KEY=${config.openaiKey || ''}
CADENCE_API_KEY=${apiKey}
CADENCE_PORT=3000
REPOS_DIR=/opt/cadence/repos
`.trim();
    await ssh.execCommand(`cat > /opt/cadence/.env << 'EOF'
${envContent}
EOF`);
    spinner.succeed('Environment configured');

    // Upload and install cadence-bridge
    spinner.start('Installing Cadence bridge server...');

    // Write the bridge server directly
    const bridgeCode = getBridgeServerCode();
    await ssh.execCommand(`cat > /opt/cadence/server.js << 'EOFSERVER'
${bridgeCode}
EOFSERVER`);

    // Write package.json for bridge
    const bridgePackage = JSON.stringify({
      name: "cadence-bridge",
      type: "module",
      dependencies: {
        "fastify": "^4.25.0",
        "dotenv": "^16.3.1"
      }
    }, null, 2);
    await ssh.execCommand(`cat > /opt/cadence/package.json << 'EOF'
${bridgePackage}
EOF`);

    // Install bridge dependencies
    await ssh.execCommand('cd /opt/cadence && npm install');
    spinner.succeed('Cadence bridge installed');

    // Create systemd service
    spinner.start('Setting up auto-start service...');
    const serviceContent = `
[Unit]
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
WantedBy=multi-user.target
`.trim();
    await ssh.execCommand(`cat > /etc/systemd/system/cadence.service << 'EOF'
${serviceContent}
EOF`);
    await ssh.execCommand('systemctl daemon-reload');
    await ssh.execCommand('systemctl enable cadence');
    await ssh.execCommand('systemctl start cadence');
    spinner.succeed('Service configured and started');

    // Configure firewall
    spinner.start('Configuring firewall...');
    await ssh.execCommand('ufw allow 3000/tcp || true');
    spinner.succeed('Firewall configured');

    // Verify service is running
    spinner.start('Verifying installation...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for service to start
    const healthCheck = await ssh.execCommand('curl -s http://localhost:3000/health');
    if (healthCheck.stdout.includes('ok')) {
      spinner.succeed('Cadence is running!');
    } else {
      spinner.warn('Service may need a moment to start. Check with: systemctl status cadence');
    }

    ssh.dispose();

    // Print success message
    console.log('\n' + chalk.green('═'.repeat(60)));
    console.log(chalk.green.bold('\n  ✅ Setup Complete!\n'));
    console.log(chalk.white('  Your Cadence endpoint:'));
    console.log(chalk.cyan(`    http://${config.host}:3000\n`));
    console.log(chalk.white('  API Key (save this!):'));
    console.log(chalk.yellow(`    ${apiKey}\n`));
    console.log(chalk.white('  Test your setup:'));
    console.log(chalk.gray(`    curl -X POST http://${config.host}:3000/health`));
    console.log(chalk.gray(`    curl -X POST http://${config.host}:3000/task \\`));
    console.log(chalk.gray(`      -H "Authorization: Bearer ${apiKey}" \\`));
    console.log(chalk.gray(`      -H "Content-Type: application/json" \\`));
    console.log(chalk.gray(`      -d '{"task": "What files are in the current directory?"}'`));
    console.log(chalk.green('\n' + '═'.repeat(60)));

  } catch (error) {
    spinner.fail('Setup failed');
    console.error(chalk.red('\nError:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function gatherConfig(): Promise<SetupConfig> {
  const defaultKeyPath = join(homedir(), '.ssh', 'id_ed25519');
  const fallbackKeyPath = join(homedir(), '.ssh', 'id_rsa');

  const defaultKey = existsSync(defaultKeyPath)
    ? defaultKeyPath
    : existsSync(fallbackKeyPath)
      ? fallbackKeyPath
      : '';

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'host',
      message: 'VPS IP address:',
      validate: (input) => {
        if (!input) return 'IP address is required';
        // Basic IP validation
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(input) && !input.includes('.')) {
          return 'Please enter a valid IP address or hostname';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'username',
      message: 'SSH username:',
      default: 'root'
    },
    {
      type: 'input',
      name: 'privateKeyPath',
      message: 'SSH private key path:',
      default: defaultKey,
      validate: (input) => {
        if (!input) return 'SSH key path is required';
        if (!existsSync(input)) return `File not found: ${input}`;
        return true;
      }
    },
    {
      type: 'password',
      name: 'anthropicKey',
      message: 'Anthropic API key:',
      mask: '*',
      validate: (input) => {
        if (!input) return 'Anthropic API key is required';
        if (!input.startsWith('sk-ant-')) return 'Invalid Anthropic API key format';
        return true;
      }
    },
    {
      type: 'password',
      name: 'openaiKey',
      message: 'OpenAI API key (optional, for voice):',
      mask: '*'
    }
  ]);

  return answers;
}

function getBridgeServerCode(): string {
  return `
import Fastify from 'fastify';
import { spawn } from 'child_process';
import { config } from 'dotenv';

config();

const app = Fastify({ logger: true });

const API_KEY = process.env.CADENCE_API_KEY;
const PORT = parseInt(process.env.CADENCE_PORT || '3000');
const REPOS_DIR = process.env.REPOS_DIR || '/opt/cadence/repos';

// Auth middleware
app.addHook('preHandler', async (request, reply) => {
  // Skip auth for health check
  if (request.url === '/health') return;

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  if (token !== API_KEY) {
    reply.code(403).send({ error: 'Invalid API key' });
    return;
  }
});

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Run a task with Claude
app.post('/task', async (request, reply) => {
  const { task, repoPath, repoUrl } = request.body as {
    task: string;
    repoPath?: string;
    repoUrl?: string;
  };

  if (!task) {
    return reply.code(400).send({ error: 'task is required' });
  }

  let workDir = repoPath || REPOS_DIR;

  // Clone repo if URL provided and not already cloned
  if (repoUrl) {
    const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repo';
    workDir = \`\${REPOS_DIR}/\${repoName}\`;

    try {
      await execCommand(\`git clone \${repoUrl} \${workDir} 2>/dev/null || (cd \${workDir} && git pull)\`);
    } catch (e) {
      // Repo might already exist, continue
    }
  }

  try {
    const output = await runClaude(task, workDir);
    return { success: true, output };
  } catch (error) {
    return reply.code(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// List repos
app.get('/repos', async () => {
  const output = await execCommand(\`ls -la \${REPOS_DIR}\`);
  return { repos: output.split('\\n').filter(Boolean) };
});

// Clone a repo
app.post('/repos/clone', async (request, reply) => {
  const { url } = request.body as { url: string };
  if (!url) {
    return reply.code(400).send({ error: 'url is required' });
  }

  const repoName = url.split('/').pop()?.replace('.git', '') || 'repo';
  const repoPath = \`\${REPOS_DIR}/\${repoName}\`;

  try {
    await execCommand(\`git clone \${url} \${repoPath}\`);
    return { success: true, path: repoPath };
  } catch (error) {
    return reply.code(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Clone failed'
    });
  }
});

function runClaude(task: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const claude = spawn('claude', ['-p', task, '--yes'], {
      cwd,
      shell: true,
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    claude.stdout.on('data', (data) => {
      output += data.toString();
    });

    claude.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    claude.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(errorOutput || \`Claude exited with code \${code}\`));
      }
    });

    claude.on('error', reject);
  });
}

function execCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('sh', ['-c', cmd]);
    let output = '';
    proc.stdout.on('data', (data) => output += data);
    proc.stderr.on('data', (data) => output += data);
    proc.on('close', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(output));
    });
  });
}

// Start server
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(\`Cadence bridge listening on \${address}\`);
});
`.trim();
}

main();
