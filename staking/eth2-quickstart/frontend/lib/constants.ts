/**
 * Application constants
 */

export const SITE_CONFIG = {
  name: 'Ethereum Node Quick Setup',
  shortName: 'ETH2 Quick Start',
  description: 'Transform a fresh cloud server into a fully-configured Ethereum node.',
  github: 'https://github.com/chimera-defi/eth2-quickstart',
}

export const NAV_LINKS = [
  { label: 'Install', href: '#install' },
  { label: 'Learn', href: '/learn' },
  { label: 'GitHub', href: SITE_CONFIG.github, external: true },
]

export const STATS = [
  { value: '12', label: 'Clients' },
  { value: '36', label: 'Combinations' },
  { value: '~30m', label: 'Setup Time' },
  { value: '2-step', label: 'Hardened Flow' },
]

export const INSTALL_COMMAND =
  'curl -fsSL https://raw.githubusercontent.com/chimera-defi/eth2-quickstart/master/install.sh | sudo bash'

export const INSTALL_HIGHLIGHTS = [
  {
    title: 'Bootstraps safely',
    description: 'Runs a two-phase flow: hardened base setup, reboot, then client install.',
    icon: 'Shield',
  },
  {
    title: 'Configurable wizard',
    description: 'Launches a guided TUI to select clients, MEV options, and network presets.',
    icon: 'Terminal',
  },
  {
    title: 'Everything included',
    description: 'Sets up monitoring, firewalls, and service management automatically.',
    icon: 'Grid3x3',
  },
]

export const WORKFLOW_STEPS = [
  {
    title: 'Bootstrap the host',
    description: 'Run the one-line installer to clone the repo, verify requirements, and launch the wizard.',
    detail: 'Includes firewall rules, SSH hardening, and a non-root operator user.',
  },
  {
    title: 'Reboot & validate',
    description: 'Reboot to confirm secure access with the new user and updated SSH settings.',
    detail: 'The script pauses and reminds you to verify access before proceeding.',
  },
  {
    title: 'Install clients',
    description: 'Select execution and consensus clients, MEV relay presets, and monitoring.',
    detail: 'The installer configures services, systemd units, and auto-start.',
  },
  {
    title: 'Go live',
    description: 'Start services and monitor sync progress from a dedicated dashboard.',
    detail: 'Health checks and logs are included for ongoing ops.',
  },
]

export const EXECUTION_CLIENTS = [
  { name: 'Geth', language: 'Go', bestFor: 'Beginners, stability' },
  { name: 'Erigon', language: 'Go', bestFor: 'Performance, fast sync' },
  { name: 'Reth', language: 'Rust', bestFor: 'Performance, modularity' },
  { name: 'Nethermind', language: 'C#', bestFor: 'Enterprise, advanced features' },
  { name: 'Besu', language: 'Java', bestFor: 'Private networks, compliance' },
  { name: 'Nimbus-eth1', language: 'Nim', bestFor: 'Low resources' },
]

export const CONSENSUS_CLIENTS = [
  { name: 'Prysm', language: 'Go', bestFor: 'Beginners, documentation' },
  { name: 'Lighthouse', language: 'Rust', bestFor: 'Performance, security' },
  { name: 'Teku', language: 'Java', bestFor: 'Institutional, monitoring' },
  { name: 'Nimbus', language: 'Nim', bestFor: 'Low resources' },
  { name: 'Lodestar', language: 'TypeScript', bestFor: 'Development' },
  { name: 'Grandine', language: 'Rust', bestFor: 'Advanced users' },
]

export const FEATURES = [
  {
    id: 'client-diversity',
    title: 'Choose Your Client Stack',
    description: 'Support for all major Ethereum clients. Mix and match for optimal performance and network diversity.',
    icon: 'Grid3x3',
  },
  {
    id: 'one-liner',
    title: 'One Command Setup',
    description: 'No manual configuration. One command handles security, client installation, and MEV setup.',
    icon: 'Terminal',
  },
  {
    id: 'security',
    title: 'Security Out of the Box',
    description: 'Firewall, fail2ban, SSH hardening, and secure permissions—all configured automatically.',
    icon: 'Shield',
  },
  {
    id: 'mev',
    title: 'Maximize Rewards',
    description: 'Built-in MEV-Boost support. Connect to multiple relays and optimize validator rewards.',
    icon: 'TrendingUp',
  },
  {
    id: 'rpc',
    title: 'Your Own RPC',
    description: 'Run your own censorship-resistant RPC endpoint. Faster and uncensored.',
    icon: 'Globe',
  },
]

export const DOCUMENTATION_LINKS = [
  { title: 'README', description: 'Project overview and quickstart', path: 'README.md' },
  { title: 'Scripts', description: 'Script reference and usage', path: 'docs/SCRIPTS.md' },
  { title: 'Configuration', description: 'Configuration guide', path: 'docs/CONFIGURATION_GUIDE.md' },
  { title: 'Security', description: 'Security documentation', path: 'docs/SECURITY_GUIDE.md' },
]

export const INSTALLATION_STEPS = [
  {
    step: 1,
    title: 'Clone Repository',
    description: 'Download the scripts and make them executable.',
    code: `git clone https://github.com/chimera-defi/eth2-quickstart
cd eth2-quickstart && chmod +x run_1.sh`,
  },
  {
    step: 2,
    title: 'Run Setup',
    description: 'Configure firewalls, security hardening, and create a non-root user.',
    code: 'sudo ./run_1.sh',
  },
  {
    step: 3,
    title: 'Reboot',
    description: 'Reboot and login as the new user.',
    code: 'sudo reboot',
  },
  {
    step: 4,
    title: 'Install Clients',
    description: 'Configure your settings and run the installation.',
    code: `nano exports.sh  # Edit settings
./run_2.sh       # Install clients`,
  },
  {
    step: 5,
    title: 'Start Services',
    description: 'Start and verify all services.',
    code: 'sudo systemctl start eth1 cl validator',
  },
]

export const PREREQUISITES = [
  { label: 'Server', value: 'Ubuntu 20.04+ with SSH access' },
  { label: 'Storage', value: '2-4TB SSD/NVMe' },
  { label: 'Memory', value: '16-64GB RAM' },
  { label: 'Network', value: 'Stable broadband connection' },
]
