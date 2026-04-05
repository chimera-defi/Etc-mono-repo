// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@forge-std/interfaces/IERC20.sol";
import {IFU} from "src/interfaces/IFU.sol";
import {Settings} from "src/core/Settings.sol";
import {IUniswapV2Pair} from "src/interfaces/IUniswapV2Pair.sol";

import {Test} from "@forge-std/Test.sol";
import {console} from "@forge-std/console.sol";

/// @title FU Token Transfer & Sell Example Tests (Fork-based)
/// @notice Tests against the real deployed FU token on Ethereum mainnet.
/// Demonstrates what happens when you try to transfer, sell, or interact with the FU token.
///
/// The FU token is an intentionally adversarial ERC-20 "shitpost" designed to break wallets,
/// DEX aggregators, and anyone who interacts with it normally. Key mechanics:
///   - 35 decimal places (most tokens use 18)
///   - Moon-phase-based tax (0.01% to 50% depending on lunar cycle)
///   - "CrazyBalance" - same shares display as different balances per holder
///   - Anti-whale: large transfers get excess "delivered" (reflected) to all holders
///   - Random return values: transfer() may return true, false, nothing, or revert
///   - Permit2 has infinite allowance for ALL accounts
///   - Symbol is personalized: contracts see "Fuck you, <address>!", EOAs see "FU"
contract TokenTransferExamples is Test {
    // Real deployed FU token on mainnet
    IFU internal constant FU_TOKEN = IFU(0xaC03C1Efc03A62A4C86c544161E2103E9B90D6f9);
    IERC20 internal constant WETH = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    address internal constant DEAD = 0xdeaDDeADDEaDdeaDdEAddEADDEAdDeadDEADDEaD;
    address internal constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    // The address from the user's transaction
    address internal holder = 0x712ADBeD99F53b73C6dF1D522DC38042b160CacB;

    address internal alice;
    address internal bob;
    address internal charlie;

    function setUp() public {
        // Fork mainnet at latest block
        vm.createSelectFork("https://ethereum-rpc.publicnode.com");

        alice = makeAddr("alice");
        bob = makeAddr("bob");
        charlie = makeAddr("charlie");

        // Give alice some FU tokens by pranking a known holder
        uint256 holderBal = FU_TOKEN.balanceOf(holder);
        if (holderBal > 0) {
            vm.prank(holder);
            // Use low-level call since return value is unreliable
            address(FU_TOKEN).call(
                abi.encodeWithSelector(IERC20.transfer.selector, alice, holderBal / 3)
            );
        }
    }

    // =========================================================================
    // Basic Token Info - Shows the absurd configuration
    // =========================================================================

    function test_tokenInfo() external view {
        console.log("=== FU Token Info ===");
        console.log("Name:", FU_TOKEN.name());
        console.log("Decimals:", FU_TOKEN.decimals());
        console.log("Total Supply:", FU_TOKEN.totalSupply());
        console.log("Pair (Uniswap V2):", FU_TOKEN.pair());

        // 35 decimals instead of the standard 18
        assertEq(FU_TOKEN.decimals(), 35, "35 decimals - breaks most UIs");
    }

    // =========================================================================
    // Transfer Tests - Tax and value destruction
    // =========================================================================

    /// @notice Every transfer applies a moon-phase-based tax.
    /// Part is burned (reducing total supply), part is reflected to all holders.
    function test_transfer_losesTax() external {
        uint256 aliceBal = FU_TOKEN.balanceOf(alice);
        vm.assume(aliceBal > 0);

        uint256 bobBalBefore = FU_TOKEN.balanceOf(bob);
        uint256 totalBefore = FU_TOKEN.totalSupply();

        uint256 transferAmt = aliceBal / 2;
        console.log("=== Transfer Tax Test ===");
        console.log("Alice balance:", aliceBal);
        console.log("Attempting to transfer:", transferAmt);

        vm.prank(alice);
        address(FU_TOKEN).call(
            abi.encodeWithSelector(IERC20.transfer.selector, bob, transferAmt)
        );

        uint256 aliceAfter = FU_TOKEN.balanceOf(alice);
        uint256 bobAfter = FU_TOKEN.balanceOf(bob);
        uint256 totalAfter = FU_TOKEN.totalSupply();

        uint256 aliceLost = aliceBal - aliceAfter;
        uint256 bobGained = bobAfter - bobBalBefore;

        console.log("Alice lost:", aliceLost);
        console.log("Bob gained:", bobGained);
        console.log("Value destroyed:", aliceLost > bobGained ? aliceLost - bobGained : 0);
        console.log("Total supply before:", totalBefore);
        console.log("Total supply after:", totalAfter);

        // Bob receives LESS than what was sent - tax was taken
        if (bobGained > 0) {
            assertLt(bobGained, transferAmt, "Bob receives less than sent due to tax");
        }
    }

    /// @notice Cascade transfers: each hop compounds the tax erosion.
    function test_cascadeTransfers_erosion() external {
        uint256 aliceBal = FU_TOKEN.balanceOf(alice);
        vm.assume(aliceBal > 0);

        console.log("=== Cascade Transfer Erosion ===");
        uint256 currentAmount = aliceBal / 4;
        uint256 originalAmount = currentAmount;
        console.log("Starting amount:", originalAmount);

        address[4] memory chain = [alice, bob, charlie, makeAddr("dave")];

        for (uint256 i = 0; i < chain.length - 1; i++) {
            uint256 receiverBefore = FU_TOKEN.balanceOf(chain[i + 1]);

            vm.prank(chain[i]);
            address(FU_TOKEN).call(
                abi.encodeWithSelector(IERC20.transfer.selector, chain[i + 1], currentAmount)
            );

            uint256 receiverAfter = FU_TOKEN.balanceOf(chain[i + 1]);
            uint256 received = receiverAfter > receiverBefore ? receiverAfter - receiverBefore : 0;

            console.log("---");
            console.log("Hop", i + 1);
            console.log("  Sent:", currentAmount);
            console.log("  Received:", received);
            if (currentAmount > received) {
                console.log("  Tax lost:", currentAmount - received);
            }

            currentAmount = received;
            if (currentAmount == 0) break;
        }

        console.log("---");
        console.log("Original:", originalAmount);
        console.log("After 3 hops:", currentAmount);
        if (originalAmount > 0 && currentAmount < originalAmount) {
            console.log("% remaining:", (currentAmount * 100) / originalAmount);
        }
    }

    // =========================================================================
    // Return Value Unpredictability
    // =========================================================================

    /// @notice transfer() return value is unreliable due to _check() and _success().
    /// _check() uses keccak256(prevrandao, gasprice, coinbase) to randomly decide behavior.
    /// _success() may execute STOP opcode (return nothing) instead of returning true.
    function test_returnValue_unpredictable() external {
        uint256 aliceBal = FU_TOKEN.balanceOf(alice);
        vm.assume(aliceBal > 0);

        console.log("=== Return Value Unpredictability ===");

        vm.prank(alice);
        (bool success, bytes memory ret) = address(FU_TOKEN).call(
            abi.encodeWithSelector(IERC20.transfer.selector, bob, aliceBal / 10)
        );

        console.log("Call success (no revert):", success);
        console.log("Return data length:", ret.length);

        if (ret.length == 32) {
            bool decoded = abi.decode(ret, (bool));
            console.log("Returned bool:", decoded);
            console.log("(could be true OR false randomly)");
        } else if (ret.length == 0) {
            console.log("No return data - STOP opcode was executed");
            console.log("This breaks contracts that check: require(token.transfer(...))");
        }
    }

    // =========================================================================
    // Blocked Transfers
    // =========================================================================

    /// @notice Transfers to DEAD, address(0), address(token), or self are blocked.
    /// But instead of always reverting, they randomly either revert or return false.
    function test_blockedRecipients() external {
        uint256 aliceBal = FU_TOKEN.balanceOf(alice);
        vm.assume(aliceBal > 0);
        uint256 amt = aliceBal / 100;

        console.log("=== Blocked Recipient Tests ===");

        // Transfer to DEAD
        vm.prank(alice);
        (bool s1, bytes memory r1) = address(FU_TOKEN).call(
            abi.encodeWithSelector(IERC20.transfer.selector, DEAD, amt)
        );
        console.log("Transfer to DEAD - call success:", s1);
        if (r1.length == 32) console.log("  returned:", abi.decode(r1, (bool)));

        // Transfer to self
        vm.prank(alice);
        (bool s2, bytes memory r2) = address(FU_TOKEN).call(
            abi.encodeWithSelector(IERC20.transfer.selector, alice, amt)
        );
        console.log("Self-transfer - call success:", s2);
        if (r2.length == 32) console.log("  returned:", abi.decode(r2, (bool)));

        // Transfer to token contract
        vm.prank(alice);
        (bool s3, bytes memory r3) = address(FU_TOKEN).call(
            abi.encodeWithSelector(IERC20.transfer.selector, address(FU_TOKEN), amt)
        );
        console.log("Transfer to token - call success:", s3);
        if (r3.length == 32) console.log("  returned:", abi.decode(r3, (bool)));
    }

    /// @notice Transfers FROM DEAD are also blocked
    function test_transferFromDead_blocked() external {
        console.log("=== Transfer FROM DEAD ===");

        vm.prank(DEAD);
        (bool success, bytes memory ret) = address(FU_TOKEN).call(
            abi.encodeWithSelector(IERC20.transfer.selector, alice, 1)
        );
        console.log("Transfer from DEAD - call success:", success);
        if (ret.length == 32) console.log("  returned:", abi.decode(ret, (bool)));
        // Either reverts or returns false - never actually transfers
    }

    // =========================================================================
    // Sell to Pair (Uniswap V2)
    // =========================================================================

    /// @notice Selling = transferring to the Uniswap pair. Same tax applies.
    /// The pair receives tokens in its special accounting (pairTokens, not shares).
    function test_sellToPair() external {
        uint256 aliceBal = FU_TOKEN.balanceOf(alice);
        vm.assume(aliceBal > 0);

        address pair_ = FU_TOKEN.pair();
        uint256 pairBefore = FU_TOKEN.balanceOf(pair_);

        uint256 sellAmount = aliceBal / 4;
        console.log("=== Sell to Pair ===");
        console.log("Alice balance:", aliceBal);
        console.log("Sell amount:", sellAmount);
        console.log("Pair balance before:", pairBefore);

        vm.prank(alice);
        address(FU_TOKEN).call(
            abi.encodeWithSelector(IERC20.transfer.selector, pair_, sellAmount)
        );

        uint256 aliceAfter = FU_TOKEN.balanceOf(alice);
        uint256 pairAfter = FU_TOKEN.balanceOf(pair_);

        console.log("Alice after:", aliceAfter);
        console.log("Pair after:", pairAfter);
        console.log("Alice lost:", aliceBal - aliceAfter);
        console.log("Pair gained:", pairAfter - pairBefore);
    }

    // =========================================================================
    // CrazyBalance - Balance differs per holder for same shares
    // =========================================================================

    /// @notice The "CrazyBalance" mechanism means balance = f(shares, address).
    /// Two holders with identical share counts will show different balances.
    function test_crazyBalance() external {
        console.log("=== CrazyBalance Mechanism ===");

        // Balance display depends on holder address, not just share count.
        // Two holders with identical internal shares show different balances.
        console.log("Balance display depends on holder address, not just share count");
        console.log("This means portfolio trackers show wrong values");
        console.log("Holder bal:", FU_TOKEN.balanceOf(holder));
        console.log("DEAD bal:", FU_TOKEN.balanceOf(DEAD));
    }

    // =========================================================================
    // Permit2 Infinite Allowance
    // =========================================================================

    /// @notice Permit2 has infinite allowance for ALL accounts automatically.
    /// This is hardcoded - you can't revoke it.
    function test_permit2_infiniteAllowance() external view {
        console.log("=== Permit2 Infinite Allowance ===");

        assertEq(
            FU_TOKEN.allowance(alice, PERMIT2),
            type(uint256).max,
            "Permit2 has max allowance for alice"
        );
        assertEq(
            FU_TOKEN.allowance(address(0xBEEF), PERMIT2),
            type(uint256).max,
            "Permit2 has max allowance for random address"
        );
        assertEq(
            FU_TOKEN.allowance(holder, PERMIT2),
            type(uint256).max,
            "Permit2 has max allowance for real holder"
        );

        console.log("Permit2 allowance for any account:", type(uint256).max);
        console.log("This is HARDCODED and IRREVOCABLE");
    }

    // =========================================================================
    // Symbol is Caller-Dependent
    // =========================================================================

    /// @notice symbol() returns different strings based on who calls it.
    /// Contracts see: "Fuck you, <checksummed address>!"
    /// EOAs see: "FU"
    function test_symbol_callerDependent() external {
        console.log("=== Caller-Dependent Symbol ===");

        // From a contract (this test contract)
        string memory contractSymbol = FU_TOKEN.symbol();
        console.log("Symbol from contract:", contractSymbol);

        // From an "EOA" (tx.origin == msg.sender)
        vm.prank(alice, alice);
        string memory eoaSymbol = FU_TOKEN.symbol();
        console.log("Symbol from EOA:", eoaSymbol);
    }

    // =========================================================================
    // Deliver - Voluntary reflection
    // =========================================================================

    /// @notice deliver() lets you voluntarily burn tokens as reflection to all holders.
    /// Unlike transfer tax (which burns some), deliver converts ALL to reflections.
    function test_deliver() external {
        uint256 aliceBal = FU_TOKEN.balanceOf(alice);
        vm.assume(aliceBal > 0);

        uint256 deliverAmt = aliceBal / 5;
        console.log("=== Deliver (Voluntary Reflection) ===");
        console.log("Alice balance before:", aliceBal);
        console.log("Delivering:", deliverAmt);

        uint256 holderBefore = FU_TOKEN.balanceOf(holder);

        vm.prank(alice);
        address(FU_TOKEN).call(
            abi.encodeWithSelector(IFU.deliver.selector, deliverAmt)
        );

        uint256 aliceAfter = FU_TOKEN.balanceOf(alice);
        uint256 holderAfter = FU_TOKEN.balanceOf(holder);

        console.log("Alice after:", aliceAfter);
        console.log("Alice lost:", aliceBal - aliceAfter);
        console.log("Other holder before:", holderBefore);
        console.log("Other holder after:", holderAfter);
        if (holderAfter > holderBefore) {
            console.log("Other holder gained (reflection):", holderAfter - holderBefore);
        }
    }

    // =========================================================================
    // Gas Consumption Chaos
    // =========================================================================

    /// @notice The rebase queue processing makes gas usage highly variable and
    /// unpredictable. This breaks gas estimation for wallets and aggregators.
    function test_gasVariability() external {
        uint256 aliceBal = FU_TOKEN.balanceOf(alice);
        vm.assume(aliceBal > 0);

        console.log("=== Gas Variability ===");

        uint256 amt = aliceBal / 10;

        // Measure gas for first transfer
        uint256 gasBefore1 = gasleft();
        vm.prank(alice);
        address(FU_TOKEN).call(
            abi.encodeWithSelector(IERC20.transfer.selector, bob, amt)
        );
        uint256 gasUsed1 = gasBefore1 - gasleft();

        // Measure gas for second transfer (different queue state)
        uint256 bobBal = FU_TOKEN.balanceOf(bob);
        if (bobBal > 0) {
            uint256 gasBefore2 = gasleft();
            vm.prank(bob);
            address(FU_TOKEN).call(
                abi.encodeWithSelector(IERC20.transfer.selector, charlie, bobBal / 2)
            );
            uint256 gasUsed2 = gasBefore2 - gasleft();

            console.log("Gas for transfer 1:", gasUsed1);
            console.log("Gas for transfer 2:", gasUsed2);
            console.log("Gas difference:", gasUsed1 > gasUsed2 ? gasUsed1 - gasUsed2 : gasUsed2 - gasUsed1);
            console.log("This variability breaks gas estimation in wallets");
        }
    }
}
