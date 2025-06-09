const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking contract deployment...");
    
    const contractAddress = "0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2";
    
    // Get provider
    const provider = new ethers.JsonRpcProvider(`https://base-sepolia.nodit.io/${process.env.NODIT_API_KEY}`);
    
    try {
        // Check if contract exists
        const code = await provider.getCode(contractAddress);
        console.log("Contract bytecode length:", code.length);
        console.log("Contract exists:", code !== "0x");
        
        if (code === "0x") {
            console.log("❌ No contract found at this address!");
            return;
        }
        
        // Try to call basic view functions
        const contractABI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function owner() view returns (address)"
        ];
        
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        
        console.log("\n📋 Testing view functions:");
        
        try {
            const name = await contract.name();
            console.log("✅ Name:", name);
        } catch (e) {
            console.log("❌ Name function failed:", e.message);
        }
        
        try {
            const symbol = await contract.symbol();
            console.log("✅ Symbol:", symbol);
        } catch (e) {
            console.log("❌ Symbol function failed:", e.message);
        }
        
        try {
            const totalSupply = await contract.totalSupply();
            console.log("✅ Total Supply:", totalSupply.toString());
        } catch (e) {
            console.log("❌ Total Supply function failed:", e.message);
        }
        
        try {
            const owner = await contract.owner();
            console.log("✅ Owner:", owner);
        } catch (e) {
            console.log("❌ Owner function failed:", e.message);
        }
        
    } catch (error) {
        console.error("❌ Error checking contract:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 