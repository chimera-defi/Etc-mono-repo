#!/bin/bash

# Legacy Utils Library - DEPRECATED
# All functions have been moved to lib/common_functions.sh
# This file exists only for backward compatibility with external scripts.
# New scripts should source lib/common_functions.sh directly.

# Only define functions if not already defined (avoid conflicts)
if ! declare -f log_info >/dev/null 2>&1; then
    log_info()  { printf "[INFO] %s\n" "$*"; }
    log_warn()  { printf "[WARN] %s\n" "$*"; }
    log_error() { printf "[ERROR] %s\n" "$*" 1>&2; }
fi

if ! declare -f require_root >/dev/null 2>&1; then
    require_root() {
        if [ "${EUID:-$(id -u)}" -ne 0 ]; then
            log_error "This script must be run as root."
            exit 1
        fi
    }
fi

if ! declare -f append_once >/dev/null 2>&1; then
    append_once() {
        local file="$1"; shift
        local text="$*"
        if [ ! -f "$file" ] || ! grep -Fqx -- "$text" "$file"; then
            echo "$text" | sudo tee -a "$file" >/dev/null
        fi
    }
fi
