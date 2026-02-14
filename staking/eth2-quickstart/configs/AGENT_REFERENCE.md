# Configuration Agent Reference

## Configuration Architecture Overview

This directory contains base configuration templates for all Ethereum clients. The configuration system follows a standardized pattern:

### Configuration Flow
```
exports.sh → Base Template + Custom Variables → Final Client Config
```

### Directory Structure
- `besu/` - Besu client configurations (TOML format)
- `grandine/` - Grandine client configurations
- `lodestar/` - Lodestar client configurations (JSON format)
- `nethermind/` - Nethermind client configurations
- `nimbus/` - Nimbus client configurations (TOML format)
- `prysm/` - Prysm client configurations (YAML format)
- `teku/` - Teku client configurations (YAML format)

### Key Principles
1. **Base Templates**: Static configuration files with placeholders
2. **Variable Substitution**: User-specific values from `exports.sh`
3. **Consistent Naming**: All clients follow similar configuration patterns
4. **Documentation**: Each config directory should have clear documentation

### For AI Agents
When working with configurations:
- **Read**: `docs/CONFIGURATION_GUIDE.md` for detailed architecture
- **Follow**: Template + custom variable pattern
- **Maintain**: Consistency across all client configurations
- **Update**: Both base templates and documentation when making changes

### Configuration Variables
Key variables are defined in `exports.sh`:
- Client-specific memory settings (e.g., `TEKU_CACHE`, `NIMBUS_CACHE`)
- Port configurations (e.g., `TEKU_REST_PORT`, `NIMBUS_REST_PORT`)
- Checkpoint URLs for fast sync
- Universal settings (e.g., `FEE_RECIPIENT`, `GRAFITTI`)
- Prysm-specific settings (e.g., `PRYSM_CPURL`, `USE_PRYSM_MODERN`)

### Recent Updates
- **Prysm v6.1.2 Configuration**: Updated with performance optimizations, monitoring capabilities, and deprecated flag fixes
- **Monitoring**: Added Prometheus metrics on port 8080 (beacon node)
- **Performance**: Added `max-goroutines`, `block-batch-limit`, and `slots-per-archive-point` flags
- **MEV Boost**: Configured to use external MEV-Boost (local builder disabled)

Refer to `docs/CONFIGURATION_GUIDE.md` for complete configuration architecture details.