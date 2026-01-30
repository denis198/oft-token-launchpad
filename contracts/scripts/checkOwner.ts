import { ethers } from "hardhat";

async function main() {
  const token = await ethers.getContractAt("LaunchpadOFT", "0x4232F3Be6a8A7a04F7dA7baab7a594FaE00328dC");
  const owner = await token.owner();
  const creator = await token.creator();
  const [signer] = await ethers.getSigners();
  console.log("Token owner:", owner);
  console.log("Token creator:", creator);
  console.log("Current signer:", signer.address);
  console.log("Signer is owner:", owner.toLowerCase() === signer.address.toLowerCase());
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
