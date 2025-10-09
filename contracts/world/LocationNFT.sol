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

/**
 * @notice Calculate chemical hazard effects for Chromatic Mire biome
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate hazards for
 * @return hazardLevel The calculated hazard level (0-100)
 * @return resourceBonus Bonus resources available due to chemical richness
 */
function calculateChromaticMireHazards(int32 x, int32 y, LocationType locationType) public pure returns (uint32 hazardLevel, uint32 resourceBonus) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "chromatic_mire")));
    
    // Base hazard from terrain type
    if (locationType == LocationType.INFECTED_ZONE) {
        hazardLevel = 70;
    } else if (locationType == LocationType.DUNGEON) {
        hazardLevel = 60;
    } else if (locationType == LocationType.WASTELAND) {
        hazardLevel = 50;
    } else {
        hazardLevel = 40;
    }
    
    // Add random chemical instability
    uint256 instability = positionHash % 30;
    hazardLevel += uint32(instability);
    
    // Calculate resource bonus from chemical richness
    resourceBonus = uint32((positionHash % 20) + 10);
    
    return (hazardLevel, resourceBonus);
}


/**
 * @notice Calculate Rustwood Tangle biome hazards and resource bonuses
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate effects for
 * @return hazardLevel The calculated hazard level (0-100)
 * @return energyCrystals Number of energy crystals available
 */
function calculateRustwoodTangleEffects(int32 x, int32 y, LocationType locationType) public pure returns (uint32 hazardLevel, uint32 energyCrystals) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "rustwood_tangle")));
    
    // Base hazard from terrain type
    if (locationType == LocationType.DUNGEON) {
        hazardLevel = 65;
    } else if (locationType == LocationType.SCAVENGING_SITE) {
        hazardLevel = 55;
    } else if (locationType == LocationType.WASTELAND) {
        hazardLevel = 45;
    } else {
        hazardLevel = 35;
    }
    
    // Add electromagnetic instability from biome
    uint256 instability = positionHash % 35;
    hazardLevel += uint32(instability);
    
    // Calculate energy crystals from crystalline formations
    energyCrystals = uint32((positionHash % 25) + 15);
    
    return (hazardLevel, energyCrystals);
}


/**
 * @notice Calculate magnetic anomaly effects for Rustwood Tangle biome
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate anomalies for
 * @return anomalyStrength The calculated magnetic anomaly strength (0-100)
 * @return bioMetallicAlloys Amount of bio-metallic alloys available
 */
function calculateRustwoodTangleMagneticAnomalies(int32 x, int32 y, LocationType locationType) public pure returns (uint32 anomalyStrength, uint32 bioMetallicAlloys) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "rustwood_magnetic")));
    
    // Base anomaly strength from terrain type
    if (locationType == LocationType.DUNGEON) {
        anomalyStrength = 75;
    } else if (locationType == LocationType.SCAVENGING_SITE) {
        anomalyStrength = 60;
    } else if (locationType == LocationType.WASTELAND) {
        anomalyStrength = 50;
    } else {
        anomalyStrength = 40;
    }
    
    // Add magnetic disturbance from biome hazards
    uint256 disturbance = positionHash % 40;
    anomalyStrength += uint32(disturbance);
    
    // Calculate bio-metallic alloys from fused ecosystem
    bioMetallicAlloys = uint32((positionHash % 30) + 20);
    
    return (anomalyStrength, bioMetallicAlloys);
}

/**
 * @notice Calculate Rustwood Expanse biome hazards and resource bonuses
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate effects for
 * @return hazardLevel The calculated hazard level (0-100)
 * @return salvagedElectronics Amount of salvaged electronics available
 */
function calculateRustwoodExpanseEffects(int32 x, int32 y, LocationType locationType) public pure returns (uint32 hazardLevel, uint32 salvagedElectronics) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "rustwood_expanse")));
    
    // Base hazard from terrain type
    if (locationType == LocationType.DUNGEON) {
        hazardLevel = 70;
    } else if (locationType == LocationType.SCAVENGING_SITE) {
        hazardLevel = 60;
    } else if (locationType == LocationType.WASTELAND) {
        hazardLevel = 50;
    } else {
        hazardLevel = 40;
    }
    
    // Add industrial instability from biome hazards
    uint256 instability = positionHash % 35;
    hazardLevel += uint32(instability);
    
    // Calculate salvaged electronics from industrial ruins
    salvagedElectronics = uint32((positionHash % 30) + 20);
    
    return (hazardLevel, salvagedElectronics);
}

/**
 * @notice Calculate Rust Cathedral biome hazards and resource bonuses
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate effects for
 * @return hazardLevel The calculated hazard level (0-100)
 * @return rareComponents Number of rare components available
 */
function calculateRustCathedralEffects(int32 x, int32 y, LocationType locationType) public pure returns (uint32 hazardLevel, uint32 rareComponents) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "rust_cathedral")));
    
    // Base hazard from terrain type
    if (locationType == LocationType.DUNGEON) {
        hazardLevel = 70;
    } else if (locationType == LocationType.SCAVENGING_SITE) {
        hazardLevel = 60;
    } else if (locationType == LocationType.WASTELAND) {
        hazardLevel = 50;
    } else {
        hazardLevel = 40;
    }
    
    // Add cultist and mechanical hazards from biome
    uint256 cultistDanger = positionHash % 30;
    hazardLevel += uint32(cultistDanger);
    
    // Calculate rare components from hidden workshops and confessionals
    rareComponents = uint32((positionHash % 35) + 25);
    
    return (hazardLevel, rareComponents);
}


/**
 * @notice Calculate Rust Cathedral steam forge crafting bonuses and hazards
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate effects for
 * @return forgeBonus The calculated crafting bonus (0-100)
 * @return steamHazard The calculated steam explosion hazard level (0-100)
 */
function calculateRustCathedralForgeEffects(int32 x, int32 y, LocationType locationType) public pure returns (uint32 forgeBonus, uint32 steamHazard) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "rust_cathedral_forge")));
    
    // Base forge bonus from location type
    if (locationType == LocationType.DUNGEON) {
        forgeBonus = 80;
    } else if (locationType == LocationType.SCAVENGING_SITE) {
        forgeBonus = 65;
    } else if (locationType == LocationType.WASTELAND) {
        forgeBonus = 45;
    } else {
        forgeBonus = 30;
    }
    
    // Add random variation from forge condition
    uint256 forgeCondition = positionHash % 25;
    forgeBonus += uint32(forgeCondition);
    
    // Calculate steam hazard from poorly maintained pipes
    steamHazard = uint32((positionHash % 40) + 30);
    
    return (forgeBonus, steamHazard);
}

/**
 * @notice Calculate Rust Cathedral cultist trust and rust-based crafting bonuses
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate effects for
 * @return trustLevel The calculated cultist trust level (0-100)
 * @return rustCraftingBonus Bonus percentage for rust-based crafting recipes
 */
function calculateRustCathedralCultistEffects(int32 x, int32 y, LocationType locationType) public pure returns (uint32 trustLevel, uint32 rustCraftingBonus) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "rust_cathedral_cultists")));
    
    // Base trust level from location type
    if (locationType == LocationType.DUNGEON) {
        trustLevel = 25;
    } else if (locationType == LocationType.SCAVENGING_SITE) {
        trustLevel = 40;
    } else if (locationType == LocationType.WASTELAND) {
        trustLevel = 15;
    } else {
        trustLevel = 10;
    }
    
    // Add random variation from cultist disposition
    uint256 cultistDisposition = positionHash % 35;
    trustLevel += uint32(cultistDisposition);
    
    // Calculate rust crafting bonus from hidden workshops and prophecies
    rustCraftingBonus = uint32((positionHash % 45) + 15);
    
    return (trustLevel, rustCraftingBonus);
}


/**
 * @notice Calculate Rust Cathedral spire energy interference and tech component bonuses
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate effects for
 * @return interferenceLevel The calculated electronic interference level (0-100)
 * @return techComponents Number of valuable tech components available
 */
function calculateRustCathedralSpireEffects(int32 x, int32 y, LocationType locationType) public pure returns (uint32 interferenceLevel, uint32 techComponents) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "rust_cathedral_spire")));
    
    // Base interference from spire energy
    if (locationType == LocationType.DUNGEON) {
        interferenceLevel = 85;
    } else if (locationType == LocationType.SCAVENGING_SITE) {
        interferenceLevel = 70;
    } else if (locationType == LocationType.WASTELAND) {
        interferenceLevel = 55;
    } else {
        interferenceLevel = 40;
    }
    
    // Add random variation from spire instability
    uint256 spireInstability = positionHash % 25;
    interferenceLevel += uint32(spireInstability);
    
    // Calculate tech components from hidden workshops and moving platforms
    techComponents = uint32((positionHash % 50) + 30);
    
    return (interferenceLevel, techComponents);
}


/**
 * @notice Calculate Rust Cathedral reactor altar radiation effects and isotope rewards
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate effects for
 * @return radiationLevel The calculated radiation level (0-100)
 * @return isotopeRewards Number of rare isotopes available from the reactor altar
 */
function calculateRustCathedralReactorEffects(int32 x, int32 y, LocationType locationType) public pure returns (uint32 radiationLevel, uint32 isotopeRewards) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "rust_cathedral_reactor")));
    
    // Base radiation level from reactor altar
    if (locationType == LocationType.DUNGEON) {
        radiationLevel = 75;
    } else if (locationType == LocationType.SCAVENGING_SITE) {
        radiationLevel = 60;
    } else if (locationType == LocationType.WASTELAND) {
        radiationLevel = 45;
    } else {
        radiationLevel = 30;
    }
    
    // Add random variation from reactor instability
    uint256 reactorInstability = positionHash % 20;
    radiationLevel += uint32(reactorInstability);
    
    // Calculate isotope rewards from salvaged reactor core
    isotopeRewards = uint32((positionHash % 25) + 10);
    
    return (radiationLevel, isotopeRewards);
}

/**
 * @notice Calculate Chromatic Blightlands reality distortion effects and resource availability
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate effects for
 * @return distortionLevel The calculated reality distortion level (0-100)
 * @return chromaticCrystals Number of chromatic crystals available from the blightlands
 */
function calculateChromaticBlightlandsEffects(int32 x, int32 y, LocationType locationType) public pure returns (uint32 distortionLevel, uint32 chromaticCrystals) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "chromatic_blightlands")));
    
    // Base distortion level from blightlands energy
    if (locationType == LocationType.DUNGEON) {
        distortionLevel = 80;
    } else if (locationType == LocationType.SCAVENGING_SITE) {
        distortionLevel = 65;
    } else if (locationType == LocationType.WASTELAND) {
        distortionLevel = 50;
    } else {
        distortionLevel = 35;
    }
    
    // Add random variation from reality instability
    uint256 realityInstability = positionHash % 30;
    distortionLevel += uint32(realityInstability);
    
    // Calculate chromatic crystals from crystalline formations
    chromaticCrystals = uint32((positionHash % 40) + 20);
    
    return (distortionLevel, chromaticCrystals);
}

/**
 * @notice Calculate Rustwood Tangle environmental hazards and resource availability
 * @param x X coordinate of location
 * @param y Y coordinate of location
 * @param locationType Type of location to calculate effects for
 * @return hazardLevel The calculated environmental hazard level (0-100)
 * @return bioResources Number of bio-luminescent fungi and salvaged resources available
 */
function calculateRustwoodTangleEffects(int32 x, int32 y, LocationType locationType) public pure returns (uint32 hazardLevel, uint32 bioResources) {
    uint256 positionHash = uint256(keccak256(abi.encodePacked(x, y, "rustwood_tangle")));
    
    // Base hazard level from corrosive environment
    if (locationType == LocationType.DUNGEON) {
        hazardLevel = 90;
    } else if (locationType == LocationType.SCAVENGING_SITE) {
        hazardLevel = 75;
    } else if (locationType == LocationType.WASTELAND) {
        hazardLevel = 60;
    } else {
        hazardLevel = 45;
    }
    
    // Add random variation from environmental instability
    uint256 environmentalInstability = positionHash % 35;
    hazardLevel += uint32(environmentalInstability);
    
    // Calculate bio resources from fungal growth and metal salvage
    bioResources = uint32((positionHash % 60) + 25);
    
    return (hazardLevel, bioResources);
}
}