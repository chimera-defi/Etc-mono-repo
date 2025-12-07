import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Main deployment module for the Hybrid project
 * 
 * Usage:
 *   npx hardhat ignition deploy ignition/modules/Deploy.ts --network <network>
 * 
 * This module deploys:
 *   - Token: ERC-20 with 1M initial supply
 *   - NFT: ERC-721 with configurable base URI
 */

const INITIAL_SUPPLY = 1_000_000n * 10n ** 18n; // 1 million tokens
const BASE_URI = "https://api.example.com/metadata/";

const DeployModule = buildModule("Deploy", (m) => {
  // Deploy Token contract
  const token = m.contract("Token", [
    "MyToken",      // name
    "MTK",          // symbol
    INITIAL_SUPPLY, // initialSupply
  ]);

  // Deploy NFT contract
  const nft = m.contract("NFT", [
    "MyNFT",   // name
    "MNFT",    // symbol
    BASE_URI,  // baseURI
  ]);

  return { token, nft };
});

export default DeployModule;
