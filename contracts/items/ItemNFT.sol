// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../core/IDeadGrid.sol";

/**
 * @title ItemNFT
 * @notice ERC1155 contract for game items - allows multiple copies of items
 * @dev Items are procedurally generated with varying stats and attributes
 */
contract ItemNFT is ERC1155, AccessControl, IDeadGrid {
    using Counters for Counters.Counter;
    
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");
    bytes32 public constant CRAFTER_ROLE = keccak256("CRAFTER_ROLE");
    bytes32 public constant EVOLUTION_ROLE = keccak256("EVOLUTION_ROLE");
    
    Counters.Counter private _itemTypeCounter;
    
    struct Item {
        string name;
        string description;
        ItemType itemType;
        Rarity rarity;
        uint256 dna; // For procedural stat generation
        bool isConsumable;
        bool isStackable;
        uint32 weight; // In grams
        uint32 durability; // Current durability
        uint32 maxDurability;
        mapping(string => uint32) attributes; // Dynamic attributes
    }
    
    struct ItemStats {
        uint32 damage;
        uint32 defense;
        uint32 healAmount;
        uint32 foodValue;
        uint32 waterValue;
        uint32 craftingLevel;
        uint32 scavengeBonus;
        uint32 speedModifier;
    }
    
    struct Blueprint {
        uint256 resultItemId;
        uint256[] requiredItems;
        uint256[] requiredAmounts;
        uint32 craftingTime; // In blocks
        uint32 successRate; // 0-100
        uint32 skillRequired;
    }
    
    mapping(uint256 => Item) public items;
    mapping(uint256 => ItemStats) public itemStats;
    mapping(uint256 => Blueprint) public blueprints;
    mapping(uint256 => uint256) public totalSupply; // Track supply per item type
    mapping(uint256 => uint256) public maxSupply; // Max supply per item type (0 = unlimited)
    mapping(address => mapping(uint256 => uint256)) public equipped; // player => slot => itemId
    
    uint256 private nonce;
    uint256 private constant DNA_MODULUS = 10**14;
    
    event ItemCreated(uint256 indexed itemId, string name, ItemType itemType, Rarity rarity);
    event ItemCraftedBy(uint256 indexed itemId, address indexed crafter, uint256 amount);
    event ItemConsumed(uint256 indexed itemId, address indexed consumer);
    event ItemBroken(uint256 indexed itemId, address indexed owner);
    event BlueprintDiscovered(uint256 indexed blueprintId, address indexed discoverer);
    
    constructor(string memory uri) ERC1155(uri) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_MASTER_ROLE, msg.sender);
        _initializeBaseItems();
    }
    
    /**
     * @notice Create a new item type
     */
    function createItem(
        string memory name,
        string memory description,
        ItemType itemType,
        Rarity rarity,
        uint256 maxSupplyLimit
    ) public onlyRole(GAME_MASTER_ROLE) returns (uint256) {
        uint256 itemId = _itemTypeCounter.current();
        _itemTypeCounter.increment();
        
        uint256 dna = _generateDNA(name, itemId);
        
        Item storage newItem = items[itemId];
        newItem.name = name;
        newItem.description = description;
        newItem.itemType = itemType;
        newItem.rarity = rarity;
        newItem.dna = dna;
        newItem.isConsumable = (itemType == ItemType.CONSUMABLE);
        newItem.isStackable = (itemType != ItemType.WEAPON && itemType != ItemType.ARMOR);
        newItem.weight = _generateWeight(itemType, rarity);
        newItem.maxDurability = _generateDurability(itemType, rarity);
        newItem.durability = newItem.maxDurability;
        
        // Generate stats based on item type and rarity
        itemStats[itemId] = _generateItemStats(itemType, rarity, dna);
        maxSupply[itemId] = maxSupplyLimit;
        
        emit ItemCreated(itemId, name, itemType, rarity);
        return itemId;
    }
    
    /**
     * @notice Mint items to a player
     */
    function mintItem(
        address to,
        uint256 itemId,
        uint256 amount
    ) public onlyRole(GAME_MASTER_ROLE) {
        require(items[itemId].dna != 0, "Item does not exist");
        require(
            maxSupply[itemId] == 0 || totalSupply[itemId] + amount <= maxSupply[itemId],
            "Exceeds max supply"
        );
        
        totalSupply[itemId] += amount;
        _mint(to, itemId, amount, "");
    }
    
    /**
     * @notice Craft an item using blueprint
     */
    function craftItem(
        uint256 blueprintId,
        address crafter
    ) external onlyRole(CRAFTER_ROLE) returns (bool) {
        Blueprint memory blueprint = blueprints[blueprintId];
        require(blueprint.resultItemId != 0, "Invalid blueprint");
        
        // Check if crafter has required items
        for (uint i = 0; i < blueprint.requiredItems.length; i++) {
            require(
                balanceOf(crafter, blueprint.requiredItems[i]) >= blueprint.requiredAmounts[i],
                "Insufficient materials"
            );
        }
        
        // Check success rate
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, crafter, nonce++))) % 100;
        if (random > blueprint.successRate) {
            // Crafting failed but consume materials
            _consumeMaterials(crafter, blueprint.requiredItems, blueprint.requiredAmounts);
            return false;
        }
        
        // Consume materials
        _consumeMaterials(crafter, blueprint.requiredItems, blueprint.requiredAmounts);
        
        // Mint crafted item
        _mint(crafter, blueprint.resultItemId, 1, "");
        totalSupply[blueprint.resultItemId]++;
        
        emit ItemCraftedBy(blueprint.resultItemId, crafter, 1);
        emit ItemCrafted(blueprint.resultItemId, crafter);
        
        return true;
    }
    
    /**
     * @notice Consume an item
     */
    function consumeItem(
        uint256 itemId,
        address consumer
    ) external onlyRole(GAME_MASTER_ROLE) {
        require(items[itemId].isConsumable, "Item is not consumable");
        require(balanceOf(consumer, itemId) > 0, "No item to consume");
        
        _burn(consumer, itemId, 1);
        totalSupply[itemId]--;
        
        emit ItemConsumed(itemId, consumer);
    }
    
    /**
     * @notice Create a crafting blueprint
     */
    function createBlueprint(
        uint256 resultItemId,
        uint256[] memory requiredItems,
        uint256[] memory requiredAmounts,
        uint32 craftingTime,
        uint32 successRate,
        uint32 skillRequired
    ) external onlyRole(GAME_MASTER_ROLE) returns (uint256) {
        uint256 blueprintId = _itemTypeCounter.current();
        _itemTypeCounter.increment();
        
        blueprints[blueprintId] = Blueprint({
            resultItemId: resultItemId,
            requiredItems: requiredItems,
            requiredAmounts: requiredAmounts,
            craftingTime: craftingTime,
            successRate: successRate,
            skillRequired: skillRequired
        });
        
        return blueprintId;
    }
    
    /**
     * @notice Initialize base game items
     */
    function _initializeBaseItems() private {
        // Create basic items
        createItem("Rusty Knife", "A worn blade, better than nothing", ItemType.WEAPON, Rarity.COMMON, 0);
        createItem("Torn Jacket", "Provides minimal protection", ItemType.ARMOR, Rarity.COMMON, 0);
        createItem("Canned Food", "Pre-war preserved food", ItemType.CONSUMABLE, Rarity.COMMON, 0);
        createItem("Dirty Water", "Questionable but drinkable", ItemType.CONSUMABLE, Rarity.COMMON, 0);
        createItem("Scrap Metal", "Useful for crafting", ItemType.MATERIAL, Rarity.COMMON, 0);
        createItem("Medical Bandage", "Stops bleeding", ItemType.CONSUMABLE, Rarity.UNCOMMON, 0);
        createItem("Makeshift Hammer", "Tool and weapon", ItemType.TOOL, Rarity.COMMON, 0);
        
        // Create rare items
        createItem("Military Rifle", "Well-maintained automatic weapon", ItemType.WEAPON, Rarity.EPIC, 10);
        createItem("Hazmat Suit", "Complete radiation protection", ItemType.ARMOR, Rarity.EPIC, 5);
        createItem("Antibiotics", "Cures infection", ItemType.CONSUMABLE, Rarity.RARE, 100);
        
        // Create legendary items
        createItem("Prototype Plasma Rifle", "Experimental energy weapon", ItemType.WEAPON, Rarity.LEGENDARY, 1);
        createItem("Pre-War Power Armor", "Military-grade protection", ItemType.ARMOR, Rarity.LEGENDARY, 1);
    }
    
    /**
     * @notice Generate DNA for item variation
     */
    function _generateDNA(string memory name, uint256 itemId) private returns (uint256) {
        nonce++;
        return uint256(keccak256(abi.encodePacked(name, itemId, block.timestamp, nonce))) % DNA_MODULUS;
    }
    
    /**
     * @notice Generate weight based on type and rarity
     */
    function _generateWeight(ItemType itemType, Rarity rarity) private pure returns (uint32) {
        uint32 baseWeight = 1000; // 1kg default
        
        if (itemType == ItemType.ARMOR) baseWeight = 5000;
        else if (itemType == ItemType.WEAPON) baseWeight = 3000;
        else if (itemType == ItemType.CONSUMABLE) baseWeight = 500;
        else if (itemType == ItemType.MATERIAL) baseWeight = 2000;
        
        // Rarer items tend to be lighter/more advanced
        uint32 rarityModifier = uint32(rarity) * 10;
        return baseWeight > rarityModifier * 100 ? baseWeight - (rarityModifier * 100) : 100;
    }
    
    /**
     * @notice Generate durability based on type and rarity
     */
    function _generateDurability(ItemType itemType, Rarity rarity) private pure returns (uint32) {
        uint32 baseDurability = 100;
        
        if (itemType == ItemType.WEAPON || itemType == ItemType.ARMOR || itemType == ItemType.TOOL) {
            baseDurability = 100 + uint32(rarity) * 50;
        }
        
        return baseDurability;
    }
    
    /**
     * @notice Generate item stats based on type, rarity, and DNA
     */
    function _generateItemStats(
        ItemType itemType,
        Rarity rarity,
        uint256 dna
    ) private pure returns (ItemStats memory) {
        uint32 rarityMultiplier = uint32(rarity) + 1;
        
        ItemStats memory stats;
        
        if (itemType == ItemType.WEAPON) {
            stats.damage = uint32(10 + (dna % 20)) * rarityMultiplier;
            stats.speedModifier = uint32(dna % 10);
        } else if (itemType == ItemType.ARMOR) {
            stats.defense = uint32(5 + (dna % 15)) * rarityMultiplier;
            stats.speedModifier = stats.defense > 50 ? uint32(-10) : 0;
        } else if (itemType == ItemType.CONSUMABLE) {
            stats.healAmount = uint32(dna % 50) + 10;
            stats.foodValue = uint32(dna / 100 % 100);
            stats.waterValue = uint32(dna / 10000 % 100);
        } else if (itemType == ItemType.TOOL) {
            stats.craftingLevel = uint32(dna % 10) + rarityMultiplier;
            stats.scavengeBonus = uint32(dna % 20) * rarityMultiplier;
        }
        
        return stats;
    }
    
    /**
     * @notice Consume materials for crafting
     */
    function _consumeMaterials(
        address crafter,
        uint256[] memory itemIds,
        uint256[] memory amounts
    ) private {
        for (uint i = 0; i < itemIds.length; i++) {
            _burn(crafter, itemIds[i], amounts[i]);
            totalSupply[itemIds[i]] -= amounts[i];
        }
    }
    
    // Override required functions
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}