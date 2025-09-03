// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IDeadGrid.sol";

/**
 * @title ProceduralGenerator
 * @notice On-chain procedural content generation for DeadGrid
 * @dev Generates events, quests, and world changes based on blockchain state
 */
contract ProceduralGenerator is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant EVOLUTION_ROLE = keccak256("EVOLUTION_ROLE");
    
    struct GeneratedEvent {
        uint256 id;
        string title;
        string description;
        uint256 locationId;
        uint256 triggerBlock;
        uint256 duration; // In blocks
        uint256 severity; // 1-10
        EventType eventType;
        bool isActive;
        mapping(address => bool) participated;
        mapping(address => uint256) contributions;
    }
    
    struct GeneratedQuest {
        uint256 id;
        string title;
        string description;
        uint256[] objectives;
        uint256 rewardItemId;
        uint256 rewardAmount;
        uint256 experienceReward;
        uint256 deadline; // Block number
        address creator;
        bool isCompleted;
        mapping(address => bool) accepted;
        mapping(address => uint256) progress;
    }
    
    struct WorldState {
        uint256 currentSeason; // 0: Spring, 1: Summer, 2: Fall, 3: Winter
        uint256 infectionLevel; // Global infection severity 0-100
        uint256 resourceScarcity; // Global resource availability 0-100
        uint256 totalSurvivors;
        uint256 totalDeaths;
        uint256 totalLocationsDiscovered;
        uint256 lastEvolutionBlock;
        uint256 evolutionCycle;
    }
    
    struct NarrativeArc {
        uint256 id;
        string name;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256[] keyEvents;
        bool isActive;
    }
    
    enum EventType {
        ZOMBIE_HORDE,
        RESOURCE_CACHE,
        SURVIVOR_ENCOUNTER,
        WEATHER_EVENT,
        FACTION_CONFLICT,
        SUPPLY_DROP,
        INFECTION_OUTBREAK,
        TRADER_ARRIVAL,
        MYSTERIOUS_SIGNAL,
        BOSS_SPAWN
    }
    
    WorldState public worldState;
    mapping(uint256 => GeneratedEvent) public events;
    mapping(uint256 => GeneratedQuest) public quests;
    mapping(uint256 => NarrativeArc) public narrativeArcs;
    
    uint256 public eventCounter;
    uint256 public questCounter;
    uint256 public arcCounter;
    
    uint256 private nonce;
    uint256 private constant EVOLUTION_INTERVAL = 2880; // ~12 hours at 15s blocks
    uint256 private constant SEASON_LENGTH = 172800; // ~30 days
    
    event EventGenerated(uint256 indexed eventId, EventType eventType, uint256 locationId);
    event QuestGenerated(uint256 indexed questId, string title, uint256 deadline);
    event WorldEvolved(uint256 cycle, uint256 infectionLevel, uint256 season);
    event NarrativeArcStarted(uint256 indexed arcId, string name);
    event NarrativeArcCompleted(uint256 indexed arcId);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EVOLUTION_ROLE, msg.sender);
        
        // Initialize world state
        worldState = WorldState({
            currentSeason: 0,
            infectionLevel: 30,
            resourceScarcity: 40,
            totalSurvivors: 0,
            totalDeaths: 0,
            totalLocationsDiscovered: 1,
            lastEvolutionBlock: block.number,
            evolutionCycle: 0
        });
    }
    
    /**
     * @notice Evolve the world state - called periodically
     */
    function evolveWorld() external onlyRole(EVOLUTION_ROLE) {
        require(block.number >= worldState.lastEvolutionBlock + EVOLUTION_INTERVAL, "Too soon to evolve");
        
        worldState.evolutionCycle++;
        worldState.lastEvolutionBlock = block.number;
        
        // Update season
        uint256 blocksSinceGenesis = block.number;
        worldState.currentSeason = (blocksSinceGenesis / SEASON_LENGTH) % 4;
        
        // Evolve infection level based on survivor actions
        _evolveInfectionLevel();
        
        // Evolve resource scarcity
        _evolveResourceScarcity();
        
        // Generate random events based on world state
        _generateWorldEvents();
        
        // Check and progress narrative arcs
        _progressNarrativeArcs();
        
        emit WorldEvolved(worldState.evolutionCycle, worldState.infectionLevel, worldState.currentSeason);
    }
    
    /**
     * @notice Generate a random event at a location
     */
    function generateEvent(uint256 locationId) external onlyRole(EVOLUTION_ROLE) returns (uint256) {
        uint256 eventId = eventCounter++;
        
        EventType eventType = _determineEventType();
        GeneratedEvent storage newEvent = events[eventId];
        
        newEvent.id = eventId;
        newEvent.title = _generateEventTitle(eventType);
        newEvent.description = _generateEventDescription(eventType);
        newEvent.locationId = locationId;
        newEvent.triggerBlock = block.number;
        newEvent.duration = _calculateEventDuration(eventType);
        newEvent.severity = _calculateEventSeverity();
        newEvent.eventType = eventType;
        newEvent.isActive = true;
        
        emit EventGenerated(eventId, eventType, locationId);
        
        return eventId;
    }
    
    /**
     * @notice Generate a procedural quest
     */
    function generateQuest(
        address creator,
        uint256 difficulty
    ) external onlyRole(EVOLUTION_ROLE) returns (uint256) {
        uint256 questId = questCounter++;
        
        GeneratedQuest storage newQuest = quests[questId];
        newQuest.id = questId;
        newQuest.title = _generateQuestTitle(difficulty);
        newQuest.description = _generateQuestDescription(difficulty);
        newQuest.objectives = _generateQuestObjectives(difficulty);
        newQuest.rewardItemId = _selectRewardItem(difficulty);
        newQuest.rewardAmount = difficulty * 10;
        newQuest.experienceReward = difficulty * 100;
        newQuest.deadline = block.number + (difficulty * 1000);
        newQuest.creator = creator;
        newQuest.isCompleted = false;
        
        emit QuestGenerated(questId, newQuest.title, newQuest.deadline);
        
        return questId;
    }
    
    /**
     * @notice Start a new narrative arc
     */
    function startNarrativeArc(
        string memory name,
        string memory description,
        uint256 duration
    ) external onlyRole(EVOLUTION_ROLE) returns (uint256) {
        uint256 arcId = arcCounter++;
        
        NarrativeArc storage newArc = narrativeArcs[arcId];
        newArc.id = arcId;
        newArc.name = name;
        newArc.description = description;
        newArc.startBlock = block.number;
        newArc.endBlock = block.number + duration;
        newArc.isActive = true;
        
        emit NarrativeArcStarted(arcId, name);
        
        return arcId;
    }
    
    /**
     * @notice Generate content based on blockchain entropy
     */
    function generateContent(
        string memory contentType,
        uint256 seed
    ) external view returns (string memory) {
        uint256 random = _random(seed);
        
        if (keccak256(bytes(contentType)) == keccak256(bytes("survivor_backstory"))) {
            return _generateSurvivorBackstory(random);
        } else if (keccak256(bytes(contentType)) == keccak256(bytes("item_lore"))) {
            return _generateItemLore(random);
        } else if (keccak256(bytes(contentType)) == keccak256(bytes("location_history"))) {
            return _generateLocationHistory(random);
        } else {
            return "Unknown content type";
        }
    }
    
    /**
     * @notice Evolve infection level based on world events
     */
    function _evolveInfectionLevel() private {
        uint256 random = _random(block.number);
        
        // Infection spreads faster in winter
        if (worldState.currentSeason == 3) {
            worldState.infectionLevel += uint256(random % 5) + 3;
        } else {
            worldState.infectionLevel += uint256(random % 3) + 1;
        }
        
        // Cap at 100
        if (worldState.infectionLevel > 100) {
            worldState.infectionLevel = 100;
        }
        
        // Reduce if survivors are doing well
        if (worldState.totalSurvivors > worldState.totalDeaths * 2) {
            worldState.infectionLevel = worldState.infectionLevel > 5 ? worldState.infectionLevel - 5 : 0;
        }
    }
    
    /**
     * @notice Evolve resource scarcity
     */
    function _evolveResourceScarcity() private {
        uint256 random = _random(block.timestamp);
        
        // Resources become scarcer over time
        worldState.resourceScarcity += uint256(random % 3) + 1;
        
        // Winter makes resources scarcer
        if (worldState.currentSeason == 3) {
            worldState.resourceScarcity += 5;
        }
        
        // Cap at 100
        if (worldState.resourceScarcity > 100) {
            worldState.resourceScarcity = 100;
        }
    }
    
    /**
     * @notice Generate world events based on state
     */
    function _generateWorldEvents() private {
        // Higher infection = more zombie events
        if (worldState.infectionLevel > 70) {
            generateEvent(_randomLocation());
        }
        
        // Resource scarcity might trigger supply drops
        if (worldState.resourceScarcity > 80 && _random(1) % 100 < 30) {
            uint256 eventId = eventCounter++;
            GeneratedEvent storage supplyDrop = events[eventId];
            supplyDrop.eventType = EventType.SUPPLY_DROP;
            supplyDrop.title = "Emergency Supply Drop";
            supplyDrop.isActive = true;
        }
    }
    
    /**
     * @notice Progress narrative arcs
     */
    function _progressNarrativeArcs() private {
        // Check active arcs and generate related events
        for (uint i = 0; i < arcCounter; i++) {
            if (narrativeArcs[i].isActive && block.number >= narrativeArcs[i].endBlock) {
                narrativeArcs[i].isActive = false;
                emit NarrativeArcCompleted(i);
            }
        }
    }
    
    /**
     * @notice Determine event type based on world state
     */
    function _determineEventType() private view returns (EventType) {
        uint256 random = _random(block.timestamp) % 100;
        
        if (worldState.infectionLevel > 60 && random < 30) {
            return EventType.ZOMBIE_HORDE;
        } else if (worldState.resourceScarcity > 70 && random < 40) {
            return EventType.RESOURCE_CACHE;
        } else if (random < 50) {
            return EventType.SURVIVOR_ENCOUNTER;
        } else if (worldState.currentSeason == 3 && random < 60) {
            return EventType.WEATHER_EVENT;
        } else if (random < 70) {
            return EventType.FACTION_CONFLICT;
        } else if (random < 80) {
            return EventType.TRADER_ARRIVAL;
        } else if (random < 90) {
            return EventType.MYSTERIOUS_SIGNAL;
        } else {
            return EventType.BOSS_SPAWN;
        }
    }
    
    /**
     * @notice Generate event title
     */
    function _generateEventTitle(EventType eventType) private pure returns (string memory) {
        if (eventType == EventType.ZOMBIE_HORDE) return "The Walking Dead Approach";
        else if (eventType == EventType.RESOURCE_CACHE) return "Hidden Supplies Discovered";
        else if (eventType == EventType.SURVIVOR_ENCOUNTER) return "Survivors in Need";
        else if (eventType == EventType.WEATHER_EVENT) return "Harsh Weather Strikes";
        else if (eventType == EventType.FACTION_CONFLICT) return "Faction Tensions Rise";
        else if (eventType == EventType.SUPPLY_DROP) return "Military Supply Drop";
        else if (eventType == EventType.INFECTION_OUTBREAK) return "Infection Spreads";
        else if (eventType == EventType.TRADER_ARRIVAL) return "Mysterious Trader Appears";
        else if (eventType == EventType.MYSTERIOUS_SIGNAL) return "Strange Signal Detected";
        else return "Ancient Horror Awakens";
    }
    
    /**
     * @notice Generate event description
     */
    function _generateEventDescription(EventType eventType) private pure returns (string memory) {
        if (eventType == EventType.ZOMBIE_HORDE) {
            return "A massive horde of infected approaches. Prepare defenses or evacuate immediately.";
        } else if (eventType == EventType.RESOURCE_CACHE) {
            return "Scouts report an untouched cache of supplies nearby. Move quickly before others claim it.";
        } else {
            return "Something unexpected has occurred. Investigate carefully.";
        }
    }
    
    /**
     * @notice Generate quest title based on difficulty
     */
    function _generateQuestTitle(uint256 difficulty) private pure returns (string memory) {
        if (difficulty < 3) return "Supply Run";
        else if (difficulty < 6) return "Rescue Mission";
        else if (difficulty < 9) return "Clear the Infection";
        else return "Impossible Odds";
    }
    
    /**
     * @notice Generate quest description
     */
    function _generateQuestDescription(uint256 difficulty) private pure returns (string memory) {
        if (difficulty < 3) {
            return "Basic survival task. Low risk, modest reward.";
        } else if (difficulty < 6) {
            return "Moderate challenge requiring preparation and skill.";
        } else {
            return "Extreme danger. Only the most prepared should attempt.";
        }
    }
    
    /**
     * @notice Generate quest objectives
     */
    function _generateQuestObjectives(uint256 difficulty) private pure returns (uint256[] memory) {
        uint256[] memory objectives = new uint256[](difficulty + 1);
        for (uint i = 0; i <= difficulty; i++) {
            objectives[i] = i + 1;
        }
        return objectives;
    }
    
    /**
     * @notice Select reward item based on difficulty
     */
    function _selectRewardItem(uint256 difficulty) private pure returns (uint256) {
        return difficulty * 10 + 1; // Simple formula, would be more complex in production
    }
    
    /**
     * @notice Calculate event duration
     */
    function _calculateEventDuration(EventType eventType) private pure returns (uint256) {
        if (eventType == EventType.ZOMBIE_HORDE) return 100;
        else if (eventType == EventType.TRADER_ARRIVAL) return 50;
        else return 200;
    }
    
    /**
     * @notice Calculate event severity
     */
    function _calculateEventSeverity() private view returns (uint256) {
        uint256 baseSeverity = (worldState.infectionLevel / 10) + 1;
        uint256 random = _random(block.timestamp) % 5;
        return baseSeverity + random;
    }
    
    /**
     * @notice Generate survivor backstory
     */
    function _generateSurvivorBackstory(uint256 seed) private pure returns (string memory) {
        uint256 variant = seed % 5;
        if (variant == 0) return "Former military, lost squad to infection. Carries guilt and determination.";
        else if (variant == 1) return "Doctor who couldn't save their patients. Seeks redemption through helping others.";
        else if (variant == 2) return "Parent searching for lost children. Hope keeps them going despite impossible odds.";
        else if (variant == 3) return "Criminal given second chance by apocalypse. Questions whether to change or survive.";
        else return "Ordinary person thrust into extraordinary circumstances. Discovering hidden strength.";
    }
    
    /**
     * @notice Generate item lore
     */
    function _generateItemLore(uint256 seed) private pure returns (string memory) {
        uint256 variant = seed % 4;
        if (variant == 0) return "Military prototype, field-tested in the final days before collapse.";
        else if (variant == 1) return "Handcrafted by survivor commune, each mark tells a story of loss.";
        else if (variant == 2) return "Pre-war relic, pristine condition suggests hidden cache origin.";
        else return "Modified and improved through countless encounters, reliable companion.";
    }
    
    /**
     * @notice Generate location history
     */
    function _generateLocationHistory(uint256 seed) private pure returns (string memory) {
        uint256 variant = seed % 4;
        if (variant == 0) return "Former evacuation point, abandoned when infection breached perimeter.";
        else if (variant == 1) return "Secret research facility, experiments may explain local mutations.";
        else if (variant == 2) return "Thriving settlement until faction war left it in ruins.";
        else return "Natural fortress, multiple groups fought and died for control.";
    }
    
    /**
     * @notice Get random location ID
     */
    function _randomLocation() private view returns (uint256) {
        return _random(block.timestamp) % worldState.totalLocationsDiscovered;
    }
    
    /**
     * @notice Generate pseudo-random number
     */
    function _random(uint256 seed) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, nonce, seed)));
    }
}