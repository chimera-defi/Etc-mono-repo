import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("NFT", function () {
  const NAME = "Test NFT";
  const SYMBOL = "TNFT";
  const BASE_URI = "https://api.example.com/";

  async function deployFixture() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();
    const NFT = await hre.ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(NAME, SYMBOL, BASE_URI);
    return { nft, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set correct metadata", async function () {
      const { nft } = await loadFixture(deployFixture);
      expect(await nft.name()).to.equal(NAME);
      expect(await nft.symbol()).to.equal(SYMBOL);
    });

    it("Should set the right owner", async function () {
      const { nft, owner } = await loadFixture(deployFixture);
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should start with zero minted", async function () {
      const { nft } = await loadFixture(deployFixture);
      expect(await nft.totalMinted()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint", async function () {
      const { nft, addr1 } = await loadFixture(deployFixture);

      const tx = await nft.mint(addr1.address);
      const receipt = await tx.wait();

      expect(await nft.ownerOf(0)).to.equal(addr1.address);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.totalMinted()).to.equal(1);
    });

    it("Should mint sequential token IDs", async function () {
      const { nft, addr1, addr2 } = await loadFixture(deployFixture);

      await nft.mint(addr1.address);
      await nft.mint(addr1.address);
      await nft.mint(addr2.address);

      expect(await nft.ownerOf(0)).to.equal(addr1.address);
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.ownerOf(2)).to.equal(addr2.address);
      expect(await nft.balanceOf(addr1.address)).to.equal(2);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should revert if non-owner tries to mint", async function () {
      const { nft, addr1, addr2 } = await loadFixture(deployFixture);
      await expect(
        nft.connect(addr1).mint(addr2.address)
      ).to.be.reverted;
    });
  });

  describe("Transfers", function () {
    it("Should transfer NFT between accounts", async function () {
      const { nft, owner, addr1 } = await loadFixture(deployFixture);

      await nft.mint(owner.address);
      await nft.transferFrom(owner.address, addr1.address, 0);

      expect(await nft.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should allow approved operator to transfer", async function () {
      const { nft, owner, addr1, addr2 } = await loadFixture(deployFixture);

      await nft.mint(owner.address);
      await nft.approve(addr1.address, 0);
      await nft.connect(addr1).transferFrom(owner.address, addr2.address, 0);

      expect(await nft.ownerOf(0)).to.equal(addr2.address);
    });

    it("Should revert transfer of non-owned token", async function () {
      const { nft, owner, addr1, addr2 } = await loadFixture(deployFixture);

      await nft.mint(owner.address);
      await expect(
        nft.connect(addr1).transferFrom(owner.address, addr2.address, 0)
      ).to.be.reverted;
    });
  });

  describe("Token URI", function () {
    it("Should return correct tokenURI", async function () {
      const { nft, addr1 } = await loadFixture(deployFixture);

      await nft.mint(addr1.address);
      expect(await nft.tokenURI(0)).to.equal(BASE_URI + "0");
    });

    it("Should return correct tokenURI for multiple tokens", async function () {
      const { nft, addr1 } = await loadFixture(deployFixture);

      await nft.mint(addr1.address);
      await nft.mint(addr1.address);
      await nft.mint(addr1.address);

      expect(await nft.tokenURI(0)).to.equal(BASE_URI + "0");
      expect(await nft.tokenURI(1)).to.equal(BASE_URI + "1");
      expect(await nft.tokenURI(2)).to.equal(BASE_URI + "2");
    });

    it("Should revert for non-existent token", async function () {
      const { nft } = await loadFixture(deployFixture);
      await expect(nft.tokenURI(999)).to.be.reverted;
    });
  });
});
