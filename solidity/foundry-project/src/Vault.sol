// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "forge-std/interfaces/IERC20.sol";

/**
 * @title Vault
 * @notice A simple ERC20 token vault with deposit/withdraw functionality
 * @dev Demonstrates common patterns: reentrancy guard, access control, precision handling
 */
contract Vault {
    // ============ Errors ============
    error Vault__ZeroAmount();
    error Vault__InsufficientBalance();
    error Vault__TransferFailed();
    error Vault__Unauthorized();
    error Vault__ReentrantCall();

    // ============ Events ============
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount, uint256 shares);
    event EmergencyWithdraw(address indexed admin, uint256 amount);

    // ============ State Variables ============
    IERC20 public immutable token;
    address public admin;
    
    mapping(address => uint256) public shares;
    uint256 public totalShares;
    
    uint256 private _locked;

    // ============ Modifiers ============
    modifier nonReentrant() {
        if (_locked == 1) revert Vault__ReentrantCall();
        _locked = 1;
        _;
        _locked = 0;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Vault__Unauthorized();
        _;
    }

    // ============ Constructor ============
    constructor(address _token) {
        token = IERC20(_token);
        admin = msg.sender;
    }

    // ============ External Functions ============
    
    /**
     * @notice Deposit tokens into the vault
     * @param amount Amount of tokens to deposit
     * @return sharesMinted Number of shares minted to the user
     */
    function deposit(uint256 amount) external nonReentrant returns (uint256 sharesMinted) {
        if (amount == 0) revert Vault__ZeroAmount();

        uint256 totalBalance = token.balanceOf(address(this));
        
        // Calculate shares: first depositor gets 1:1, subsequent depositors get proportional
        if (totalShares == 0) {
            sharesMinted = amount;
        } else {
            sharesMinted = (amount * totalShares) / totalBalance;
        }

        shares[msg.sender] += sharesMinted;
        totalShares += sharesMinted;

        bool success = token.transferFrom(msg.sender, address(this), amount);
        if (!success) revert Vault__TransferFailed();

        emit Deposit(msg.sender, amount, sharesMinted);
    }

    /**
     * @notice Withdraw tokens from the vault
     * @param shareAmount Number of shares to redeem
     * @return amountWithdrawn Amount of tokens withdrawn
     */
    function withdraw(uint256 shareAmount) external nonReentrant returns (uint256 amountWithdrawn) {
        if (shareAmount == 0) revert Vault__ZeroAmount();
        if (shares[msg.sender] < shareAmount) revert Vault__InsufficientBalance();

        uint256 totalBalance = token.balanceOf(address(this));
        amountWithdrawn = (shareAmount * totalBalance) / totalShares;

        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;

        bool success = token.transfer(msg.sender, amountWithdrawn);
        if (!success) revert Vault__TransferFailed();

        emit Withdraw(msg.sender, amountWithdrawn, shareAmount);
    }

    /**
     * @notice Get the token balance for a user's shares
     * @param user Address of the user
     * @return The equivalent token balance
     */
    function balanceOf(address user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (shares[user] * token.balanceOf(address(this))) / totalShares;
    }

    /**
     * @notice Emergency withdraw all tokens (admin only)
     */
    function emergencyWithdraw() external onlyAdmin {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(admin, balance);
        emit EmergencyWithdraw(admin, balance);
    }

    /**
     * @notice Transfer admin role
     * @param newAdmin New admin address
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}
