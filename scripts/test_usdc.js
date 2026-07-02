const hre = require("hardhat");

async function main() {
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
  const PAYROLL_ADDRESS = "0x24E9cBc99ab4D696F7Ad9fFA42d15Dc84CE5A006";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Query USDC details
  const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address, address) view returns (uint256)"
  ];

  const usdc = new hre.ethers.Contract(USDC_ADDRESS, abi, deployer);

  try {
    const name = await usdc.name();
    const symbol = await usdc.symbol();
    const decimals = await usdc.decimals();
    const balance = await usdc.balanceOf(deployer.address);
    const allowance = await usdc.allowance(deployer.address, PAYROLL_ADDRESS);

    console.log("USDC Name:", name);
    console.log("USDC Symbol:", symbol);
    console.log("USDC Decimals:", decimals);
    console.log("Deployer USDC Balance:", balance.toString());
    console.log("USDC Allowance to Payroll Contract:", allowance.toString());
  } catch (e) {
    console.error("Error querying USDC details:", e);
  }
}

main().catch(console.error);
