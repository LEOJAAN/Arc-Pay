const hre = require("hardhat");

async function main() {
  const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
  const PAYROLL_ADDRESS = "0x24E9cBc99ab4D696F7Ad9fFA42d15Dc84CE5A006";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Executor address:", deployer.address);

  // Setup contracts
  const usdcAbi = [
    "function approve(address, uint256) returns (bool)",
    "function allowance(address, address) view returns (uint256)",
    "function balanceOf(address) view returns (uint256)"
  ];
  const usdc = new hre.ethers.Contract(USDC_ADDRESS, usdcAbi, deployer);

  const payrollAbi = [
    "function batchPayEmployees(address[] calldata recipients, uint256[] calldata amounts) external"
  ];
  const payroll = new hre.ethers.Contract(PAYROLL_ADDRESS, payrollAbi, deployer);

  // Define test parameters
  const recipient = "0x1234567890123456789012345678901234567890";
  const amount = 1000000n; // 1 USDC (6 decimals)

  console.log("\n--- Checking Initial Balances ---");
  const balanceBefore = await usdc.balanceOf(deployer.address);
  console.log("Deployer USDC Balance:", balanceBefore.toString());

  console.log("\n--- Step 1: Approve USDC ---");
  const approveTx = await usdc.approve(PAYROLL_ADDRESS, amount);
  console.log("Approve Tx Hash:", approveTx.hash);
  await approveTx.wait();
  console.log("Approve confirmed.");

  const allowance = await usdc.allowance(deployer.address, PAYROLL_ADDRESS);
  console.log("USDC Allowance to Payroll:", allowance.toString());

  console.log("\n--- Step 2: Execute batchPayEmployees ---");
  try {
    const tx = await payroll.batchPayEmployees([recipient], [amount]);
    console.log("Transaction Hash:", tx.hash);
    
    console.log("Waiting for receipt...");
    const receipt = await tx.wait();
    console.log("Transaction status:", receipt.status);

    console.log("\n--- Transaction Logs ---");
    // Interface to parse event logs
    const payrollInterface = new hre.ethers.Interface([
      "event DebugBeforeTransfer(address employee, uint256 amount)",
      "event DebugAfterTransfer(address employee, uint256 amount)",
      "event SalaryPaid(address indexed employee, uint256 amount)",
      "event BatchPayrollExecuted(address indexed executor, uint256 totalAmount, uint256 employeeCount)"
    ]);

    const usdcInterface = new hre.ethers.Interface([
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)"
    ]);

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === PAYROLL_ADDRESS.toLowerCase()) {
        try {
          const parsed = payrollInterface.parseLog(log);
          console.log(`[Payroll Event] ${parsed.name}:`, parsed.args.toObject ? parsed.args.toObject() : parsed.args);
        } catch (e) {
          console.log(`[Payroll Unparsed Log] Address: ${log.address}, Topics: ${log.topics}`);
        }
      } else if (log.address.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
        try {
          const parsed = usdcInterface.parseLog(log);
          console.log(`[USDC Event] ${parsed.name}:`, parsed.args.toObject ? parsed.args.toObject() : parsed.args);
        } catch (e) {
          console.log(`[USDC Unparsed Log] Address: ${log.address}, Topics: ${log.topics}`);
        }
      } else {
        console.log(`[Other Log] Address: ${log.address}`);
      }
    }
  } catch (err) {
    console.error("Execution failed:", err);
  }
}

main().catch(console.error);
