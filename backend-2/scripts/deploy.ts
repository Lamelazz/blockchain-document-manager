import { ethers } from "hardhat";

async function main() {
  const Vault = await ethers.getContractFactory("DocumentVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();

  console.log("📌 CONTRACT_ADDRESS =", await vault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
