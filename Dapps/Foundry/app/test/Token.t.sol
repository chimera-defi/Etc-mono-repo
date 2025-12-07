// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Token} from "../src/Token.sol";

contract TokenTest is Test {
    Token public token;
    address public owner;
    address public addr1;
    address public addr2;

    uint256 constant INITIAL_SUPPLY = 1_000_000 ether;

    function setUp() public {
        owner = address(this);
        addr1 = makeAddr("addr1");
        addr2 = makeAddr("addr2");
        
        token = new Token("Test Token", "TST", INITIAL_SUPPLY);
    }

    function test_DeployWithCorrectSupply() public view {
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
    }

    function test_DeployWithCorrectMetadata() public view {
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TST");
        assertEq(token.decimals(), 18);
    }

    function test_Transfer() public {
        uint256 amount = 100 ether;
        token.transfer(addr1, amount);
        
        assertEq(token.balanceOf(addr1), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function test_TransferFrom() public {
        uint256 amount = 100 ether;
        token.approve(addr1, amount);
        
        vm.prank(addr1);
        token.transferFrom(owner, addr2, amount);
        
        assertEq(token.balanceOf(addr2), amount);
    }

    function test_Mint_AsOwner() public {
        uint256 mintAmount = 500 ether;
        token.mint(addr1, mintAmount);
        
        assertEq(token.balanceOf(addr1), mintAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + mintAmount);
    }

    function test_Mint_RevertIfNotOwner() public {
        vm.prank(addr1);
        vm.expectRevert();
        token.mint(addr2, 100 ether);
    }

    function test_Burn() public {
        uint256 burnAmount = 100 ether;
        token.burn(burnAmount);
        
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY - burnAmount);
    }

    function test_Burn_RevertIfInsufficientBalance() public {
        vm.prank(addr1);
        vm.expectRevert();
        token.burn(100 ether);
    }

    // Fuzz Tests
    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 0, INITIAL_SUPPLY);
        
        token.transfer(addr1, amount);
        
        assertEq(token.balanceOf(addr1), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function testFuzz_Mint(uint256 amount) public {
        amount = bound(amount, 0, type(uint128).max);
        
        token.mint(addr1, amount);
        
        assertEq(token.balanceOf(addr1), amount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + amount);
    }

    function testFuzz_Burn(uint256 amount) public {
        amount = bound(amount, 0, INITIAL_SUPPLY);
        
        token.burn(amount);
        
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }
}
