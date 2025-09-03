// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../core/IDeadGrid.sol";

/**
 * @title LocationNFT
 * @notice Territory ownership and location discovery system
 * @dev Locations can be discovered, claimed, and developed by players
 */
contract LocationNFT is ERC721Enumerable, AccessControl, IDeadGrid {
    using Counters for Counters.Counter;
    
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");
    bytes32 public constant WORLD_BUILDER_ROLE = keccak256("WORLD_BUILDER_ROLE");
    
    Counters.Counter private _locationIdCounter;
    
    struct Location {
        string name;
        string description;
        LocationType locationType;
        Position coordinates;
        uint32 dangerLevel; // 0-100
        uint32 resourceRichness; // 0-100
        uint32 fortificationLevel; // 0-100
        uint256 faction; // Controlling faction
        address discoverer;
        address currentOwner;
        uint256 discoveryBlock;
        bool isPublic; // Can anyone enter or is it private
        mapping(uint256 => bool) hasResource; // resourceId => available
        mapping(address => uint256) lastVisit; // player => block number
    }
    
    struct LocationStats {
        uint256 totalVisits;
        uint256 survivorDeaths;
        uint256 itemsScavenged;
        uint256 battlesOccurred;
        uint256 lastEventBlock;
        uint256[] connectedLocations; // Adjacent location IDs
    }
    
    struct Settlement {
        uint256 locationId;
        string settlementName;
        uint32 population;
        uint32 defenseRating;
        uint32 morale; // 0-100
        uint32 foodSupply; // Days worth
        uint32 waterSupply; // Days worth
        uint32 medicineSupply;
        mapping(uint256 => uint32) buildings; // buildingType => count
        mapping(address => bool) citizens;
        bool acceptingNewCitizens;
    }
    
    mapping(uint256 => Location) public locations;
    mapping(uint256 => LocationStats) public locationStats;
    mapping(uint256 => Settlement) public settlements;
    mapping(int32 => mapping(int32 => uint256)) public coordinateToLocation; // x => y => locationId
    mapping(address => uint256[]) public playerDiscoveries;
    mapping(uint256 => uint256[]) public locationResources; // locationId => resource IDs
    
    // Procedural generation
    uint256 private nonce;
    uint256 private constant WORLD_SIZE = 1000; // -500 to 500 on each axis
    
    event LocationDiscoveredBy(uint256 indexed locationId, address indexed discoverer, string name);
    event LocationClaimed(uint256 indexed locationId, address indexed owner);
    event LocationDeveloped(uint256 indexed locationId, uint32 newFortification);
    event SettlementFounded(uint256 indexed locationId, string name, address indexed founder);
    event ResourceDepleted(uint256 indexed locationId, uint256 resourceId);
    event LocationEvent(uint256 indexed locationId, string eventType, uint256 severity);
    
    constructor() ERC721("DeadGrid Locations", "LOCATION") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_MASTER_ROLE, msg.sender);
        _initializeWorld();
    }
    
    /**
     * @notice Discover a new location at coordinates
     */
    function discoverLocation(
        int32 x,
        int32 y,
        address discoverer
    ) external onlyRole(GAME_MASTER_ROLE) returns (uint256) {
        require(x >= -500 && x <= 500 && y >= -500 && y <= 500, "Out of world bounds");
        require(coordinateToLocation[x][y] == 0, "Location already discovered");
        
        uint256 locationId = _locationIdCounter.current();
        _locationIdCounter.increment();
        
        // Generate location properties based on coordinates
        (string memory name, LocationType locationType) = _generateLocationProperties(x, y, locationId);
        
        Location storage newLocation = locations[locationId];
        newLocation.name = name;
        newLocation.description = _generateDescription(locationType, x, y);
        newLocation.locationType = locationType;
        newLocation.coordinates = Position(x, y, uint32(locationId));
        newLocation.dangerLevel = _calculateDangerLevel(x, y, locationType);
        newLocation.resourceRichness = _calculateResourceRichness(x, y, locationType);
        newLocation.fortificationLevel = 0;
        newLocation.discoverer = discoverer;
        newLocation.currentOwner = discoverer;
        newLocation.discoveryBlock = block.number;
        newLocation.isPublic = true;
        
        // Initialize stats
        locationStats[locationId].connectedLocations = _findAdjacentLocations(x, y);
        
        // Generate resources
        _generateLocationResources(locationId, locationType);
        
        // Update mappings
        coordinateToLocation[x][y] = locationId;
        playerDiscoveries[discoverer].push(locationId);
        
        // Mint NFT to discoverer
        _safeMint(discoverer, locationId);
        
        emit LocationDiscoveredBy(locationId, discoverer, name);
        emit LocationDiscovered(locationId, discoverer);
        
        return locationId;
    }
    
    /**
     * @notice Claim ownership of a location
     */
    function claimLocation(uint256 locationId) external {
        require(_exists(locationId), "Location does not exist");
        require(ownerOf(locationId) == address(0) || locations[locationId].isPublic, "Location already owned");
        
        locations[locationId].currentOwner = msg.sender;
        locations[locationId].isPublic = false;
        
        if (ownerOf(locationId) == address(0)) {
            _safeMint(msg.sender, locationId);
        } else {
            _transfer(ownerOf(locationId), msg.sender, locationId);
        }
        
        emit LocationClaimed(locationId, msg.sender);
    }
    
    /**
     * @notice Found a settlement at a location
     */
    function foundSettlement(
        uint256 locationId,
        string memory settlementName
    ) external {
        require(ownerOf(locationId) == msg.sender, "Not location owner");
        require(locations[locationId].locationType == LocationType.SAFEZONE || 
                locations[locationId].locationType == LocationType.SETTLEMENT, "Invalid location type");
        require(settlements[locationId].population == 0, "Settlement already exists");
        
        Settlement storage newSettlement = settlements[locationId];
        newSettlement.locationId = locationId;
        newSettlement.settlementName = settlementName;
        newSettlement.population = 1;
        newSettlement.defenseRating = locations[locationId].fortificationLevel;
        newSettlement.morale = 50;
        newSettlement.foodSupply = 7;
        newSettlement.waterSupply = 7;
        newSettlement.medicineSupply = 3;
        newSettlement.citizens[msg.sender] = true;
        newSettlement.acceptingNewCitizens = true;
        
        emit SettlementFounded(locationId, settlementName, msg.sender);
    }
    
    /**
     * @notice Fortify a location
     */
    function fortifyLocation(
        uint256 locationId,
        uint32 fortificationIncrease
    ) external onlyRole(GAME_MASTER_ROLE) {
        require(_exists(locationId), "Location does not exist");
        require(fortificationIncrease > 0 && fortificationIncrease <= 10, "Invalid fortification amount");
        
        locations[locationId].fortificationLevel += fortificationIncrease;
        if (locations[locationId].fortificationLevel > 100) {
            locations[locationId].fortificationLevel = 100;
        }
        
        emit LocationDeveloped(locationId, locations[locationId].fortificationLevel);
    }
    
    /**
     * @notice Visit a location
     */
    function visitLocation(uint256 locationId, address visitor) external onlyRole(GAME_MASTER_ROLE) {
        require(_exists(locationId), "Location does not exist");
        
        locations[locationId].lastVisit[visitor] = block.number;
        locationStats[locationId].totalVisits++;
    }
    
    /**
     * @notice Trigger location event
     */
    function triggerLocationEvent(
        uint256 locationId,
        string memory eventType,
        uint256 severity
    ) external onlyRole(GAME_MASTER_ROLE) {
        require(_exists(locationId), "Location does not exist");
        
        locationStats[locationId].lastEventBlock = block.number;
        
        // Apply event effects
        if (keccak256(bytes(eventType)) == keccak256(bytes("zombie_horde"))) {
            locations[locationId].dangerLevel += uint32(severity * 10);
            if (locations[locationId].dangerLevel > 100) locations[locationId].dangerLevel = 100;
        } else if (keccak256(bytes(eventType)) == keccak256(bytes("resource_discovery"))) {
            locations[locationId].resourceRichness += uint32(severity * 5);
            if (locations[locationId].resourceRichness > 100) locations[locationId].resourceRichness = 100;
        }
        
        emit LocationEvent(locationId, eventType, severity);
        emit EventTriggered(locationId, locationId);
    }
    
    /**
     * @notice Initialize world with starting locations
     */
    function _initializeWorld() private {
        // Create origin safezone
        uint256 originId = _locationIdCounter.current();
        _locationIdCounter.increment();
        
        Location storage origin = locations[originId];
        origin.name = "Haven Central";
        origin.description = "The last bastion of civilization";
        origin.locationType = LocationType.SAFEZONE;
        origin.coordinates = Position(0, 0, uint32(originId));
        origin.dangerLevel = 0;
        origin.resourceRichness = 50;
        origin.fortificationLevel = 100;
        origin.discoverer = msg.sender;
        origin.currentOwner = address(0); // Public
        origin.discoveryBlock = block.number;
        origin.isPublic = true;
        
        coordinateToLocation[0][0] = originId;
    }
    
    /**
     * @notice Generate location properties based on position
     */
    function _generateLocationProperties(
        int32 x,
        int32 y,
        uint256 locationId
    ) private view returns (string memory name, LocationType locationType) {
        uint256 distance = uint256(sqrt(uint256(x * x + y * y)));
        uint256 random = uint256(keccak256(abi.encodePacked(x, y, locationId, block.timestamp))) % 100;
        
        // Distance from origin affects location type probability
        if (distance < 10) {
            // Close to origin - safer
            if (random < 40) locationType = LocationType.SAFEZONE;
            else if (random < 70) locationType = LocationType.SCAVENGING_SITE;
            else locationType = LocationType.SETTLEMENT;
        } else if (distance < 100) {
            // Medium distance
            if (random < 10) locationType = LocationType.SAFEZONE;
            else if (random < 40) locationType = LocationType.SCAVENGING_SITE;
            else if (random < 60) locationType = LocationType.WASTELAND;
            else if (random < 80) locationType = LocationType.DUNGEON;
            else locationType = LocationType.INFECTED_ZONE;
        } else {
            // Far from origin - dangerous
            if (random < 30) locationType = LocationType.INFECTED_ZONE;
            else if (random < 60) locationType = LocationType.WASTELAND;
            else if (random < 90) locationType = LocationType.DUNGEON;
            else locationType = LocationType.SCAVENGING_SITE;
        }
        
        name = _generateLocationName(locationType, x, y);
    }
    
    /**
     * @notice Generate location name
     */
    function _generateLocationName(LocationType locationType, int32 x, int32 y) private pure returns (string memory) {
        // Simple name generation - in production would be more sophisticated
        if (locationType == LocationType.SAFEZONE) return "Survivor Outpost";
        else if (locationType == LocationType.SCAVENGING_SITE) return "Abandoned Store";
        else if (locationType == LocationType.DUNGEON) return "Underground Complex";
        else if (locationType == LocationType.SETTLEMENT) return "Makeshift Camp";
        else if (locationType == LocationType.WASTELAND) return "Desolate Plains";
        else return "Infected Zone";
    }
    
    /**
     * @notice Generate location description
     */
    function _generateDescription(LocationType locationType, int32, int32) private pure returns (string memory) {
        if (locationType == LocationType.SAFEZONE) {
            return "A fortified area with basic defenses and survivors";
        } else if (locationType == LocationType.SCAVENGING_SITE) {
            return "Abandoned structures with potential resources";
        } else if (locationType == LocationType.DUNGEON) {
            return "Dark underground area full of dangers and treasures";
        } else if (locationType == LocationType.SETTLEMENT) {
            return "A small group of survivors trying to rebuild";
        } else if (locationType == LocationType.WASTELAND) {
            return "Barren landscape with scattered resources";
        } else {
            return "Heavily infected area with extreme danger";
        }
    }
    
    /**
     * @notice Calculate danger level based on position and type
     */
    function _calculateDangerLevel(int32 x, int32 y, LocationType locationType) private pure returns (uint32) {
        uint256 distance = uint256(sqrt(uint256(x * x + y * y)));
        uint32 baseDanger = uint32(distance / 5);
        
        if (locationType == LocationType.SAFEZONE) return baseDanger / 2;
        else if (locationType == LocationType.INFECTED_ZONE) return baseDanger + 50;
        else if (locationType == LocationType.DUNGEON) return baseDanger + 30;
        else return baseDanger + 10;
    }
    
    /**
     * @notice Calculate resource richness
     */
    function _calculateResourceRichness(int32 x, int32 y, LocationType locationType) private pure returns (uint32) {
        uint256 random = uint256(keccak256(abi.encodePacked(x, y, "resources"))) % 50;
        
        if (locationType == LocationType.SCAVENGING_SITE) return uint32(50 + random);
        else if (locationType == LocationType.DUNGEON) return uint32(30 + random);
        else if (locationType == LocationType.WASTELAND) return uint32(10 + random);
        else return uint32(20 + random / 2);
    }
    
    /**
     * @notice Generate resources for location
     */
    function _generateLocationResources(uint256 locationId, LocationType locationType) private {
        uint256 resourceCount = 3;
        if (locationType == LocationType.SCAVENGING_SITE) resourceCount = 5;
        else if (locationType == LocationType.DUNGEON) resourceCount = 4;
        
        for (uint i = 0; i < resourceCount; i++) {
            uint256 resourceId = uint256(keccak256(abi.encodePacked(locationId, i, "resource"))) % 100;
            locations[locationId].hasResource[resourceId] = true;
            locationResources[locationId].push(resourceId);
        }
    }
    
    /**
     * @notice Find adjacent locations
     */
    function _findAdjacentLocations(int32 x, int32 y) private view returns (uint256[] memory) {
        uint256[] memory adjacent = new uint256[](8);
        uint256 count = 0;
        
        for (int32 dx = -1; dx <= 1; dx++) {
            for (int32 dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) continue;
                
                uint256 locationId = coordinateToLocation[x + dx][y + dy];
                if (locationId != 0) {
                    adjacent[count] = locationId;
                    count++;
                }
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = adjacent[i];
        }
        
        return result;
    }
    
    /**
     * @notice Simple square root function
     */
    function sqrt(uint256 x) private pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    // Required overrides
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0) || tokenId < _locationIdCounter.current();
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}