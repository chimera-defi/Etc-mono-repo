#!/bin/bash
# Centralized Shellcheck Configuration
# Source this file or use the variable directly

# Shellcheck exclusions with rationale:
# SC2317 - Unreachable code (false positive in test scripts with dynamic calls)
# SC1091 - Not following source files (relative paths handled at runtime)
# SC1090 - Can't follow non-constant source (variable paths like $HOME/.cargo/env)
# SC2034 - Unused variables (common in template/example scripts)
# SC2031 - Variable modified in subshell (false positive when testing source in subshell)

SHELLCHECK_EXCLUDES="SC2317,SC1091,SC1090,SC2034,SC2031"

# Function to run shellcheck with standard exclusions
run_shellcheck() {
    local script="$1"
    shellcheck -x --exclude="$SHELLCHECK_EXCLUDES" "$script"
}

# Function to check if shellcheck passes
check_shellcheck() {
    local script="$1"
    shellcheck -x --exclude="$SHELLCHECK_EXCLUDES" "$script" >/dev/null 2>&1
}
