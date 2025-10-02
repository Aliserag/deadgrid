// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../core/IDeadGrid.sol";

/**
 * @title SurvivorNFT
 * @notice NFT contract for survivor characters in DeadGrid
 * @dev Each survivor is unique with procedurally generated stats and backstory
 */
contract SurvivorNFT is ERC721Enumerable, AccessControl, IDeadGrid {
    using Counters for Counters.Counter;
    
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");
    bytes32 public constant EVOLUTION_ROLE = keccak256("EVOLUTION_ROLE");
    
    Counters.Counter private _tokenIdCounter;
    
    struct Survivor {
        string name;
        string backstory;
        uint256 dna; // Deterministic seed for procedural generation
        Stats stats;
        Position position;
        uint32 daysSurvived;
        uint32 zombiesKilled;
        uint32 humansHelped;
        uint32 itemsCrafted;
        uint8 hopeLevel; // 0-100
        uint8 sanityLevel; // 0-100
        uint256[] inventory; // Item token IDs
        uint256 faction;
        bool isAlive;
        uint256 lastActionBlock;
    }
    
    struct SurvivorMetadata {
        string occupation;
        string[] personality;
        string[] skills;
        string lastWords;
        uint256 birthBlock;
        address originalOwner;
    }
    
    mapping(uint256 => Survivor) public survivors;
    mapping(uint256 => SurvivorMetadata) public metadata;
    mapping(uint256 => mapping(uint256 => uint256)) public relationships; // survivorId => otherId => relationship score
    mapping(address => uint256[]) public playerSurvivors;
    
    // Procedural generation parameters
    uint256 private constant DNA_MODULUS = 10**16;
    uint256 private nonce;
    
    event SurvivorCreated(uint256 indexed tokenId, string name, uint256 dna);
    event SurvivorDied(uint256 indexed tokenId, string causeOfDeath);
    event StatsUpdated(uint256 indexed tokenId, Stats newStats);
    event HopeChanged(uint256 indexed tokenId, int8 change, uint8 newLevel);
    event RelationshipFormed(uint256 indexed survivor1, uint256 indexed survivor2, uint256 score);
    
    constructor() ERC721("DeadGrid Survivors", "SURVIVOR") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_MASTER_ROLE, msg.sender);
    }
    
    /**
     * @notice Mint a new survivor with procedurally generated attributes
     */
    function mintSurvivor(
        address to,
        string memory name,
        string memory backstory
    ) public onlyRole(GAME_MASTER_ROLE) returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        uint256 dna = _generateDNA(name, to, block.timestamp);
        Stats memory stats = _generateStats(dna);
        
        survivors[tokenId] = Survivor({
            name: name,
            backstory: backstory,
            dna: dna,
            stats: stats,
            position: Position(0, 0, 0),
            daysSurvived: 0,
            zombiesKilled: 0,
            humansHelped: 0,
            itemsCrafted: 0,
            hopeLevel: 50,
            sanityLevel: 75,
            inventory: new uint256[](0),
            faction: 0,
            isAlive: true,
            lastActionBlock: block.number
        });
        
        metadata[tokenId] = SurvivorMetadata({
            occupation: _generateOccupation(dna),
            personality: _generatePersonality(dna),
            skills: _generateSkills(dna),
            lastWords: "",
            birthBlock: block.number,
            originalOwner: to
        });
        
        playerSurvivors[to].push(tokenId);
        _safeMint(to, tokenId);
        
        emit SurvivorCreated(tokenId, name, dna);
        emit SurvivorSpawned(tokenId, to);
        
        return tokenId;
    }
    
    /**
     * @notice Update survivor stats based on actions and events
     */
    function updateStats(
        uint256 tokenId,
        Stats memory newStats
    ) external onlyRole(GAME_MASTER_ROLE) {
        require(_exists(tokenId), "Survivor does not exist");
        require(survivors[tokenId].isAlive, "Survivor is dead");
        
        survivors[tokenId].stats = newStats;
        emit StatsUpdated(tokenId, newStats);
    }
    
    /**
     * @notice Change hope level based on events
     */
    function adjustHope(
        uint256 tokenId,
        int8 change
    ) external onlyRole(GAME_MASTER_ROLE) {
        require(_exists(tokenId), "Survivor does not exist");
        require(survivors[tokenId].isAlive, "Survivor is dead");
        
        uint8 currentHope = survivors[tokenId].hopeLevel;
        uint8 newHope;
        
        if (change > 0) {
            newHope = currentHope + uint8(change) > 100 ? 100 : currentHope + uint8(change);
        } else {
            uint8 decrease = uint8(-change);
            newHope = currentHope > decrease ? currentHope - decrease : 0;
        }
        
        survivors[tokenId].hopeLevel = newHope;
        
        // Check for despair death
        if (newHope == 0) {
            _killSurvivor(tokenId, "Lost all hope");
        }
        
        emit HopeChanged(tokenId, change, newHope);
    }
    
    /**
     * @notice Form relationship between survivors
     */
    function formRelationship(
        uint256 survivor1,
        uint256 survivor2,
        uint256 score
    ) external onlyRole(GAME_MASTER_ROLE) {
        require(_exists(survivor1) && _exists(survivor2), "Invalid survivors");
        require(survivors[survivor1].isAlive && survivors[survivor2].isAlive, "Survivors must be alive");
        
        relationships[survivor1][survivor2] = score;
        relationships[survivor2][survivor1] = score;
        
        emit RelationshipFormed(survivor1, survivor2, score);
    }
    
    /**
     * @notice Kill a survivor
     */
    function _killSurvivor(uint256 tokenId, string memory causeOfDeath) internal {
        survivors[tokenId].isAlive = false;
        metadata[tokenId].lastWords = causeOfDeath;
        emit SurvivorDied(tokenId, causeOfDeath);
    }
    
    /**
     * @notice Generate DNA for procedural attributes
     */
    function _generateDNA(
        string memory name,
        address owner,
        uint256 timestamp
    ) internal returns (uint256) {
        nonce++;
        return uint256(keccak256(abi.encodePacked(name, owner, timestamp, nonce, blockhash(block.number - 1)))) % DNA_MODULUS;
    }
    
    /**
     * @notice Generate stats from DNA
     */
    function _generateStats(uint256 dna) internal pure returns (Stats memory) {
        return Stats({
            health: uint16(50 + (dna % 51)), // 50-100
            maxHealth: uint16(50 + (dna % 51)),
            strength: uint16(1 + (dna / 100 % 20)), // 1-20
            agility: uint16(1 + (dna / 10000 % 20)),
            intelligence: uint16(1 + (dna / 1000000 % 20)),
            luck: uint16(1 + (dna / 100000000 % 20)),
            survival: uint16(1 + (dna / 10000000000 % 20))
        });
    }
    
    /**
     * @notice Generate occupation from DNA
     */
    function _generateOccupation(uint256 dna) internal pure returns (string memory) {
        string[20] memory occupations = [
            "Doctor", "Engineer", "Teacher", "Police Officer", "Firefighter",
            "Mechanic", "Farmer", "Soldier", "Scientist", "Nurse",
            "Electrician", "Carpenter", "Chef", "Pilot", "Paramedic",
            "Programmer", "Architect", "Pharmacist", "Veterinarian", "Journalist"
        ];
        return occupations[dna % 20];
    }
    
    /**
     * @notice Generate personality traits from DNA
     */
    function _generatePersonality(uint256 dna) internal pure returns (string[] memory) {
        string[15] memory traits = [
            "Brave", "Cautious", "Optimistic", "Pessimistic", "Leader",
            "Follower", "Aggressive", "Peaceful", "Resourceful", "Wasteful",
            "Trusting", "Paranoid", "Altruistic", "Selfish", "Stoic"
        ];
        
        string[] memory selected = new string[](3);
        selected[0] = traits[dna % 15];
        selected[1] = traits[(dna / 100) % 15];
        selected[2] = traits[(dna / 10000) % 15];
        
        return selected;
    }
    
    /**
     * @notice Generate skills from DNA
     */
    function _generateSkills(uint256 dna) internal pure returns (string[] memory) {
        string[12] memory skills = [
            "First Aid", "Weapon Crafting", "Cooking", "Scouting", "Leadership",
            "Mechanics", "Agriculture", "Combat", "Stealth", "Negotiation",
            "Construction", "Electronics"
        ];
        
        string[] memory selected = new string[](2);
        selected[0] = skills[dna % 12];
        selected[1] = skills[(dna / 1000) % 12];
        
        return selected;
    }
    
    // Required overrides
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    // Game interface implementations
    function startNewGame(address player) external override returns (uint256) {
        return mintSurvivor(player, "New Survivor", "A mysterious wanderer");
    }
    
    function enterLocation(uint256 survivorId, uint256 locationId) external override {
        require(_exists(survivorId), "Survivor does not exist");
        survivors[survivorId].position.locationId = uint32(locationId);
    }
    
    function scavenge(uint256) external pure override returns (uint256[] memory) {
        return new uint256[](0); // Implemented by game mechanics contract
    }
    
    function craft(uint256[] memory, uint256) external pure override returns (uint256) {
        return 0; // Implemented by crafting contract
    }
    
    function trade(uint256[] memory, uint256[] memory, address) external pure override {
        // Implemented by trading contract
    }

/**
 * @notice Generate survivor background story based on DNA and occupation
 * @param dna The survivor's DNA value
 * @param occupation The survivor's occupation
 * @return background The generated background story
 */
function _generateBackground(uint256 dna, string memory occupation) internal pure returns (string memory) {
    string[10] memory backgrounds = [
        "Former marine biologist specializing in coral reefs. Lost family during evacuation. Now survives alone in coastal ruins.",
        "Ex-military medic turned scavenger. Carries memories of fallen comrades. Expert in field medicine and trauma care.",
        "Urban engineer who designed safe zones. Witnessed infrastructure collapse firsthand. Practical and resourceful.",
        "Elementary teacher who protected students during outbreak. Now uses teaching skills to train new survivors.",
        "Fisherman with coastal survival knowledge. Lost fishing community to the infected. Knows edible sea life and preservation.",
        "Research scientist studying environmental collapse. Documents ecosystem changes while searching for cure.",
        "Farmer with agricultural expertise. Maintains hope through small gardens. Believes in rebuilding society.",
        "Mechanic who keeps old generators running. Values functional tools and systems. Pragmatic and hands-on.",
        "Journalist documenting survivor stories. Seeks truth amidst the chaos. Carries camera and notebooks everywhere.",
        "Chef who creates meals from scavenged ingredients. Believes good food maintains humanity in dark times."
    ];
    
    return backgrounds[(dna / 100000000) % 10];
}

}