# Shell Scripting Best Practices & Linting Guide

## Critical Requirements

### 1. **Shebang Line (MANDATORY)**
```bash
#!/bin/bash
```

### 2. **Strict Mode (HIGHLY RECOMMENDED)**
```bash
#!/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'
```

### 3. **Root/Non-Root Detection (WHEN NEEDED)**
```bash
# For scripts requiring root
require_root() {
    if [ "${EUID:-$(id -u)}" -ne 0 ]; then
        echo "[ERROR] This script must be run as root." >&2
        exit 1
    fi
}
```

## Syntax and Structure

### Function Definitions
```bash
function_name() {
    local param1="$1"
    local param2="$2"
    # Function body
}
```

### Conditional Statements
```bash
# Use [[ ]] for bash, [ ] for POSIX
if [[ -f "$file" ]]; then
    echo "File exists"
elif [[ -d "$file" ]]; then
    echo "Directory exists"
else
    echo "Does not exist"
fi
```

### Loops
```bash
for file in "$directory"/*.txt; do
    [[ -f "$file" ]] || continue
    echo "Processing: $file"
done
```

## Error Handling

### CD Commands
```bash
# ALWAYS check cd success
if ! cd "$target_dir"; then
    log_error "Failed to change to directory: $target_dir"
    exit 1
fi
```

### Command Error Checking
```bash
# Check command success
if ! command_name; then
    log_error "Command failed"
    exit 1
fi
```

### Trap for Cleanup
```bash
cleanup() {
    # Cleanup code
    rm -f "$temp_file"
}

trap cleanup EXIT
```

## Variable Handling

### Quoting
```bash
# ALWAYS quote variables
echo "Value: $variable"
cp "$source" "$destination"

# Use quotes in conditionals
if [[ "$var" == "value" ]]; then
    # action
fi
```

### Variable Assignment
```bash
# Use local in functions
local var_name="$1"

# Use parameter expansion for defaults
local port="${PORT:-8080}"
```

### Command Substitution
```bash
# Use $() instead of backticks
result=$(command_name)
```

## Command Execution

### Pipeline Error Handling
```bash
# Use set -o pipefail for pipeline errors
set -o pipefail
command1 | command2 | command3
```

### Safe Command Execution
```bash
# Validate before execution
if command -v program >/dev/null 2>&1; then
    program --option
else
    log_error "Program not found"
    exit 1
fi
```

## File Operations

### File Testing
```bash
# Test file existence and type
if [[ -f "$file" ]]; then
    echo "File exists"
elif [[ -d "$dir" ]]; then
    echo "Directory exists"
fi
```

### Temporary Files
```bash
# Use mktemp for temporary files
temp_file=$(mktemp)
trap 'rm -f "$temp_file"' EXIT
```

## User Input

### Read Input
```bash
# Use read -r for raw input
read -r -p "Enter value: " user_input

# Validate input
if [[ -z "$user_input" ]]; then
    log_error "Input cannot be empty"
    exit 1
fi
```

## Sourcing and Dependencies

### Source Files
```bash
# Source common functions
source ./lib/common_functions.sh

# Check if file exists before sourcing
if [[ -f "./lib/common_functions.sh" ]]; then
    source ./lib/common_functions.sh
else
    log_error "Common functions not found"
    exit 1
fi
```

## Linting Workflow

### ShellCheck
```bash
# Install shellcheck
sudo apt install shellcheck

# Run shellcheck
shellcheck script.sh

# Fix common issues
# SC2086: Quote variables
# SC2001: Use parameter expansion instead of sed
# SC2034: Unused variables
```

## Common Pitfalls and Fixes

### 1. Unquoted Variables
```bash
# BAD
if [ $var = "value" ]; then

# GOOD
if [[ "$var" == "value" ]]; then
```

### 2. Missing Error Handling
```bash
# BAD
cd "$directory"
command

# GOOD
if ! cd "$directory"; then
    log_error "Failed to change directory"
    exit 1
fi
command
```

### 3. Legacy Backticks
```bash
# BAD
result=`command`

# GOOD
result=$(command)
```

## Production Readiness Checklist

- [ ] Shebang line present
- [ ] Strict mode enabled (`set -Eeuo pipefail`)
- [ ] All variables quoted
- [ ] Error handling for critical commands
- [ ] Input validation implemented
- [ ] Temporary files cleaned up
- [ ] ShellCheck passes without errors
- [ ] Functions use `local` variables
- [ ] Commands checked for existence
- [ ] Proper logging implemented

## Quick Reference

### Essential Patterns
```bash
#!/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

# Source common functions
source ./lib/common_functions.sh

# Function definition
function_name() {
    local param="$1"
    # Function body
}

# Error handling
if ! command; then
    log_error "Command failed"
    exit 1
fi

# File operations
if [[ -f "$file" ]]; then
    # Process file
fi

# Cleanup
cleanup() {
    rm -f "$temp_file"
}
trap cleanup EXIT
```

This guide covers the essential patterns for writing secure, maintainable shell scripts. For detailed examples, refer to the existing scripts in the repository.