// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {NFT} from "../../contracts/NFT.sol";

/**
 * @title NFTTest
 * @dev Comprehensive tests for NFT contract using Foundry
 * @notice Includes unit tests and fuzz tests for thorough coverage
 */
contract NFTTest is Test {
    NFT public nft;
    address public owner;
    address public alice;
    address public bob;

    string constant NAME = "Test NFT";
    string constant SYMBOL = "TNFT";
    string constant BASE_URI = "https://api.example.com/";

    function setUp() public {
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        
        nft = new NFT(NAME, SYMBOL, BASE_URI);
    }

    // ============ Deployment Tests ============

    function test_DeployWithCorrectMetadata() public view {
        assertEq(nft.name(), NAME);
        assertEq(nft.symbol(), SYMBOL);
    }

    function test_DeployWithZeroMinted() public view {
        assertEq(nft.totalMinted(), 0);
    }

    // ============ Mint Tests ============

    function test_Mint_AsOwner() public {
        uint256 tokenId = nft.mint(alice);
        
        assertEq(tokenId, 0);
        assertEq(nft.ownerOf(0), alice);
        assertEq(nft.balanceOf(alice), 1);
        assertEq(nft.totalMinted(), 1);
    }

    function test_MintMultiple() public {
        nft.mint(alice);
        nft.mint(alice);
        nft.mint(bob);
        
        assertEq(nft.balanceOf(alice), 2);
        assertEq(nft.balanceOf(bob), 1);
        assertEq(nft.totalMinted(), 3);
    }

    function test_Mint_RevertIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        nft.mint(bob);
    }

    // ============ Transfer Tests ============

    function test_Transfer() public {
        nft.mint(alice);
        
        vm.prank(alice);
        nft.transferFrom(alice, bob, 0);
        
        assertEq(nft.ownerOf(0), bob);
    }

    function test_Approve_AndTransfer() public {
        nft.mint(alice);
        
        vm.prank(alice);
        nft.approve(bob, 0);
        
        vm.prank(bob);
        nft.transferFrom(alice, owner, 0);
        
        assertEq(nft.ownerOf(0), owner);
    }

    // ============ TokenURI Tests ============

    function test_TokenURI() public {
        nft.mint(alice);
        assertEq(nft.tokenURI(0), string.concat(BASE_URI, "0"));
    }

    function test_TokenURI_RevertForNonexistent() public {
        vm.expectRevert();
        nft.tokenURI(999);
    }

    // ============ Fuzz Tests ============

    function testFuzz_MintSequential(uint8 count) public {
        count = uint8(bound(count, 1, 50));
        
        for (uint8 i = 0; i < count; i++) {
            uint256 tokenId = nft.mint(alice);
            assertEq(tokenId, i);
        }
        
        assertEq(nft.balanceOf(alice), count);
        assertEq(nft.totalMinted(), count);
    }

    function testFuzz_Transfer(address to) public {
        vm.assume(to != address(0));
        vm.assume(to != alice);
        vm.assume(to.code.length == 0); // Only EOAs
        
        nft.mint(alice);
        
        vm.prank(alice);
        nft.transferFrom(alice, to, 0);
        
        assertEq(nft.ownerOf(0), to);
    }
}
