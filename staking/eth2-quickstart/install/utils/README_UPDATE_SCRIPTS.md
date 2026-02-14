# Update Scripts for eth2-quickstart

This directory contains several update scripts to help you keep your eth2-quickstart installation up to date.

## Available Scripts

### 1. `update_all.sh` - Comprehensive Update Script (Recommended)

The main update script that can handle both git file updates and software stack updates.

**Usage:**
```bash
./install/utils/update_all.sh [options]
```

**Options:**
- `--git-only` - Update only the eth2-quickstart files from git
- `--software-only` - Update only the Ethereum software stack
- `--backup` - Create backup before updating (recommended for git updates)
- `--force` - Force update even if there are local changes (git only)
- `--rollback` - Rollback to previous version if available (git only)
- `--help` - Show help message

**Examples:**
```bash
# Update both git files and software with backup (recommended)
./install/utils/update_all.sh --backup

# Update only git files with backup
./install/utils/update_all.sh --git-only --backup

# Update only software stack
./install/utils/update_all.sh --software-only

# Rollback git changes
./install/utils/update_all.sh --rollback
```

### 2. `update_git.sh` - Git Files Update Script

Updates the eth2-quickstart files by pulling the latest version from the git repository.

**Usage:**
```bash
./install/utils/update_git.sh [options]
```

**Features:**
- Safe updates with automatic backups
- Conflict resolution for local changes
- Rollback support
- Force update option
- Verification of critical files

**Options:**
- `--backup` - Create backup before updating (highly recommended)
- `--force` - Force update even if there are local changes
- `--rollback` - Rollback to previous version if available
- `--help` - Show help message

### 3. `update.sh` - Software Stack Update Script

Updates the Ethereum software stack (Geth, Prysm, MEV-Boost, etc.) and shows version changes.

**Usage:**
```bash
./install/utils/update.sh
```

**What it updates:**
- System packages (apt update/upgrade)
- Geth (Ethereum execution client)
- Prysm (consensus client and validator)
- MEV-Boost
- Nginx (web server)

## Which Script Should I Use?

### For Regular Updates (Recommended)
Use `update_all.sh --backup` to update both the git files and software stack with a backup.

### For Git Files Only
Use `update_git.sh --backup` if you only want to update the eth2-quickstart files from git.

### For Software Only
Use `update.sh` if you only want to update the Ethereum software stack.

## Safety Features

### Automatic Backups
- Git updates create timestamped backups in `~/eth2-quickstart-backups/`
- Backups include your current configuration and state
- Easy rollback if something goes wrong

### Change Detection
- Scripts detect local modifications to tracked files
- Prevents accidental overwrites of your customizations
- Use `--force` to override if needed

### Verification
- All scripts verify that critical files exist after updates
- Check that scripts are executable
- Validate system state

## Important Notes

### Configuration Files
- If `exports.sh` is updated, you'll need to review and potentially restore your customizations
- Check your backup directory for previous versions if needed

### Services
- You may need to restart services after an update
- Use `./install/utils/stats.sh` to check service status

### Permissions
- All scripts automatically fix file permissions for shell scripts
- Ensures scripts remain executable after updates

## Troubleshooting

### Local Changes Detected
If you have uncommitted changes, the git update script will refuse to update unless you use `--force`. You can:
- Commit your changes first: `git add . && git commit -m "My changes"`
- Stash your changes: `git stash`
- Use `--force` to override (not recommended)

### Update Failed
If an update fails and you created a backup:
```bash
./install/utils/update_all.sh --rollback
```

### Configuration Lost
If your `exports.sh` was overwritten, check your backup:
```bash
ls ~/eth2-quickstart-backups/
# Find your backup and copy exports.sh back
cp ~/eth2-quickstart-backups/eth2-quickstart-YYYYMMDD-HHMMSS/exports.sh ./exports.sh
```

### Service Issues
After updates, check service status:
```bash
./install/utils/stats.sh
sudo systemctl status eth1 cl validator mev nginx
```

## Best Practices

1. **Always use `--backup`** for git updates to avoid losing your configuration
2. **Review changes** to configuration files after updates
3. **Test services** after updates to ensure everything is working
4. **Keep backups** of important configurations
5. **Update regularly** to get the latest improvements and security fixes

## Examples

### First Time Setup
```bash
# Clone the repository
git clone https://github.com/chimera-defi/eth2-quickstart.git
cd eth2-quickstart

# Run initial setup
sudo ./run_1.sh
# ... follow setup instructions ...

# Update to latest version
./install/utils/update_all.sh --backup
```

### Regular Maintenance
```bash
# Check for updates and update everything with backup
./install/utils/update_all.sh --backup

# Or update only git files if you don't need software updates
./install/utils/update_git.sh --backup
```

### Emergency Rollback
```bash
# If something goes wrong, rollback to previous version
./install/utils/update_all.sh --rollback
```

This comprehensive update system ensures you can safely keep your eth2-quickstart installation up to date while protecting your configuration and providing easy recovery options.
