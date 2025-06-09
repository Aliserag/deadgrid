const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Debugging DeadGrid contract minting...");
    
    // Contract details
    const contractAddress = "0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2";
    const contractABI = [
        "function createSurvivor(string memory _name, string memory _faction) payable returns (uint256)",
        "function totalSupply() view returns (uint256)",
        "function owner() view returns (address)",
        "function name() view returns (string)",
        "function symbol() view returns (string)"
    ];
    
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("👤 Using account:", signer.address);
    
    // Check balance
    const balance = await signer.provider.getBalance(signer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    // Connect to contract
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    try {
        // Check basic contract info
        console.log("\n📋 Contract Info:");
        const contractName = await contract.name();
        const contractSymbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        const owner = await contract.owner();
        
        console.log("Name:", contractName);
        console.log("Symbol:", contractSymbol);
        console.log("Total Supply:", totalSupply.toString());
        console.log("Owner:", owner);
        
        // Try to estimate gas for minting
        console.log("\n⛽ Estimating gas for minting...");
        const gasEstimate = await contract.createSurvivor.estimateGas("TestSurvivor", "TestFaction", {
            value: ethers.parseEther("0.001")
        });
        console.log("Gas estimate:", gasEstimate.toString());
        
        // Try to mint
        console.log("\n🎯 Attempting to mint survivor...");
        const tx = await contract.createSurvivor("TestSurvivor", "TestFaction", {
            value: ethers.parseEther("0.001"),
            gasLimit: gasEstimate * BigInt(2) // Double the gas estimate for safety
        });
        
        console.log("Transaction hash:", tx.hash);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed!");
        console.log("Block number:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());
        
        // Check new total supply
        const newTotalSupply = await contract.totalSupply();
        console.log("New total supply:", newTotalSupply.toString());
        
    } catch (error) {
        console.error("❌ Error occurred:");
        console.error("Error code:", error.code);
        console.error("Error reason:", error.reason);
        console.error("Error message:", error.message);
        
        if (error.data) {
            console.error("Error data:", error.data);
        }
        
        // Try to decode the error
        if (error.reason) {
            console.error("Decoded reason:", error.reason);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 