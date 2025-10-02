// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../core/IDeadGrid.sol";

/**
 * @title GameMechanics
 * @notice Core game mechanics including combat, scavenging, and survival
 * @dev Handles all game actions and interactions between entities
 */
contract GameMechanics is AccessControl, IDeadGrid {
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    // Interfaces to other contracts
    address public survivorContract;
    address public itemContract;
    address public locationContract;
    address public generatorContract;
    
    struct Combat {
        uint256 attackerId;
        uint256 defenderId;
        uint256 startBlock;
        uint256 rounds;
        bool isActive;
        uint256 attackerDamageDealt;
        uint256 defenderDamageDealt;
        address winner;
    }
    
    struct ScavengeResult {
        uint256[] itemIds;
        uint256[] quantities;
        uint256 experienceGained;
        bool encounteredDanger;
        uint256 damageT taken;
    }
    
    struct CraftingSession {
        address crafter;
        uint256 survivorId;
        uint256[] inputItems;
        uint256 outputItem;
        uint256 startBlock;
        uint256 completionBlock;
        bool completed;
    }
    
    struct SurvivalStatus {
        uint256 hungerLevel; // 0-100, 100 = starving
        uint256 thirstLevel; // 0-100, 100 = dehydrated
        uint256 fatigueLevel; // 0-100, 100 = exhausted
        uint256 infectionRisk; // 0-100, 100 = infected
        uint256 lastUpdateBlock;
    }
    
    mapping(uint256 => Combat) public activeCombats;
    mapping(uint256 => SurvivalStatus) public survivalStatus; // survivorId => status
    mapping(uint256 => CraftingSession) public craftingSessions;
    mapping(uint256 => mapping(uint256 => uint256)) public lastScavenge; // survivorId => locationId => block
    
    uint256 public combatCounter;
    uint256 public craftingCounter;
    
    uint256 private constant SCAVENGE_COOLDOWN = 100; // blocks
    uint256 private constant HUNGER_RATE = 10; // blocks per hunger point
    uint256 private constant THIRST_RATE = 5; // blocks per thirst point
    uint256 private constant FATIGUE_RATE = 20; // blocks per fatigue point
    
    event CombatStarted(uint256 indexed combatId, uint256 attackerId, uint256 defenderId);
    event CombatEnded(uint256 indexed combatId, address winner);
    event ScavengeCompleted(uint256 indexed survivorId, uint256 locationId, uint256 itemsFound);
    event CraftingStarted(uint256 indexed sessionId, address crafter, uint256 outputItem);
    event CraftingCompleted(uint256 indexed sessionId, uint256 outputItem);
    event SurvivalStatusUpdated(uint256 indexed survivorId, SurvivalStatus status);
    event SurvivorInfected(uint256 indexed survivorId, uint256 severity);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_MASTER_ROLE, msg.sender);
    }
    
    /**
     * @notice Set contract addresses for integration
     */
    function setContracts(
        address _survivor,
        address _item,
        address _location,
        address _generator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        survivorContract = _survivor;
        itemContract = _item;
        locationContract = _location;
        generatorContract = _generator;
    }
    
    /**
     * @notice Initiate combat between two survivors
     */
    function initiateCombat(
        uint256 attackerId,
        uint256 defenderId
    ) external onlyRole(GAME_MASTER_ROLE) returns (uint256) {
        require(attackerId != defenderId, "Cannot attack self");
        
        uint256 combatId = combatCounter++;
        
        Combat storage newCombat = activeCombats[combatId];
        newCombat.attackerId = attackerId;
        newCombat.defenderId = defenderId;
        newCombat.startBlock = block.number;
        newCombat.isActive = true;
        
        emit CombatStarted(combatId, attackerId, defenderId);
        emit CombatInitiated(attackerId, defenderId);
        
        return combatId;
    }
    
    /**
     * @notice Resolve a combat round
     */
    function resolveCombatRound(uint256 combatId) external onlyRole(VALIDATOR_ROLE) {
        Combat storage combat = activeCombats[combatId];
        require(combat.isActive, "Combat not active");
        
        // Get survivor stats (would interface with SurvivorNFT)
        uint256 attackerStrength = _getSurvivorStat(combat.attackerId, "strength");
        uint256 defenderStrength = _getSurvivorStat(combat.defenderId, "strength");
        uint256 attackerAgility = _getSurvivorStat(combat.attackerId, "agility");
        uint256 defenderAgility = _getSurvivorStat(combat.defenderId, "agility");
        
        // Calculate damage
        uint256 attackerDamage = _calculateDamage(attackerStrength, defenderAgility);
        uint256 defenderDamage = _calculateDamage(defenderStrength, attackerAgility);
        
        combat.attackerDamageDealt += attackerDamage;
        combat.defenderDamageDealt += defenderDamage;
        combat.rounds++;
        
        // Check for winner (simplified - would check actual health)
        if (combat.attackerDamageDealt > 100) {
            combat.isActive = false;
            combat.winner = _getSurvivorOwner(combat.attackerId);
            emit CombatEnded(combatId, combat.winner);
        } else if (combat.defenderDamageDealt > 100) {
            combat.isActive = false;
            combat.winner = _getSurvivorOwner(combat.defenderId);
            emit CombatEnded(combatId, combat.winner);
        } else if (combat.rounds > 10) {
            // Draw after 10 rounds
            combat.isActive = false;
            emit CombatEnded(combatId, address(0));
        }
    }
    
    /**
     * @notice Scavenge at a location
     */
    function scavengeLocation(
        uint256 survivorId,
        uint256 locationId
    ) external onlyRole(GAME_MASTER_ROLE) returns (ScavengeResult memory) {
        require(
            block.number >= lastScavenge[survivorId][locationId] + SCAVENGE_COOLDOWN,
            "Location recently scavenged"
        );
        
        lastScavenge[survivorId][locationId] = block.number;
        
        // Get location danger and resources (would interface with LocationNFT)
        uint256 dangerLevel = _getLocationDanger(locationId);
        uint256 resourceLevel = _getLocationResources(locationId);
        
        ScavengeResult memory result;
        
        // Calculate items found based on survivor stats and location
        uint256 luck = _getSurvivorStat(survivorId, "luck");
        uint256 survival = _getSurvivorStat(survivorId, "survival");
        
        uint256 itemCount = _calculateItemsFound(resourceLevel, luck, survival);
        result.itemIds = new uint256[](itemCount);
        result.quantities = new uint256[](itemCount);
        
        for (uint i = 0; i < itemCount; i++) {
            result.itemIds[i] = _generateRandomItem(resourceLevel);
            result.quantities[i] = 1;
        }
        
        result.experienceGained = itemCount * 10;
        
        // Check for danger encounter
        uint256 random = _random(survivorId + locationId) % 100;
        if (random < dangerLevel) {
            result.encounteredDanger = true;
            result.damageTaken = dangerLevel / 2;
            
            // Increase infection risk
            survivalStatus[survivorId].infectionRisk += dangerLevel / 10;
        }
        
        emit ScavengeCompleted(survivorId, locationId, itemCount);
        
        return result;
    }
    
    /**
     * @notice Start a crafting session
     */
    function startCrafting(
        uint256 survivorId,
        uint256[] memory inputItems,
        uint256 blueprintId
    ) external returns (uint256) {
        uint256 sessionId = craftingCounter++;
        
        CraftingSession storage session = craftingSessions[sessionId];
        session.crafter = _getSurvivorOwner(survivorId);
        session.survivorId = survivorId;
        session.inputItems = inputItems;
        session.outputItem = _getBlueprintOutput(blueprintId);
        session.startBlock = block.number;
        session.completionBlock = block.number + _getCraftingTime(blueprintId);
        
        emit CraftingStarted(sessionId, session.crafter, session.outputItem);
        
        return sessionId;
    }
    
    /**
     * @notice Complete a crafting session
     */
    function completeCrafting(uint256 sessionId) external {
        CraftingSession storage session = craftingSessions[sessionId];
        require(!session.completed, "Already completed");
        require(block.number >= session.completionBlock, "Not ready yet");
        require(msg.sender == session.crafter, "Not the crafter");
        
        session.completed = true;
        
        // Mint the crafted item (would interface with ItemNFT)
        _mintItem(session.crafter, session.outputItem, 1);
        
        emit CraftingCompleted(sessionId, session.outputItem);
        emit ItemCrafted(session.outputItem, session.crafter);
    }
    
    /**
     * @notice Update survivor's survival status
     */
    function updateSurvivalStatus(uint256 survivorId) external {
        SurvivalStatus storage status = survivalStatus[survivorId];
        
        uint256 blocksPassed = block.number - status.lastUpdateBlock;
        
        // Increase hunger and thirst
        status.hungerLevel += blocksPassed / HUNGER_RATE;
        status.thirstLevel += blocksPassed / THIRST_RATE;
        status.fatigueLevel += blocksPassed / FATIGUE_RATE;
        
        // Cap at 100
        if (status.hungerLevel > 100) status.hungerLevel = 100;
        if (status.thirstLevel > 100) status.thirstLevel = 100;
        if (status.fatigueLevel > 100) status.fatigueLevel = 100;
        
        // Check for infection
        if (status.infectionRisk > 50 && _random(survivorId) % 100 < status.infectionRisk) {
            emit SurvivorInfected(survivorId, status.infectionRisk);
        }
        
        status.lastUpdateBlock = block.number;
        
        emit SurvivalStatusUpdated(survivorId, status);
    }
    
    /**
     * @notice Consume food/water to reduce hunger/thirst
     */
    function consumeSupplies(
        uint256 survivorId,
        uint256 itemId
    ) external {
        require(msg.sender == _getSurvivorOwner(survivorId), "Not owner");
        
        // Get item stats (would interface with ItemNFT)
        (uint256 foodValue, uint256 waterValue) = _getItemConsumableValues(itemId);
        
        SurvivalStatus storage status = survivalStatus[survivorId];
        
        status.hungerLevel = status.hungerLevel > foodValue ? 
            status.hungerLevel - foodValue : 0;
        status.thirstLevel = status.thirstLevel > waterValue ? 
            status.thirstLevel - waterValue : 0;
        
        // Consume the item
        _consumeItem(msg.sender, itemId);
        
        emit SurvivalStatusUpdated(survivorId, status);
    }
    
    /**
     * @notice Rest to reduce fatigue
     */
    function rest(uint256 survivorId, uint256 duration) external {
        require(msg.sender == _getSurvivorOwner(survivorId), "Not owner");
        require(duration > 0 && duration <= 100, "Invalid duration");
        
        SurvivalStatus storage status = survivalStatus[survivorId];
        
        uint256 fatigueReduction = duration * 2;
        status.fatigueLevel = status.fatigueLevel > fatigueReduction ?
            status.fatigueLevel - fatigueReduction : 0;
            
        // But increases hunger/thirst
        status.hungerLevel += duration / 10;
        status.thirstLevel += duration / 5;
        
        emit SurvivalStatusUpdated(survivorId, status);
    }
    
    // Helper functions (would interface with other contracts in production)
    
    function _getSurvivorStat(uint256, string memory) private pure returns (uint256) {
        return 10; // Placeholder
    }
    
    function _getSurvivorOwner(uint256) private pure returns (address) {
        return address(0); // Placeholder
    }
    
    function _getLocationDanger(uint256) private pure returns (uint256) {
        return 30; // Placeholder
    }
    
    function _getLocationResources(uint256) private pure returns (uint256) {
        return 50; // Placeholder
    }
    
    function _generateRandomItem(uint256 resourceLevel) private view returns (uint256) {
        return _random(resourceLevel) % 100;
    }
    
    function _getBlueprintOutput(uint256) private pure returns (uint256) {
        return 1; // Placeholder
    }
    
    function _getCraftingTime(uint256) private pure returns (uint256) {
        return 10; // Placeholder
    }
    
    function _mintItem(address, uint256, uint256) private pure {
        // Placeholder
    }
    
    function _getItemConsumableValues(uint256) private pure returns (uint256, uint256) {
        return (20, 30); // Placeholder food, water values
    }
    
    function _consumeItem(address, uint256) private pure {
        // Placeholder
    }
    
    function _calculateDamage(uint256 strength, uint256 enemyAgility) private view returns (uint256) {
        uint256 baseDamage = strength * 2;
        uint256 dodgeChance = enemyAgility * 5;
        uint256 random = _random(strength + enemyAgility) % 100;
        
        if (random < dodgeChance) {
            return baseDamage / 2; // Partial dodge
        }
        return baseDamage;
    }
    
    function _calculateItemsFound(
        uint256 resourceLevel,
        uint256 luck,
        uint256 survival
    ) private view returns (uint256) {
        uint256 base = resourceLevel / 20;
        uint256 bonus = (luck + survival) / 10;
        uint256 random = _random(resourceLevel + luck) % 3;
        return base + bonus + random;
    }
    
    function _random(uint256 seed) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, seed)));
    }
    
    // Interface implementations
    function startNewGame(address) external pure override returns (uint256) {
        return 0; // Implemented in SurvivorNFT
    }
    
    function enterLocation(uint256, uint256) external pure override {
        // Implemented in LocationNFT
    }
    
    function scavenge(uint256 survivorId) external override returns (uint256[] memory) {
        ScavengeResult memory result = this.scavengeLocation(survivorId, 0);
        return result.itemIds;
    }
    
    function craft(uint256[] memory materials, uint256 blueprintId) external override returns (uint256) {
        return this.startCrafting(0, materials, blueprintId);
    }
    
    function trade(uint256[] memory, uint256[] memory, address) external pure override {
        // Implemented in trading contract
    }

/**
 * @notice Check if survivor meets conditions for adaptive mutation activation
 * @param survivorId The ID of the survivor to check
 * @return mutationType The type of mutation that would activate (0 = none, 1 = night vision, 2 = radiation resistance, 3 = strength boost, 4 = stealth)
 * @return readiness The activation readiness percentage (0-100)
 */
function checkMutationReadiness(uint256 survivorId) external view returns (uint8 mutationType, uint8 readiness) {
    SurvivalStatus memory status = survivalStatus[survivorId];
    uint8 maxReadiness = 0;
    uint8 potentialMutation = 0;
    
    // Check health threshold for strength mutation
    if (status.healthLevel <= 15) {
        uint8 healthReadiness = uint8((15 - status.healthLevel) * 100 / 15);
        if (healthReadiness > maxReadiness) {
            maxReadiness = healthReadiness;
            potentialMutation = 3;
        }
    }
    
    // Check radiation threshold for radiation resistance mutation
    if (status.radiationLevel >= 85) {
        uint8 radiationReadiness = uint8((status.radiationLevel - 85) * 100 / 15);
        if (radiationReadiness > maxReadiness) {
            maxReadiness = radiationReadiness;
            potentialMutation = 2;
        }
    }
    
    // Check fatigue threshold for stealth mutation
    if (status.fatigueLevel >= 85) {
        uint8 fatigueReadiness = uint8((status.fatigueLevel - 85) * 100 / 15);
        if (fatigueReadiness > maxReadiness) {
            maxReadiness = fatigueReadiness;
            potentialMutation = 4;
        }
    }
    
    // Check hunger threshold for night vision mutation
    if (status.hungerLevel >= 85) {
        uint8 hungerReadiness = uint8((status.hungerLevel - 85) * 100 / 15);
        if (hungerReadiness > maxReadiness) {
            maxReadiness = hungerReadiness;
            potentialMutation = 1;
        }
    }
    
    return (potentialMutation, maxReadiness);
}

}