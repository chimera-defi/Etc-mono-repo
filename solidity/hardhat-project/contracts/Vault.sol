// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Vault
 * @notice A simple ERC20 token vault with deposit/withdraw functionality
 * @dev Uses OpenZeppelin's battle-tested contracts for security
 */
contract Vault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ============ Errors ============
    error Vault__ZeroAmount();
    error Vault__InsufficientBalance();

    // ============ Events ============
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount, uint256 shares);
    event EmergencyWithdraw(address indexed admin, uint256 amount);

    // ============ State Variables ============
    IERC20 public immutable token;
    
    mapping(address => uint256) public shares;
    uint256 public totalShares;

    // ============ Constructor ============
    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
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

        token.safeTransferFrom(msg.sender, address(this), amount);

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

        token.safeTransfer(msg.sender, amountWithdrawn);

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
     * @notice Emergency withdraw all tokens (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(owner(), balance);
        emit EmergencyWithdraw(owner(), balance);
    }
}
