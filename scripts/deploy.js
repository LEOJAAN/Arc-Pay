const hre = require("hardhat");

async function main() {
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

  console.log("=========================================");
  console.log("Arc Payroll Smart Contract Deployment");
  console.log("=========================================");
  console.log("Target network: Arc Testnet");
  console.log(`USDC Address:   ${USDC_ADDRESS}`);

  const [deployer] = await hre.ethers.getSigners();
  if (deployer) {
    console.log(`Deploying with: ${deployer.address}`);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Deployer ETH Balance: ${hre.ethers.formatEther(balance)} ETH`);
  } else {
    console.log("No deployer signer found. Ensure PRIVATE_KEY is set in your environment.");
    process.exit(1);
  }

  // Get the ContractFactory
  const ArcPayroll = await hre.ethers.getContractFactory("ArcPayroll");
  
  console.log("\nDeploying ArcPayroll contract...");
  const payroll = await ArcPayroll.deploy(USDC_ADDRESS);

  console.log("Waiting for deployment transaction to be mined...");
  await payroll.waitForDeployment();

  const contractAddress = await payroll.getAddress();
  console.log(`\nSuccess! ArcPayroll deployed to: ${contractAddress}`);
  console.log("=========================================");
}

main().catch((error) => {
  console.error("\nDeployment failed with error:");
  console.error(error);
  process.exitCode = 1;
});
