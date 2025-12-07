import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Token", function () {
  const INITIAL_SUPPLY = hre.ethers.parseEther("1000000");

  async function deployFixture() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();
    const Token = await hre.ethers.getContractFactory("Token");
    const token = await Token.deploy("Test Token", "TST", INITIAL_SUPPLY);
    return { token, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should deploy with correct supply", async function () {
      const { token, owner } = await loadFixture(deployFixture);
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should set correct metadata", async function () {
      const { token } = await loadFixture(deployFixture);
      expect(await token.name()).to.equal("Test Token");
      expect(await token.symbol()).to.equal("TST");
      expect(await token.decimals()).to.equal(18);
    });

    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployFixture);
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, owner, addr1 } = await loadFixture(deployFixture);
      const amount = hre.ethers.parseEther("100");

      await token.transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - amount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { token, addr1, addr2 } = await loadFixture(deployFixture);
      await expect(
        token.connect(addr1).transfer(addr2.address, 1)
      ).to.be.reverted;
    });

    it("Should update allowances on approve", async function () {
      const { token, owner, addr1 } = await loadFixture(deployFixture);
      const amount = hre.ethers.parseEther("100");

      await token.approve(addr1.address, amount);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(amount);
    });

    it("Should transfer using transferFrom", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(deployFixture);
      const amount = hre.ethers.parseEther("100");

      await token.approve(addr1.address, amount);
      await token.connect(addr1).transferFrom(owner.address, addr2.address, amount);
      
      expect(await token.balanceOf(addr2.address)).to.equal(amount);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint", async function () {
      const { token, addr1 } = await loadFixture(deployFixture);
      const mintAmount = hre.ethers.parseEther("500");

      await token.mint(addr1.address, mintAmount);
      
      expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY + mintAmount);
    });

    it("Should revert if non-owner tries to mint", async function () {
      const { token, addr1, addr2 } = await loadFixture(deployFixture);
      await expect(
        token.connect(addr1).mint(addr2.address, 100)
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      const { token, owner } = await loadFixture(deployFixture);
      const burnAmount = hre.ethers.parseEther("100");

      await token.burn(burnAmount);
      
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - burnAmount);
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY - burnAmount);
    });

    it("Should revert if burning more than balance", async function () {
      const { token, addr1 } = await loadFixture(deployFixture);
      await expect(
        token.connect(addr1).burn(100)
      ).to.be.reverted;
    });
  });
});
