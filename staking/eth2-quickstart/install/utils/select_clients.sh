#!/bin/bash

# Ethereum Client Selection Script
# This script helps users choose between different execution and consensus clients

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1
source "$PROJECT_ROOT/lib/common_functions.sh"

# Colors for better readability
BOLD='\033[1m'
UNDERLINE='\033[4m'

display_header() {
    echo -e "${BOLD}${GREEN}"
    echo "=============================================="
    echo "    Ethereum Client Selection Assistant"
    echo "=============================================="
    echo -e "${NC}"
}

display_client_info() {
    # client_type="$1"  # Currently unused but kept for future use
    local client_name="$2"
    local language="$3"
    local description="$4"
    local pros="$5"
    local cons="$6"
    local install_script="$7"
    
    echo -e "${BOLD}${YELLOW}$client_name${NC} (${language})"
    echo -e "${description}"
    echo
    echo -e "${GREEN}Pros:${NC}"
    echo -e "${pros}"
    echo
    echo -e "${RED}Cons:${NC}"
    echo -e "${cons}"
    echo
    echo -e "${BOLD}Install script:${NC} ${install_script}"
    echo
    echo "----------------------------------------"
    echo
}

show_execution_clients() {
    echo -e "${BOLD}${UNDERLINE}EXECUTION CLIENTS${NC}"
    echo
    
    display_client_info "execution" "Geth" "Go" \
        "The original Go implementation of Ethereum. Most widely used and battle-tested." \
        "• Most stable and mature\n• Extensive documentation\n• Wide community support\n• Proven track record" \
        "• Higher resource usage\n• Slower sync compared to newer clients" \
        "../execution/geth.sh"
    
    display_client_info "execution" "Erigon" "Go" \
        "Re-architected Geth focusing on efficiency and performance." \
        "• Faster sync times\n• Lower disk space usage\n• Better performance\n• Modular architecture" \
        "• More complex setup\n• Less mature than Geth\n• Higher memory usage during sync" \
        "../execution/erigon.sh"
    
    display_client_info "execution" "Reth" "Rust" \
        "Modern Rust implementation focusing on performance and modularity." \
        "• Excellent performance\n• Modern codebase\n• Active development\n• Modular design" \
        "• Newer and less battle-tested\n• Rust compilation takes time\n• Still in development" \
        "../execution/reth.sh"
    
    display_client_info "execution" "Nethermind" ".NET/C#" \
        "Enterprise-focused .NET implementation with advanced features." \
        "• Enterprise features\n• Good performance\n• Active development\n• JSON-RPC compatibility" \
        "• Requires .NET runtime\n• Less common in home staking\n• Complex configuration" \
        "../execution/nethermind.sh"
    
    display_client_info "execution" "Besu" "Java" \
        "Apache 2.0 licensed Java client suitable for both public and private networks." \
        "• Permissive license\n• Enterprise support\n• Good for private networks\n• Hyperledger project" \
        "• Requires Java runtime\n• Higher resource usage\n• Less optimized for home staking" \
        "../execution/besu.sh"
    
    display_client_info "execution" "Nimbus-eth1" "Nim" \
        "Status-developed execution client optimized for resource efficiency." \
        "• Very lightweight\n• Perfect for Raspberry Pi\n• Low bandwidth usage\n• Low memory footprint" \
        "• Uses nightly builds\n• Smaller community\n• Less battle-tested\n• Nim language less common" \
        "../execution/nimbus_eth1.sh"
    
    display_client_info "execution" "Ethrex" "Rust" \
        "Lambda Class minimalist, fast and modular Ethereum client. Supports L1 and L2." \
        "• Minimalist codebase\n• Fast and modular\n• Pre-built binaries available\n• L2/ZK-Rollup support\n• Active development" \
        "• Very new client (2024)\n• Less battle-tested\n• Smaller community\n• Early adopter risk" \
        "../execution/ethrex.sh"
}

show_consensus_clients() {
    echo -e "${BOLD}${UNDERLINE}CONSENSUS CLIENTS${NC}"
    echo
    
    display_client_info "consensus" "Prysm" "Go" \
        "Developed by Prysmatic Labs, known for reliability and documentation." \
        "• Excellent documentation\n• Stable and reliable\n• Good community support\n• Easy to use" \
        "• Higher resource usage\n• Less client diversity benefit" \
        "../consensus/prysm.sh"
    
    display_client_info "consensus" "Lighthouse" "Rust" \
        "Rust implementation by Sigma Prime, focusing on security and performance." \
        "• Excellent performance\n• Security focused\n• Good documentation\n• Active development" \
        "• Rust compilation required\n• Less beginner-friendly setup" \
        "../consensus/lighthouse.sh"
    
    display_client_info "consensus" "Teku" "Java" \
        "ConsenSys-developed client designed for institutional staking." \
        "• Enterprise features\n• Institutional support\n• Good for large operations\n• Comprehensive monitoring" \
        "• Higher resource usage\n• Requires Java runtime\n• Complex for home stakers" \
        "../consensus/teku.sh"
    
    display_client_info "consensus" "Nimbus" "Nim" \
        "Status-developed client optimized for resource efficiency." \
        "• Very lightweight\n• Perfect for Raspberry Pi\n• Low bandwidth usage\n• Easy to run" \
        "• Smaller community\n• Less feature-rich\n• Nim language less common" \
        "../consensus/nimbus.sh"
    
    display_client_info "consensus" "Lodestar" "TypeScript" \
        "ChainSafe-developed client written in TypeScript." \
        "• Developer-friendly (TypeScript)\n• Good for development\n• Active development\n• Modern architecture" \
        "• Higher resource usage\n• Less battle-tested\n• Node.js dependency" \
        "../consensus/lodestar.sh"
    
    display_client_info "consensus" "Grandine" "Rust" \
        "High-performance Rust client focused on correctness and efficiency." \
        "• High performance\n• Modern Rust implementation\n• Performance optimized\n• Advanced features" \
        "• Very new client\n• Less documentation\n• Advanced users only\n• Still in development" \
        "../consensus/grandine.sh"
}

show_recommendations() {
    echo -e "${BOLD}${UNDERLINE}RECOMMENDATIONS${NC}"
    echo
    
    echo -e "${BOLD}For Beginners:${NC}"
    echo "• Execution: Geth (most stable and documented)"
    echo "• Consensus: Prysm (excellent documentation and support)"
    echo
    
    echo -e "${BOLD}For Performance:${NC}"
    echo "• Execution: Erigon or Reth (faster sync, better efficiency)"
    echo "• Consensus: Lighthouse or Nimbus (efficient resource usage)"
    echo
    
    echo -e "${BOLD}For Resource-Constrained Systems:${NC}"
    echo "• Execution: Nimbus-eth1 or Geth (lightweight and proven)"
    echo "• Consensus: Nimbus (designed for low-resource environments)"
    echo
    
    echo -e "${BOLD}For Enterprise/Institutional:${NC}"
    echo "• Execution: Nethermind or Besu (enterprise features)"
    echo "• Consensus: Teku (designed for institutional use)"
    echo
    
    echo -e "${BOLD}For Client Diversity:${NC}"
    echo "Consider using minority clients to improve network resilience:"
    echo "• Execution: Erigon, Reth, Nethermind, Besu, Nimbus-eth1, or Ethrex"
    echo "• Consensus: Lighthouse, Teku, Nimbus, Lodestar, or Grandine"
    echo
    
    echo -e "${BOLD}For Early Adopters/Developers:${NC}"
    echo "• Execution: Ethrex (minimalist Rust client with L2 support)"
    echo "• Consensus: Lodestar or Grandine (modern implementations)"
    echo
}

show_system_requirements() {
    echo -e "${BOLD}${UNDERLINE}SYSTEM REQUIREMENTS${NC}"
    echo
    
    echo -e "${BOLD}Minimum Requirements:${NC}"
    echo "• CPU: 4+ cores"
    echo "• RAM: 16GB+ (32GB+ recommended)"
    echo "• Storage: 2TB+ SSD (NVMe preferred)"
    echo "• Network: Stable internet with unlimited data"
    echo
    
    echo -e "${BOLD}Client-Specific Requirements:${NC}"
    echo "• Nimbus (consensus): Can run on 4GB RAM and slower hardware"
    echo "• Nimbus-eth1 (execution): Lightweight, suitable for low-resource systems"
    echo "• Teku/Besu: Require Java, higher RAM usage"
    echo "• Lodestar: Requires Node.js"
    echo "• Erigon: Higher RAM during initial sync"
    echo "• Reth/Grandine: Rust compilation requires build tools"
    echo "• Ethrex: Pre-built binaries available (8GB+ RAM recommended)"
    echo
}

interactive_selection() {
    echo -e "${BOLD}${UNDERLINE}INTERACTIVE CLIENT SELECTION${NC}"
    echo
    
    # Ask about user experience
    echo "1. What is your experience level?"
    echo "   a) Beginner - new to Ethereum staking"
    echo "   b) Intermediate - some experience with crypto/servers"
    echo "   c) Advanced - experienced with blockchain infrastructure"
    echo
    read -r -p "Select (a/b/c): " experience
    if ! validate_user_input "$experience" "^[abc]$" 1; then
        log_error "Invalid selection. Please choose a, b, or c."
        return 1
    fi
    
    # Ask about hardware
    echo
    echo "2. What hardware are you using?"
    echo "   a) High-end server/desktop (32GB+ RAM, fast SSD)"
    echo "   b) Mid-range system (16-32GB RAM, SSD)"
    echo "   c) Resource-constrained (Raspberry Pi, <16GB RAM)"
    echo
    read -r -p "Select (a/b/c): " hardware
    if ! validate_user_input "$hardware" "^[abc]$" 1; then
        log_error "Invalid selection. Please choose a, b, or c."
        return 1
    fi
    
    # Ask about priorities
    echo
    echo "3. What is your priority?"
    echo "   a) Stability and reliability"
    echo "   b) Performance and efficiency"
    echo "   c) Client diversity"
    echo "   d) Learning and development"
    echo
    read -r -p "Select (a/b/c/d): " priority
    if ! validate_user_input "$priority" "^[abcd]$" 1; then
        log_error "Invalid selection. Please choose a, b, c, or d."
        return 1
    fi
    
    # Generate recommendation
    echo
    echo -e "${BOLD}${GREEN}RECOMMENDATION BASED ON YOUR ANSWERS:${NC}"
    echo
    
    case "$experience" in
        "a")
            case "$hardware" in
                "a"|"b") echo "• Execution Client: Geth (most stable)"
                        echo "• Consensus Client: Prysm (best documentation)" ;;
                "c") echo "• Execution Client: Nimbus-eth1 or Geth (lightweight and proven)"
                     echo "• Consensus Client: Nimbus (lightweight)" ;;
            esac
            ;;
        "b")
            case "$priority" in
                "a") echo "• Execution Client: Geth"
                     echo "• Consensus Client: Lighthouse or Prysm" ;;
                "b") echo "• Execution Client: Erigon"
                     echo "• Consensus Client: Lighthouse" ;;
                "c") echo "• Execution Client: Reth or Nethermind"
                     echo "• Consensus Client: Teku or Nimbus" ;;
            esac
            ;;
        "c")
            case "$priority" in
                "a") echo "• Execution Client: Geth or Erigon"
                     echo "• Consensus Client: Lighthouse or Prysm" ;;
                "b") echo "• Execution Client: Reth or Erigon"
                     echo "• Consensus Client: Lighthouse or Grandine" ;;
                "c") echo "• Execution Client: Nethermind, Besu, or Ethrex"
                     echo "• Consensus Client: Teku or Lodestar" ;;
                "d") echo "• Execution Client: Ethrex or Reth (modern Rust)"
                     echo "• Consensus Client: Lodestar (TypeScript) or Grandine" ;;
            esac
            ;;
    esac
    
    echo
    echo "Run the corresponding install scripts to set up your chosen clients."
}

main_menu() {
    while true; do
        display_header
        
        echo "What would you like to do?"
        echo
        echo "1. View Execution Clients"
        echo "2. View Consensus Clients"
        echo "3. View Recommendations"
        echo "4. View System Requirements"
        echo "5. Interactive Client Selection"
        echo "6. Exit"
        echo
        read -r -p "Select an option (1-6): " choice
        if ! validate_menu_choice "$choice" 6; then
            log_error "Invalid choice. Please select 1-6."
            continue
        fi
        
        case $choice in
            1) clear; show_execution_clients; read -r -p "Press Enter to continue..." ;;
            2) clear; show_consensus_clients; read -r -p "Press Enter to continue..." ;;
            3) clear; show_recommendations; read -r -p "Press Enter to continue..." ;;
            4) clear; show_system_requirements; read -r -p "Press Enter to continue..." ;;
            5) clear; interactive_selection; read -r -p "Press Enter to continue..." ;;
            6) log_info "Thank you for using the Ethereum Client Selection Assistant!"; exit 0 ;;
            *) log_error "Invalid option. Please select 1-6." ;;
        esac
        clear
    done
}

# Run the main menu
main_menu