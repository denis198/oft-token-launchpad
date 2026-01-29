import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Script to create a new OFT token via the factory
 * 
 * Usage:
 * TOKEN_NAME="My Token" TOKEN_SYMBOL="MTK" INITIAL_SUPPLY=1000000 npx hardhat run scripts/createToken.ts --network sepolia
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
  const tokenName = process.env.TOKEN_NAME || "Test Token";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "TEST";
  const initialSupply = process.env.INITIAL_SUPPLY || "1000000"; // in whole tokens

  console.log(`\n🪙 Creating new OFT token on ${currentNetwork}...\n`);
  console.log(`📋 Token Name: ${tokenName}`);
  console.log(`📋 Token Symbol: ${tokenSymbol}`);
  console.log(`📋 Initial Supply: ${initialSupply} tokens`);

  // Load factory deployment
  const deploymentsDir = path.join(__dirname, "../deployments");
  const deploymentPath = path.join(deploymentsDir, `${currentNetwork}.json`);

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found for network: ${currentNetwork}. Run deploy.ts first.`);
  }

  const deployment: DeploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  console.log(`📍 Factory Address: ${deployment.factoryAddress}`);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`👤 Creator: ${signer.address}`);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Get factory contract
  const OFTFactory = await ethers.getContractFactory("OFTFactory");
  const factory = OFTFactory.attach(deployment.factoryAddress);

  // Calculate initial supply in wei (18 decimals)
  const initialSupplyWei = ethers.parseEther(initialSupply);
  console.log(`📊 Initial Supply (wei): ${initialSupplyWei.toString()}`);

  // Create token
  console.log(`\n⏳ Creating token...`);
  const tx = await factory.createToken(tokenName, tokenSymbol, initialSupplyWei);
  console.log(`📤 Transaction sent: ${tx.hash}`);

  const receipt = await tx.wait();
  
  // Get token address from event
  const event = receipt?.logs.find((log: any) => {
    try {
      const parsed = factory.interface.parseLog({ topics: log.topics as string[], data: log.data });
      return parsed?.name === "TokenCreated";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = factory.interface.parseLog({ topics: event.topics as string[], data: event.data });
    const tokenAddress = parsed?.args?.tokenAddress;
    
    console.log(`\n✅ Token created successfully!`);
    console.log(`📍 Token Address: ${tokenAddress}`);
    console.log(`\n📋 Token Details:`);
    console.log(`   Name: ${tokenName}`);
    console.log(`   Symbol: ${tokenSymbol}`);
    console.log(`   Initial Supply: ${initialSupply} ${tokenSymbol}`);
    console.log(`   Creator: ${signer.address}`);

    // Save token info
    const tokensDir = path.join(deploymentsDir, "tokens");
    if (!fs.existsSync(tokensDir)) {
      fs.mkdirSync(tokensDir, { recursive: true });
    }

    const tokenInfo = {
      network: currentNetwork,
      address: tokenAddress,
      name: tokenName,
      symbol: tokenSymbol,
      initialSupply: initialSupply,
      creator: signer.address,
      createdAt: new Date().toISOString(),
      factoryAddress: deployment.factoryAddress,
    };

    const tokenPath = path.join(tokensDir, `${tokenSymbol}-${currentNetwork}.json`);
    fs.writeFileSync(tokenPath, JSON.stringify(tokenInfo, null, 2));
    console.log(`\n📁 Token info saved to: ${tokenPath}`);

    console.log(`\n📋 Next steps:`);
    console.log(`1. Deploy the same token on other chains`);
    console.log(`2. Run setupPeers.ts to connect tokens across chains`);
    console.log(`3. Start bridging tokens!`);
  } else {
    console.log(`\n⚠️ Token created but couldn't parse event. Check transaction: ${tx.hash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
