import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy MockERC20
  console.log("\n--- Deploying MockERC20 ---");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const token = await MockERC20.deploy("Test Token", "TEST");
  await token.waitForDeployment();
  console.log("MockERC20 deployed to:", await token.getAddress());

  // Deploy Vault
  console.log("\n--- Deploying Vault ---");
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(await token.getAddress());
  await vault.waitForDeployment();
  console.log("Vault deployed to:", await vault.getAddress());

  // Deploy MultiSigWallet with deployer as sole owner
  console.log("\n--- Deploying MultiSigWallet ---");
  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  const wallet = await MultiSigWallet.deploy([deployer.address], 1);
  await wallet.waitForDeployment();
  console.log("MultiSigWallet deployed to:", await wallet.getAddress());

  console.log("\n=== Deployment Complete ===");
  console.log("Token:", await token.getAddress());
  console.log("Vault:", await vault.getAddress());
  console.log("MultiSig:", await wallet.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
