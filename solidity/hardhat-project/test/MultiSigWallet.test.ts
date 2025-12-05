import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MultiSigWallet } from "../typechain-types";

describe("MultiSigWallet", function () {
  const THRESHOLD = 2;
  const INITIAL_BALANCE = ethers.parseEther("10");

  async function deployMultiSigFixture() {
    const [owner1, owner2, owner3, nonOwner, recipient] = await ethers.getSigners();
    const owners = [owner1.address, owner2.address, owner3.address];

    const MultiSigFactory = await ethers.getContractFactory("MultiSigWallet");
    const wallet = await MultiSigFactory.deploy(owners, THRESHOLD);

    // Fund the wallet
    await owner1.sendTransaction({
      to: await wallet.getAddress(),
      value: INITIAL_BALANCE,
    });

    return { wallet, owner1, owner2, owner3, nonOwner, recipient };
  }

  describe("Deployment", function () {
    it("Should set owners correctly", async function () {
      const { wallet, owner1, owner2, owner3 } = await loadFixture(deployMultiSigFixture);

      expect(await wallet.isOwner(owner1.address)).to.be.true;
      expect(await wallet.isOwner(owner2.address)).to.be.true;
      expect(await wallet.isOwner(owner3.address)).to.be.true;
    });

    it("Should set threshold correctly", async function () {
      const { wallet } = await loadFixture(deployMultiSigFixture);
      expect(await wallet.threshold()).to.equal(THRESHOLD);
    });

    it("Should revert with empty owners", async function () {
      const MultiSigFactory = await ethers.getContractFactory("MultiSigWallet");
      await expect(MultiSigFactory.deploy([], 1))
        .to.be.revertedWithCustomError({ interface: MultiSigFactory.interface } as any, "MultiSig__InvalidOwnerCount");
    });

    it("Should revert with invalid threshold", async function () {
      const [owner1, owner2] = await ethers.getSigners();
      const MultiSigFactory = await ethers.getContractFactory("MultiSigWallet");

      await expect(MultiSigFactory.deploy([owner1.address, owner2.address], 0))
        .to.be.revertedWithCustomError({ interface: MultiSigFactory.interface } as any, "MultiSig__InvalidThreshold");

      await expect(MultiSigFactory.deploy([owner1.address, owner2.address], 3))
        .to.be.revertedWithCustomError({ interface: MultiSigFactory.interface } as any, "MultiSig__InvalidThreshold");
    });

    it("Should revert with duplicate owner", async function () {
      const [owner1] = await ethers.getSigners();
      const MultiSigFactory = await ethers.getContractFactory("MultiSigWallet");

      await expect(MultiSigFactory.deploy([owner1.address, owner1.address], 1))
        .to.be.revertedWithCustomError({ interface: MultiSigFactory.interface } as any, "MultiSig__DuplicateOwner");
    });
  });

  describe("Submit Transaction", function () {
    it("Should submit a transaction", async function () {
      const { wallet, owner1, recipient } = await loadFixture(deployMultiSigFixture);
      const value = ethers.parseEther("1");

      await wallet.connect(owner1).submitTransaction(recipient.address, value, "0x");

      expect(await wallet.getTransactionCount()).to.equal(1);

      const tx = await wallet.getTransaction(0);
      expect(tx.to).to.equal(recipient.address);
      expect(tx.value).to.equal(value);
      expect(tx.executed).to.be.false;
      expect(tx.numConfirmations).to.equal(0);
    });

    it("Should emit SubmitTransaction event", async function () {
      const { wallet, owner1, recipient } = await loadFixture(deployMultiSigFixture);
      const value = ethers.parseEther("1");

      await expect(wallet.connect(owner1).submitTransaction(recipient.address, value, "0x"))
        .to.emit(wallet, "SubmitTransaction")
        .withArgs(owner1.address, 0, recipient.address, value, "0x");
    });

    it("Should revert when non-owner submits", async function () {
      const { wallet, nonOwner, recipient } = await loadFixture(deployMultiSigFixture);

      await expect(wallet.connect(nonOwner).submitTransaction(recipient.address, 0, "0x"))
        .to.be.revertedWithCustomError(wallet, "MultiSig__NotOwner");
    });
  });

  describe("Confirm Transaction", function () {
    it("Should confirm a transaction", async function () {
      const { wallet, owner1, recipient } = await loadFixture(deployMultiSigFixture);

      await wallet.connect(owner1).submitTransaction(recipient.address, ethers.parseEther("1"), "0x");
      await wallet.connect(owner1).confirmTransaction(0);

      expect(await wallet.isConfirmed(0, owner1.address)).to.be.true;
      const tx = await wallet.getTransaction(0);
      expect(tx.numConfirmations).to.equal(1);
    });

    it("Should emit ConfirmTransaction event", async function () {
      const { wallet, owner1, recipient } = await loadFixture(deployMultiSigFixture);

      await wallet.connect(owner1).submitTransaction(recipient.address, ethers.parseEther("1"), "0x");

      await expect(wallet.connect(owner1).confirmTransaction(0))
        .to.emit(wallet, "ConfirmTransaction")
        .withArgs(owner1.address, 0);
    });

    it("Should revert on double confirmation", async function () {
      const { wallet, owner1, recipient } = await loadFixture(deployMultiSigFixture);

      await wallet.connect(owner1).submitTransaction(recipient.address, ethers.parseEther("1"), "0x");
      await wallet.connect(owner1).confirmTransaction(0);

      await expect(wallet.connect(owner1).confirmTransaction(0))
        .to.be.revertedWithCustomError(wallet, "MultiSig__TxAlreadyConfirmed");
    });
  });

  describe("Execute Transaction", function () {
    it("Should execute a transaction with enough confirmations", async function () {
      const { wallet, owner1, owner2, recipient } = await loadFixture(deployMultiSigFixture);
      const value = ethers.parseEther("1");

      const recipientBalanceBefore = await ethers.provider.getBalance(recipient.address);

      await wallet.connect(owner1).submitTransaction(recipient.address, value, "0x");
      await wallet.connect(owner1).confirmTransaction(0);
      await wallet.connect(owner2).confirmTransaction(0);
      await wallet.connect(owner1).executeTransaction(0);

      const recipientBalanceAfter = await ethers.provider.getBalance(recipient.address);
      expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(value);

      const tx = await wallet.getTransaction(0);
      expect(tx.executed).to.be.true;
    });

    it("Should emit ExecuteTransaction event", async function () {
      const { wallet, owner1, owner2, recipient } = await loadFixture(deployMultiSigFixture);
      const value = ethers.parseEther("1");

      await wallet.connect(owner1).submitTransaction(recipient.address, value, "0x");
      await wallet.connect(owner1).confirmTransaction(0);
      await wallet.connect(owner2).confirmTransaction(0);

      await expect(wallet.connect(owner1).executeTransaction(0))
        .to.emit(wallet, "ExecuteTransaction")
        .withArgs(owner1.address, 0);
    });

    it("Should revert with insufficient confirmations", async function () {
      const { wallet, owner1, recipient } = await loadFixture(deployMultiSigFixture);

      await wallet.connect(owner1).submitTransaction(recipient.address, ethers.parseEther("1"), "0x");
      await wallet.connect(owner1).confirmTransaction(0);
      // Only 1 confirmation, need 2

      await expect(wallet.connect(owner1).executeTransaction(0))
        .to.be.revertedWithCustomError(wallet, "MultiSig__InsufficientConfirmations");
    });

    it("Should revert on double execution", async function () {
      const { wallet, owner1, owner2, recipient } = await loadFixture(deployMultiSigFixture);

      await wallet.connect(owner1).submitTransaction(recipient.address, ethers.parseEther("1"), "0x");
      await wallet.connect(owner1).confirmTransaction(0);
      await wallet.connect(owner2).confirmTransaction(0);
      await wallet.connect(owner1).executeTransaction(0);

      await expect(wallet.connect(owner1).executeTransaction(0))
        .to.be.revertedWithCustomError(wallet, "MultiSig__TxAlreadyExecuted");
    });
  });

  describe("Revoke Confirmation", function () {
    it("Should revoke a confirmation", async function () {
      const { wallet, owner1, recipient } = await loadFixture(deployMultiSigFixture);

      await wallet.connect(owner1).submitTransaction(recipient.address, ethers.parseEther("1"), "0x");
      await wallet.connect(owner1).confirmTransaction(0);
      await wallet.connect(owner1).revokeConfirmation(0);

      expect(await wallet.isConfirmed(0, owner1.address)).to.be.false;
      const tx = await wallet.getTransaction(0);
      expect(tx.numConfirmations).to.equal(0);
    });

    it("Should emit RevokeConfirmation event", async function () {
      const { wallet, owner1, recipient } = await loadFixture(deployMultiSigFixture);

      await wallet.connect(owner1).submitTransaction(recipient.address, ethers.parseEther("1"), "0x");
      await wallet.connect(owner1).confirmTransaction(0);

      await expect(wallet.connect(owner1).revokeConfirmation(0))
        .to.emit(wallet, "RevokeConfirmation")
        .withArgs(owner1.address, 0);
    });
  });

  describe("Receive ETH", function () {
    it("Should receive ETH and emit Deposit event", async function () {
      const { wallet, nonOwner } = await loadFixture(deployMultiSigFixture);
      const value = ethers.parseEther("1");

      await expect(nonOwner.sendTransaction({
        to: await wallet.getAddress(),
        value: value,
      }))
        .to.emit(wallet, "Deposit")
        .withArgs(nonOwner.address, value, INITIAL_BALANCE + value);
    });
  });

  describe("View Functions", function () {
    it("Should return owners", async function () {
      const { wallet, owner1, owner2, owner3 } = await loadFixture(deployMultiSigFixture);

      const owners = await wallet.getOwners();
      expect(owners).to.deep.equal([owner1.address, owner2.address, owner3.address]);
    });

    it("Should return transaction count", async function () {
      const { wallet, owner1, recipient } = await loadFixture(deployMultiSigFixture);

      expect(await wallet.getTransactionCount()).to.equal(0);

      await wallet.connect(owner1).submitTransaction(recipient.address, 0, "0x");
      expect(await wallet.getTransactionCount()).to.equal(1);
    });
  });
});
