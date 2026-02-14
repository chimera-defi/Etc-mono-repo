# Test Environment Dockerfile
# 
# Uses the centralized install_dependencies.sh script with --test mode
# This ensures test and production dependencies stay in sync

FROM ubuntu:22.04

# Prevent interactive prompts during package installation (batteries-included)
ENV DEBIAN_FRONTEND=noninteractive
ENV DEBIAN_PRIORITY=critical

# Set up working directory and copy project first (needed for debconf_preseed.sh)
WORKDIR /workspace
COPY . /workspace/

# Pre-seed debconf (single source: install/utils/debconf_preseed.sh)
RUN bash /workspace/install/utils/debconf_preseed.sh

# Make scripts executable
RUN find /workspace -name "*.sh" -exec chmod +x {} \;

# Install test dependencies using the centralized script
# This runs as root in Docker, which the script now handles
RUN apt-get update && \
    bash /workspace/install/utils/install_dependencies.sh --test && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Enable SSH for run_1 E2E (configure_ssh needs sshd running under systemd)
RUN systemctl enable ssh 2>/dev/null || systemctl enable sshd 2>/dev/null || true

# Create a non-root user for testing (mimics real deployment)
# Preserve DEBIAN_* through sudo so apt/dpkg stay noninteractive (prevents tzdata Readline hang)
RUN useradd -m -s /bin/bash testuser \
    && echo "testuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
    && echo 'Defaults env_keep += "DEBIAN_FRONTEND DEBIAN_PRIORITY"' > /etc/sudoers.d/99-noninteractive \
    && chmod 440 /etc/sudoers.d/99-noninteractive

# Set ownership
RUN chown -R testuser:testuser /workspace

# Default to running as testuser (non-root, like real usage)
USER testuser

# Default command runs the test suite
CMD ["/workspace/test/docker_test.sh"]
