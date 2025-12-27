// Query Aztec L2 Devnet using AztecJS
import { createAztecNodeClient } from '@aztec/aztec.js';

const DEVNET_URL = 'https://next.devnet.aztec-labs.com';

async function main() {
  console.log('Connecting to Aztec devnet...');

  try {
    const node = createAztecNodeClient(DEVNET_URL);

    // Get node info
    console.log('\n=== Node Info ===');
    const nodeInfo = await node.getNodeInfo();
    console.log('Node Version:', nodeInfo.nodeVersion);
    console.log('L1 Chain ID:', nodeInfo.l1ChainId);
    console.log('Rollup Version:', nodeInfo.rollupVersion);

    // Get L2 tips
    console.log('\n=== L2 Tips ===');
    const tips = await node.getL2Tips();
    console.log('Latest Block:', tips.latest.number);
    console.log('Proven Block:', tips.proven.number);
    console.log('Finalized Block:', tips.finalized.number);

    // Get a block header
    console.log('\n=== Latest Block Header ===');
    const block = await node.getBlock(tips.latest.number);
    if (block) {
      console.log('Block Number:', block.header.globalVariables.blockNumber);
      console.log('Timestamp:', block.header.globalVariables.timestamp.toString());
      console.log('Slot:', block.header.globalVariables.slotNumber.toString());
      console.log('Fee Per L2 Gas:', block.header.globalVariables.gasFees.feePerL2Gas.toString());
    }

    // Get L1 contract addresses
    console.log('\n=== L1 Contract Addresses ===');
    const l1Contracts = await node.getL1ContractAddresses();
    console.log('Rollup:', l1Contracts.rollupAddress.toString());
    console.log('Staking Asset:', l1Contracts.stakingAssetAddress.toString());
    console.log('Fee Juice:', l1Contracts.feeJuiceAddress.toString());
    console.log('Reward Distributor:', l1Contracts.rewardDistributorAddress.toString());

    // Get protocol contract addresses
    console.log('\n=== Protocol Contract Addresses (L2) ===');
    const protocolContracts = await node.getProtocolContractAddresses();
    console.log('Class Registry:', protocolContracts.classRegistry.toString());
    console.log('Instance Registry:', protocolContracts.instanceRegistry.toString());
    console.log('Fee Juice:', protocolContracts.feeJuice.toString());
    console.log('MultiCall Entrypoint:', protocolContracts.multiCallEntrypoint.toString());

    console.log('\n=== Done ===');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

main().catch(console.error);
