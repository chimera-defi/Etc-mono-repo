// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {MultiSigWallet} from "../src/MultiSigWallet.sol";

contract MultiSigWalletTest is Test {
    MultiSigWallet public wallet;
    
    address public owner1 = makeAddr("owner1");
    address public owner2 = makeAddr("owner2");
    address public owner3 = makeAddr("owner3");
    address public nonOwner = makeAddr("nonOwner");
    address public recipient = makeAddr("recipient");
    
    address[] public owners;
    uint256 public constant THRESHOLD = 2;
    uint256 public constant INITIAL_BALANCE = 10 ether;

    function setUp() public {
        owners.push(owner1);
        owners.push(owner2);
        owners.push(owner3);
        
        wallet = new MultiSigWallet(owners, THRESHOLD);
        vm.deal(address(wallet), INITIAL_BALANCE);
    }

    // ============ Constructor Tests ============
    function test_ConstructorSetsOwners() public view {
        assertTrue(wallet.isOwner(owner1));
        assertTrue(wallet.isOwner(owner2));
        assertTrue(wallet.isOwner(owner3));
        assertFalse(wallet.isOwner(nonOwner));
    }

    function test_ConstructorSetsThreshold() public view {
        assertEq(wallet.threshold(), THRESHOLD);
    }

    function test_RevertOn_EmptyOwners() public {
        address[] memory emptyOwners = new address[](0);
        vm.expectRevert(MultiSigWallet.MultiSig__InvalidOwnerCount.selector);
        new MultiSigWallet(emptyOwners, 1);
    }

    function test_RevertOn_InvalidThreshold() public {
        vm.expectRevert(MultiSigWallet.MultiSig__InvalidThreshold.selector);
        new MultiSigWallet(owners, 0);
        
        vm.expectRevert(MultiSigWallet.MultiSig__InvalidThreshold.selector);
        new MultiSigWallet(owners, 4);
    }

    function test_RevertOn_DuplicateOwner() public {
        address[] memory dupeOwners = new address[](2);
        dupeOwners[0] = owner1;
        dupeOwners[1] = owner1;
        
        vm.expectRevert(MultiSigWallet.MultiSig__DuplicateOwner.selector);
        new MultiSigWallet(dupeOwners, 1);
    }

    // ============ Submit Transaction Tests ============
    function test_SubmitTransaction() public {
        vm.prank(owner1);
        uint256 txIndex = wallet.submitTransaction(recipient, 1 ether, "");
        
        assertEq(txIndex, 0);
        assertEq(wallet.getTransactionCount(), 1);
        
        (address to, uint256 value, , bool executed, uint256 numConfirmations) = wallet.getTransaction(0);
        assertEq(to, recipient);
        assertEq(value, 1 ether);
        assertFalse(executed);
        assertEq(numConfirmations, 0);
    }

    function test_RevertOn_NonOwnerSubmit() public {
        vm.prank(nonOwner);
        vm.expectRevert(MultiSigWallet.MultiSig__NotOwner.selector);
        wallet.submitTransaction(recipient, 1 ether, "");
    }

    // ============ Confirm Transaction Tests ============
    function test_ConfirmTransaction() public {
        vm.prank(owner1);
        wallet.submitTransaction(recipient, 1 ether, "");
        
        vm.prank(owner1);
        wallet.confirmTransaction(0);
        
        assertTrue(wallet.isConfirmed(0, owner1));
        (, , , , uint256 numConfirmations) = wallet.getTransaction(0);
        assertEq(numConfirmations, 1);
    }

    function test_RevertOn_DoubleConfirm() public {
        vm.prank(owner1);
        wallet.submitTransaction(recipient, 1 ether, "");
        
        vm.prank(owner1);
        wallet.confirmTransaction(0);
        
        vm.prank(owner1);
        vm.expectRevert(MultiSigWallet.MultiSig__TxAlreadyConfirmed.selector);
        wallet.confirmTransaction(0);
    }

    // ============ Execute Transaction Tests ============
    function test_ExecuteTransaction() public {
        uint256 recipientBalanceBefore = recipient.balance;
        
        vm.prank(owner1);
        wallet.submitTransaction(recipient, 1 ether, "");
        
        vm.prank(owner1);
        wallet.confirmTransaction(0);
        
        vm.prank(owner2);
        wallet.confirmTransaction(0);
        
        vm.prank(owner1);
        wallet.executeTransaction(0);
        
        assertEq(recipient.balance, recipientBalanceBefore + 1 ether);
        (, , , bool executed, ) = wallet.getTransaction(0);
        assertTrue(executed);
    }

    function test_RevertOn_InsufficientConfirmations() public {
        vm.prank(owner1);
        wallet.submitTransaction(recipient, 1 ether, "");
        
        vm.prank(owner1);
        wallet.confirmTransaction(0);
        
        // Only 1 confirmation, need 2
        vm.prank(owner1);
        vm.expectRevert(MultiSigWallet.MultiSig__InsufficientConfirmations.selector);
        wallet.executeTransaction(0);
    }

    function test_RevertOn_DoubleExecute() public {
        vm.prank(owner1);
        wallet.submitTransaction(recipient, 1 ether, "");
        
        vm.prank(owner1);
        wallet.confirmTransaction(0);
        vm.prank(owner2);
        wallet.confirmTransaction(0);
        
        vm.prank(owner1);
        wallet.executeTransaction(0);
        
        vm.prank(owner1);
        vm.expectRevert(MultiSigWallet.MultiSig__TxAlreadyExecuted.selector);
        wallet.executeTransaction(0);
    }

    // ============ Revoke Confirmation Tests ============
    function test_RevokeConfirmation() public {
        vm.prank(owner1);
        wallet.submitTransaction(recipient, 1 ether, "");
        
        vm.prank(owner1);
        wallet.confirmTransaction(0);
        
        vm.prank(owner1);
        wallet.revokeConfirmation(0);
        
        assertFalse(wallet.isConfirmed(0, owner1));
        (, , , , uint256 numConfirmations) = wallet.getTransaction(0);
        assertEq(numConfirmations, 0);
    }

    // ============ Fuzz Tests ============
    function testFuzz_MultipleOwnersAndThreshold(uint8 numOwners, uint8 threshold) public {
        numOwners = uint8(bound(numOwners, 1, 10));
        threshold = uint8(bound(threshold, 1, numOwners));
        
        address[] memory fuzzOwners = new address[](numOwners);
        for (uint8 i = 0; i < numOwners; i++) {
            fuzzOwners[i] = makeAddr(string(abi.encodePacked("fuzzOwner", i)));
        }
        
        MultiSigWallet fuzzWallet = new MultiSigWallet(fuzzOwners, threshold);
        
        assertEq(fuzzWallet.threshold(), threshold);
        assertEq(fuzzWallet.getOwners().length, numOwners);
    }

    function testFuzz_TransactionValue(uint256 value) public {
        value = bound(value, 0, INITIAL_BALANCE);
        
        uint256 recipientBalanceBefore = recipient.balance;
        
        vm.prank(owner1);
        wallet.submitTransaction(recipient, value, "");
        
        vm.prank(owner1);
        wallet.confirmTransaction(0);
        vm.prank(owner2);
        wallet.confirmTransaction(0);
        
        vm.prank(owner1);
        wallet.executeTransaction(0);
        
        assertEq(recipient.balance, recipientBalanceBefore + value);
    }

    function testFuzz_TransactionData(bytes calldata data) public {
        vm.prank(owner1);
        uint256 txIndex = wallet.submitTransaction(recipient, 0, data);
        
        (, , bytes memory storedData, , ) = wallet.getTransaction(txIndex);
        assertEq(keccak256(storedData), keccak256(data));
    }

    // ============ Invariant Tests ============
    function invariant_ThresholdNeverExceedsOwners() public view {
        assertTrue(wallet.threshold() <= wallet.getOwners().length);
    }

    function invariant_ThresholdNeverZero() public view {
        assertTrue(wallet.threshold() > 0);
    }
}
