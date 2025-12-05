# Makefile for Solidity Development
# Supports both Foundry and Hardhat projects

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

# Paths
FOUNDRY_PROJECT := foundry-project
HARDHAT_PROJECT := hardhat-project
SLITHER := ~/.local/bin/slither
FORGE := ~/.foundry/bin/forge
ANVIL := ~/.foundry/bin/anvil
CAST := ~/.foundry/bin/cast

.PHONY: help install build test lint clean format snapshot gas slither all foundry-test hardhat-test

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "$(YELLOW)Installing Foundry dependencies...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) install
	@echo "$(YELLOW)Installing Hardhat dependencies...$(NC)"
	cd $(HARDHAT_PROJECT) && npm install
	@echo "$(GREEN)Dependencies installed!$(NC)"

# ============ BUILD ============

build: foundry-build hardhat-build ## Build both projects

foundry-build: ## Build Foundry project
	@echo "$(YELLOW)Building Foundry project...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) build
	@echo "$(GREEN)Foundry build complete!$(NC)"

hardhat-build: ## Build Hardhat project  
	@echo "$(YELLOW)Building Hardhat project...$(NC)"
	cd $(HARDHAT_PROJECT) && npx hardhat compile
	@echo "$(GREEN)Hardhat build complete!$(NC)"

# ============ TEST ============

test: foundry-test hardhat-test ## Run all tests

foundry-test: ## Run Foundry tests
	@echo "$(YELLOW)Running Foundry tests...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) test -vvv
	@echo "$(GREEN)Foundry tests complete!$(NC)"

foundry-test-fuzz: ## Run Foundry fuzz tests with more runs
	@echo "$(YELLOW)Running Foundry fuzz tests (1000 runs)...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) test --fuzz-runs 1000 -vvv
	@echo "$(GREEN)Foundry fuzz tests complete!$(NC)"

hardhat-test: ## Run Hardhat tests
	@echo "$(YELLOW)Running Hardhat tests...$(NC)"
	cd $(HARDHAT_PROJECT) && npx hardhat test
	@echo "$(GREEN)Hardhat tests complete!$(NC)"

# ============ COVERAGE ============

coverage: foundry-coverage hardhat-coverage ## Run coverage for both

foundry-coverage: ## Run Foundry coverage
	@echo "$(YELLOW)Running Foundry coverage...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) coverage
	@echo "$(GREEN)Foundry coverage complete!$(NC)"

hardhat-coverage: ## Run Hardhat coverage
	@echo "$(YELLOW)Running Hardhat coverage...$(NC)"
	cd $(HARDHAT_PROJECT) && npx hardhat coverage
	@echo "$(GREEN)Hardhat coverage complete!$(NC)"

# ============ GAS ============

gas: foundry-gas hardhat-gas ## Generate gas reports

foundry-gas: ## Generate Foundry gas report
	@echo "$(YELLOW)Generating Foundry gas report...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) test --gas-report
	@echo "$(GREEN)Foundry gas report complete!$(NC)"

hardhat-gas: ## Generate Hardhat gas report
	@echo "$(YELLOW)Generating Hardhat gas report...$(NC)"
	cd $(HARDHAT_PROJECT) && REPORT_GAS=true npx hardhat test
	@echo "$(GREEN)Hardhat gas report complete!$(NC)"

# ============ SECURITY ============

slither: slither-foundry slither-hardhat ## Run Slither on both projects

slither-foundry: ## Run Slither on Foundry project
	@echo "$(YELLOW)Running Slither on Foundry project...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(SLITHER) . --config-file ../slither.config.json || true
	@echo "$(GREEN)Slither analysis complete!$(NC)"

slither-hardhat: ## Run Slither on Hardhat project
	@echo "$(YELLOW)Running Slither on Hardhat project...$(NC)"
	cd $(HARDHAT_PROJECT) && $(SLITHER) . --config-file ../slither.config.json || true
	@echo "$(GREEN)Slither analysis complete!$(NC)"

# ============ FORMAT ============

format: ## Format Solidity code
	@echo "$(YELLOW)Formatting Solidity code...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) fmt
	@echo "$(GREEN)Formatting complete!$(NC)"

lint: ## Lint Solidity code
	@echo "$(YELLOW)Linting Solidity code...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) fmt --check
	@echo "$(GREEN)Linting complete!$(NC)"

# ============ SNAPSHOT ============

snapshot: ## Create gas snapshot
	@echo "$(YELLOW)Creating gas snapshot...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) snapshot
	@echo "$(GREEN)Snapshot created!$(NC)"

# ============ LOCAL NODE ============

anvil: ## Start local Anvil node
	@echo "$(YELLOW)Starting Anvil...$(NC)"
	$(ANVIL)

hardhat-node: ## Start local Hardhat node
	@echo "$(YELLOW)Starting Hardhat node...$(NC)"
	cd $(HARDHAT_PROJECT) && npx hardhat node

# ============ DEPLOY ============

deploy-foundry-local: ## Deploy Foundry contracts to local node
	@echo "$(YELLOW)Deploying Foundry contracts...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) script script/Counter.s.sol --fork-url http://localhost:8545 --broadcast
	@echo "$(GREEN)Deployment complete!$(NC)"

deploy-hardhat-local: ## Deploy Hardhat contracts to local node
	@echo "$(YELLOW)Deploying Hardhat contracts...$(NC)"
	cd $(HARDHAT_PROJECT) && npx hardhat run scripts/deploy.ts --network localhost
	@echo "$(GREEN)Deployment complete!$(NC)"

# ============ CLEAN ============

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	cd $(FOUNDRY_PROJECT) && $(FORGE) clean
	cd $(HARDHAT_PROJECT) && npx hardhat clean
	@echo "$(GREEN)Clean complete!$(NC)"

# ============ ALL ============

all: build test gas slither ## Build, test, gas report, and security scan
	@echo "$(GREEN)All tasks complete!$(NC)"
