// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDeadGrid
 * @notice Core interface for the DeadGrid decentralized survival game
 * @dev Defines the main game mechanics and cross-contract interactions
 */
interface IDeadGrid {
    // Game state enums
    enum GamePhase { 
        EXPLORATION, 
        COMBAT, 
        CAMP_MANAGEMENT, 
        TRADING, 
        EVENT 
    }
    
    enum Rarity { 
        COMMON, 
        UNCOMMON, 
        RARE, 
        EPIC, 
        LEGENDARY, 
        MYTHIC 
    }
    
    enum ItemType { 
        WEAPON, 
        ARMOR, 
        CONSUMABLE, 
        MATERIAL, 
        TOOL, 
        BLUEPRINT 
    }
    
    enum LocationType { 
        SAFEZONE, 
        SCAVENGING_SITE, 
        DUNGEON, 
        SETTLEMENT, 
        WASTELAND, 
        INFECTED_ZONE 
    }

    // Core structs
    struct Stats {
        uint16 health;
        uint16 maxHealth;
        uint16 strength;
        uint16 agility;
        uint16 intelligence;
        uint16 luck;
        uint16 survival;
    }
    
    struct Position {
        int32 x;
        int32 y;
        uint32 locationId;
    }
    
    // Events
    event SurvivorSpawned(uint256 indexed tokenId, address indexed owner);
    event ItemCrafted(uint256 indexed itemId, address indexed crafter);
    event LocationDiscovered(uint256 indexed locationId, address indexed discoverer);
    event CombatInitiated(uint256 indexed attackerId, uint256 indexed defenderId);
    event TradeCompleted(address indexed seller, address indexed buyer, uint256[] itemIds);
    event EventTriggered(uint256 indexed eventId, uint256 indexed locationId);
    
    // Core functions
    function startNewGame(address player) external returns (uint256 survivorId);
    function enterLocation(uint256 survivorId, uint256 locationId) external;
    function scavenge(uint256 survivorId) external returns (uint256[] memory items);
    function craft(uint256[] memory materials, uint256 blueprintId) external returns (uint256 itemId);
    function trade(uint256[] memory offeredItems, uint256[] memory requestedItems, address counterparty) external;
}