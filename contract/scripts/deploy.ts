import { ethers } from "hardhat";

async function main() {

  const nft = await ethers.deployContract("BasedBicoNFT");

  await nft.waitForDeployment();

  console.log(
    `deployed to ${nft.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
