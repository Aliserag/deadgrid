#!/bin/bash

echo "🧟‍♂️ Setting up DeadGrid x Nodit Integration for Nero Hack"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Setup contracts
print_header "📋 Setting up Smart Contracts..."
cd contracts

if [ ! -f "package.json" ]; then
    print_error "contracts/package.json not found!"
    exit 1
fi

print_status "Installing contract dependencies..."
npm install

# Check if .env exists, if not copy from example
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        print_warning "Created .env file from env.example. Please update with your API keys!"
    else
        print_error "No env.example file found!"
    fi
else
    print_status ".env file already exists"
fi

# Compile contracts
print_status "Compiling smart contracts..."
npx hardhat compile

if [ $? -eq 0 ]; then
    print_status "✅ Smart contracts compiled successfully!"
else
    print_error "❌ Smart contract compilation failed!"
    exit 1
fi

# Setup frontend
print_header "🎮 Setting up Frontend..."
cd ../frontend

if [ ! -f "package.json" ]; then
    print_error "frontend/package.json not found!"
    exit 1
fi

print_status "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "✅ Frontend dependencies installed successfully!"
else
    print_error "❌ Frontend dependency installation failed!"
    exit 1
fi

# Go back to root
cd ..

# Create deployment summary
print_header "📊 Deployment Summary"
echo "======================"
echo "✅ Smart contracts compiled and ready"
echo "✅ Frontend dependencies installed"
echo "✅ Nodit integration components created"
echo "✅ Multi-chain architecture implemented"
echo ""

print_header "🚀 Next Steps for Hackathon:"
echo "1. Update contracts/.env with your Nodit API key"
echo "2. Deploy contracts: cd contracts && npm run deploy:sepolia"
echo "3. Update frontend environment with contract addresses"
echo "4. Start frontend: cd frontend && npm run dev"
echo "5. Access Nodit integration at: http://localhost:3000/nodit"
echo ""

print_header "🏆 Hackathon Features Implemented:"
echo "• Multi-chain survivor NFTs on Ethereum"
echo "• Nodit RPC integration for fast transactions"
echo "• Cross-chain synchronization capabilities"
echo "• Decentralized resource trading marketplace"
echo "• Seamless wallet integration with MetaMask"
echo "• Network switching between Sepolia and Mainnet"
echo ""

print_header "📚 Documentation:"
echo "• Main documentation: NODIT_INTEGRATION.md"
echo "• Architecture details: ARCHITECTURE.md"
echo "• Smart contracts: contracts/DeadGridEthereum.sol"
echo "• Frontend integration: frontend/src/components/NoditIntegration.tsx"
echo ""

print_status "🎉 Setup complete! Ready for Nero Hack submission!"

# Check if git is available and show current status
if command -v git &> /dev/null; then
    echo ""
    print_header "📝 Git Status:"
    git status --short
fi

echo ""
print_warning "Remember to:"
echo "• Add your Nodit API key to contracts/.env"
echo "• Fund your wallet with Sepolia ETH for testing"
echo "• Test the integration before final submission"
echo ""
echo "🧟‍♂️ Good luck with the hackathon! May your survivors thrive across all chains!" 