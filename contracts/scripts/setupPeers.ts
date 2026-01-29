import { ethers, network } from "hardhat";
import { LZ_EID } from "../hardhat.config";
import * as fs from "fs";
import * as path from "path";

/**
 * Script to set up peer connections between OFT tokens on different chains
 * This is required for cross-chain token transfers
 * 
 * Usage:
 * TOKEN_ADDRESS=0x... PEER_NETWORK=mumbai npx hardhat run scripts/setupPeers.ts --network sepolia
 */

interface DeploymentInfo {
  network: string;
  chainId: number;
  lzEid: number;
  factoryAddress: string;
  lzEndpoint: string;
  deployedAt: string;
  deployer: string;
}

async function main() {
  const currentNetwork = network.name;
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const peerNetwork = process.env.PEER_NETWORK;
  const peerTokenAddress = process.env.PEER_TOKEN_ADDRESS;

  if (!tokenAddress || !peerNetwork || !peerTokenAddress) {
    console.log(`
📖 Usage:
   TOKEN_ADDRESS=0x... PEER_NETWORK=mumbai PEER_TOKEN_ADDRESS=0x... npx hardhat run scripts/setupPeers.ts --network sepolia

📋 This script sets up peer connections between OFT tokens on different chains.
   After deploying your OFT token on multiple chains, run this script to enable cross-chain transfers.

Example:
   1. Deploy token on Sepolia: Returns address 0xAAA...
   2. Deploy token on Mumbai: Returns address 0xBBB...
   3. Set peer on Sepolia:
      TOKEN_ADDRESS=0xAAA PEER_NETWORK=mumbai PEER_TOKEN_ADDRESS=0xBBB npx hardhat run scripts/setupPeers.ts --network sepolia
   4. Set peer on Mumbai:
      TOKEN_ADDRESS=0xBBB PEER_NETWORK=sepolia PEER_TOKEN_ADDRESS=0xAAA npx hardhat run scripts/setupPeers.ts --network mumbai
    `);
    return;
  }

  console.log(`\n🔗 Setting up peer connection...\n`);
  console.log(`📍 Current Network: ${currentNetwork}`);
  console.log(`📍 Token Address: ${tokenAddress}`);
  console.log(`📍 Peer Network: ${peerNetwork}`);
  console.log(`📍 Peer Token Address: ${peerTokenAddress}`);

  // Get peer EID
  const peerEid = LZ_EID[peerNetwork];
  if (!peerEid) {
    throw new Error(`No LayerZero EID found for network: ${peerNetwork}`);
  }
  console.log(`📍 Peer EID: ${peerEid}`);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`👤 Signer: ${signer.address}\n`);

  // Get token contract
  const LaunchpadOFT = await ethers.getContractFactory("LaunchpadOFT");
  const token = LaunchpadOFT.attach(tokenAddress);

  // Convert peer address to bytes32
  const peerBytes32 = ethers.zeroPadValue(peerTokenAddress, 32);
  console.log(`📦 Peer address (bytes32): ${peerBytes32}`);

  // Set peer
  console.log(`\n⏳ Setting peer...`);
  const tx = await token.setPeer(peerEid, peerBytes32);
  console.log(`📤 Transaction sent: ${tx.hash}`);
  
  await tx.wait();
  console.log(`✅ Peer set successfully!\n`);

  // Verify peer was set
  const storedPeer = await token.peers(peerEid);
  console.log(`🔍 Verified peer for EID ${peerEid}: ${storedPeer}`);

  console.log(`\n✨ Peer setup complete!`);
  console.log(`   Tokens on ${currentNetwork} can now send to ${peerNetwork}`);
  console.log(`\n⚠️  Don't forget to set the reverse peer on ${peerNetwork}!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
