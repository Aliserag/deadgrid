# DeadGrid x Nodit Integration Guide
## AI-Powered Zombie Survival Game with DeepSeek AI & Nodit MCP

### 🎯 Project Overview

**DeadGrid** is an innovative AI-driven zombie apocalypse survival game that leverages Nodit's blockchain infrastructure and your existing **DeepSeek AI engine** to deliver a seamless Web3 gaming experience on Base testnet. The game combines AI-generated content, NFT-based survivors, and blockchain-powered gameplay mechanics.

### 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Client     │    │   Nodit MCP      │    │  DeepSeek AI    │
│   (Any MCP      │◄──►│   Server         │◄──►│  Engine         │
│   Compatible)   │    │   (Official)     │    │  (Existing)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Game State    │    │   DeadGrid MCP   │    │   Base Testnet  │
│   Queries       │    │   Bridge         │    │   Contract      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 🚀 Deployment Status

#### ✅ Successfully Deployed
- **Contract Address**: `0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2`
- **Network**: Base Sepolia Testnet (Chain ID: 84532)
- **Explorer**: [View on BaseScan](https://sepolia.basescan.org/address/0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2)
- **RPC Provider**: Nodit (`https://base-sepolia.nodit.io/${NODIT_API_KEY}`)

### 🛠️ Quick Setup Guide

#### 1. Environment Configuration

**IMPORTANT**: Never commit API keys to version control!

Create/update your `.env` file:

```bash
# Nodit Configuration
NODIT_API_KEY=your_nodit_api_key_here

# DeepSeek Configuration (already exists)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Contract Configuration
CONTRACT_ADDRESS=0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2
BASE_SEPOLIA_RPC=https://base-sepolia.nodit.io/${NODIT_API_KEY}
PRIVATE_KEY=your_private_key_here
```

#### 2. Install Dependencies

```bash
# Install Nodit MCP Server (official hackathon requirement)
npm install -g @noditlabs/nodit-mcp-server

# Install MCP SDK for the bridge
npm install @modelcontextprotocol/sdk ethers

# Ensure Python dependencies are available
pip install requests pathlib
```

#### 3. Test the Integration

```bash
# Test the content generator directly
python3 ai_engine/content_generator.py survivor "Create a tough scavenger named Marcus"

# Test the MCP bridge
node mcp-integration/deadgrid-mcp-bridge.js

# Test with any MCP-compatible client
```

### 🔧 Technical Implementation

#### Smart Contract Features
- **ERC721 NFT Survivors**: Each survivor is a unique NFT with AI-generated traits
- **AI-Driven Gameplay**: Integration points for DeepSeek AI content generation
- **Reward System**: Point-based rewards for successful missions and survival
- **Game State Management**: On-chain tracking of global game conditions
- **Mission System**: Dynamic missions with AI-generated content

#### Key Contract Functions
```solidity
// Core gameplay functions
function createSurvivor(string memory _name, string memory _faction) external payable
function completeMission(uint256 _survivorId, uint256 _missionId) external
function getCurrentGameState() external view returns (GameState memory)

// AI integration functions
function generateAIContent(string memory _contentType, string memory _prompt) external
function updateGameStateWithAI(uint256 _newDay, string memory _aiNarrative) external
```

#### Frontend Integration
- **React/TypeScript**: Modern, responsive UI built with Material-UI
- **Ethers.js**: Web3 integration for contract interactions
- **MetaMask Integration**: Seamless wallet connection and network switching
- **Real-time Updates**: Live game state and survivor status updates

### 🤖 AI Integration Architecture

#### 1. Existing DeepSeek AI Engine ✅
**Comprehensive AI system already integrated throughout the game**

```python
# DeepSeek API Integration (ai_engine/)
- story_generator.py: AI-driven narrative generation
- generate_day.py: Daily content generation
- character_generator.py: Survivor personality creation
- event_generator.py: Dynamic event creation
- world_generator.py: Environment generation
- content_generator.py: MCP bridge interface (NEW)
```

**Key AI Features:**
- **Story Generation**: Main and side story arcs with AI narratives
- **Character Creation**: AI-generated survivor personalities and traits
- **Dynamic Events**: Weather, encounters, and missions
- **World Building**: Locations, factions, and lore generation
- **Content Integration**: Seamless AI content across all game systems

#### 2. Official Nodit MCP Server Integration ✅
**Hackathon-compliant integration using official Nodit MCP**

```bash
# Official Nodit MCP Server (required for hackathon)
npm install @noditlabs/nodit-mcp-server

# Available Nodit MCP Tools:
- list_nodit_api_categories: Explore available API categories
- list_nodit_node_apis: View Node API operations  
- list_nodit_data_apis: View Web3 Data API operations
- get_nodit_api_spec: Get detailed API specifications
- call_nodit_api: Execute Nodit API calls
```

#### 3. DeadGrid Game Bridge ✅
**Custom MCP bridge connecting Nodit MCP to DeadGrid contract and DeepSeek AI**

```typescript
// DeadGrid-specific MCP tools
- get_game_state: Get current zombie apocalypse state
- get_player_survivors: Get player's survivor NFTs
- create_survivor: Create new survivor with DeepSeek AI personality
- generate_ai_content: Generate AI content using DeepSeek
- update_game_state: Update game with AI narrative
- run_daily_simulation: Run full daily content generation
- analyze_blockchain_data: Analyze game data via Nodit APIs
```

### 🎮 Game Mechanics

#### Survivor Creation
- **Cost**: 0.001 ETH + gas fees
- **DeepSeek AI Generation**: Unique personality traits, backstories, and stats
- **NFT Minting**: Each survivor becomes an ERC721 token
- **Faction System**: AI-generated faction relationships and conflicts

#### Mission System
- **AI-Generated Missions**: Dynamic content based on game state using DeepSeek
- **Success Probability**: Calculated from survivor stats and AI analysis
- **Reward Distribution**: Points and experience for completion
- **Risk/Reward Balance**: Failed missions can injure or kill survivors

#### Game State Evolution
- **Daily Progression**: DeepSeek AI-driven narrative updates
- **Environmental Factors**: Weather, zombie count, resource scarcity
- **Player Impact**: Collective player actions affect global state
- **Story Arcs**: Multi-day narratives with AI-generated plot developments

### 🔧 MCP Client Configuration

#### For Cursor IDE
**Location**: `~/.cursor/mcp.json` (macOS) or `C:\Users\<Username>\.cursor\mcp.json` (Windows)

```json
{
  "mcpServers": {
    "nodit": {
      "command": "npx",
      "args": ["@noditlabs/nodit-mcp-server@latest"],
      "env": {
        "NODIT_API_KEY": "your_nodit_api_key_here"
      }
    },
    "deadgrid-deepseek": {
      "command": "node",
      "args": ["mcp-integration/deadgrid-mcp-bridge.js"],
      "env": {
        "NODIT_API_KEY": "your_nodit_api_key_here",
        "DEEPSEEK_API_KEY": "your_deepseek_api_key_here",
        "CONTRACT_ADDRESS": "0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2",
        "BASE_SEPOLIA_RPC": "https://base-sepolia.nodit.io/your_nodit_api_key_here",
        "PRIVATE_KEY": "your_private_key_here"
      }
    }
  }
}
```

#### For Claude Desktop
**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "nodit": {
      "command": "npx",
      "args": ["-y", "@noditlabs/nodit-mcp-server"],
      "env": {
        "NODIT_API_KEY": "your_nodit_api_key_here"
      }
    },
    "deadgrid-deepseek": {
      "command": "node",
      "args": ["mcp-integration/deadgrid-mcp-bridge.js"],
      "env": {
        "NODIT_API_KEY": "your_nodit_api_key_here",
        "DEEPSEEK_API_KEY": "your_deepseek_api_key_here",
        "CONTRACT_ADDRESS": "0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2",
        "BASE_SEPOLIA_RPC": "https://base-sepolia.nodit.io/your_nodit_api_key_here",
        "PRIVATE_KEY": "your_private_key_here"
      }
    }
  }
}
```

#### For Claude CLI
```bash
# Add the Nodit MCP server
claude mcp add nodit-mcp-server npx @noditlabs/nodit-mcp-server

# Set API key
export NODIT_API_KEY=your-api-key

# Start Claude with the Nodit MCP server enabled
claude
```

### 🎮 Example Usage

#### 1. Generate Survivor Personality
```bash
# Direct Python call
python3 ai_engine/content_generator.py survivor "A former military medic who lost their squad"

# Via MCP (any compatible client)
{
  "tool": "generate_ai_content",
  "args": {
    "contentType": "survivor",
    "prompt": "A former military medic who lost their squad",
    "gameContext": {"day": 15, "faction": "Medical Corps"}
  }
}
```

#### 2. Run Daily Simulation
```bash
# Direct Python call
python3 ai_engine/generate_day.py

# Via MCP
{
  "tool": "run_daily_simulation",
  "args": {
    "forceUpdate": false
  }
}
```

#### 3. Analyze Blockchain Data
```bash
# Via MCP
{
  "tool": "analyze_blockchain_data",
  "args": {
    "analysisType": "player_activity",
    "parameters": {"timeframe": "24h"}
  }
}
```

### 🔍 Content Generation Examples

#### Survivor Creation
```json
{
  "type": "survivor",
  "content": {
    "name": "Marcus Chen",
    "personality": "Stoic former military medic with PTSD",
    "backstory": "Lost his entire squad in the first wave...",
    "traits": {
      "medical_expertise": 85,
      "combat_training": 70,
      "leadership": 60,
      "trauma_response": 40
    },
    "faction_affinity": "Medical Corps",
    "starting_equipment": ["First Aid Kit", "Combat Knife", "Radio"]
  }
}
```

#### Mission Generation
```json
{
  "type": "mission",
  "content": {
    "title": "Hospital Supply Run",
    "description": "The Medical Corps needs antibiotics from St. Mary's Hospital",
    "objectives": [
      "Reach St. Mary's Hospital",
      "Secure the pharmacy",
      "Extract medical supplies",
      "Return safely to base"
    ],
    "difficulty": 75,
    "estimated_duration": "4-6 hours",
    "required_skills": ["Medical Knowledge", "Stealth", "Combat"],
    "rewards": {
      "experience": 150,
      "reputation": 25,
      "items": ["Antibiotics", "Surgical Tools"]
    }
  }
}
```

### 📊 Hackathon Alignment

#### ✅ AI-Powered Dapp
- **DeepSeek Integration**: Mature AI engine already generating content
- **Real-time Generation**: Live content creation during gameplay
- **Multi-modal AI**: Stories, characters, events, missions, world-building

#### ✅ Nodit Infrastructure
- **Official MCP Server**: Using `@noditlabs/nodit-mcp-server` 
- **Base Testnet**: Deployed on Nodit's Base Sepolia RPC
- **Blockchain Analytics**: Ready for Nodit API integration

#### ✅ Model Context Protocol
- **Standard Compliance**: Implements official MCP specification
- **Tool Discovery**: Dynamic tool listing and specification
- **Contextual Responses**: AI responses based on blockchain state

### 🛠️ Development Setup

#### Prerequisites
```bash
# Install dependencies
npm install

# Environment variables (NEVER commit these!)
cp contracts/env.example .env
# Edit .env with your actual API keys
```

#### Deployment Commands
```bash
# Compile contracts
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia

# Start frontend
npm run dev

# Run AI engine (daily content generation)
python ai_engine/generate_day.py
```

### 🚨 Security Best Practices

#### Environment Variables
```bash
# NEVER commit these to version control
echo ".env" >> .gitignore
echo "*.key" >> .gitignore

# Use environment variable substitution
export NODIT_API_KEY="your_key_here"
export DEEPSEEK_API_KEY="your_key_here"
```

#### API Key Management
- Store keys in environment variables only
- Use different keys for development/production
- Rotate keys regularly
- Monitor API usage

### 🚨 Troubleshooting

#### MCP Server Not Starting
```bash
# Check if the official Nodit MCP server is installed
npx @noditlabs/nodit-mcp-server --version

# Test the server manually
NODIT_API_KEY=your_key npx @noditlabs/nodit-mcp-server
```

#### Bridge Connection Issues
```bash
# Test the DeadGrid bridge
cd /path/to/deadgrid
node mcp-integration/deadgrid-mcp-bridge.js
```

#### Content Generator Issues
```bash
# Test content generation directly
python3 ai_engine/content_generator.py survivor "test prompt"

# Check environment variables
echo $DEEPSEEK_API_KEY
```

### 📊 Monitoring & Analytics

#### Content Generation Metrics
```bash
# Track AI generation success rates
python3 -c "
import json
from ai_engine.content_generator import generate_content
result = generate_content('survivor', 'test')
print(f'Success: {result[\"success\"]}')
"
```

#### Blockchain Integration Health
```bash
# Test contract connectivity
node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
provider.getBlockNumber().then(console.log);
"
```

### 🔮 Future Roadmap

#### Phase 1: Enhanced AI Integration
- **Advanced DeepSeek Features**: More sophisticated AI content generation
- **Player Behavior Analysis**: AI-driven personalization
- **Dynamic Economy**: AI-managed resource pricing

#### Phase 2: Multi-chain Expansion
- **Base Mainnet**: Production deployment
- **Cross-chain Bridges**: Survivor portability between networks
- **Layer 2 Integration**: Optimized for high-frequency gameplay

#### Phase 3: Community Features
- **Faction Wars**: Large-scale multiplayer conflicts
- **Governance**: Community-driven game evolution
- **Creator Tools**: User-generated content with AI assistance

### 📈 Metrics & KPIs

#### Technical Metrics
- **Contract Deployment**: ✅ Successful on Base Sepolia
- **AI Integration**: ✅ DeepSeek AI engine fully operational
- **MCP Integration**: ✅ Official Nodit MCP server configured
- **Frontend Performance**: Responsive, real-time updates

#### Game Metrics (Generated by AI Engine)
- **Daily Content Generation**: Stories, events, characters, missions
- **AI-Generated Assets**: Personalities, locations, items, lore
- **Player Engagement**: Survivor creation, mission completion, faction participation

### 🏆 Competitive Advantages

1. **Mature AI System**: Existing DeepSeek integration with proven content generation
2. **Nodit MCP Compliance**: Official hackathon-compliant integration
3. **Sustainable Tokenomics**: Point-based rewards, not inflationary tokens
4. **Rich Narrative**: AI-generated stories create unique experiences
5. **Community-Driven**: Player actions shape the AI-generated world

### 📞 Support & Resources

- **DeepSeek API**: https://platform.deepseek.com/
- **Nodit MCP Documentation**: https://developer.nodit.io/docs/nodit-mcp
- **MCP Specification**: https://modelcontextprotocol.io/
- **GitHub Repository**: https://github.com/noditlabs/nodit-mcp-server
- **DeadGrid Contract**: https://sepolia.basescan.org/address/0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2

---

