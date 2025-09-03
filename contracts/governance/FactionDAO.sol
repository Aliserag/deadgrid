// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title FactionDAO  
 * @notice Decentralized governance for game factions
 * @dev Each faction has its own DAO for collective decision making
 */
contract FactionDAO is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    struct Faction {
        uint256 id;
        string name;
        string description;
        string ideology; // What the faction believes in
        uint256 memberCount;
        uint256 territoryCount;
        uint256 resourcePool;
        uint256 militaryStrength;
        mapping(address => bool) members;
        mapping(uint256 => bool) controlledLocations;
        mapping(uint256 => uint256) relationshipScores; // factionId => score (-100 to 100)
    }
    
    struct FactionProposal {
        ProposalType proposalType;
        uint256 targetFaction;
        uint256 resourceAmount;
        uint256 locationId;
        string details;
    }
    
    struct War {
        uint256 aggressor;
        uint256 defender;
        uint256 startBlock;
        uint256 endBlock;
        uint256 aggressorLosses;
        uint256 defenderLosses;
        bool active;
        uint256 winner;
    }
    
    struct Alliance {
        uint256 faction1;
        uint256 faction2;
        uint256 startBlock;
        uint256 duration;
        bool active;
        uint256 tradeBonus; // Percentage bonus for trading
        bool militarySupport;
    }
    
    enum ProposalType {
        DECLARE_WAR,
        FORM_ALLIANCE,
        TRADE_RESOURCES,
        CLAIM_TERRITORY,
        EXILE_MEMBER,
        CHANGE_IDEOLOGY,
        DISTRIBUTE_RESOURCES,
        MILITARY_ACTION,
        DIPLOMATIC_ACTION
    }
    
    mapping(uint256 => Faction) public factions;
    mapping(address => uint256) public playerFaction;
    mapping(uint256 => FactionProposal) public proposals;
    mapping(uint256 => War) public wars;
    mapping(uint256 => Alliance) public alliances;
    
    uint256 public factionCounter;
    uint256 public warCounter;
    uint256 public allianceCounter;
    
    uint256 private constant MAX_FACTIONS = 6;
    uint256 private constant MIN_MEMBERS_FOR_ACTION = 3;
    uint256 private constant WAR_DURATION = 28800; // ~5 days in blocks
    
    event FactionCreated(uint256 indexed factionId, string name, address founder);
    event MemberJoined(uint256 indexed factionId, address member);
    event MemberExiled(uint256 indexed factionId, address member);
    event WarDeclared(uint256 indexed warId, uint256 aggressor, uint256 defender);
    event WarEnded(uint256 indexed warId, uint256 winner);
    event AllianceFormed(uint256 indexed allianceId, uint256 faction1, uint256 faction2);
    event TerritoryConquered(uint256 indexed locationId, uint256 oldFaction, uint256 newFaction);
    event ResourcesAllocated(uint256 indexed factionId, uint256 amount, string purpose);
    
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold
    ) 
        Governor("DeadGrid Faction DAO")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(10) // 10% quorum
        GovernorTimelockControl(_timelock)
    {
        _initializeFactions();
    }
    
    /**
     * @notice Initialize the 6 base factions
     */
    function _initializeFactions() private {
        _createFaction("The Wardens", "Military remnants maintaining order through strength", "Order through Force");
        _createFaction("Haven Collective", "Cooperative survivors building sustainable communities", "Unity and Cooperation");
        _createFaction("Tech Enclave", "Scientists and engineers seeking technological solutions", "Knowledge is Power");
        _createFaction("Free Traders", "Merchants and scavengers operating black markets", "Profit Above All");
        _createFaction("The Forsaken", "Outcasts and criminals with their own brutal code", "Survival of the Fittest");
        _createFaction("New Eden", "Religious zealots seeing the apocalypse as divine judgment", "Redemption through Faith");
    }
    
    /**
     * @notice Create a new faction
     */
    function _createFaction(
        string memory name,
        string memory description,
        string memory ideology
    ) private returns (uint256) {
        require(factionCounter < MAX_FACTIONS, "Maximum factions reached");
        
        uint256 factionId = factionCounter++;
        
        Faction storage newFaction = factions[factionId];
        newFaction.id = factionId;
        newFaction.name = name;
        newFaction.description = description;
        newFaction.ideology = ideology;
        newFaction.resourcePool = 1000; // Starting resources
        newFaction.militaryStrength = 100; // Starting military
        
        emit FactionCreated(factionId, name, msg.sender);
        
        return factionId;
    }
    
    /**
     * @notice Join a faction
     */
    function joinFaction(uint256 factionId) external {
        require(factionId < factionCounter, "Invalid faction");
        require(playerFaction[msg.sender] == 0, "Already in faction");
        
        factions[factionId].members[msg.sender] = true;
        factions[factionId].memberCount++;
        playerFaction[msg.sender] = factionId;
        
        emit MemberJoined(factionId, msg.sender);
    }
    
    /**
     * @notice Propose faction action
     */
    function proposeFactionAction(
        ProposalType proposalType,
        uint256 targetFaction,
        uint256 value,
        string memory details
    ) external returns (uint256) {
        require(playerFaction[msg.sender] != 0, "Not in faction");
        uint256 factionId = playerFaction[msg.sender];
        require(factions[factionId].memberCount >= MIN_MEMBERS_FOR_ACTION, "Not enough members");
        
        // Create proposal based on type
        bytes memory proposalData = _encodeProposal(proposalType, targetFaction, value, details);
        
        address[] memory targets = new address[](1);
        targets[0] = address(this);
        
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = proposalData;
        
        uint256 proposalId = propose(targets, values, calldatas, details);
        
        proposals[proposalId] = FactionProposal({
            proposalType: proposalType,
            targetFaction: targetFaction,
            resourceAmount: value,
            locationId: 0,
            details: details
        });
        
        return proposalId;
    }
    
    /**
     * @notice Declare war on another faction
     */
    function declareWar(uint256 targetFaction) external returns (uint256) {
        require(playerFaction[msg.sender] != 0, "Not in faction");
        uint256 attackerFaction = playerFaction[msg.sender];
        require(targetFaction != attackerFaction, "Cannot declare war on own faction");
        require(targetFaction < factionCounter, "Invalid target faction");
        
        // Check for existing war
        for (uint i = 0; i < warCounter; i++) {
            if (wars[i].active && 
                ((wars[i].aggressor == attackerFaction && wars[i].defender == targetFaction) ||
                 (wars[i].aggressor == targetFaction && wars[i].defender == attackerFaction))) {
                revert("Already at war");
            }
        }
        
        uint256 warId = warCounter++;
        
        wars[warId] = War({
            aggressor: attackerFaction,
            defender: targetFaction,
            startBlock: block.number,
            endBlock: block.number + WAR_DURATION,
            aggressorLosses: 0,
            defenderLosses: 0,
            active: true,
            winner: 0
        });
        
        // Update faction relationships
        factions[attackerFaction].relationshipScores[targetFaction] = -100;
        factions[targetFaction].relationshipScores[attackerFaction] = -100;
        
        emit WarDeclared(warId, attackerFaction, targetFaction);
        
        return warId;
    }
    
    /**
     * @notice Conduct war action
     */
    function conductWarAction(uint256 warId, uint256 committedForces) external {
        require(wars[warId].active, "War not active");
        require(playerFaction[msg.sender] != 0, "Not in faction");
        
        uint256 faction = playerFaction[msg.sender];
        require(
            faction == wars[warId].aggressor || faction == wars[warId].defender,
            "Not involved in war"
        );
        
        require(
            committedForces <= factions[faction].militaryStrength,
            "Insufficient military strength"
        );
        
        // Simple combat resolution
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100;
        uint256 losses = (committedForces * (20 + random % 30)) / 100;
        
        factions[faction].militaryStrength -= losses;
        
        if (faction == wars[warId].aggressor) {
            wars[warId].aggressorLosses += losses;
            wars[warId].defenderLosses += committedForces - losses;
        } else {
            wars[warId].defenderLosses += losses;
            wars[warId].aggressorLosses += committedForces - losses;
        }
        
        // Check for war end
        if (block.number >= wars[warId].endBlock) {
            _endWar(warId);
        }
    }
    
    /**
     * @notice Form alliance with another faction
     */
    function formAlliance(
        uint256 otherFaction,
        uint256 duration,
        uint256 tradeBonus,
        bool militarySupport
    ) external returns (uint256) {
        require(playerFaction[msg.sender] != 0, "Not in faction");
        uint256 faction = playerFaction[msg.sender];
        require(faction != otherFaction, "Cannot ally with self");
        require(otherFaction < factionCounter, "Invalid faction");
        
        // Check relationship score
        require(
            factions[faction].relationshipScores[otherFaction] > 50,
            "Insufficient relationship"
        );
        
        uint256 allianceId = allianceCounter++;
        
        alliances[allianceId] = Alliance({
            faction1: faction,
            faction2: otherFaction,
            startBlock: block.number,
            duration: duration,
            active: true,
            tradeBonus: tradeBonus,
            militarySupport: militarySupport
        });
        
        // Improve relationship scores
        factions[faction].relationshipScores[otherFaction] = 100;
        factions[otherFaction].relationshipScores[faction] = 100;
        
        emit AllianceFormed(allianceId, faction, otherFaction);
        
        return allianceId;
    }
    
    /**
     * @notice Conquer territory for faction
     */
    function conquerTerritory(uint256 locationId) external {
        require(playerFaction[msg.sender] != 0, "Not in faction");
        uint256 faction = playerFaction[msg.sender];
        
        // Find current owner
        uint256 currentOwner = 0;
        for (uint i = 0; i < factionCounter; i++) {
            if (factions[i].controlledLocations[locationId]) {
                currentOwner = i;
                break;
            }
        }
        
        if (currentOwner != 0) {
            // Remove from old faction
            factions[currentOwner].controlledLocations[locationId] = false;
            factions[currentOwner].territoryCount--;
        }
        
        // Add to new faction
        factions[faction].controlledLocations[locationId] = true;
        factions[faction].territoryCount++;
        
        emit TerritoryConquered(locationId, currentOwner, faction);
    }
    
    /**
     * @notice Allocate faction resources
     */
    function allocateResources(
        uint256 amount,
        string memory purpose
    ) external {
        require(playerFaction[msg.sender] != 0, "Not in faction");
        uint256 faction = playerFaction[msg.sender];
        require(amount <= factions[faction].resourcePool, "Insufficient resources");
        
        factions[faction].resourcePool -= amount;
        
        emit ResourcesAllocated(faction, amount, purpose);
    }
    
    /**
     * @notice End a war
     */
    function _endWar(uint256 warId) private {
        War storage war = wars[warId];
        war.active = false;
        
        // Determine winner based on losses
        if (war.aggressorLosses < war.defenderLosses) {
            war.winner = war.aggressor;
            // Aggressor gains resources
            factions[war.aggressor].resourcePool += factions[war.defender].resourcePool / 4;
        } else {
            war.winner = war.defender;
            // Defender gains military strength
            factions[war.defender].militaryStrength += 50;
        }
        
        emit WarEnded(warId, war.winner);
    }
    
    /**
     * @notice Encode proposal for execution
     */
    function _encodeProposal(
        ProposalType proposalType,
        uint256 target,
        uint256 value,
        string memory details
    ) private pure returns (bytes memory) {
        if (proposalType == ProposalType.DECLARE_WAR) {
            return abi.encodeWithSignature("declareWar(uint256)", target);
        } else if (proposalType == ProposalType.FORM_ALLIANCE) {
            return abi.encodeWithSignature("formAlliance(uint256,uint256,uint256,bool)", target, value, 10, true);
        } else if (proposalType == ProposalType.DISTRIBUTE_RESOURCES) {
            return abi.encodeWithSignature("allocateResources(uint256,string)", value, details);
        } else {
            return "";
        }
    }
    
    // Required overrides for Governor
    
    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }
    
    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }
    
    function quorum(uint256 blockNumber) public view override(IGovernor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }
    
    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
    }
    
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }
    
    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }
    
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }
    
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }
    
    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}