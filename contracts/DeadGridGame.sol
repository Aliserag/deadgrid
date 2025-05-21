// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {CadenceRandomConsumer} from "@onflow/flow-sol-utils/src/random/CadenceRandomConsumer.sol";

/**
 * @title DeadGridGame
 * @dev A zombie apocalypse game that uses Flow VRF for randomization
 */
contract DeadGridGame is CadenceRandomConsumer {
    // Events
    event ZombieAttack(uint64 zombieCount, uint64 damage, uint64 survivorHealth);
    event ItemFound(string item, uint64 durability);
    event LocationExplored(string location, bool isDangerous);
    event RandomEventTriggered(string eventName, uint64 impactValue);

    // Errors
    error InvalidProbability();
    error InvalidEventId();

    // Game state variables
    address public owner;
    mapping(address => Survivor) public survivors;
    
    // Game structures
    struct Survivor {
        uint64 health;
        uint64 morale;
        uint64 water;
        uint64 food;
        uint64 day;
        uint64 baseDefense;
        bool isAlive;
        string[] gear;
        string lastAction;
    }
    
    struct GameEvent {
        string name;
        uint64 chance; // Represented as 0-100
    }
    
    // Game events with their chances (out of 100)
    GameEvent[] public gameEvents;
    string[] public nightActions = ["scavenge", "rest", "defend", "craft", "signal"];
    
    constructor() {
        owner = msg.sender;
        
        // Initialize game events and their chances
        gameEvents.push(GameEvent("raider_attack", 12));
        gameEvents.push(GameEvent("stranger_offers_help", 9));
        gameEvents.push(GameEvent("hallucination", 7));
        gameEvents.push(GameEvent("supply_drop", 10));
        gameEvents.push(GameEvent("base_fire", 5));
        gameEvents.push(GameEvent("new_faction_sighting", 5));
        gameEvents.push(GameEvent("discovered_artifact", 5));
        gameEvents.push(GameEvent("gear_buff", 7));
        gameEvents.push(GameEvent("build_structure", 10));
        gameEvents.push(GameEvent("nothing", 30));
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the game owner");
        _;
    }
    
    /**
     * @dev Creates a new survivor for the caller
     */
    function createSurvivor() external {
        require(survivors[msg.sender].day == 0, "Survivor already exists");
        
        string[] memory initialGear = new string[](1);
        initialGear[0] = "flashlight";
        
        survivors[msg.sender] = Survivor({
            health: 100,
            morale: 80,
            water: 3,
            food: 4,
            day: 1,
            baseDefense: 1,
            isAlive: true,
            gear: initialGear,
            lastAction: "none"
        });
    }
    
    /**
     * @dev Simulates a random night action taken by the survivor
     * @return actionTaken The action that was selected
     * @return eventTriggered The random event that was triggered
     */
    function simulateNight() external returns (string memory actionTaken, string memory eventTriggered) {
        require(survivors[msg.sender].isAlive, "Survivor is not alive");
        Survivor storage survivor = survivors[msg.sender];
        
        // Decrement resources
        if (survivor.water > 0) survivor.water--;
        if (survivor.food > 0) survivor.food--;
        
        // Apply effects of zero resources
        if (survivor.water == 0) survivor.health -= 10;
        if (survivor.food == 0) survivor.health -= 5;
        
        // Check if survivor died
        if (survivor.health <= 0) {
            survivor.isAlive = false;
            return ("none", "survivor_died");
        }
        
        // Select random night action
        uint64 actionIndex = _getRevertibleRandomInRange(0, uint64(nightActions.length - 1));
        string memory action = nightActions[actionIndex];
        survivor.lastAction = action;
        
        // Select random event
        uint64 eventRoll = _getRevertibleRandomInRange(1, 100);
        uint64 cumulativeChance = 0;
        string memory event = "nothing";
        
        for (uint i = 0; i < gameEvents.length; i++) {
            cumulativeChance += gameEvents[i].chance;
            if (eventRoll <= cumulativeChance) {
                event = gameEvents[i].name;
                break;
            }
        }
        
        // Apply action effects
        if (keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("scavenge"))) {
            // 70% chance to find food/water
            if (_getRevertibleRandomInRange(1, 100) <= 70) {
                survivor.food += _getRevertibleRandomInRange(1, 3);
                survivor.water += _getRevertibleRandomInRange(1, 2);
                
                // 30% chance to find a new item
                if (_getRevertibleRandomInRange(1, 100) <= 30) {
                    string[] memory possibleItems = new string[](5);
                    possibleItems[0] = "knife";
                    possibleItems[1] = "medkit";
                    possibleItems[2] = "rope";
                    possibleItems[3] = "radio";
                    possibleItems[4] = "battery";
                    
                    uint64 itemIndex = _getRevertibleRandomInRange(0, 4);
                    string memory newItem = possibleItems[itemIndex];
                    
                    // Add to gear array
                    uint currentLength = survivor.gear.length;
                    string[] memory tempGear = new string[](currentLength + 1);
                    for (uint i = 0; i < currentLength; i++) {
                        tempGear[i] = survivor.gear[i];
                    }
                    tempGear[currentLength] = newItem;
                    
                    delete survivor.gear;
                    for (uint i = 0; i < tempGear.length; i++) {
                        survivor.gear.push(tempGear[i]);
                    }
                    
                    // Emit item found event
                    emit ItemFound(newItem, 10);
                }
            } else {
                // Scavenging failed, morale decrease
                if (survivor.morale >= 5) survivor.morale -= 5;
            }
        } else if (keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("rest"))) {
            // Resting recovers health and morale
            if (survivor.health <= 90) survivor.health += 10;
            if (survivor.morale <= 90) survivor.morale += 10;
        } else if (keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("defend"))) {
            // Defending improves base defense
            survivor.baseDefense += 1;
        }
        
        // Apply event effects
        if (keccak256(abi.encodePacked(event)) == keccak256(abi.encodePacked("raider_attack"))) {
            uint64 damage = _getRevertibleRandomInRange(10, 30);
            // Base defense reduces damage
            if (damage > survivor.baseDefense * 5) {
                damage -= survivor.baseDefense * 5;
                survivor.health = (survivor.health > damage) ? survivor.health - damage : 0;
                emit ZombieAttack(5, damage, survivor.health);
            } else {
                // Defense held
                damage = 0;
                emit ZombieAttack(5, 0, survivor.health);
            }
        } else if (keccak256(abi.encodePacked(event)) == keccak256(abi.encodePacked("supply_drop"))) {
            survivor.food += _getRevertibleRandomInRange(3, 6);
            survivor.water += _getRevertibleRandomInRange(3, 6);
            survivor.morale += 10;
        }
        
        // Increment day
        survivor.day++;
        
        // Handle death condition
        if (survivor.health <= 0) {
            survivor.isAlive = false;
        }
        
        // Trigger random event
        uint64 impactValue = _getRevertibleRandomInRange(1, 100);
        emit RandomEventTriggered(event, impactValue);
        
        return (action, event);
    }
    
    /**
     * @dev Gets a random number between min and max (inclusive)
     * @param min The minimum value
     * @param max The maximum value
     */
    function getRandomNumberInRange(uint64 min, uint64 max) public view returns (uint64) {
        if (min > max) revert InvalidProbability();
        return _getRevertibleRandomInRange(min, max);
    }
    
    /**
     * @dev Gets a random game event
     */
    function triggerRandomEvent() public view returns (string memory) {
        uint64 eventRoll = _getRevertibleRandomInRange(1, 100);
        uint64 cumulativeChance = 0;
        
        for (uint i = 0; i < gameEvents.length; i++) {
            cumulativeChance += gameEvents[i].chance;
            if (eventRoll <= cumulativeChance) {
                return gameEvents[i].name;
            }
        }
        
        return "nothing"; // Fallback
    }
    
    /**
     * @dev Gets the current state of a survivor
     */
    function getSurvivorState(address survivorAddress) external view returns (
        uint64 health,
        uint64 morale, 
        uint64 water,
        uint64 food,
        uint64 day,
        uint64 baseDefense,
        bool isAlive,
        string memory lastAction
    ) {
        Survivor storage survivor = survivors[survivorAddress];
        return (
            survivor.health,
            survivor.morale,
            survivor.water,
            survivor.food,
            survivor.day,
            survivor.baseDefense,
            survivor.isAlive,
            survivor.lastAction
        );
    }
    
    /**
     * @dev Gets the gear of a survivor
     */
    function getSurvivorGear(address survivorAddress) external view returns (string[] memory) {
        return survivors[survivorAddress].gear;
    }
} 