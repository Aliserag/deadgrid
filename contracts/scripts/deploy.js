const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting DeadGrid deployment on Base testnet...");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Verify we're on Base testnet
  if (network.chainId !== 84532n) {
    console.warn("⚠️  Warning: Not deploying on Base Sepolia testnet (84532)");
  }

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no ETH. Please fund your account first.");
  }

  // Deploy DeadGrid contract
  console.log("\n📦 Deploying DeadGrid contract...");
  const DeadGrid = await ethers.getContractFactory("DeadGrid");
  
  // Deploy with no constructor parameters
  const deployTx = await DeadGrid.deploy();
  
  console.log(`⏳ Transaction hash: ${deployTx.deploymentTransaction().hash}`);
  
  // Wait for deployment
  await deployTx.waitForDeployment();
  const contractAddress = await deployTx.getAddress();
  
  console.log(`✅ DeadGrid deployed to: ${contractAddress}`);
  
  // Get deployment transaction details
  const deploymentTx = deployTx.deploymentTransaction();
  const receipt = await deploymentTx.wait();
  
  console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
  console.log(`💸 Gas price: ${ethers.formatUnits(receipt.gasPrice, "gwei")} gwei`);
  console.log(`💰 Deployment cost: ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} ETH`);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    deployerAddress: deployerAddress,
    transactionHash: deploymentTx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    gasPrice: receipt.gasPrice.toString(),
    deploymentCost: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
    timestamp: new Date().toISOString(),
    contractName: "DeadGrid",
    contractSymbol: "DGS"
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `base-sepolia-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${deploymentFile}`);

  // Contract verification
  if (network.chainId === 84532n) { // Base Sepolia
    console.log("\n🔍 Waiting before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    try {
      console.log("🔍 Verifying contract on BaseScan...");
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      console.log("💡 You can verify manually at: https://sepolia.basescan.org/verifyContract");
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log(`🔗 View on BaseScan: https://sepolia.basescan.org/address/${contractAddress}`);
  console.log(`📋 Contract Address: ${contractAddress}`);
  
  return {
    contractAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 