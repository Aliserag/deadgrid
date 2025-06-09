const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying DeadGridFixed contract to Base Sepolia...");
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    // Get the contract factory
    const DeadGridFixed = await ethers.getContractFactory("DeadGridFixed");
    
    // Estimate deployment gas
    const deploymentData = DeadGridFixed.getDeployTransaction();
    const gasEstimate = await deployer.estimateGas(deploymentData);
    console.log("⛽ Estimated gas for deployment:", gasEstimate.toString());
    
    // Deploy the contract
    console.log("📦 Deploying contract...");
    const deadGrid = await DeadGridFixed.deploy({
        gasLimit: gasEstimate * BigInt(2) // Double the gas estimate for safety
    });
    
    // Wait for deployment
    await deadGrid.waitForDeployment();
    const contractAddress = await deadGrid.getAddress();
    
    console.log("✅ DeadGridFixed deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🌐 Network: Base Sepolia (Chain ID: 84532)");
    console.log("🔗 Explorer:", `https://sepolia.basescan.org/address/${contractAddress}`);
    
    // Test basic functions
    console.log("\n🧪 Testing basic functions...");
    
    try {
        const name = await deadGrid.name();
        const symbol = await deadGrid.symbol();
        const totalSupply = await deadGrid.totalSupply();
        const owner = await deadGrid.owner();
        
        console.log("✅ Name:", name);
        console.log("✅ Symbol:", symbol);
        console.log("✅ Total Supply:", totalSupply.toString());
        console.log("✅ Owner:", owner);
        
        // Test minting
        console.log("\n🎯 Testing survivor creation...");
        const tx = await deadGrid.createSurvivor("TestSurvivor", "TestFaction", {
            value: ethers.parseEther("0.001")
        });
        
        const receipt = await tx.wait();
        console.log("✅ Survivor created successfully!");
        console.log("📝 Transaction hash:", receipt.hash);
        
        const newTotalSupply = await deadGrid.totalSupply();
        console.log("✅ New total supply:", newTotalSupply.toString());
        
    } catch (error) {
        console.error("❌ Error testing functions:", error.message);
    }
    
    console.log("\n🎉 Deployment and testing complete!");
    console.log("📋 Contract Details:");
    console.log("   Address:", contractAddress);
    console.log("   Network: Base Sepolia");
    console.log("   Explorer:", `https://sepolia.basescan.org/address/${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 