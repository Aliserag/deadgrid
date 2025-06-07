#!/usr/bin/env node

/**
 * DeadGrid MCP Bridge
 * Connects the official Nodit MCP Server with DeadGrid smart contract
 * Integrates with existing DeepSeek AI engine for content generation
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { ethers } = require('ethers');
const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const cors = require('cors');

// Contract configuration - using the correct environment variable names
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x26E9f28c7c3eB5425003959AC4F4279eF373A1c2";
const NODIT_API_KEY = process.env.NEXT_PUBLIC_NODIT_API || process.env.NODIT_API_KEY;
const RPC_URL = process.env.BASE_SEPOLIA_RPC || `https://base-sepolia.nodit.io/${NODIT_API_KEY}`;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_WALLET_KEY || process.env.PRIVATE_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Validate required environment variables
if (!NODIT_API_KEY) {
  console.error('Error: NEXT_PUBLIC_NODIT_API or NODIT_API_KEY environment variable is required');
  process.exit(1);
}

if (!PRIVATE_KEY) {
  console.error('Error: NEXT_PUBLIC_WALLET_KEY or PRIVATE_KEY environment variable is required');
  process.exit(1);
}

if (!DEEPSEEK_API_KEY) {
  console.error('Error: DEEPSEEK_API_KEY environment variable is required');
  process.exit(1);
}

// Ensure private key has 0x prefix
const formattedPrivateKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;

// Contract ABI (key functions for AI interaction)
const DEADGRID_ABI = [
  "function getCurrentGameState() external view returns (uint256 day, uint256 zombieCount, string weatherCondition, uint256 resourceScarcity, string aiNarrative)",
  "function getSurvivorsByPlayer(address _player) external view returns (uint256[] memory)",
  "function survivors(uint256) external view returns (uint256 id, string name, uint256 health, uint256 stamina, uint256 intelligence, uint256 strength, uint256 experience, uint256 level, string faction, string location, uint256 lastActionTime, bool isAlive, string aiPersonality)",
  "function getPlayerRewards(address _player) external view returns (uint256)",
  "function createSurvivor(string memory _name, string memory _faction) external payable returns (uint256)",
  "function generateAIContent(string memory _contentType, string memory _prompt) external returns (string memory)",
  "function updateGameStateWithAI(uint256 _newDay, string memory _aiNarrative, string memory _weatherCondition, uint256 _zombieCount) external",
  "function createAIMission(string memory _title, string memory _description, uint256 _difficulty, uint256 _reward) external returns (uint256)",
  "function getMissionDetails(uint256 _missionId) external view returns (uint256 id, string title, string description, uint256 difficulty, uint256 reward, uint256 deadline, bool isActive, string aiGeneratedContent)"
];

class DeadGridMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'deadgrid-game',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    try {
      // Initialize blockchain connection
      this.provider = new ethers.JsonRpcProvider(RPC_URL);
      this.wallet = new ethers.Wallet(formattedPrivateKey, this.provider);
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, DEADGRID_ABI, this.wallet);
      
      console.log(`✅ DeadGrid MCP Bridge initialized successfully`);
      console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
      console.log(`🌐 Network: Base Sepolia`);
      console.log(`👤 Wallet: ${this.wallet.address}`);
    } catch (error) {
      console.error('❌ Failed to initialize blockchain connection:', error.message);
      process.exit(1);
    }
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_game_state',
            description: 'Get the current state of the DeadGrid zombie apocalypse game',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_player_survivors',
            description: 'Get all survivors owned by a specific player address',
            inputSchema: {
              type: 'object',
              properties: {
                playerAddress: {
                  type: 'string',
                  description: 'Ethereum address of the player',
                },
              },
              required: ['playerAddress'],
            },
          },
          {
            name: 'get_survivor_details',
            description: 'Get detailed information about a specific survivor',
            inputSchema: {
              type: 'object',
              properties: {
                survivorId: {
                  type: 'number',
                  description: 'ID of the survivor to query',
                },
              },
              required: ['survivorId'],
            },
          },
          {
            name: 'create_survivor',
            description: 'Create a new survivor NFT with DeepSeek AI-generated personality',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name for the new survivor',
                },
                faction: {
                  type: 'string',
                  description: 'Faction the survivor belongs to',
                },
              },
              required: ['name', 'faction'],
            },
          },
          {
            name: 'generate_ai_content',
            description: 'Generate AI content using DeepSeek (missions, narratives, personalities)',
            inputSchema: {
              type: 'object',
              properties: {
                contentType: {
                  type: 'string',
                  description: 'Type of content to generate (survivor, mission, narrative, event, etc.)',
                },
                prompt: {
                  type: 'string',
                  description: 'Prompt or context for AI content generation',
                },
                gameContext: {
                  type: 'object',
                  description: 'Current game context (optional)',
                },
              },
              required: ['contentType', 'prompt'],
            },
          },
          {
            name: 'update_game_state',
            description: 'Update the game state with AI-generated narrative and conditions',
            inputSchema: {
              type: 'object',
              properties: {
                day: {
                  type: 'number',
                  description: 'New day number',
                },
                aiNarrative: {
                  type: 'string',
                  description: 'AI-generated narrative for the day',
                },
                weatherCondition: {
                  type: 'string',
                  description: 'Weather condition for the day',
                },
                zombieCount: {
                  type: 'number',
                  description: 'Number of zombies in the world',
                },
              },
              required: ['day', 'aiNarrative', 'weatherCondition', 'zombieCount'],
            },
          },
          {
            name: 'create_ai_mission',
            description: 'Create a new mission with DeepSeek AI-generated content',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Mission title',
                },
                description: {
                  type: 'string',
                  description: 'Mission description',
                },
                difficulty: {
                  type: 'number',
                  description: 'Mission difficulty (1-100)',
                },
                reward: {
                  type: 'number',
                  description: 'Reward points for completing the mission',
                },
              },
              required: ['title', 'description', 'difficulty', 'reward'],
            },
          },
          {
            name: 'run_daily_simulation',
            description: 'Run the daily AI simulation to generate new content and update game state',
            inputSchema: {
              type: 'object',
              properties: {
                forceUpdate: {
                  type: 'boolean',
                  description: 'Force update even if already run today',
                },
              },
            },
          },
          {
            name: 'analyze_blockchain_data',
            description: 'Analyze blockchain data related to the game using Nodit APIs',
            inputSchema: {
              type: 'object',
              properties: {
                analysisType: {
                  type: 'string',
                  description: 'Type of analysis (transactions, player_activity, contract_events, etc.)',
                },
                parameters: {
                  type: 'object',
                  description: 'Parameters for the analysis',
                },
              },
              required: ['analysisType'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_game_state':
            return await this.getGameState();
          
          case 'get_player_survivors':
            return await this.getPlayerSurvivors(args.playerAddress);
          
          case 'get_survivor_details':
            return await this.getSurvivorDetails(args.survivorId);
          
          case 'create_survivor':
            return await this.createSurvivor(args.name, args.faction);
          
          case 'generate_ai_content':
            return await this.generateAIContent(args.contentType, args.prompt, args.gameContext);
          
          case 'update_game_state':
            return await this.updateGameState(args.day, args.aiNarrative, args.weatherCondition, args.zombieCount);
          
          case 'create_ai_mission':
            return await this.createAIMission(args.title, args.description, args.difficulty, args.reward);
          
          case 'run_daily_simulation':
            return await this.runDailySimulation(args.forceUpdate);
          
          case 'analyze_blockchain_data':
            return await this.analyzeBlockchainData(args.analysisType, args.parameters);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async getGameState() {
    const gameState = await this.contract.getCurrentGameState();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            day: Number(gameState[0]),
            zombieCount: Number(gameState[1]),
            weatherCondition: gameState[2],
            resourceScarcity: Number(gameState[3]),
            aiNarrative: gameState[4],
          }, null, 2),
        },
      ],
    };
  }

  async getPlayerSurvivors(playerAddress) {
    const survivorIds = await this.contract.getSurvivorsByPlayer(playerAddress);
    const survivors = [];

    for (const id of survivorIds) {
      const survivor = await this.contract.survivors(id);
      survivors.push({
        id: Number(survivor[0]),
        name: survivor[1],
        health: Number(survivor[2]),
        stamina: Number(survivor[3]),
        intelligence: Number(survivor[4]),
        strength: Number(survivor[5]),
        experience: Number(survivor[6]),
        level: Number(survivor[7]),
        faction: survivor[8],
        location: survivor[9],
        isAlive: survivor[11],
        aiPersonality: survivor[12],
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ playerAddress, survivors }, null, 2),
        },
      ],
    };
  }

  async getSurvivorDetails(survivorId) {
    const survivor = await this.contract.survivors(survivorId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            id: Number(survivor[0]),
            name: survivor[1],
            health: Number(survivor[2]),
            stamina: Number(survivor[3]),
            intelligence: Number(survivor[4]),
            strength: Number(survivor[5]),
            experience: Number(survivor[6]),
            level: Number(survivor[7]),
            faction: survivor[8],
            location: survivor[9],
            isAlive: survivor[11],
            aiPersonality: survivor[12],
          }, null, 2),
        },
      ],
    };
  }

  async createSurvivor(name, faction) {
    const tx = await this.contract.createSurvivor(name, faction, {
      value: ethers.parseEther("0.001")
    });
    const receipt = await tx.wait();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            transactionHash: receipt.hash,
            message: `Survivor "${name}" created successfully in faction "${faction}"`,
          }, null, 2),
        },
      ],
    };
  }

  async generateAIContent(contentType, prompt, gameContext = {}) {
    return new Promise((resolve, reject) => {
      // Use the existing DeepSeek AI engine
      const pythonScript = path.join(__dirname, '..', 'ai_engine', 'content_generator.py');
      const args = [pythonScript, contentType, prompt, JSON.stringify(gameContext)];
      
      const pythonProcess = spawn('python3', args, {
        env: { ...process.env, DEEPSEEK_API_KEY }
      });

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    contentType,
                    prompt,
                    generatedContent: result,
                    timestamp: new Date().toISOString(),
                    source: 'DeepSeek AI Engine'
                  }, null, 2),
                },
              ],
            });
          } catch (parseError) {
            resolve({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    contentType,
                    prompt,
                    generatedContent: output,
                    timestamp: new Date().toISOString(),
                    source: 'DeepSeek AI Engine'
                  }, null, 2),
                },
              ],
            });
          }
        } else {
          reject(new Error(`AI content generation failed: ${error}`));
        }
      });
    });
  }

  async updateGameState(day, aiNarrative, weatherCondition, zombieCount) {
    const tx = await this.contract.updateGameStateWithAI(day, aiNarrative, weatherCondition, zombieCount);
    const receipt = await tx.wait();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            transactionHash: receipt.hash,
            newGameState: {
              day,
              aiNarrative,
              weatherCondition,
              zombieCount,
            },
          }, null, 2),
        },
      ],
    };
  }

  async createAIMission(title, description, difficulty, reward) {
    const tx = await this.contract.createAIMission(title, description, difficulty, reward);
    const receipt = await tx.wait();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            transactionHash: receipt.hash,
            mission: {
              title,
              description,
              difficulty,
              reward,
            },
          }, null, 2),
        },
      ],
    };
  }

  async runDailySimulation(forceUpdate = false) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '..', 'ai_engine', 'generate_day.py');
      const args = forceUpdate ? [scriptPath, '--force'] : [scriptPath];
      
      const pythonProcess = spawn('python3', args, {
        env: { ...process.env, DEEPSEEK_API_KEY }
      });

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: 'Daily simulation completed successfully',
                  output: output,
                  timestamp: new Date().toISOString(),
                }, null, 2),
              },
            ],
          });
        } else {
          reject(new Error(`Daily simulation failed: ${error}`));
        }
      });
    });
  }

  async analyzeBlockchainData(analysisType, parameters = {}) {
    // This integrates with Nodit's blockchain data APIs
    const analysis = {
      analysisType,
      parameters,
      results: {
        contractAddress: CONTRACT_ADDRESS,
        network: "Base Sepolia",
        timestamp: new Date().toISOString(),
        summary: `Analysis of ${analysisType} completed using Nodit blockchain data APIs`,
        // In production, this would make actual API calls to Nodit
        placeholder: "Real blockchain analysis would be implemented here using Nodit APIs"
      },
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('DeadGrid MCP Bridge server running on stdio');
  }
}

// Start the server
const server = new DeadGridMCPServer();
server.run().catch(console.error);

// Quick Win: Add HTTP server for frontend integration
const app = express();
app.use(cors());
app.use(express.json());

// HTTP endpoint for content generation
app.post('/generate-content', async (req, res) => {
  try {
    const { contentType, prompt } = req.body;
    
    // Call DeepSeek AI for content generation
    const content = await generateAIContent(contentType, prompt);
    
    res.json({
      success: true,
      contentType,
      content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start HTTP server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 HTTP server running on port ${PORT}`);
});

// AI Content Generation Function
async function generateAIContent(contentType, prompt) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an AI content generator for DeadGrid, a zombie apocalypse survival game. Generate ${contentType} content that is engaging, realistic, and fits the post-apocalyptic theme.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
} 