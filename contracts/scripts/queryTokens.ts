import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractAt("OFTFactory", "0xfE955CC21241aB7bdE6B3406794F481646048CC0");
  const count = await factory.getDeployedTokensCount();
  console.log("Token count:", count.toString());
  for (let i = 0; i < Number(count); i++) {
    const info = await factory.getTokenInfo(i);
    console.log(`Token ${i}: ${info.tokenAddress} | ${info.name} (${info.symbol}) | Supply: ${ethers.formatEther(info.initialSupply)}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error(error); process.exit(1); });
