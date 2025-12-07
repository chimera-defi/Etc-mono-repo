// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Token} from "../../contracts/Token.sol";

/**
 * @title TokenTest
 * @dev Comprehensive tests for Token contract using Foundry
 * @notice Includes unit tests and fuzz tests for thorough coverage
 */
contract TokenTest is Test {
    Token public token;
    address public owner;
    address public alice;
    address public bob;

    uint256 constant INITIAL_SUPPLY = 1_000_000 ether;

    function setUp() public {
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        
        token = new Token("Test Token", "TST", INITIAL_SUPPLY);
    }

    // ============ Deployment Tests ============

    function test_DeployWithCorrectSupply() public view {
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
    }

    function test_DeployWithCorrectMetadata() public view {
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TST");
        assertEq(token.decimals(), 18);
    }

    function test_DeployWithCorrectOwner() public view {
        assertEq(token.owner(), owner);
    }

    // ============ Transfer Tests ============

    function test_Transfer() public {
        uint256 amount = 100 ether;
        token.transfer(alice, amount);
        
        assertEq(token.balanceOf(alice), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function test_TransferFrom() public {
        uint256 amount = 100 ether;
        token.approve(alice, amount);
        
        vm.prank(alice);
        token.transferFrom(owner, bob, amount);
        
        assertEq(token.balanceOf(bob), amount);
    }

    // ============ Mint Tests ============

    function test_Mint_AsOwner() public {
        uint256 mintAmount = 500 ether;
        token.mint(alice, mintAmount);
        
        assertEq(token.balanceOf(alice), mintAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + mintAmount);
    }

    function test_Mint_RevertIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(bob, 100 ether);
    }

    // ============ Burn Tests ============

    function test_Burn() public {
        uint256 burnAmount = 100 ether;
        token.burn(burnAmount);
        
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY - burnAmount);
    }

    function test_Burn_RevertIfInsufficientBalance() public {
        vm.prank(alice);
        vm.expectRevert();
        token.burn(100 ether);
    }

    // ============ Fuzz Tests ============

    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 0, INITIAL_SUPPLY);
        
        token.transfer(alice, amount);
        
        assertEq(token.balanceOf(alice), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function testFuzz_Mint(uint256 amount) public {
        amount = bound(amount, 0, type(uint128).max);
        
        token.mint(alice, amount);
        
        assertEq(token.balanceOf(alice), amount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + amount);
    }

    function testFuzz_Burn(uint256 amount) public {
        amount = bound(amount, 0, INITIAL_SUPPLY);
        
        token.burn(amount);
        
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }
}
