import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const INITIAL_SUPPLY = 1_000_000n * 10n ** 18n;
const BASE_URI = "https://api.example.com/";

const DeployModule = buildModule("Deploy", (m) => {
  const token = m.contract("Token", ["MyToken", "MTK", INITIAL_SUPPLY]);
  const nft = m.contract("NFT", ["MyNFT", "MNFT", BASE_URI]);

  return { token, nft };
});

export default DeployModule;
