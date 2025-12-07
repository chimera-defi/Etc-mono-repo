import { expect } from "chai";
import hre from "hardhat";

/**
 * Hardhat Integration Tests
 * 
 * These tests verify deployment works correctly.
 * For comprehensive unit/fuzz testing, use Foundry: `forge test`
 * 
 * Run with: `npm run test:hardhat` or `npx hardhat test`
 */
describe("Deployment Integration Tests", function () {
  describe("Token", function () {
    it("Should deploy with correct parameters", async function () {
      const [owner] = await hre.ethers.getSigners();
      const initialSupply = hre.ethers.parseEther("1000000");
      
      const Token = await hre.ethers.getContractFactory("Token");
      const token = await Token.deploy("TestToken", "TST", initialSupply);
      
      expect(await token.name()).to.equal("TestToken");
      expect(await token.symbol()).to.equal("TST");
      expect(await token.totalSupply()).to.equal(initialSupply);
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("NFT", function () {
    it("Should deploy with correct parameters", async function () {
      const [owner] = await hre.ethers.getSigners();
      
      const NFT = await hre.ethers.getContractFactory("NFT");
      const nft = await NFT.deploy("TestNFT", "TNFT", "https://api.example.com/");
      
      expect(await nft.name()).to.equal("TestNFT");
      expect(await nft.symbol()).to.equal("TNFT");
      expect(await nft.totalMinted()).to.equal(0);
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should mint and return correct tokenURI", async function () {
      const [owner, addr1] = await hre.ethers.getSigners();
      
      const NFT = await hre.ethers.getContractFactory("NFT");
      const nft = await NFT.deploy("TestNFT", "TNFT", "https://api.example.com/");
      
      await nft.mint(addr1.address);
      
      expect(await nft.tokenURI(0)).to.equal("https://api.example.com/0");
      expect(await nft.ownerOf(0)).to.equal(addr1.address);
    });
  });
});
