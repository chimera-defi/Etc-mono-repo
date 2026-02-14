# Configuration Architecture Guide

## Overview
This repository implements a standardized configuration architecture across all Ethereum clients to ensure consistency, maintainability, and ease of customization.

## Configuration Conventions

### 1. Centralized Configuration Variables
All client-specific settings are defined in `exports.sh` to provide a single source of truth for configuration management.

**Pattern:**
```bash
# Client-specific memory settings
export TEKU_CACHE=8192
export NIMBUS_CACHE=4096
export LODESTAR_CACHE=8192

# Client-specific ports  
export TEKU_REST_PORT=5051
export NIMBUS_REST_PORT=5052
export LODESTAR_REST_PORT=9596
```

### 2. Template + Custom Configuration Pattern
Each client follows the Prysm model of separating base configuration templates from user-specific customizations.

**Structure:**
```
client_name/
├── client_base_config.ext       # Static base configuration
└── (generated at runtime)
    ├── client_custom.ext        # Dynamic user variables  
    └── client_final.ext         # Merged final configuration
```

### 3. Directory Structure
All client configuration templates are organized under the `configs/` directory:

```
configs/
├── nethermind/
│   └── nethermind_base.cfg      # JSON base configuration
├── besu/
│   └── besu_base.toml          # TOML base configuration  
├── teku/
│   ├── teku_beacon_base.yaml   # YAML beacon base config
│   └── teku_validator_base.yaml # YAML validator base config
├── nimbus/
│   └── nimbus_base.toml        # TOML base configuration
├── lodestar/
│   ├── lodestar_beacon_base.json    # JSON beacon base config
│   └── lodestar_validator_base.json # JSON validator base config
├── grandine/
│   └── grandine_base.toml      # TOML base configuration
└── prysm/
    ├── prysm_beacon_conf.yaml      # YAML beacon base config
    ├── prysm_validator_conf.yaml   # YAML validator base config
    └── checkpoint_ssz/             # Checkpoint state files
```

## Configuration Flow

### 1. Variable Definition (exports.sh)
```bash
# Define client-specific variables
export TEKU_CACHE=8192
export TEKU_REST_PORT=5051
export TEKU_CHECKPOINT_URL="https://beaconstate.ethstaker.cc"
```

### 2. Template Creation (install scripts)
```bash
# Create temporary directory
mkdir ./tmp

# Generate custom configuration with variables
cat > ./tmp/teku_beacon_custom.yaml << EOF
data-path: "$TEKU_DATA_DIR"
rest-api-port: ${TEKU_REST_PORT}
checkpoint-sync-url: "$TEKU_CHECKPOINT_URL"
validators-graffiti: "$GRAFITTI"
EOF
```

### 3. Configuration Merge
```bash
# Merge base template with custom variables
cat ~/eth2-quickstart/configs/teku/teku_beacon_base.yaml ./tmp/teku_beacon_custom.yaml > "$TEKU_DIR/beacon.yaml"

# Clean up temporary files
rm -rf ./tmp/
```

## Client-Specific Implementation Details

### Execution Clients

#### Nethermind (JSON)
- **Base Config**: `configs/nethermind/nethermind_base.cfg`
- **Custom Variables**: Memory, ports, fee recipient, graffiti
- **Merge Strategy**: JSON concatenation (TODO: implement proper JSON merging with jq)

#### Besu (TOML)  
- **Base Config**: `configs/besu/besu_base.toml`
- **Custom Variables**: Memory, ports, data path, mining settings
- **Merge Strategy**: TOML concatenation

### Consensus Clients

#### Teku (YAML)
- **Base Configs**: 
  - `configs/teku/teku_beacon_base.yaml`
  - `configs/teku/teku_validator_base.yaml`
- **Custom Variables**: Data paths, ports, checkpoint URLs, validator settings
- **Merge Strategy**: YAML concatenation

#### Nimbus (TOML)
- **Base Config**: `configs/nimbus/nimbus_base.toml`
- **Custom Variables**: Data paths, ports, checkpoint URLs, validator settings
- **Merge Strategy**: TOML concatenation

#### Lodestar (JSON)
- **Base Configs**:
  - `configs/lodestar/lodestar_beacon_base.json`
  - `configs/lodestar/lodestar_validator_base.json`
- **Custom Variables**: Data paths, ports, checkpoint URLs, validator settings
- **Merge Strategy**: JSON merging with jq (if available), fallback to complete config generation

#### Grandine (TOML)
- **Base Config**: `configs/grandine/grandine_base.toml`
- **Custom Variables**: Data paths, ports, checkpoint URLs, validator settings
- **Merge Strategy**: TOML concatenation

#### Prysm (YAML)
- **Base Configs**: 
  - `configs/prysm/prysm_beacon_conf.yaml`
  - `configs/prysm/prysm_validator_conf.yaml`
  - `configs/prysm/prysm_beacon_sync_conf.yaml` (checkpoint sync)
- **Custom Variables**: Data paths, ports, checkpoint URLs, validator settings, MEV configuration
- **Merge Strategy**: YAML concatenation
- **Version**: v6.1.2 with performance optimizations and monitoring
- **Features**: 
  - Performance flags: `max-goroutines`, `block-batch-limit`, `slots-per-archive-point`
  - Monitoring: Prometheus metrics on port 8080 (beacon node)
  - MEV boost: Configured to use external MEV-Boost (local builder disabled)
  - Reliability: `dynamic-key-reload-debounce-interval`, `enable-doppelganger`

## Benefits of This Architecture

### 1. Consistency
- All clients follow the same configuration pattern
- Standardized variable naming conventions
- Uniform merge strategies across client types

### 2. Maintainability
- Base configurations are version-controlled and reviewable
- User customizations are clearly separated from defaults
- Easy to update base configurations without affecting user settings

### 3. Flexibility
- Users can easily modify settings in one place (`exports.sh`)
- Different clients can have different default values
- Port conflicts avoided through client-specific port assignments

### 4. Security
- No hardcoded sensitive values in base templates
- JWT secrets and keys referenced by file path, not embedded
- External IP addresses determined at runtime, not build time

## Best Practices

### 1. Variable Naming
- Use `CLIENT_SETTING` format (e.g., `TEKU_CACHE`, `NIMBUS_REST_PORT`)
- Group related settings together in `exports.sh`
- Use descriptive names that indicate purpose

### 2. Template Design
- Keep base templates minimal and focused on static settings
- Avoid embedding dynamic values in base templates
- Use comments to explain non-obvious configurations

### 3. Merge Strategy
- Prefer proper configuration merging tools (jq for JSON, yq for YAML)
- Provide fallback strategies for environments without merge tools
- Always clean up temporary files after merging

### 4. Error Handling
- Validate that required variables are set before using them
- Provide meaningful error messages for configuration issues
- Test configuration generation in different environments

## Future Enhancements

### 1. Configuration Validation
- Implement schema validation for each client's configuration
- Add pre-flight checks to ensure configurations are valid
- Provide configuration testing utilities

### 2. Advanced Merging
- Implement proper JSON/YAML/TOML merging using appropriate tools
- Support for complex configuration hierarchies
- Environment-specific configuration overrides

### 3. Configuration Management
- Add configuration backup and restore functionality
- Implement configuration versioning and rollback
- Support for configuration templates for different use cases

## Migration Guide

### For Existing Users
1. **Review `exports.sh`**: Check new client-specific variables
2. **Backup Configurations**: Save any manual configuration changes
3. **Re-run Install Scripts**: Use updated scripts to regenerate configurations
4. **Validate Settings**: Ensure all custom settings are preserved

### For New Installations
1. **Configure `exports.sh`**: Set all required variables before installation
2. **Choose Clients**: Use `./select_clients.sh` for recommendations
3. **Run Install Scripts**: Execute client-specific installation scripts
4. **Verify Configuration**: Check generated config files match expectations

This architecture ensures that the eth2-quickstart repository remains maintainable, secure, and user-friendly while supporting the diverse ecosystem of Ethereum clients.