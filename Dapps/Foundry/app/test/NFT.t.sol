// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {NFT} from "../src/NFT.sol";

contract NFTTest is Test {
    NFT public nft;
    address public owner;
    address public addr1;
    address public addr2;

    string constant NAME = "Test NFT";
    string constant SYMBOL = "TNFT";
    string constant BASE_URI = "https://api.example.com/";

    function setUp() public {
        owner = address(this);
        addr1 = makeAddr("addr1");
        addr2 = makeAddr("addr2");
        
        nft = new NFT(NAME, SYMBOL, BASE_URI);
    }

    function test_DeployWithCorrectMetadata() public view {
        assertEq(nft.name(), NAME);
        assertEq(nft.symbol(), SYMBOL);
    }

    function test_Mint_AsOwner() public {
        uint256 tokenId = nft.mint(addr1);
        
        assertEq(tokenId, 0);
        assertEq(nft.ownerOf(0), addr1);
        assertEq(nft.balanceOf(addr1), 1);
        assertEq(nft.totalMinted(), 1);
    }

    function test_MintMultiple() public {
        nft.mint(addr1);
        nft.mint(addr1);
        nft.mint(addr2);
        
        assertEq(nft.balanceOf(addr1), 2);
        assertEq(nft.balanceOf(addr2), 1);
        assertEq(nft.totalMinted(), 3);
    }

    function test_Mint_RevertIfNotOwner() public {
        vm.prank(addr1);
        vm.expectRevert();
        nft.mint(addr2);
    }

    function test_Transfer() public {
        // Mint to an EOA, not the test contract (which can't receive ERC721)
        nft.mint(addr1);
        
        vm.prank(addr1);
        nft.transferFrom(addr1, addr2, 0);
        
        assertEq(nft.ownerOf(0), addr2);
    }

    function test_Approve_AndTransfer() public {
        nft.mint(addr1);
        
        vm.prank(addr1);
        nft.approve(addr2, 0);
        
        vm.prank(addr2);
        nft.transferFrom(addr1, owner, 0);
        
        assertEq(nft.ownerOf(0), owner);
    }

    function test_TokenURI() public {
        nft.mint(addr1);
        
        assertEq(nft.tokenURI(0), string.concat(BASE_URI, "0"));
    }

    function test_TokenURI_RevertForNonexistent() public {
        vm.expectRevert();
        nft.tokenURI(999);
    }

    // Fuzz Tests
    function testFuzz_MintSequential(uint8 count) public {
        count = uint8(bound(count, 1, 50)); // Limit to reasonable amount
        
        for (uint8 i = 0; i < count; i++) {
            uint256 tokenId = nft.mint(addr1);
            assertEq(tokenId, i);
        }
        
        assertEq(nft.balanceOf(addr1), count);
        assertEq(nft.totalMinted(), count);
    }

    function testFuzz_Transfer(address to) public {
        vm.assume(to != address(0));
        vm.assume(to != addr1);
        vm.assume(to.code.length == 0); // Only EOAs can receive without implementing receiver
        
        nft.mint(addr1);
        
        vm.prank(addr1);
        nft.transferFrom(addr1, to, 0);
        
        assertEq(nft.ownerOf(0), to);
    }
}
