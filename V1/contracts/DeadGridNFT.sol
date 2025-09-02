// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {CadenceRandomConsumer} from "@onflow/flow-sol-utils/src/random/CadenceRandomConsumer.sol";

/**
 * @title DeadGridNFT
 * @dev NFT contract for items in the DeadGrid universe
 */
contract DeadGridNFT is CadenceRandomConsumer {
    // Events
    event NFTMinted(address to, uint256 tokenId, string itemType, uint64 rarity);
    event NFTEquipped(address owner, uint256 tokenId, bool isEquipped);
    event NFTDamaged(uint256 tokenId, uint64 newDurability);
    
    // Errors
    error InvalidTokenId();
    error Unauthorized();
    
    // NFT data structure
    struct Item {
        string itemType; // "weapon", "tool", "medication", "armor", "special"
        string name;
        uint64 rarity; // 1-100, higher is rarer
        uint64 durability; // 0-100, lower means more damaged
        uint64 power; // Effect power when used
        bool isEquipped;
        string[] attributes; // Special attributes
    }
    
    // Game state variables
    address public gameContract;
    address public owner;
    uint256 public nextTokenId = 1;
    
    // Token mappings
    mapping(uint256 => Item) public items;
    mapping(uint256 => address) public tokenOwners;
    mapping(address => uint256[]) public ownerTokens;
    
    // Item templates with names for each type
    string[] public weaponNames = ["Rusty Knife", "Baseball Bat", "Makeshift Spear", "Hunting Rifle", "Molotov Cocktail"];
    string[] public toolNames = ["Flashlight", "Radio", "Lockpick", "Medical Kit", "Gas Mask"];
    string[] public armorNames = ["Leather Jacket", "Riot Gear", "Scrap Plate", "Hazmat Suit", "Military Vest"];
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }
    
    modifier onlyGameContract() {
        require(msg.sender == gameContract, "Not the game contract");
        _;
    }
    
    /**
     * @dev Sets the game contract address
     * @param _gameContract The address of the DeadGrid game contract
     */
    function setGameContract(address _gameContract) external onlyOwner {
        gameContract = _gameContract;
    }
    
    /**
     * @dev Mints a random NFT for a survivor
     * @param to The address to mint the NFT to
     * @return tokenId The ID of the minted token
     */
    function mintRandomItem(address to) external returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        
        // Generate random item attributes
        uint64 itemTypeRoll = _getRevertibleRandomInRange(1, 3);
        string memory itemType;
        string memory name;
        
        if (itemTypeRoll == 1) {
            itemType = "weapon";
            uint64 nameIndex = _getRevertibleRandomInRange(0, uint64(weaponNames.length - 1));
            name = weaponNames[nameIndex];
        } else if (itemTypeRoll == 2) {
            itemType = "tool";
            uint64 nameIndex = _getRevertibleRandomInRange(0, uint64(toolNames.length - 1));
            name = toolNames[nameIndex];
        } else {
            itemType = "armor";
            uint64 nameIndex = _getRevertibleRandomInRange(0, uint64(armorNames.length - 1));
            name = armorNames[nameIndex];
        }
        
        uint64 rarity = _getRevertibleRandomInRange(1, 100);
        uint64 durability = _getRevertibleRandomInRange(70, 100);
        uint64 power = rarity / 2;
        
        // Create special attributes
        string[] memory attributes = new string[](2);
        
        if (rarity > 90) {
            attributes[0] = "Legendary";
            attributes[1] = "Unbreakable";
        } else if (rarity > 70) {
            attributes[0] = "Rare";
            attributes[1] = "Durable";
        } else if (rarity > 50) {
            attributes[0] = "Uncommon";
            attributes[1] = "Balanced";
        } else {
            attributes[0] = "Common";
            attributes[1] = "Fragile";
        }
        
        // Create the item NFT
        items[tokenId] = Item({
            itemType: itemType,
            name: name,
            rarity: rarity,
            durability: durability,
            power: power,
            isEquipped: false,
            attributes: attributes
        });
        
        // Assign ownership
        tokenOwners[tokenId] = to;
        ownerTokens[to].push(tokenId);
        
        // Emit minted event
        emit NFTMinted(to, tokenId, itemType, rarity);
        
        return tokenId;
    }
    
    /**
     * @dev Equips or unequips an item
     * @param tokenId The ID of the token to toggle equipped status
     */
    function toggleEquippedStatus(uint256 tokenId) external {
        if (tokenOwners[tokenId] != msg.sender) revert Unauthorized();
        if (tokenId >= nextTokenId) revert InvalidTokenId();
        
        items[tokenId].isEquipped = !items[tokenId].isEquipped;
        
        emit NFTEquipped(msg.sender, tokenId, items[tokenId].isEquipped);
    }
    
    /**
     * @dev Uses an item, reducing its durability
     * @param tokenId The ID of the token to use
     * @return powerEffect The power effect applied
     */
    function useItem(uint256 tokenId) external onlyGameContract returns (uint64 powerEffect) {
        if (tokenId >= nextTokenId) revert InvalidTokenId();
        
        Item storage item = items[tokenId];
        
        // Apply wear and tear
        uint64 durabilityLoss = _getRevertibleRandomInRange(1, 5);
        
        // Legendary items don't lose durability
        if (keccak256(abi.encodePacked(item.attributes[0])) != keccak256(abi.encodePacked("Legendary"))) {
            if (item.durability > durabilityLoss) {
                item.durability -= durabilityLoss;
            } else {
                item.durability = 0;
            }
        }
        
        emit NFTDamaged(tokenId, item.durability);
        
        return item.power;
    }
    
    /**
     * @dev Repairs an item, increasing its durability
     * @param tokenId The ID of the token to repair
     */
    function repairItem(uint256 tokenId) external {
        if (tokenOwners[tokenId] != msg.sender) revert Unauthorized();
        if (tokenId >= nextTokenId) revert InvalidTokenId();
        
        Item storage item = items[tokenId];
        
        // Apply repair
        uint64 repairAmount = _getRevertibleRandomInRange(10, 30);
        item.durability = (item.durability + repairAmount > 100) ? 100 : item.durability + repairAmount;
        
        emit NFTDamaged(tokenId, item.durability);
    }
    
    /**
     * @dev Gets all tokens owned by an address
     * @param owner The address to get tokens for
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        return ownerTokens[owner];
    }
    
    /**
     * @dev Gets details of a token
     * @param tokenId The ID of the token
     */
    function getItemDetails(uint256 tokenId) external view returns (
        string memory itemType,
        string memory name,
        uint64 rarity,
        uint64 durability,
        uint64 power,
        bool isEquipped,
        string[] memory attributes
    ) {
        if (tokenId >= nextTokenId) revert InvalidTokenId();
        
        Item storage item = items[tokenId];
        return (
            item.itemType,
            item.name,
            item.rarity,
            item.durability,
            item.power,
            item.isEquipped,
            item.attributes
        );
    }
} 