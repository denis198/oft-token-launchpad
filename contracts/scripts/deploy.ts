import { ethers, network } from "hardhat";
import { LZ_ENDPOINTS, LZ_EID } from "../hardhat.config";
import * as fs from "fs";
import * as path from "path";

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
  const networkName = network.name;
  
  console.log(`\n🚀 Deploying OFTFactory to ${networkName}...\n`);

  // Get LayerZero endpoint for current network
  const lzEndpoint = LZ_ENDPOINTS[networkName];
  const lzEid = LZ_EID[networkName];

  if (!lzEndpoint) {
    throw new Error(`No LayerZero endpoint configured for network: ${networkName}`);
  }

  console.log(`📍 LayerZero Endpoint: ${lzEndpoint}`);
  console.log(`📍 LayerZero EID: ${lzEid}`);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Deploy OFTFactory
  console.log("📦 Deploying OFTFactory...");
  const OFTFactory = await ethers.getContractFactory("OFTFactory");
  const factory = await OFTFactory.deploy(lzEndpoint);
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log(`✅ OFTFactory deployed to: ${factoryAddress}\n`);

  // Save deployment info
  const deploymentInfo: DeploymentInfo = {
    network: networkName,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    lzEid: lzEid,
    factoryAddress: factoryAddress,
    lzEndpoint: lzEndpoint,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📁 Deployment info saved to: ${deploymentPath}`);

  // Also update the combined deployments file
  const allDeploymentsPath = path.join(deploymentsDir, "all.json");
  let allDeployments: Record<string, DeploymentInfo> = {};
  
  if (fs.existsSync(allDeploymentsPath)) {
    allDeployments = JSON.parse(fs.readFileSync(allDeploymentsPath, "utf-8"));
  }
  
  allDeployments[networkName] = deploymentInfo;
  fs.writeFileSync(allDeploymentsPath, JSON.stringify(allDeployments, null, 2));
  
  console.log(`\n✨ Deployment complete!\n`);
  console.log("Next steps:");
  console.log("1. Deploy to other networks");
  console.log("2. Run setupPeers.ts to connect factories");
  console.log(`3. Verify contract: npx hardhat verify --network ${networkName} ${factoryAddress} ${lzEndpoint}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
