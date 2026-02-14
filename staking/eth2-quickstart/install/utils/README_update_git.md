# Git Update Script for eth2-quickstart

The `update_git.sh` script allows you to easily update your eth2-quickstart installation by pulling the latest changes from the git repository.

## Features

- **Safe Updates**: Creates automatic backups before updating
- **Conflict Resolution**: Handles local changes gracefully
- **Rollback Support**: Can restore previous versions if needed
- **Force Update**: Option to override local changes
- **Verification**: Checks that critical files exist after update

## Usage

### Basic Update (Recommended)
```bash
./install/utils/update_git.sh --backup
```
This creates a backup before updating and is the safest option.

### Force Update
```bash
./install/utils/update_git.sh --backup --force
```
Use this if you have local changes that you want to override.

### Rollback
```bash
./install/utils/update_git.sh --rollback
```
Restores the most recent backup if something goes wrong.

### Help
```bash
./install/utils/update_git.sh --help
```
Shows all available options.

## Options

- `--backup`: Create backup before updating (highly recommended)
- `--force`: Force update even if there are local changes
- `--rollback`: Rollback to previous version if available
- `-h, --help`: Show help message

## How It Works

1. **Backup Creation**: If `--backup` is specified, creates a timestamped backup in `~/eth2-quickstart-backups/`
2. **Change Detection**: Checks for local modifications to tracked files
3. **Update Process**: Fetches and pulls latest changes from the master branch
4. **Permission Fix**: Ensures all shell scripts are executable
5. **Verification**: Checks that critical files exist and are accessible
6. **Summary**: Shows what was updated and next steps

## Important Notes

- **Configuration Files**: If `exports.sh` is updated, you'll need to review and potentially restore your customizations
- **Services**: You may need to restart services after an update
- **Backups**: Backups are stored in `~/eth2-quickstart-backups/` with timestamps
- **Permissions**: The script automatically fixes file permissions for shell scripts

## Troubleshooting

### Local Changes Detected
If you have uncommitted changes, the script will refuse to update unless you use `--force`. You can:
- Commit your changes first
- Stash your changes: `git stash`
- Use `--force` to override (not recommended)

### Update Failed
If an update fails and you created a backup:
```bash
./install/utils/update_git.sh --rollback
```

### Configuration Lost
If your `exports.sh` was overwritten, check your backup:
```bash
ls ~/eth2-quickstart-backups/
# Find your backup and copy exports.sh back
cp ~/eth2-quickstart-backups/eth2-quickstart-YYYYMMDD-HHMMSS/exports.sh ./exports.sh
```

## Examples

### Regular Update
```bash
cd /path/to/eth2-quickstart
./install/utils/update_git.sh --backup
```

### Update with Local Changes
```bash
cd /path/to/eth2-quickstart
git add .
git commit -m "My local changes"
./install/utils/update_git.sh --backup
```

### Emergency Rollback
```bash
cd /path/to/eth2-quickstart
./install/utils/update_git.sh --rollback
```

## Safety Features

- **Automatic Backups**: Never lose your configuration
- **Change Detection**: Prevents accidental overwrites
- **Verification**: Ensures update was successful
- **Rollback**: Quick recovery if something goes wrong
- **Permission Management**: Maintains proper script permissions

This script makes it safe and easy to keep your eth2-quickstart installation up to date with the latest improvements and fixes.