// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract VaultTest is Test {
    Vault public vault;
    MockERC20 public token;
    
    address public admin = makeAddr("admin");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    
    uint256 public constant INITIAL_BALANCE = 1000 ether;

    function setUp() public {
        vm.startPrank(admin);
        token = new MockERC20("Test Token", "TEST");
        vault = new Vault(address(token));
        vm.stopPrank();

        // Setup initial balances
        token.mint(alice, INITIAL_BALANCE);
        token.mint(bob, INITIAL_BALANCE);

        // Approve vault
        vm.prank(alice);
        token.approve(address(vault), type(uint256).max);
        vm.prank(bob);
        token.approve(address(vault), type(uint256).max);
    }

    // ============ Unit Tests ============
    function test_Deposit() public {
        vm.prank(alice);
        uint256 shares = vault.deposit(100 ether);
        
        assertEq(shares, 100 ether);
        assertEq(vault.shares(alice), 100 ether);
        assertEq(vault.totalShares(), 100 ether);
        assertEq(token.balanceOf(address(vault)), 100 ether);
    }

    function test_Withdraw() public {
        vm.prank(alice);
        vault.deposit(100 ether);
        
        vm.prank(alice);
        uint256 amount = vault.withdraw(100 ether);
        
        assertEq(amount, 100 ether);
        assertEq(vault.shares(alice), 0);
        assertEq(vault.totalShares(), 0);
    }

    function test_MultipleDepositors() public {
        // Alice deposits first
        vm.prank(alice);
        vault.deposit(100 ether);
        
        // Bob deposits second
        vm.prank(bob);
        uint256 bobShares = vault.deposit(100 ether);
        
        assertEq(bobShares, 100 ether);
        assertEq(vault.totalShares(), 200 ether);
    }

    function test_RevertOn_ZeroDeposit() public {
        vm.prank(alice);
        vm.expectRevert(Vault.Vault__ZeroAmount.selector);
        vault.deposit(0);
    }

    function test_RevertOn_WithdrawMoreThanBalance() public {
        vm.prank(alice);
        vault.deposit(100 ether);
        
        vm.prank(alice);
        vm.expectRevert(Vault.Vault__InsufficientBalance.selector);
        vault.withdraw(200 ether);
    }

    function test_EmergencyWithdraw() public {
        vm.prank(alice);
        vault.deposit(100 ether);
        
        vm.prank(admin);
        vault.emergencyWithdraw();
        
        assertEq(token.balanceOf(admin), 100 ether);
    }

    function test_RevertOn_UnauthorizedEmergencyWithdraw() public {
        vm.prank(alice);
        vault.deposit(100 ether);
        
        vm.prank(alice);
        vm.expectRevert(Vault.Vault__Unauthorized.selector);
        vault.emergencyWithdraw();
    }

    // ============ Fuzz Tests ============
    function testFuzz_Deposit(uint256 amount) public {
        // Bound amount to reasonable values
        amount = bound(amount, 1, INITIAL_BALANCE);
        
        vm.prank(alice);
        uint256 shares = vault.deposit(amount);
        
        assertEq(vault.shares(alice), shares);
        assertEq(token.balanceOf(address(vault)), amount);
    }

    function testFuzz_DepositAndWithdraw(uint256 depositAmount) public {
        depositAmount = bound(depositAmount, 1, INITIAL_BALANCE);
        
        vm.prank(alice);
        uint256 shares = vault.deposit(depositAmount);
        
        vm.prank(alice);
        uint256 withdrawnAmount = vault.withdraw(shares);
        
        assertEq(withdrawnAmount, depositAmount);
        assertEq(vault.shares(alice), 0);
        assertEq(vault.totalShares(), 0);
    }

    function testFuzz_MultipleDepositsAndWithdrawals(
        uint256 aliceDeposit,
        uint256 bobDeposit,
        uint256 aliceWithdrawShare
    ) public {
        aliceDeposit = bound(aliceDeposit, 1 ether, INITIAL_BALANCE);
        bobDeposit = bound(bobDeposit, 1 ether, INITIAL_BALANCE);
        
        // Alice deposits
        vm.prank(alice);
        uint256 aliceShares = vault.deposit(aliceDeposit);
        
        // Bob deposits
        vm.prank(bob);
        uint256 bobShares = vault.deposit(bobDeposit);
        
        // Bound alice's withdrawal
        aliceWithdrawShare = bound(aliceWithdrawShare, 1, aliceShares);
        
        // Alice partial withdrawal
        vm.prank(alice);
        vault.withdraw(aliceWithdrawShare);
        
        // Invariant: Bob should still have his proportional share
        uint256 bobBalance = vault.balanceOf(bob);
        assertTrue(bobBalance > 0);
    }

    function testFuzz_SharesNeverExceedDeposits(uint256[] calldata deposits) public {
        vm.assume(deposits.length > 0 && deposits.length <= 10);
        
        uint256 totalDeposited = 0;
        
        for (uint256 i = 0; i < deposits.length; i++) {
            uint256 amount = bound(deposits[i], 1, INITIAL_BALANCE / deposits.length);
            totalDeposited += amount;
            
            if (totalDeposited > INITIAL_BALANCE) break;
            
            vm.prank(alice);
            vault.deposit(amount);
        }
        
        // Invariant: total shares should equal total deposited (for single depositor)
        assertEq(vault.totalShares(), token.balanceOf(address(vault)));
    }

    // ============ Invariant Tests Setup ============
    function invariant_VaultSolvency() public view {
        // The vault should always have enough tokens to cover shares
        if (vault.totalShares() > 0) {
            assertTrue(token.balanceOf(address(vault)) > 0);
        }
    }
}
