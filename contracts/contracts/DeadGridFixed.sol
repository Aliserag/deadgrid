// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DeadGrid
 * @dev AI-Powered Zombie Survival Game on Base Network
 * Integrates with Nodit MCP for AI-driven gameplay mechanics
 */
contract DeadGridFixed is ERC721URIStorage, Ownable, ReentrancyGuard {
    
    // ============ State Variables ============
    
    uint256 private _survivorIdCounter;
    uint256 private _missionIdCounter;
    
    // Nodit MCP Integration
    string public noditMCPEndpoint;
    mapping(address => bool) public authorizedMCPCallers;
    
    // Game Mechanics
    struct Survivor {
        uint256 id;
        string name;
        uint256 health;
        uint256 stamina;
        uint256 intelligence;
        uint256 strength;
        uint256 experience;
        uint256 level;
        string faction;
        string location;
        uint256 lastActionTime;
        bool isAlive;
        string aiPersonality; // AI-generated personality traits
    }
    
    struct Mission {
        uint256 id;
        string title;
        string description;
        uint256 difficulty;
        uint256 reward;
        uint256 deadline;
        bool isActive;
        string aiGeneratedContent; // AI-generated mission content
    }
    
    struct GameState {
        uint256 day;
        uint256 zombieCount;
        string weatherCondition;
        uint256 resourceScarcity;
        string aiNarrative; // AI-generated daily narrative
    }
    
    // Mappings
    mapping(uint256 => Survivor) public survivors;
    mapping(address => uint256[]) public playerSurvivors;
    mapping(uint256 => Mission) public missions;
    mapping(uint256 => mapping(uint256 => bool)) public survivorMissions; // survivorId => missionId => completed
    mapping(address => uint256) public playerRewards; // Player reward points
    
    // Game State
    GameState public currentGameState;
    
    // Events
    event SurvivorCreated(uint256 indexed survivorId, address indexed owner, string name);
    event MissionCreated(uint256 indexed missionId, string title, uint256 reward);
    event MissionCompleted(uint256 indexed survivorId, uint256 indexed missionId, uint256 reward);
    event AIContentGenerated(string contentType, string content);
    event GameStateUpdated(uint256 day, string aiNarrative);
    event NoditMCPCall(address indexed caller, string action, bytes data);
    event RewardsEarned(address indexed player, uint256 amount);
    
    // ============ Constructor ============
    
    constructor() ERC721("DeadGrid Survivors", "DGS") {
        _survivorIdCounter = 0;
        _missionIdCounter = 0;
        
        // Initialize game state
        currentGameState = GameState({
            day: 1,
            zombieCount: 1000,
            weatherCondition: "Clear",
            resourceScarcity: 50,
            aiNarrative: "The apocalypse begins..."
        });
        
        // Set initial Nodit MCP endpoint (placeholder)
        noditMCPEndpoint = "https://api.nodit.io/mcp/v1";
        authorizedMCPCallers[msg.sender] = true;
    }
    
    // ============ Nodit MCP Integration ============
    
    modifier onlyMCPAuthorized() {
        require(authorizedMCPCallers[msg.sender], "Not authorized for MCP calls");
        _;
    }
    
    function setNoditMCPEndpoint(string memory _endpoint) external onlyOwner {
        noditMCPEndpoint = _endpoint;
    }
    
    function authorizeMCPCaller(address _caller) external onlyOwner {
        authorizedMCPCallers[_caller] = true;
    }
    
    function revokeMCPCaller(address _caller) external onlyOwner {
        authorizedMCPCallers[_caller] = false;
    }
    
    // AI-driven content generation via Nodit MCP
    function generateAIContent(
        string memory _contentType,
        string memory _prompt
    ) external onlyMCPAuthorized returns (string memory) {
        // This would integrate with Nodit MCP in production
        // For now, we emit an event to track AI content generation
        string memory generatedContent = string(abi.encodePacked("AI_", _contentType, "_", _prompt));
        
        emit AIContentGenerated(_contentType, generatedContent);
        emit NoditMCPCall(msg.sender, "generateContent", abi.encode(_contentType, _prompt));
        
        return generatedContent;
    }
    
    // ============ Survivor Management ============
    
    function createSurvivor(
        string memory _name,
        string memory _faction
    ) external payable returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(msg.value >= 0.001 ether, "Insufficient payment for survivor creation");
        
        _survivorIdCounter++;
        uint256 newSurvivorId = _survivorIdCounter;
        
        // Generate AI personality (would use Nodit MCP in production)
        string memory aiPersonality = generateAIPersonality(newSurvivorId);
        
        survivors[newSurvivorId] = Survivor({
            id: newSurvivorId,
            name: _name,
            health: 100,
            stamina: 100,
            intelligence: _randomStat(newSurvivorId, "intelligence"),
            strength: _randomStat(newSurvivorId, "strength"),
            experience: 0,
            level: 1,
            faction: _faction,
            location: "Safe Zone",
            lastActionTime: block.timestamp,
            isAlive: true,
            aiPersonality: aiPersonality
        });
        
        _safeMint(msg.sender, newSurvivorId);
        playerSurvivors[msg.sender].push(newSurvivorId);
        
        // Reward points for survivor creation
        playerRewards[msg.sender] += 100;
        emit RewardsEarned(msg.sender, 100);
        
        emit SurvivorCreated(newSurvivorId, msg.sender, _name);
        return newSurvivorId;
    }
    
    function generateAIPersonality(uint256 _survivorId) internal view returns (string memory) {
        // Simplified AI personality generation (would use Nodit MCP in production)
        uint256 personalityType = uint256(keccak256(abi.encodePacked(_survivorId, block.timestamp))) % 4;
        
        if (personalityType == 0) return "Brave Leader";
        if (personalityType == 1) return "Cautious Strategist";
        if (personalityType == 2) return "Resourceful Scavenger";
        return "Loyal Protector";
    }
    
    // ============ Mission System ============
    
    function createAIMission(
        string memory _title,
        string memory _description,
        uint256 _difficulty,
        uint256 _reward
    ) external onlyMCPAuthorized returns (uint256) {
        _missionIdCounter++;
        uint256 newMissionId = _missionIdCounter;
        
        // Generate AI content for mission (would use Nodit MCP in production)
        string memory aiContent = string(abi.encodePacked("AI_Mission_", _title));
        
        missions[newMissionId] = Mission({
            id: newMissionId,
            title: _title,
            description: _description,
            difficulty: _difficulty,
            reward: _reward,
            deadline: block.timestamp + 7 days,
            isActive: true,
            aiGeneratedContent: aiContent
        });
        
        emit MissionCreated(newMissionId, _title, _reward);
        return newMissionId;
    }
    
    function completeMission(uint256 _survivorId, uint256 _missionId) external nonReentrant {
        require(ownerOf(_survivorId) == msg.sender, "Not your survivor");
        require(survivors[_survivorId].isAlive, "Survivor is not alive");
        require(missions[_missionId].isActive, "Mission not active");
        require(!survivorMissions[_survivorId][_missionId], "Mission already completed");
        require(block.timestamp <= missions[_missionId].deadline, "Mission expired");
        
        Survivor storage survivor = survivors[_survivorId];
        Mission storage mission = missions[_missionId];
        
        // Simple success calculation (would use AI via Nodit MCP in production)
        uint256 successChance = (survivor.intelligence + survivor.strength) / 2;
        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, _survivorId, _missionId))) % 100;
        
        if (randomValue < successChance) {
            // Mission successful
            survivorMissions[_survivorId][_missionId] = true;
            survivor.experience += mission.reward;
            survivor.level = survivor.experience / 1000 + 1;
            
            // Reward points
            playerRewards[msg.sender] += mission.reward;
            emit RewardsEarned(msg.sender, mission.reward);
            
            emit MissionCompleted(_survivorId, _missionId, mission.reward);
        } else {
            // Mission failed - reduce health
            survivor.health = survivor.health > 20 ? survivor.health - 20 : 0;
            if (survivor.health == 0) {
                survivor.isAlive = false;
            }
        }
        
        survivor.lastActionTime = block.timestamp;
    }
    
    // ============ AI-Driven Game State Updates ============
    
    function updateGameStateWithAI(
        uint256 _newDay,
        string memory _aiNarrative,
        string memory _weatherCondition,
        uint256 _zombieCount
    ) external onlyMCPAuthorized {
        currentGameState.day = _newDay;
        currentGameState.aiNarrative = _aiNarrative;
        currentGameState.weatherCondition = _weatherCondition;
        currentGameState.zombieCount = _zombieCount;
        
        emit GameStateUpdated(_newDay, _aiNarrative);
        emit NoditMCPCall(msg.sender, "updateGameState", abi.encode(_newDay, _aiNarrative));
    }
    
    // ============ Utility Functions ============
    
    function _randomStat(uint256 _survivorId, string memory _statType) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(_survivorId, _statType, block.timestamp))) % 50 + 50;
    }
    
    function getSurvivorsByPlayer(address _player) external view returns (uint256[] memory) {
        return playerSurvivors[_player];
    }
    
    function getMissionDetails(uint256 _missionId) external view returns (Mission memory) {
        return missions[_missionId];
    }
    
    function getCurrentGameState() external view returns (GameState memory) {
        return currentGameState;
    }
    
    function getPlayerRewards(address _player) external view returns (uint256) {
        return playerRewards[_player];
    }
    
    function totalSupply() public view returns (uint256) {
        return _survivorIdCounter;
    }
    
    // ============ Emergency Functions ============
    
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function pause() external onlyOwner {
        // Implement pause functionality if needed
    }
    
    // Receive function to accept ETH
    receive() external payable {}
} 