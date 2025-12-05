import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Vault, MockERC20 } from "../typechain-types";

describe("Vault", function () {
  const INITIAL_BALANCE = ethers.parseEther("1000");

  async function deployVaultFixture() {
    const [admin, alice, bob] = await ethers.getSigners();

    // Deploy MockERC20
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    const token = await MockERC20Factory.deploy("Test Token", "TEST");

    // Deploy Vault
    const VaultFactory = await ethers.getContractFactory("Vault");
    const vault = await VaultFactory.deploy(await token.getAddress());

    // Setup initial balances
    await token.mint(alice.address, INITIAL_BALANCE);
    await token.mint(bob.address, INITIAL_BALANCE);

    // Approve vault
    await token.connect(alice).approve(await vault.getAddress(), ethers.MaxUint256);
    await token.connect(bob).approve(await vault.getAddress(), ethers.MaxUint256);

    return { vault, token, admin, alice, bob };
  }

  describe("Deployment", function () {
    it("Should set the correct token", async function () {
      const { vault, token } = await loadFixture(deployVaultFixture);
      expect(await vault.token()).to.equal(await token.getAddress());
    });

    it("Should set the correct owner", async function () {
      const { vault, admin } = await loadFixture(deployVaultFixture);
      expect(await vault.owner()).to.equal(admin.address);
    });
  });

  describe("Deposit", function () {
    it("Should deposit tokens correctly", async function () {
      const { vault, token, alice } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseEther("100");

      await vault.connect(alice).deposit(depositAmount);

      expect(await vault.shares(alice.address)).to.equal(depositAmount);
      expect(await vault.totalShares()).to.equal(depositAmount);
      expect(await token.balanceOf(await vault.getAddress())).to.equal(depositAmount);
    });

    it("Should emit Deposit event", async function () {
      const { vault, alice } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseEther("100");

      await expect(vault.connect(alice).deposit(depositAmount))
        .to.emit(vault, "Deposit")
        .withArgs(alice.address, depositAmount, depositAmount);
    });

    it("Should revert on zero deposit", async function () {
      const { vault, alice } = await loadFixture(deployVaultFixture);

      await expect(vault.connect(alice).deposit(0))
        .to.be.revertedWithCustomError(vault, "Vault__ZeroAmount");
    });
  });

  describe("Withdraw", function () {
    it("Should withdraw tokens correctly", async function () {
      const { vault, token, alice } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseEther("100");

      await vault.connect(alice).deposit(depositAmount);

      const balanceBefore = await token.balanceOf(alice.address);
      await vault.connect(alice).withdraw(depositAmount);

      expect(await vault.shares(alice.address)).to.equal(0);
      expect(await vault.totalShares()).to.equal(0);
      expect(await token.balanceOf(alice.address)).to.equal(balanceBefore + depositAmount);
    });

    it("Should emit Withdraw event", async function () {
      const { vault, alice } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseEther("100");

      await vault.connect(alice).deposit(depositAmount);

      await expect(vault.connect(alice).withdraw(depositAmount))
        .to.emit(vault, "Withdraw")
        .withArgs(alice.address, depositAmount, depositAmount);
    });

    it("Should revert on zero withdrawal", async function () {
      const { vault, alice } = await loadFixture(deployVaultFixture);

      await expect(vault.connect(alice).withdraw(0))
        .to.be.revertedWithCustomError(vault, "Vault__ZeroAmount");
    });

    it("Should revert when withdrawing more than balance", async function () {
      const { vault, alice } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseEther("100");

      await vault.connect(alice).deposit(depositAmount);

      await expect(vault.connect(alice).withdraw(depositAmount * 2n))
        .to.be.revertedWithCustomError(vault, "Vault__InsufficientBalance");
    });
  });

  describe("Multiple Depositors", function () {
    it("Should handle multiple depositors correctly", async function () {
      const { vault, alice, bob } = await loadFixture(deployVaultFixture);
      const aliceDeposit = ethers.parseEther("100");
      const bobDeposit = ethers.parseEther("100");

      await vault.connect(alice).deposit(aliceDeposit);
      await vault.connect(bob).deposit(bobDeposit);

      expect(await vault.shares(alice.address)).to.equal(aliceDeposit);
      expect(await vault.shares(bob.address)).to.equal(bobDeposit);
      expect(await vault.totalShares()).to.equal(aliceDeposit + bobDeposit);
    });
  });

  describe("Emergency Withdraw", function () {
    it("Should allow owner to emergency withdraw", async function () {
      const { vault, token, admin, alice } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseEther("100");

      await vault.connect(alice).deposit(depositAmount);

      const adminBalanceBefore = await token.balanceOf(admin.address);
      await vault.connect(admin).emergencyWithdraw();

      expect(await token.balanceOf(admin.address)).to.equal(adminBalanceBefore + depositAmount);
    });

    it("Should emit EmergencyWithdraw event", async function () {
      const { vault, admin, alice } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseEther("100");

      await vault.connect(alice).deposit(depositAmount);

      await expect(vault.connect(admin).emergencyWithdraw())
        .to.emit(vault, "EmergencyWithdraw")
        .withArgs(admin.address, depositAmount);
    });

    it("Should revert when non-owner calls emergency withdraw", async function () {
      const { vault, alice } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseEther("100");

      await vault.connect(alice).deposit(depositAmount);

      await expect(vault.connect(alice).emergencyWithdraw())
        .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("Balance Of", function () {
    it("Should return correct balance", async function () {
      const { vault, alice } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseEther("100");

      await vault.connect(alice).deposit(depositAmount);

      expect(await vault.balanceOf(alice.address)).to.equal(depositAmount);
    });

    it("Should return 0 for user with no shares", async function () {
      const { vault, bob } = await loadFixture(deployVaultFixture);

      expect(await vault.balanceOf(bob.address)).to.equal(0);
    });
  });
});
