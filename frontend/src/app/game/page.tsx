'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Badge } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import { useRouter } from 'next/navigation';
import SurvivorMinter from '../../components/SurvivorMinter';

// Cell types
type CellType = 'empty' | 'building' | 'resource' | 'zombie' | 'zombieGroup' | 'zombieHorde' | 'survivor' | 'camp';

// Interface for a cell with multiple contents
interface CellContents {
  type: CellType;
  hasPlayer: boolean;
}

// Interfaces for survivor data
interface SurvivorData {
  id: string;
  name: string;
  description: string;
  faction: string | null;
  disposition: 'friendly' | 'neutral' | 'hostile';
  skills: string[];
  isDiscovered: boolean;
}

// Interface for loot items
interface LootEffect {
  name: string;
  value: number;
}

interface LootItem {
  id: number;
  name: string;
  description: string;
  emoji: string;
  category: string;
  rarity: string;
  effects: LootEffect[];
  source: string;
  date_found: string;
  equipped?: boolean;
}

// Interface for faction reputation
interface FactionReputation {
  [key: string]: number; // Reputation score for each faction (-100 to 100)
}

// Game state interface
interface GameState {
  day: number;
  phase: 'solo' | 'camp' | 'dead';
  playerPosition: number;
  hasCamp: boolean;
  campPosition: number | null;
  campType: 'open' | 'building' | null;
  survivors: number;
  zombies: number;
  campDefense: number;
  scoutRange: number;
  hasMoved: boolean; // Track if player has moved this day
  hasPerformedAction: boolean; // Track if player has performed a camp action this day
  factionReputations: FactionReputation; // Track reputation with different factions
  resources: {
    food: number;
    water: number;
    medicine: number;
    ammo: number;
  };
  cityGrid: CellContents[];
  log: string[];
  loot: LootItem[]; // Player's collected loot items
}

// Grid dimensions
const gridSize = 10;
const cellSize = 36;

// Cell graphics mapping
const cellGraphics: Record<CellType, { emoji: string; label: string; color: string }> = {
  empty: { emoji: '⬛', label: 'Empty Space', color: '#2a2a2a' },
  building: { emoji: '🏢', label: 'Building', color: '#4a4a4a' },
  resource: { emoji: '🎒', label: 'Resource Cache', color: '#ffd700' },
  zombie: { emoji: '🧟', label: 'Zombie', color: '#ff4d4d' },
  zombieGroup: { emoji: '🧟‍♂️', label: 'Zombie Group', color: '#cc0000' },
  zombieHorde: { emoji: '☣️', label: 'Zombie Horde', color: '#990000' },
  survivor: { emoji: '🧑', label: 'Survivor', color: '#4caf50' },
  camp: { emoji: '⛺', label: 'Your Camp', color: '#ff9800' }
};

const playerEmoji = '🦸'; // Superhero emoji for player

// Generate initial grid
function generateInitialGrid(playerStartPosition: number): CellContents[] {
  const totalCells = gridSize * gridSize;
  const cells: CellContents[] = Array(totalCells).fill(null).map(() => ({
    type: 'empty',
    hasPlayer: false
  }));
  
  // Add player to starting position
  cells[playerStartPosition].hasPlayer = true;
  
  // Add some initial elements
  const numZombies = 5;
  const numZombieGroups = 2;
  const numBuildings = 8;
  const numResources = 3;
  const numSurvivors = 3;
  
  // Helper function to get random empty position
  const getRandomEmptyPosition = () => {
    let pos;
    do {
      pos = Math.floor(Math.random() * totalCells);
    } while (pos === playerStartPosition || cells[pos].type !== 'empty');
    return pos;
  };
  
  // Place zombies
  for (let i = 0; i < numZombies; i++) {
    const pos = getRandomEmptyPosition();
    cells[pos].type = 'zombie';
  }
  
  // Place zombie groups
  for (let i = 0; i < numZombieGroups; i++) {
    const pos = getRandomEmptyPosition();
    cells[pos].type = 'zombieGroup';
  }
  
  // Place buildings
  for (let i = 0; i < numBuildings; i++) {
    const pos = getRandomEmptyPosition();
    cells[pos].type = 'building';
  }
  
  // Place resources
  for (let i = 0; i < numResources; i++) {
    const pos = getRandomEmptyPosition();
    cells[pos].type = 'resource';
  }
  
  // Place survivors
  for (let i = 0; i < numSurvivors; i++) {
    const pos = getRandomEmptyPosition();
    cells[pos].type = 'survivor';
  }
  
  return cells;
}

export default function Game() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Dialog states
  const [showCampDialog, setShowCampDialog] = useState(false);
  const [showCombatDialog, setShowCombatDialog] = useState(false);
  const [showSurvivorDialog, setShowSurvivorDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showNightEventDialog, setShowNightEventDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showPartyDialog, setShowPartyDialog] = useState(false);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [currentSurvivor, setCurrentSurvivor] = useState<SurvivorData | null>(null);
  const [selectedLootItem, setSelectedLootItem] = useState<LootItem | null>(null);
  const [showCampAttackDialog, setShowCampAttackDialog] = useState(false);
  const [currentAttack, setCurrentAttack] = useState<any>(null);
  const [attackDefenseOptions, setAttackDefenseOptions] = useState<any[]>([]);
  // Add a refresh key to force grid rerender when needed
  const [gridRefreshKey, setGridRefreshKey] = useState(0);
  
  // Generate random player start position
  const getRandomStartPosition = () => {
    return Math.floor(Math.random() * (gridSize * gridSize));
  };
  
  // Initialize game state
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    phase: 'solo',
    playerPosition: getRandomStartPosition(),
    hasCamp: false,
    campPosition: null,
    campType: null,
    survivors: 0,
    zombies: 20,
    campDefense: 0,
    scoutRange: 1,
    hasMoved: false,
    hasPerformedAction: false,
    factionReputations: {
      'Traders': 0,
      'Medics': 0,
      'Raiders': -20, // Start slightly negative with Raiders
      'Military Remnant': 0,
      'Scientists': 0
    },
    resources: {
      food: 10,
      water: 10,
      medicine: 5,
      ammo: 15,
    },
    cityGrid: [],
    log: ['Day 1: You find yourself alone in a zombie-infested city.'],
    loot: [],
  });

  useEffect(() => {
    setMounted(true);
    
    // Initialize grid with player position
    const initialGrid = generateInitialGrid(gameState.playerPosition);
    setGameState(prev => ({
      ...prev,
      cityGrid: initialGrid
    }));
    
    // Show first day message
    addLog("Use your first day to find a safe place to set up camp. You can only set up camp where you're standing.");
  }, []);
  
  // Check if move is valid (adjacent to current position - no diagonals)
  const isValidMove = (currentPosition: number, targetPosition: number) => {
    const currentRow = Math.floor(currentPosition / gridSize);
    const currentCol = currentPosition % gridSize;
    const targetRow = Math.floor(targetPosition / gridSize);
    const targetCol = targetPosition % gridSize;
    
    // Check if target is adjacent (up, down, left, right only - no diagonals)
    const rowDiff = Math.abs(currentRow - targetRow);
    const colDiff = Math.abs(currentCol - targetCol);
    
    return (
      // Either row or column must be the same, and the other must differ by exactly 1
      (rowDiff === 0 && colDiff === 1) || (colDiff === 0 && rowDiff === 1) 
    );
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    const cell = gameState.cityGrid[index];
    
    // If clicked on the player's current position, show camp dialog
    if (index === gameState.playerPosition && gameState.phase === 'solo') {
      setShowCampDialog(true);
      return;
    }
    
    // If in camp phase, don't allow movement (player is at the camp)
    if (gameState.phase === 'camp') {
      addLog("You cannot leave your camp in this mode. Your focus is on maintaining the settlement.");
      return;
    }
    
    // If player has already moved this day, don't allow another move
    if (gameState.hasMoved) {
      addLog("You've already moved once today. End the day before moving again.");
      return;
    }
    
    // Check if it's a valid move (adjacent non-diagonal only)
    if (!isValidMove(gameState.playerPosition, index)) {
      addLog('You cannot move that far in one day. Choose an adjacent tile.');
      return;
    }
    
    // Handle different cell types
    if (cell.type === 'empty' || cell.type === 'building') {
      movePlayer(index);
      if (cell.type === 'building') {
        addLog('You entered a building. It might provide shelter or resources.');
        // 50% chance to find resources in a building
        if (Math.random() > 0.5) {
          addResources();
        }
        
        // Solo events specific to buildings
        triggerSoloEvent('building');
      } else {
        // Solo events for open areas
        triggerSoloEvent('open');
      }
    } else if (cell.type === 'resource') {
      // Get resources from the cache
      addResources();
      
      // Create a new grid with the resource cache removed
      const newGrid = [...gameState.cityGrid];
      // Remove player from current position
      newGrid[gameState.playerPosition].hasPlayer = false;
      // Move player to resource position and clear resource
      newGrid[index] = {
        type: 'empty',
        hasPlayer: true
      };
      
      // Update game state
      setGameState(prev => ({
        ...prev,
        playerPosition: index,
        hasMoved: true,
        cityGrid: newGrid
      }));
      
      // Force refresh the grid to ensure the UI updates
      setGridRefreshKey(prev => prev + 1);
      
      addLog('You collected resources from the cache. The supplies have been depleted.');
      
      // Trigger a resource-related event
      triggerSoloEvent('resource');
    } else if (cell.type === 'zombie' || cell.type === 'zombieGroup' || cell.type === 'zombieHorde') {
      setSelectedCellIndex(index);
      setShowCombatDialog(true);
    } else if (cell.type === 'survivor') {
      setSelectedCellIndex(index);
      setShowSurvivorDialog(true);
    }
  };

  // Move player to a new position
  const movePlayer = (newPosition: number) => {
    const newGrid = [...gameState.cityGrid];
    // Remove player from current position
    newGrid[gameState.playerPosition].hasPlayer = false;
    // Add player to new position
    newGrid[newPosition].hasPlayer = true;
    
    setGameState(prev => ({
      ...prev,
      playerPosition: newPosition,
      hasMoved: true, // Mark that player has moved this day
      cityGrid: newGrid
    }));
    
    addLog(`You moved to a new location.`);
  };

  // Add resources when finding a cache
  const addResources = () => {
    const foodFound = Math.floor(Math.random() * 3) + 1;
    const waterFound = Math.floor(Math.random() * 3) + 1;
    const medicineFound = Math.floor(Math.random() * 2);
    const ammoFound = Math.floor(Math.random() * 3);
    
    setGameState(prev => ({
      ...prev,
      resources: {
        food: prev.resources.food + foodFound,
        water: prev.resources.water + waterFound,
        medicine: prev.resources.medicine + medicineFound,
        ammo: prev.resources.ammo + ammoFound
      }
    }));
    
    addLog(`You found resources! +${foodFound} food, +${waterFound} water, +${medicineFound} medicine, +${ammoFound} ammo.`);
  };

  // Set up camp
  const setupCamp = (campType: 'open' | 'building') => {
    const playerPosition = gameState.playerPosition;
    const newGrid = [...gameState.cityGrid];
    
    // Change the cell type to camp and remove player
    newGrid[playerPosition] = {
      type: 'camp',
      hasPlayer: false // Player is now represented by the camp itself
    };
    
    setGameState(prev => ({
      ...prev,
      phase: 'camp',
      hasCamp: true,
      campPosition: playerPosition,
      campType: campType,
      cityGrid: newGrid
    }));
    
    if (campType === 'open') {
      addLog('You set up camp in an open area. It will be easier to evacuate if needed.');
    } else {
      addLog('You set up camp in a building. It will provide better protection during attacks.');
    }
    
    // Trigger first camp event
    triggerCampEvent('first_day');
    
    setShowCampDialog(false);
  };

  // Trigger solo events based on context
  const triggerSoloEvent = (context: 'open' | 'building' | 'resource') => {
    // Only trigger events with a small chance
    if (Math.random() > 0.3) return;
    
    const events = {
      open: [
        "You find traces of recent zombie activity. Best to stay alert.",
        "You spot a flock of birds flying away. Something must have spooked them.",
        "The wind carries distant screams. You decide to move quickly.",
        "You notice fresh footprints. Someone was here recently."
      ],
      building: [
        "The building creaks and groans. It might not be stable.",
        "You find old newspapers with headlines about the outbreak.",
        "There are family photos on the wall. You wonder what happened to them.",
        "The building shows signs of hasty evacuation."
      ],
      resource: [
        "These supplies belonged to someone. You hope they don't come back for them.",
        "The resource cache looks recently abandoned.",
        "You find a journal with the supplies. The last entry is disturbing.",
        "These supplies were well-hidden. You were lucky to find them."
      ]
    };
    
    // Select random event for the context
    const eventText = events[context][Math.floor(Math.random() * events[context].length)];
    addLog(eventText);
  };

  // Trigger camp events
  const triggerCampEvent = (eventType: 'first_day' | 'daily' | 'special') => {
    const events = {
      first_day: [
        "You've established your camp. Now you need to focus on survival and growth.",
        "Your new settlement needs protection. Consider setting up defenses.",
        "With a base established, you can now focus on gathering more resources.",
        "Your camp provides a sense of security, but zombies are drawn to settlements."
      ],
      daily: [
        "A quiet day at camp. Everyone is focused on their tasks.",
        "Morale is holding steady at the camp.",
        "Some minor repairs needed around camp today.",
        "Camp residents report strange noises in the night."
      ],
      special: [
        "Tensions are rising in the camp. Some people want to move on.",
        "A small celebration lifts everyone's spirits. +1 morale.",
        "Heavy rain today. Some supplies got wet. -1 food.",
        "One of the survivors has medical experience. They helped organize supplies. +1 medicine."
      ]
    };
    
    // Select random event for the type
    const eventText = events[eventType][Math.floor(Math.random() * events[eventType].length)];
    addLog(eventText);
    
    // Apply special event effects if needed
    if (eventType === 'special' && eventText.includes('-1 food')) {
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          food: Math.max(0, prev.resources.food - 1)
        }
      }));
    } else if (eventType === 'special' && eventText.includes('+1 medicine')) {
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          medicine: prev.resources.medicine + 1
        }
      }));
    }
  };

  // Handle combat with zombies
  const handleCombat = (action: 'fight' | 'flee') => {
    if (selectedCellIndex === null) return;
    
    const zombieType = gameState.cityGrid[selectedCellIndex].type;
    let combatSuccess = false;
    let casualties = 0;
    
    if (action === 'fight') {
      // Use ammo for fighting
      const ammoUsed = zombieType === 'zombie' ? 1 : zombieType === 'zombieGroup' ? 2 : 3;
      
      // Check if player has enough ammo
      if (gameState.resources.ammo < ammoUsed) {
        addLog("You don't have enough ammunition to fight!");
        setShowCombatDialog(false);
        return;
      }
      
      // Combat chances depend on zombie type
      if (zombieType === 'zombie') {
        // 80% chance to win against a single zombie
        combatSuccess = Math.random() < 0.8;
        casualties = combatSuccess ? 0 : (Math.random() < 0.5 ? 0 : 1); // 50% chance of player death on failure
      } else if (zombieType === 'zombieGroup') {
        // 50% chance to win against a zombie group
        combatSuccess = Math.random() < 0.5;
        casualties = combatSuccess ? (Math.random() < 0.3 ? 1 : 0) : (gameState.survivors > 0 ? 1 : 1); // Always lose someone on failure
      } else if (zombieType === 'zombieHorde') {
        // 20% chance to win against a zombie horde
        combatSuccess = Math.random() < 0.2;
        casualties = combatSuccess ? (gameState.survivors > 0 ? 1 : 0) : (gameState.survivors > 0 ? gameState.survivors : 1);
      }
      
      // Create a new grid to update
      const newGrid = [...gameState.cityGrid];
      
      // Apply combat effects
      if (combatSuccess) {
        // Fight was successful - zombie is eliminated or reduced
        
        // First, always remove the player from their current position
        newGrid[gameState.playerPosition].hasPlayer = false;
        
        if (zombieType === 'zombieHorde') {
          // For hordes, just reduce the threat rather than removing entirely
          newGrid[selectedCellIndex] = {
            type: 'zombieGroup',
            hasPlayer: true // Player moves to the position
          };
          addLog("You managed to thin out the zombie horde, but many remain.");
        } else if (zombieType === 'zombieGroup' && Math.random() < 0.3) {
          // 30% chance a weakened zombie remains
          newGrid[selectedCellIndex] = {
            type: 'zombie',
            hasPlayer: true // Player moves to the position
          };
          addLog("You took down most of the zombies, but one is still standing.");
        } else {
          // Clear the tile completely
          newGrid[selectedCellIndex] = {
            type: 'empty',
            hasPlayer: true // Player moves to the position
          };
        }
        
        // If successful against a horde but with heavy losses, don't advance
        if (zombieType === 'zombieHorde' && casualties > 0 && Math.random() < 0.7) {
          // Player doesn't move to the horde's position
          newGrid[selectedCellIndex].hasPlayer = false;
          // Put player back at their original position
          newGrid[gameState.playerPosition].hasPlayer = true;
          
          setGameState(prev => ({
            ...prev,
            survivors: Math.max(0, prev.survivors - casualties),
            zombies: prev.zombies - 3, // Kill a few zombies
            resources: {
              ...prev.resources,
              ammo: Math.max(0, prev.resources.ammo - ammoUsed)
            },
            cityGrid: newGrid,
            hasMoved: true
          }));
          
          // Force refresh the grid
          setGridRefreshKey(prev => prev + 1);
          
          addLog(`You fought back the zombie horde but couldn't safely advance. Used ${ammoUsed} ammo.`);
        } else {
          // Normal success case - player moves to the zombie's position
          setGameState(prev => ({
            ...prev,
            playerPosition: selectedCellIndex, // Update player's position to the zombie's previous position
            survivors: Math.max(0, prev.survivors - casualties),
            zombies: prev.zombies - (zombieType === 'zombie' ? 1 : zombieType === 'zombieGroup' ? 3 : 5),
            resources: {
              ...prev.resources,
              ammo: Math.max(0, prev.resources.ammo - ammoUsed)
            },
            cityGrid: newGrid,
            hasMoved: true
          }));
          
          // Force refresh the grid
          setGridRefreshKey(prev => prev + 1);
          
          // Combat results message
          let combatMessage = `You successfully defeated ${zombieType === 'zombie' ? 'the zombie' : zombieType === 'zombieGroup' ? 'the group of zombies' : 'part of the zombie horde'}.`;
          
          if (casualties > 0) {
            if (gameState.survivors > 0) {
              combatMessage += ` Lost ${casualties} survivor${casualties > 1 ? 's' : ''} in the fight.`;
            } else {
              combatMessage += ` You were injured in the fight.`;
            }
          }
          
          combatMessage += ` Used ${ammoUsed} ammo.`;
          addLog(combatMessage);
        }
        
        // Chance to find loot from zombies
        if (Math.random() < 0.6) {
          findLoot(zombieType);
        }
      } else {
        // Fight failed - the zombie stays where it is but player doesn't move
        let combatMessage = `You failed to defeat ${zombieType === 'zombie' ? 'the zombie' : zombieType === 'zombieGroup' ? 'the group of zombies' : 'the zombie horde'}.`;
        
        // Check if player or all survivors died
        const playerDied = (gameState.survivors === 0 && casualties > 0);
        
        if (playerDied) {
          // Player death
          addLog(`${combatMessage} You were killed in the fight.`);
          setShowCombatDialog(false);
          
          // Game over - show death screen
          setGameState(prev => ({
            ...prev,
            phase: 'dead'
          }));
          
          return;
        } else {
          // Update game state - use ammo and potentially lose survivors
          // Note: The grid is not changed - zombie stays where it is
          setGameState(prev => ({
            ...prev,
            survivors: Math.max(0, prev.survivors - casualties),
            resources: {
              ...prev.resources,
              ammo: Math.max(0, prev.resources.ammo - ammoUsed),
              medicine: Math.max(0, prev.resources.medicine - 1)
            },
            hasMoved: true
          }));
          
          // Force refresh the grid
          setGridRefreshKey(prev => prev + 1);
          
          if (casualties > 0) {
            combatMessage += ` Lost ${casualties} survivor${casualties > 1 ? 's' : ''} in the fight.`;
          }
          
          combatMessage += ` Used ${ammoUsed} ammo and 1 medicine treating wounds.`;
          addLog(combatMessage);
        }
      }
    } else {
      // Flee action - has a chance of taking damage
      const fleeSuccess = Math.random() < (zombieType === 'zombie' ? 0.9 : zombieType === 'zombieGroup' ? 0.7 : 0.5);
      
      if (fleeSuccess) {
        addLog(`You successfully fled from ${zombieType === 'zombie' ? 'the zombie' : zombieType === 'zombieGroup' ? 'the group of zombies' : 'the zombie horde'}.`);
      } else {
        // Failed to flee - take damage
        casualties = zombieType === 'zombie' ? 0 : zombieType === 'zombieGroup' ? (Math.random() < 0.5 ? 1 : 0) : 1;
        
        // Check if player died during flee attempt
        if (gameState.survivors === 0 && casualties > 0) {
          addLog(`You failed to escape and were killed by ${zombieType === 'zombie' ? 'the zombie' : zombieType === 'zombieGroup' ? 'the zombies' : 'the zombie horde'}.`);
          
          // Game over - show death screen
          setGameState(prev => ({
            ...prev,
            phase: 'dead'
          }));
          
          setShowCombatDialog(false);
          return;
        }
        
        // Update game state with casualties
        setGameState(prev => ({
          ...prev,
          survivors: Math.max(0, prev.survivors - casualties),
          resources: {
            ...prev.resources,
            medicine: Math.max(0, prev.resources.medicine - (casualties > 0 ? 1 : 0))
          },
          hasMoved: true
        }));
        
        // Force refresh the grid
        setGridRefreshKey(prev => prev + 1);
        
        let fleeMessage = `You barely escaped from ${zombieType === 'zombie' ? 'the zombie' : zombieType === 'zombieGroup' ? 'the group of zombies' : 'the zombie horde'}.`;
        
        if (casualties > 0) {
          fleeMessage += ` Lost ${casualties} survivor${casualties > 1 ? 's' : ''} during the escape.`;
          fleeMessage += ` Used 1 medicine treating wounds.`;
        }
        
        addLog(fleeMessage);
      }
    }
    
    setShowCombatDialog(false);
    
    // Only end the day if the player survived
    if (gameState.phase !== 'dead') {
      // Skip updateZombies here - don't call endDay() which would move all zombies
      // Instead, just increment the day manually
      setGameState(prev => ({
        ...prev,
        day: prev.day + 1,
        hasMoved: false, // Reset movement for the new day
        hasPerformedAction: false // Reset camp action for the new day
      }));
      
      addLog(`Day ${gameState.day + 1} begins.`);
      
      // Different events based on game phase
      if (gameState.phase === 'solo') {
        // Random chance for a special solo event
        if (Math.random() < 0.2) {
          triggerRandomSoloEvent();
        }
      } else if (gameState.phase === 'camp') {
        // Resource consumption happens daily
        consumeResources();
        
        // Daily camp events
        if (Math.random() < 0.7) {
          triggerCampEvent('daily');
        } else {
          triggerCampEvent('special');
        }
        
        // Chance for zombie attack on camp
        const attackChance = 0.1 + (gameState.survivors * 0.02) - (gameState.campDefense * 0.02);
        if (Math.random() < attackChance) {
          zombieAttackOnCamp();
        }
      }
    }
  };

  // Handle encountering survivors
  const handleSurvivor = (action: 'recruit' | 'ignore') => {
    if (selectedCellIndex === null) return;
    
    // Generate a random survivor data
    const survivorId = `survivor-${selectedCellIndex}`;
    const names = ["Alex", "Morgan", "Casey", "Jordan", "Taylor", "Riley", "Quinn", "Avery", "Blake", "Cameron"];
    const factions = [null, "Traders", "Medics", "Raiders", "Military Remnant", "Scientists"];
    const skills = ["Medicine", "Hunting", "Defense", "Engineering", "Crafting", "Leadership", "Scavenging"];
    
    // Generate random survivor attributes
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomFaction = factions[Math.floor(Math.random() * factions.length)];
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    
    // Determine disposition based on faction or random chance
    let disposition: 'friendly' | 'neutral' | 'hostile' = 'neutral';
    let factionReputation = 0;
    
    if (randomFaction) {
      factionReputation = gameState.factionReputations[randomFaction] || 0;
      
      // Calculate chances based on reputation
      const friendlyChance = 0.3 + (factionReputation > 0 ? factionReputation / 200 : 0); 
      const hostileChance = 0.2 + (factionReputation < 0 ? Math.abs(factionReputation) / 200 : 0);
      
      const roll = Math.random();
      if (roll < friendlyChance) {
        disposition = 'friendly';
      } else if (roll >= (1 - hostileChance)) {
        disposition = 'hostile';
      } else {
        disposition = 'neutral';
      }
    } else {
      // No faction, 40% friendly, 40% neutral, 20% hostile
      const roll = Math.random();
      if (roll < 0.4) {
        disposition = 'friendly';
      } else if (roll < 0.8) {
        disposition = 'neutral';
      } else {
        disposition = 'hostile';
      }
    }
    
    if (action === 'recruit') {
      if (disposition === 'friendly') {
        // Successful recruitment
        const newGrid = [...gameState.cityGrid];
        // Remove player from current position
        newGrid[gameState.playerPosition].hasPlayer = false;
        // Move player to survivor position and clear survivor
        newGrid[selectedCellIndex] = {
          type: 'empty',
          hasPlayer: true
        };
        
        setGameState(prev => ({
          ...prev,
          playerPosition: selectedCellIndex,
          survivors: prev.survivors + 1,
          cityGrid: newGrid
        }));
        
        addLog(`${randomName} was friendly and decided to join your group! +1 survivor with ${randomSkill} skills.`);
        
        // If they belonged to a faction, improve reputation
        if (randomFaction) {
          updateFactionReputation(randomFaction, 10);
          addLog(`Your reputation with the ${randomFaction} has improved.`);
        }
      } else if (disposition === 'neutral') {
        // Neutral survivors might join, but less likely
        const joinChance = 0.3 + (randomFaction ? factionReputation / 300 : 0);
        
        if (Math.random() < joinChance) {
          // They decided to join
          const newGrid = [...gameState.cityGrid];
          newGrid[gameState.playerPosition].hasPlayer = false;
          newGrid[selectedCellIndex] = {
            type: 'empty',
            hasPlayer: true
          };
          
          setGameState(prev => ({
            ...prev,
            playerPosition: selectedCellIndex,
            survivors: prev.survivors + 1,
            cityGrid: newGrid
          }));
          
          addLog(`After some convincing, ${randomName} agreed to join your group. +1 survivor with ${randomSkill} skills.`);
          
          if (randomFaction) {
            updateFactionReputation(randomFaction, 5);
          }
        } else {
          // They rejected the offer
          addLog(`${randomName} considered your offer but ultimately decided not to join your group.`);
        }
      } else {
        // Hostile survivors - might attack
        addLog(`${randomName} was hostile and rejected your recruitment attempt.`);
        
        // 30% chance of attacking
        if (Math.random() < 0.3) {
          addLog(`${randomName} attacked you before fleeing!`);
          
          // Small chance of losing resources
          if (Math.random() < 0.5 && gameState.resources.food > 0) {
            setGameState(prev => ({
              ...prev,
              resources: {
                ...prev.resources,
                food: Math.max(0, prev.resources.food - 2)
              }
            }));
            addLog("They stole some of your food supplies. -2 food.");
          }
          
          // Update faction reputation negatively
          if (randomFaction) {
            updateFactionReputation(randomFaction, -10);
            addLog(`Your reputation with the ${randomFaction} has decreased.`);
          }
        }
        
        // Hostile survivors remain on the map
      }
    } else {
      // Player chose to ignore the survivor
      addLog(`You decided to leave ${randomName} alone.`);
      
      // Small positive reputation for respecting space of hostile survivors
      if (disposition === 'hostile' && randomFaction) {
        updateFactionReputation(randomFaction, 2);
      }
    }
    
    setShowSurvivorDialog(false);
    endDay();
  };

  // Add log entry
  const addLog = (entry: string) => {
    setGameState(prev => ({
      ...prev,
      log: [...prev.log, entry]
    }));
  };

  // End the current day
  const endDay = () => {
    setGameState(prev => ({
      ...prev,
      day: prev.day + 1,
      hasMoved: false, // Reset movement for the new day
      hasPerformedAction: false // Reset camp action for the new day
    }));
    
    addLog(`Day ${gameState.day + 1} begins.`);
    
    // Move zombies for both phases
    updateZombies();
    
    // Different events based on game phase
    if (gameState.phase === 'solo') {
      // Random chance for a special solo event
      if (Math.random() < 0.2) {
        triggerRandomSoloEvent();
      }
    } else if (gameState.phase === 'camp') {
      // Resource consumption happens daily
      consumeResources();
      
      // Daily camp events
      if (Math.random() < 0.7) {
        triggerCampEvent('daily');
      } else {
        triggerCampEvent('special');
      }
      
      // Chance for zombie attack on camp
      const attackChance = 0.1 + (gameState.survivors * 0.02) - (gameState.campDefense * 0.02);
      if (Math.random() < attackChance) {
        zombieAttackOnCamp();
      }
    }
  };

  // Calculate distance between two points on the grid
  const getDistance = (index1: number, index2: number) => {
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;
    
    // Manhattan distance (no diagonals)
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  };

  // Calculate zombie chase probability based on distance
  const getChaseChance = (distance: number) => {
    switch (distance) {
      case 1: return 0.7;  // 70% chance at 1 square away
      case 2: return 0.4;  // 40% chance at 2 squares away
      case 3: return 0.2;  // 20% chance at 3 squares away
      case 4: return 0.1;  // 10% chance at 4 squares away
      default: return 0.05; // 5% base chance beyond that
    }
  };

  // Update zombie positions
  const updateZombies = () => {
    const newGrid = [...gameState.cityGrid];
    
    // Keep track of indices that have been processed
    // This helps prevent issues with zombies that have been defeated in automatic combat
    const processedIndices = new Set<number>();
    
    // Get target position (player or camp)
    const targetPosition = gameState.phase === 'solo' 
      ? gameState.playerPosition 
      : gameState.campPosition || 0;
    
    // Process each cell for potential zombie movement
    for (let i = 0; i < newGrid.length; i++) {
      // Skip if this cell has already been processed
      if (processedIndices.has(i)) continue;
      
      // Skip if this is not a zombie cell
      if (newGrid[i].type !== 'zombie' && newGrid[i].type !== 'zombieGroup' && newGrid[i].type !== 'zombieHorde') continue;
      
      const zombieType = newGrid[i].type;
      const distance = getDistance(i, targetPosition);
      const chaseChance = getChaseChance(distance);
      
      // If zombie is adjacent to player in solo mode, trigger automatic combat - CRITICAL FIX
      if (gameState.phase === 'solo' && distance === 1) {
        // Mark this index as processed to prevent further updates
        processedIndices.add(i);
        
        // 50% chance for zombie to attack if adjacent
        if (Math.random() < 0.5) {
          // Trigger automatic combat
          const attackSuccess = Math.random() < (zombieType === 'zombie' ? 0.3 : zombieType === 'zombieGroup' ? 0.5 : 0.8);
          
          if (attackSuccess) {
            // Zombie succeeded in attack - same logic as before
            if (gameState.survivors === 0) {
              // Game over - player died
              addLog(`A ${zombieType === 'zombie' ? 'zombie' : zombieType === 'zombieGroup' ? 'group of zombies' : 'zombie horde'} attacked and killed you!`);
              
              // Game over - show death screen
              setGameState(prev => ({
                ...prev,
                phase: 'dead'
              }));
              return; // Exit early - game is over
            } else {
              // Player loses a survivor but survives
              setGameState(prev => ({
                ...prev,
                survivors: prev.survivors - 1,
                resources: {
                  ...prev.resources,
                  medicine: Math.max(0, prev.resources.medicine - 1)
                }
              }));
              
              addLog(`A ${zombieType === 'zombie' ? 'zombie' : zombieType === 'zombieGroup' ? 'group of zombies' : 'zombie horde'} attacked your group! You lost 1 survivor but managed to fight it off.`);
            }
          } else {
            // Player defeats zombie - DIRECTLY remove zombie from grid
            newGrid[i] = {
              type: 'empty',
              hasPlayer: false
            };
            
            // Update zombie count
            const zombiesKilled = (zombieType === 'zombie' ? 1 : zombieType === 'zombieGroup' ? 3 : 5);
            
            // Update zombie count immediately in our function scope
            gameState.zombies = Math.max(0, gameState.zombies - zombiesKilled);
            
            addLog(`A ${zombieType === 'zombie' ? 'zombie' : zombieType === 'zombieGroup' ? 'group of zombies' : 'zombie horde'} attacked, but you successfully defeated it!`);
            
            // Chance to find loot from zombie
            if (Math.random() < 0.4) {
              findLoot(zombieType);
            }
          }
          
          // Skip normal movement processing for this zombie
          continue;
        }
      }
      
      // Regular zombie movement continues as before...
      const willChase = Math.random() < chaseChance;
      
      if (willChase) {
        // Chase player/camp - get adjacent cells that are closer to target
        const adjacentCells = getAdjacentCells(i);
        let bestCells: number[] = [];
        
        for (const adjIdx of adjacentCells) {
          // Skip occupied cells or processed cells
          if (newGrid[adjIdx].type !== 'empty' || processedIndices.has(adjIdx)) continue;
          
          // Never let zombie move directly onto player's tile in solo mode
          if (adjIdx === targetPosition) continue;
          
          // Check if this cell is closer to target
          if (getDistance(adjIdx, targetPosition) < distance) {
            bestCells.push(adjIdx);
          }
        }
        
        // If there are cells closer to target, move zombie to a random one
        if (bestCells.length > 0) {
          const targetCell = bestCells[Math.floor(Math.random() * bestCells.length)];
          
          // Mark both original and target indices as processed
          processedIndices.add(i);
          processedIndices.add(targetCell);
          
          // Move zombie
          newGrid[targetCell] = {
            type: zombieType,
            hasPlayer: false
          };
          
          // Clear original cell
          newGrid[i] = {
            type: 'empty',
            hasPlayer: false
          };
          
          // Log if zombie is getting close to player
          if (gameState.phase === 'solo' && getDistance(targetCell, targetPosition) === 1) {
            addLog("A zombie is getting dangerously close to you!");
          }
        }
      } else {
        // Random movement - 40% chance to move
        if (Math.random() < 0.4) {
          const adjacentCells = getAdjacentCells(i);
          const emptyCells = adjacentCells.filter(cellIdx => 
            newGrid[cellIdx].type === 'empty' && 
            // Prevent any movement onto player's tile or processed cells
            cellIdx !== targetPosition &&
            !processedIndices.has(cellIdx)
          );
          
          // If there are empty adjacent cells, move zombie to a random one
          if (emptyCells.length > 0) {
            const targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            
            // Mark both original and target indices as processed
            processedIndices.add(i);
            processedIndices.add(targetCell);
            
            // Move zombie
            newGrid[targetCell] = {
              type: zombieType,
              hasPlayer: false
            };
            
            // Clear original cell
            newGrid[i] = {
              type: 'empty',
              hasPlayer: false
            };
          }
        }
      }
    }
    
    // Small chance to add new zombies at the edges
    if (Math.random() < 0.15) {
      const edgeCells = getEdgeCells();
      const emptyCells = edgeCells.filter(cellIdx => 
        newGrid[cellIdx].type === 'empty' &&
        // Ensure we don't spawn new zombies on player's position or processed cells
        cellIdx !== targetPosition &&
        !processedIndices.has(cellIdx)
      );
      
      if (emptyCells.length > 0) {
        const targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // Mark as processed
        processedIndices.add(targetCell);
        
        newGrid[targetCell] = {
          type: Math.random() < 0.7 ? 'zombie' : 'zombieGroup',
          hasPlayer: false
        };
        
        setGameState(prev => ({
          ...prev,
          zombies: prev.zombies + (Math.random() < 0.7 ? 1 : 3)
        }));
        
        addLog("New zombies have appeared on the outskirts of the area.");
      }
    }
    
    // Update the grid with all changes
    setGameState(prev => ({
      ...prev,
      cityGrid: newGrid,
      zombies: gameState.zombies // Ensure zombie count reflects any combat that occurred
    }));
    
    // Force refresh the grid
    setGridRefreshKey(prev => prev + 1);
  };

  // Remove handleAutomaticCombat function as its logic is now in updateZombies
  // This prevents any issues with function call sequencing
  const handleAutomaticCombat = (zombieIndex: number, zombieType: CellType) => {
    // This function is now just a stub - functionality moved to updateZombies
    // We keep it to prevent breaking existing code references
    console.log("Combat handled directly in updateZombies");
  };

  // Get adjacent cells for a given index
  const getAdjacentCells = (index: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const adjacent: number[] = [];
    
    // Check all 8 directions (including diagonals)
    for (let r = Math.max(0, row - 1); r <= Math.min(gridSize - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(gridSize - 1, col + 1); c++) {
        const adjIndex = r * gridSize + c;
        if (adjIndex !== index) {
          adjacent.push(adjIndex);
        }
      }
    }
    
    return adjacent;
  };

  // Get cells on the grid edge
  const getEdgeCells = () => {
    const edges: number[] = [];
    
    // Top and bottom edges
    for (let col = 0; col < gridSize; col++) {
      edges.push(col); // Top edge
      edges.push((gridSize - 1) * gridSize + col); // Bottom edge
    }
    
    // Left and right edges (excluding corners already added)
    for (let row = 1; row < gridSize - 1; row++) {
      edges.push(row * gridSize); // Left edge
      edges.push(row * gridSize + gridSize - 1); // Right edge
    }
    
    return edges;
  };

  // Random solo events
  const triggerRandomSoloEvent = () => {
    const events = [
      {
        type: "supply_drop",
        message: "You notice a supply crate that must have been air-dropped recently.",
        effect: () => {
          // Add random resources
          setGameState(prev => ({
            ...prev,
            resources: {
              ...prev.resources,
              food: prev.resources.food + 3,
              water: prev.resources.water + 3,
              medicine: prev.resources.medicine + 2,
              ammo: prev.resources.ammo + 3
            }
          }));
          addLog("You found a supply drop! +3 food, +3 water, +2 medicine, +3 ammo.");
        }
      },
      {
        type: "survivor_group",
        message: "You spot a small group of survivors in the distance.",
        effect: () => {
          // Add 1-3 survivors
          const newSurvivors = 1 + Math.floor(Math.random() * 3);
          setGameState(prev => ({
            ...prev,
            survivors: prev.survivors + newSurvivors
          }));
          addLog(`You recruited ${newSurvivors} survivors to your group!`);
        }
      },
      {
        type: "horde_movement",
        message: "In the distance, you see a large horde of zombies moving through the city.",
        effect: () => {
          // Add a zombie horde in a random location
          const newGrid = [...gameState.cityGrid];
          let placed = false;
          
          // Try to place a horde at least 3 cells away from player
          for (let attempts = 0; attempts < 10 && !placed; attempts++) {
            const targetIdx = Math.floor(Math.random() * newGrid.length);
            const targetRow = Math.floor(targetIdx / gridSize);
            const targetCol = targetIdx % gridSize;
            const playerRow = Math.floor(gameState.playerPosition / gridSize);
            const playerCol = gameState.playerPosition % gridSize;
            
            // Calculate Manhattan distance
            const distance = Math.abs(targetRow - playerRow) + Math.abs(targetCol - playerCol);
            
            if (distance >= 3 && newGrid[targetIdx].type === 'empty') {
              newGrid[targetIdx] = {
                type: 'zombieHorde',
                hasPlayer: false
              };
              placed = true;
              
              setGameState(prev => ({
                ...prev,
                cityGrid: newGrid,
                zombies: prev.zombies + 10
              }));
              
              addLog("A zombie horde has appeared in the distance!");
            }
          }
          
          if (!placed) {
            addLog("You hear distant moans but can't locate their source.");
          }
        }
      },
      {
        type: "bad_weather",
        message: "A sudden storm hits the area. Visibility is reduced and movement is difficult.",
        effect: () => {
          // No direct gameplay effect yet, just a message
          addLog("The storm will pass by tomorrow. Be careful when moving.");
        }
      }
    ];
    
    // Select a random event
    const selectedEvent = events[Math.floor(Math.random() * events.length)];
    addLog(selectedEvent.message);
    selectedEvent.effect();
  };

  // Zombie attack on camp
  const zombieAttackOnCamp = () => {
    // Determine attack strength based on nearby zombies
    const attackStrength = Math.floor(Math.random() * 3) + 1; // 1-3
    
    // Calculate defense factor
    const defenseFactor = gameState.campDefense * 0.1; // 0.1 per defense level
    
    // Calculate survivor loss (minimum 0)
    const potentialLoss = Math.max(0, attackStrength - Math.floor(defenseFactor));
    const actualLoss = Math.min(gameState.survivors, potentialLoss);
    
    // Calculate ammo usage in defense
    const ammoUsed = Math.min(gameState.resources.ammo, attackStrength * 2);
    
    setGameState(prev => ({
      ...prev,
      survivors: prev.survivors - actualLoss,
      resources: {
        ...prev.resources,
        ammo: prev.resources.ammo - ammoUsed
      },
      zombies: Math.max(0, prev.zombies - attackStrength)
    }));
    
    if (attackStrength === 1) {
      addLog(`A lone zombie attacked your camp. ${actualLoss > 0 ? `${actualLoss} casualties.` : 'No casualties.'} Used ${ammoUsed} ammo.`);
    } else if (attackStrength === 2) {
      addLog(`A small group of zombies attacked your camp. ${actualLoss > 0 ? `${actualLoss} casualties.` : 'No casualties.'} Used ${ammoUsed} ammo.`);
    } else {
      addLog(`A large zombie attack on your camp! ${actualLoss > 0 ? `${actualLoss} casualties.` : 'No casualties.'} Used ${ammoUsed} ammo.`);
    }
    
    // Camp defense might be damaged
    if (Math.random() < 0.3 && gameState.campDefense > 0) {
      setGameState(prev => ({
        ...prev,
        campDefense: prev.campDefense - 1
      }));
      addLog("The attack damaged your camp defenses.");
    }
    
    // Check if this attack resulted in game over
    setTimeout(() => checkGameOver(), 0);
  };

  // Helper function to check if game should end due to all survivors being lost
  const checkGameOver = () => {
    if (gameState.survivors <= 0 && gameState.phase === 'camp') {
      // All survivors are dead, game over
      addLog("With all survivors lost, your camp cannot sustain itself. Your settlement has fallen.");
      
      // Set game to dead phase
      setGameState(prev => ({
        ...prev,
        phase: 'dead'
      }));
      
      return true;
    }
    return false;
  };

  // Update consume resources function to check for game over
  const consumeResources = () => {
    const foodNeeded = 1 + Math.floor(gameState.survivors / 2);
    const waterNeeded = 1 + Math.floor(gameState.survivors / 2);
    
    // Get current resources before update
    const currentFood = gameState.resources.food;
    const currentWater = gameState.resources.water;
    
    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        food: Math.max(0, prev.resources.food - foodNeeded),
        water: Math.max(0, prev.resources.water - waterNeeded)
      }
    }));
    
    addLog(`Daily consumption: -${foodNeeded} food, -${waterNeeded} water.`);
    
    // Check for resource shortages
    if (currentFood < foodNeeded || currentWater < waterNeeded) {
      addLog("WARNING: Not enough resources for everyone. Survivors' health will suffer.");
      
      // Chance to lose a survivor from starvation/dehydration
      if (gameState.survivors > 0 && Math.random() < 0.3) {
        setGameState(prev => ({
          ...prev,
          survivors: prev.survivors - 1
        }));
        addLog("A survivor has died from lack of resources.");
        
        // Check if this was the last survivor
        setTimeout(() => checkGameOver(), 0);
      }
    }
  };

  // Camp Actions
  const gatherResources = () => {
    // Check if player has already performed an action this day
    if (gameState.hasPerformedAction) {
      addLog("You've already performed a camp action today. End the day before performing another action.");
      return;
    }
    
    addLog("You focused on gathering resources today.");
    // Add resources based on survivors (at least 1 + number of survivors as maximum)
    const foodFound = 1 + Math.floor(Math.random() * (1 + gameState.survivors));
    const waterFound = 1 + Math.floor(Math.random() * (1 + gameState.survivors));
    
    setGameState(prev => ({
      ...prev,
      hasPerformedAction: true,
      resources: {
        ...prev.resources,
        food: prev.resources.food + foodFound,
        water: prev.resources.water + waterFound
      }
    }));
    
    addLog(`Gathered: +${foodFound} food, +${waterFound} water.`);
    
    // Small chance of finding a survivor
    if (Math.random() < 0.1) {
      setGameState(prev => ({
        ...prev,
        survivors: prev.survivors + 1
      }));
      addLog("While gathering, you found and recruited a survivor!");
    }
  };

  const reinforceCamp = () => {
    // Check if player has already performed an action this day
    if (gameState.hasPerformedAction) {
      addLog("You've already performed a camp action today. End the day before performing another action.");
      return;
    }
    
    addLog("You reinforced camp defenses.");
    
    // Increase camp defense
    setGameState(prev => ({
      ...prev,
      hasPerformedAction: true,
      campDefense: prev.campDefense + 1,
      resources: {
        ...prev.resources,
        // Use some ammo for fortifications
        ammo: Math.max(0, prev.resources.ammo - 1)
      }
    }));
    
    addLog("Camp defense improved. -1 ammo used for fortifications.");
  };

  const scoutArea = () => {
    // Check if player has already performed an action this day
    if (gameState.hasPerformedAction) {
      addLog("You've already performed an action today. End the day before performing another action.");
      return;
    }
    
    // Chance to find something based on scout range
    const findChance = 0.3 + (gameState.scoutRange * 0.1);
    
    setGameState(prev => ({
      ...prev,
      hasPerformedAction: true
    }));
    
    if (Math.random() < findChance) {
      const ammoFound = Math.floor(Math.random() * (gameState.scoutRange + 2));
      const medicineFound = Math.floor(Math.random() * (gameState.scoutRange + 1));
      
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          ammo: prev.resources.ammo + ammoFound,
          medicine: prev.resources.medicine + medicineFound
        }
      }));
      
      addLog(`Scout mission successful! Found: +${ammoFound} ammo, +${medicineFound} medicine.`);
      
      // Add chance to find loot based on scout range
      if (Math.random() < 0.3 + (gameState.scoutRange * 0.05)) {
        findLoot('scouting');
      }
      
      // Small chance to improve scout range
      if (Math.random() < 0.2) {
        setGameState(prev => ({
          ...prev,
          scoutRange: prev.scoutRange + 1
        }));
        addLog("Your scouts found a vantage point! Scout range improved.");
      }
    } else {
      addLog("Your scouts returned with nothing of value.");
      
      // Small chance of zombie encounter during scouting
      if (Math.random() < 0.15) {
        // Lose a survivor if any are available
        if (gameState.survivors > 0) {
          setGameState(prev => ({
            ...prev,
            survivors: prev.survivors - 1
          }));
          addLog("One of your scouts encountered zombies and didn't make it back.");
        } else {
          addLog("You narrowly escaped zombies during your scouting mission.");
        }
      }
    }
  };

  // Handle end day button click - show night event dialog first
  const handleEndDay = () => {
    if (gameState.phase === 'solo') {
      // In solo phase, just end the day directly
      endDay();
    } else {
      // In camp phase, show night event dialog
      setShowNightEventDialog(true);
    }
  };

  // Night actions
  const handleNightAction = (action: 'sleep' | 'guard' | 'scavenge') => {
    if (action === 'sleep') {
      addLog("You and your survivors rested for the night. Everyone regained some strength.");
      // Small chance of healing if medicine is available
      if (gameState.resources.medicine > 0 && Math.random() < 0.5) {
        setGameState(prev => ({
          ...prev,
          resources: {
            ...prev.resources,
            medicine: prev.resources.medicine - 1
          }
        }));
        addLog("Used 1 medicine to treat minor injuries.");
      }
    } else if (action === 'guard') {
      addLog("You set up guard shifts for the night. Everyone is on high alert.");
      // Reduce chance of zombie attack for the next day
      setGameState(prev => ({
        ...prev,
        campDefense: prev.campDefense + 0.5 // Temporary defense boost
      }));
      
      // Small chance of finding zombie scouts
      if (Math.random() < 0.3) {
        addLog("Your guards spotted and eliminated some zombie scouts. This might prevent a larger attack.");
        setGameState(prev => ({
          ...prev,
          zombies: Math.max(0, prev.zombies - Math.floor(Math.random() * 3) - 1),
          resources: {
            ...prev.resources,
            ammo: Math.max(0, prev.resources.ammo - 1)
          }
        }));
      }
    } else if (action === 'scavenge') {
      addLog("You sent a few people out to scavenge during the night. It's dangerous but can be rewarding.");
      
      // Higher risk, higher reward
      if (Math.random() < 0.6) {
        // Success - find resources
        const foodFound = Math.floor(Math.random() * 3) + 1;
        const ammoFound = Math.floor(Math.random() * 2);
        
        setGameState(prev => ({
          ...prev,
          resources: {
            ...prev.resources,
            food: prev.resources.food + foodFound,
            ammo: prev.resources.ammo + ammoFound
          }
        }));
        
        addLog(`Night scavenging was successful! Found +${foodFound} food and +${ammoFound} ammo.`);
      } else {
        // Failure - might lose a survivor
        if (gameState.survivors > 0 && Math.random() < 0.4) {
          setGameState(prev => ({
            ...prev,
            survivors: prev.survivors - 1
          }));
          addLog("The scavenging party encountered trouble. One person didn't make it back.");
          
          // Check if this was the last survivor
          setTimeout(() => checkGameOver(), 0);
        } else {
          addLog("The scavenging party returned empty-handed. At least everyone made it back safely.");
        }
      }
    }
    
    setShowNightEventDialog(false);
    endDay(); // Now end the day after handling the night action
  };

  // Handle cell click for camp mode
  const handleCampCellClick = (index: number) => {
    // Don't allow interaction with the camp itself
    if (index === gameState.campPosition) {
      addLog("This is your camp. Try clicking on other tiles to perform actions.");
      return;
    }
    
    // Check if player has already performed an action this day
    if (gameState.hasPerformedAction) {
      addLog("You've already performed an action today. End the day or wait until tomorrow.");
      return;
    }
    
    const cell = gameState.cityGrid[index];
    
    // Calculate distance from camp
    const campRow = Math.floor((gameState.campPosition || 0) / gridSize);
    const campCol = (gameState.campPosition || 0) % gridSize;
    const cellRow = Math.floor(index / gridSize);
    const cellCol = index % gridSize;
    const distance = Math.abs(campRow - cellRow) + Math.abs(campCol - cellCol);
    
    // Check if the cell is within range (based on scout range)
    if (distance > gameState.scoutRange) {
      addLog(`That location is too far away. Your scout range is ${gameState.scoutRange} tiles.`);
      return;
    }
    
    // Handle different cell types
    switch (cell.type) {
      case 'empty':
        exploreArea(index);
        break;
      case 'building':
        scavengeBuilding(index);
        break;
      case 'survivor':
        makeContact(index);
        break;
      case 'zombie':
      case 'zombieGroup':
      case 'zombieHorde':
        sendHuntingParty(index);
        break;
      case 'resource':
        gatherResourcesAt(index);
        break;
      default:
        addLog("There's nothing interesting to do at that location.");
        return;
    }
    
    // Mark that player has performed their daily action
    setGameState(prev => ({
      ...prev,
      hasPerformedAction: true
    }));
  };

  // Explore an empty area
  const exploreArea = (index: number) => {
    addLog("You sent a team to explore the area.");
    
    // Random chance to find something interesting
    const findChance = Math.random();
    
    if (findChance < 0.2) {
      // Find a small amount of resources
      const foodFound = Math.floor(Math.random() * 2) + 1;
      const waterFound = Math.floor(Math.random() * 2) + 1;
      
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          food: prev.resources.food + foodFound,
          water: prev.resources.water + waterFound
        }
      }));
      
      addLog(`Exploration successful! Found +${foodFound} food and +${waterFound} water.`);
      
      // Add chance to find loot
      if (Math.random() < 0.3) {
        findLoot('exploration');
      }
    } else if (findChance < 0.3) {
      // Discover a new survivor
      const newGrid = [...gameState.cityGrid];
      newGrid[index] = {
        type: 'survivor',
        hasPlayer: false
      };
      
      setGameState(prev => ({
        ...prev,
        cityGrid: newGrid
      }));
      
      addLog("Your exploration team spotted a survivor in the distance!");
    } else if (findChance < 0.4) {
      // Find a hidden resource cache
      const newGrid = [...gameState.cityGrid];
      newGrid[index] = {
        type: 'resource',
        hasPlayer: false
      };
      
      setGameState(prev => ({
        ...prev,
        cityGrid: newGrid
      }));
      
      addLog("Your team discovered a hidden resource cache!");
    } else if (findChance < 0.45) {
      // Small chance to find rare loot
      const loot = findLoot('exploration_rare');
      addLog("Your team found something unusual while exploring!");
    } else {
      addLog("The team explored the area but found nothing of value.");
    }
  };

  // Scavenge a building
  const scavengeBuilding = (index: number) => {
    addLog("You sent a team to scavenge the building.");
    
    // Higher chance of resources but also danger
    const findChance = Math.random();
    
    if (findChance < 0.6) {
      // Find a good amount of resources
      const foodFound = Math.floor(Math.random() * 3) + 1;
      const medicineFound = Math.floor(Math.random() * 2);
      const ammoFound = Math.floor(Math.random() * 3);
      
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          food: prev.resources.food + foodFound,
          medicine: prev.resources.medicine + medicineFound,
          ammo: prev.resources.ammo + ammoFound
        }
      }));
      
      addLog(`Scavenging successful! Found +${foodFound} food, +${medicineFound} medicine, and +${ammoFound} ammo.`);
      
      // Add chance to find loot
      if (Math.random() < 0.5) {
        findLoot('building');
      }
    } else if (findChance < 0.8) {
      // Building is empty
      addLog("The building was already picked clean. Nothing valuable remained.");
    } else {
      // Danger - zombies in the building
      const newGrid = [...gameState.cityGrid];
      newGrid[index] = {
        type: 'zombie',
        hasPlayer: false
      };
      
      // Possible survivor casualty
      if (gameState.survivors > 0 && Math.random() < 0.3) {
        setGameState(prev => ({
          ...prev,
          survivors: prev.survivors - 1,
          zombies: prev.zombies + 1,
          cityGrid: newGrid
        }));
        
        addLog("The scavenging team was ambushed by a zombie! One survivor didn't make it back.");
      } else {
        setGameState(prev => ({
          ...prev,
          zombies: prev.zombies + 1,
          cityGrid: newGrid
        }));
        
        addLog("The team encountered a zombie in the building and had to retreat!");
      }
    }
  };

  // Make contact with survivor
  const makeContact = (index: number) => {
    addLog("You send a team to make contact with the survivor.");
    
    // Generate a random survivor if we don't have stored data
    const survivorId = `survivor-${index}`;
    const names = ["Alex", "Morgan", "Casey", "Jordan", "Taylor", "Riley", "Quinn", "Avery", "Blake", "Cameron"];
    const factions = [null, "Traders", "Medics", "Raiders", "Military Remnant", "Scientists"];
    const skills = ["Medicine", "Hunting", "Defense", "Engineering", "Crafting", "Leadership", "Scavenging"];
    
    // Generate random survivor data
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomFaction = factions[Math.floor(Math.random() * factions.length)];
    const randomSkills = [skills[Math.floor(Math.random() * skills.length)]];
    
    // Determine disposition based on faction reputation
    let disposition: 'friendly' | 'neutral' | 'hostile' = 'neutral';
    
    if (randomFaction) {
      const factionRep = gameState.factionReputations[randomFaction] || 0;
      
      // Calculate base probability for each disposition
      const friendlyChance = 0.2 + (factionRep > 0 ? factionRep / 200 : 0); // +50 rep = +25% chance
      const hostileChance = 0.2 + (factionRep < 0 ? Math.abs(factionRep) / 200 : 0); // -50 rep = +25% chance
      
      // Roll for disposition with reputation influence
      const roll = Math.random();
      
      if (roll < friendlyChance) {
        disposition = 'friendly';
      } else if (roll >= (1 - hostileChance)) {
        disposition = 'hostile';
      } else {
        disposition = 'neutral';
      }
    } else {
      // No faction, completely random disposition
      const dispositions = ["friendly", "neutral", "hostile"] as const;
      disposition = dispositions[Math.floor(Math.random() * dispositions.length)];
    }
    
    // Generate description based on faction and disposition
    let description = `${randomName} is a survivor with ${randomSkills[0]} skills.`;
    if (randomFaction) {
      description += ` They are part of the ${randomFaction} faction.`;
      
      // Add reputation information if they have a faction
      const reputation = gameState.factionReputations[randomFaction] || 0;
      if (reputation >= 50) {
        description += ` Your group has an excellent reputation with the ${randomFaction}.`;
      } else if (reputation >= 20) {
        description += ` Your group is well-regarded by the ${randomFaction}.`;
      } else if (reputation <= -50) {
        description += ` The ${randomFaction} are extremely wary of your group.`;
      } else if (reputation <= -20) {
        description += ` Your group has a poor reputation with the ${randomFaction}.`;
      }
    }
    
    switch (disposition) {
      case "friendly":
        description += " They seem willing to help and are open to joining your group.";
        break;
      case "neutral":
        description += " They are cautious but not immediately hostile.";
        break;
      case "hostile":
        description += " They appear distrustful and potentially dangerous.";
        break;
    }
    
    // Create survivor data
    const survivorData: SurvivorData = {
      id: survivorId,
      name: randomName,
      description,
      faction: randomFaction,
      disposition: disposition,
      skills: randomSkills,
      isDiscovered: true
    };
    
    // Store survivor data and show contact dialog
    setCurrentSurvivor(survivorData);
    setSelectedCellIndex(index);
    setShowContactDialog(true);
  };

  // Handle survivor contact resolution
  const handleSurvivorContact = (action: 'recruit' | 'trade' | 'leave') => {
    if (!currentSurvivor || selectedCellIndex === null) {
      setShowContactDialog(false);
      return;
    }
    
    // Get faction for reputation changes
    const faction = currentSurvivor.faction;
    
    // Handle different actions
    if (action === 'recruit') {
      // Only possible with friendly survivors
      if (currentSurvivor.disposition === 'friendly') {
        const newGrid = [...gameState.cityGrid];
        newGrid[selectedCellIndex] = {
          type: 'empty',
          hasPlayer: false
        };
        
        setGameState(prev => ({
          ...prev,
          survivors: prev.survivors + 1,
          cityGrid: newGrid
        }));
        
        addLog(`${currentSurvivor.name} was friendly and decided to join your camp! +1 survivor with ${currentSurvivor.skills[0]} skills.`);
        
        // Chance to get loot from the new survivor
        if (Math.random() < 0.6) {
          findLoot('survivor_friendly');
        }
        
        // Successful recruitment improves faction reputation significantly
        if (faction) {
          updateFactionReputation(faction, 15);
          addLog(`Your reputation with the ${faction} has improved due to recruiting one of their members.`);
        }
      } else if (currentSurvivor.disposition === 'neutral') {
        addLog(`${currentSurvivor.name} wasn't interested in joining your camp at this time.`);
        
        // No reputation change for trying
      } else {
        // Hostile - chance of injury
        addLog(`${currentSurvivor.name} reacted with hostility to your recruitment offer!`);
        
        if (Math.random() < 0.3 && gameState.survivors > 0) {
          setGameState(prev => ({
            ...prev,
            survivors: prev.survivors - 1
          }));
          
          addLog("One of your people was injured during the encounter.");
        }
        
        // Attempting to recruit a hostile survivor worsens reputation
        if (faction) {
          updateFactionReputation(faction, -10);
          addLog(`Your reputation with the ${faction} has decreased due to the hostile encounter.`);
        }
      }
    } else if (action === 'trade') {
      // Trading is most successful with neutral survivors
      if (currentSurvivor.disposition !== 'hostile') {
        const foodReceived = Math.floor(Math.random() * 3) + 1;
        const medicineGiven = 1;
        
        if (gameState.resources.medicine >= medicineGiven) {
          setGameState(prev => ({
            ...prev,
            resources: {
              ...prev.resources,
              food: prev.resources.food + foodReceived,
              medicine: prev.resources.medicine - medicineGiven
            }
          }));
          
          addLog(`${currentSurvivor.name} offered to trade. You gave ${medicineGiven} medicine and received ${foodReceived} food.`);
          
          // Chance to get loot from trading
          if (Math.random() < 0.4) {
            findLoot('survivor_trade');
          }
          
          // Successful trade slightly improves faction reputation
          if (faction) {
            updateFactionReputation(faction, 5);
            addLog(`Your reputation with the ${faction} has slightly improved due to fair trading.`);
          }
        } else {
          addLog(`${currentSurvivor.name} wanted to trade for medicine, but you didn't have enough.`);
          
          // No reputation change if you can't fulfill trade
        }
      } else {
        // Hostile - refused trade
        addLog(`${currentSurvivor.name} refused to trade and seemed suspicious of your intentions.`);
        
        // Very slight negative impact for being refused trade
        if (faction) {
          updateFactionReputation(faction, -2);
        }
      }
    } else if (action === 'leave') {
      // Just leave them be
      addLog(`You decided to leave ${currentSurvivor.name} alone for now.`);
      
      // Very slight positive impact for respecting boundaries
      if (faction && currentSurvivor.disposition === 'hostile') {
        updateFactionReputation(faction, 2);
        addLog(`The ${faction} might appreciate that you didn't press the issue.`);
      }
    }
    
    setShowContactDialog(false);
    setCurrentSurvivor(null);
  };

  // Update faction reputation
  const updateFactionReputation = (faction: string, change: number) => {
    // Only proceed if it's a valid faction
    if (!gameState.factionReputations.hasOwnProperty(faction)) return;
    
    setGameState(prev => {
      // Calculate new reputation value (clamped between -100 and 100)
      const currentRep = prev.factionReputations[faction] || 0;
      const newRep = Math.max(-100, Math.min(100, currentRep + change));
      
      return {
        ...prev,
        factionReputations: {
          ...prev.factionReputations,
          [faction]: newRep
        }
      };
    });
  };

  // Send hunting party against zombies
  const sendHuntingParty = (index: number) => {
    const cell = gameState.cityGrid[index];
    let zombieCount = 1;
    let successChance = 0.7;
    let description = "lone zombie";
    
    // Different difficulty based on zombie type
    if (cell.type === 'zombieGroup') {
      zombieCount = 3;
      successChance = 0.5;
      description = "group of zombies";
    } else if (cell.type === 'zombieHorde') {
      zombieCount = 10;
      successChance = 0.2;
      description = "zombie horde";
    }
    
    addLog(`You sent a hunting party to eliminate the ${description}.`);
    
    // Adjust success chance based on number of survivors and ammo
    const survivorBonus = Math.min(0.3, gameState.survivors * 0.05);
    const ammoRequired = Math.ceil(zombieCount / 2);
    
    if (gameState.resources.ammo < ammoRequired) {
      successChance -= 0.3;
      addLog("Your team doesn't have enough ammo for this mission. Success chances are reduced.");
    } else {
      // Use ammo
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          ammo: prev.resources.ammo - ammoRequired
        }
      }));
      
      addLog(`Used ${ammoRequired} ammo for the mission.`);
    }
    
    // Final chance calculation
    successChance += survivorBonus;
    
    // Determine outcome
    if (Math.random() < successChance) {
      // Success - clear zombies
      const newGrid = [...gameState.cityGrid];
      newGrid[index] = {
        type: 'empty',
        hasPlayer: false
      };
      
      setGameState(prev => ({
        ...prev,
        zombies: Math.max(0, prev.zombies - zombieCount),
        cityGrid: newGrid
      }));
      
      addLog(`The hunting party successfully eliminated the ${description}!`);
    } else {
      // Failure - casualties possible
      if (gameState.survivors > 0) {
        const casualties = Math.min(gameState.survivors, Math.ceil(Math.random() * 2));
        
        setGameState(prev => ({
          ...prev,
          survivors: prev.survivors - casualties
        }));
        
        addLog(`The mission failed. The team retreated with ${casualties} ${casualties === 1 ? 'casualty' : 'casualties'}.`);
        
        // Check if this mission caused game over
        setTimeout(() => checkGameOver(), 0);
      } else {
        addLog("The mission failed. You barely escaped with your life.");
      }
    }
  };

  // Gather resources from a cache
  const gatherResourcesAt = (index: number) => {
    addLog("You sent a team to gather resources from the cache.");
    
    // Generate random resources
    const foodFound = Math.floor(Math.random() * 4) + 2;
    const waterFound = Math.floor(Math.random() * 4) + 2;
    const medicineFound = Math.floor(Math.random() * 2);
    const ammoFound = Math.floor(Math.random() * 3);
    
    // Clear the resource spot
    const newGrid = [...gameState.cityGrid];
    newGrid[index] = {
      type: 'empty',
      hasPlayer: false
    };
    
    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        food: prev.resources.food + foodFound,
        water: prev.resources.water + waterFound,
        medicine: prev.resources.medicine + medicineFound,
        ammo: prev.resources.ammo + ammoFound
      },
      cityGrid: newGrid
    }));
    
    addLog(`Resource gathering successful! Found +${foodFound} food, +${waterFound} water, +${medicineFound} medicine, and +${ammoFound} ammo.`);
    
    // Add chance to find loot
    if (Math.random() < 0.7) {
      findLoot('resource');
    }
  };

  // Rarity colors for loot
  const getLootRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return '#ffffff';
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      case 'unique': return '#e6cc80';
      default: return '#ffffff';
    }
  };

  // Toggle inventory dialog
  const toggleInventory = () => {
    setShowInventoryDialog(!showInventoryDialog);
  };

  // Handle loot item click in inventory
  const handleLootItemClick = (item: LootItem) => {
    setSelectedLootItem(item);
  };

  // Equip or unequip an item
  const toggleEquipItem = (item: LootItem) => {
    if (!item) return;
    
    // Create copy of loot array
    const newLoot = [...gameState.loot];
    
    // Find the item
    const itemIndex = newLoot.findIndex(i => i.id === item.id);
    if (itemIndex === -1) return;
    
    // Toggle equipped status
    newLoot[itemIndex] = {
      ...newLoot[itemIndex],
      equipped: !newLoot[itemIndex].equipped
    };
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      loot: newLoot
    }));
    
    // Update selected item
    setSelectedLootItem(newLoot[itemIndex]);
    
    // Log the action
    if (newLoot[itemIndex].equipped) {
      addLog(`You equipped ${item.name}.`);
    } else {
      addLog(`You unequipped ${item.name}.`);
    }
  };

  // Find loot when defeating zombies, exploring, etc.
  const findLoot = (source: string) => {
    // Simulating loot generation since we don't have the backend
    // In a real implementation, we would call the backend API
    
    // Define loot category possibilities based on source
    let possibleCategories: string[] = [];
    
    if (source === 'zombie' || source === 'zombieGroup' || source === 'zombieHorde') {
      possibleCategories = ['weapon', 'medical', 'armor'];
    } else if (source === 'resource') {
      possibleCategories = ['food', 'medical', 'tools'];
    } else if (source === 'building') {
      possibleCategories = ['weapon', 'food', 'medical', 'tools', 'armor'];
    } else if (source === 'survivor') {
      possibleCategories = ['food', 'medical', 'tools', 'weapon'];
    } else {
      possibleCategories = ['weapon', 'food', 'medical', 'tools', 'armor', 'rare'];
    }
    
    // Rarity chance based on source
    let rarityChance = Math.random();
    let rarity = 'common';
    
    // Adjust rarity chance based on source
    if (source === 'zombieHorde') rarityChance += 0.2;
    else if (source === 'zombieGroup') rarityChance += 0.1;
    
    // Determine rarity
    if (rarityChance > 0.99) rarity = 'legendary';
    else if (rarityChance > 0.95) rarity = 'epic';
    else if (rarityChance > 0.85) rarity = 'rare';
    else if (rarityChance > 0.60) rarity = 'uncommon';
    
    // Sample loot items for each category (in a real app we would have a bigger database)
    const lootOptions = {
      weapon: [
        { id: 101, name: "Rusty Machete", emoji: "🔪", effects: [{ name: "damage", value: 10 }] },
        { id: 102, name: "Modified Baseball Bat", emoji: "🏏", effects: [{ name: "stun", value: 10 }] },
        { id: 103, name: "Military-grade Rifle", emoji: "🔫", effects: [{ name: "range", value: 20 }] }
      ],
      armor: [
        { id: 201, name: "Reinforced Jacket", emoji: "🧥", effects: [{ name: "protection", value: 15 }] },
        { id: 202, name: "Tactical Vest", emoji: "🦺", effects: [{ name: "durability", value: 20 }] },
        { id: 203, name: "Military Helmet", emoji: "🪖", effects: [{ name: "protection", value: 25 }] }
      ],
      medical: [
        { id: 301, name: "First Aid Kit", emoji: "🩹", effects: [{ name: "healing", value: 15 }] },
        { id: 302, name: "Antibiotics", emoji: "💊", effects: [{ name: "infection_resistance", value: 20 }] },
        { id: 303, name: "Painkillers", emoji: "💉", effects: [{ name: "pain_reduction", value: 25 }] }
      ],
      food: [
        { id: 401, name: "Canned Soup", emoji: "🥫", effects: [{ name: "nutrition", value: 15 }] },
        { id: 402, name: "Dried Meat", emoji: "🥩", effects: [{ name: "energy", value: 20 }] },
        { id: 403, name: "MRE Pack", emoji: "🍱", effects: [{ name: "nutrition", value: 25 }] }
      ],
      tools: [
        { id: 501, name: "Flashlight", emoji: "🔦", effects: [{ name: "vision", value: 15 }] },
        { id: 502, name: "Compass", emoji: "🧭", effects: [{ name: "accuracy", value: 20 }] },
        { id: 503, name: "Toolkit", emoji: "🧰", effects: [{ name: "repair_bonus", value: 25 }] }
      ],
      rare: [
        { id: 601, name: "Mysterious Artifact", emoji: "🔮", effects: [{ name: "zombie_repellent", value: 15 }] },
        { id: 602, name: "Ancient Relic", emoji: "📿", effects: [{ name: "faction_rep", value: 20 }] },
        { id: 603, name: "Hidden Document", emoji: "📜", effects: [{ name: "xp_gain", value: 25 }] }
      ]
    };
    
    // Select a random category from possible categories
    const category = possibleCategories[Math.floor(Math.random() * possibleCategories.length)];
    
    // Select a random item from that category
    const baseItem = lootOptions[category as keyof typeof lootOptions][Math.floor(Math.random() * lootOptions[category as keyof typeof lootOptions].length)];
    
    // Create a new loot item with unique ID
    const newLootId = gameState.loot.length > 0 
      ? Math.max(...gameState.loot.map(item => item.id)) + 1 
      : 1000;
    
    // Create description based on category
    let description = '';
    switch(category) {
      case 'weapon': 
        description = `A weapon that could save your life in the right situation.`;
        break;
      case 'armor':
        description = `Protective gear that helps you survive in the wasteland.`;
        break;
      case 'medical':
        description = `Medical supplies to treat wounds and illness.`;
        break;
      case 'food':
        description = `Food to keep you going through tough times.`;
        break;
      case 'tools':
        description = `Tools to help with survival tasks.`;
        break;
      case 'rare':
        description = `A mysterious item with unusual properties.`;
        break;
    }
    
    // Add effect description
    if (baseItem.effects.length > 0) {
      const effectDesc = baseItem.effects.map(effect => {
        let readable = effect.name.replace(/_/g, ' ');
        return `+${effect.value}% ${readable}`;
      }).join(', ');
      
      description += ` Effects: ${effectDesc}.`;
    }
    
    // Create the new loot item
    const newLoot: LootItem = {
      id: newLootId,
      name: baseItem.name,
      description: description,
      emoji: baseItem.emoji,
      category: category,
      rarity: rarity,
      effects: baseItem.effects,
      source: source,
      date_found: new Date().toISOString().split('T')[0],
      equipped: false
    };
    
    // Add to game state
    setGameState(prev => ({
      ...prev,
      loot: [...prev.loot, newLoot]
    }));
    
    // Log the find
    addLog(`You found ${newLoot.emoji} ${newLoot.name} (${rarity.charAt(0).toUpperCase() + rarity.slice(1)})!`);
    
    return newLoot;
  };

  // Handle camp attack event
  const handleCampAttack = (attackType: string) => {
    // Create attack event based on type
    const attackTypes = {
      'small_breach': {
        name: 'Small Breach',
        description: 'A few zombies have found a weak point in your defenses and broken through.',
        zombieCount: Math.floor(Math.random() * 5) + 1,
        severity: 'low'
      },
      'coordinated_attack': {
        name: 'Coordinated Attack',
        description: 'A sizeable group of zombies is attacking multiple points of your camp simultaneously.',
        zombieCount: Math.floor(Math.random() * 8) + 4,
        severity: 'medium'
      },
      'horde_siege': {
        name: 'Horde Siege',
        description: 'A massive horde has surrounded your camp and is breaking in from all sides.',
        zombieCount: Math.floor(Math.random() * 20) + 10,
        severity: 'high'
      },
      'stealth_infiltration': {
        name: 'Stealth Infiltration',
        description: 'Zombies have quietly broken into your camp during the night.',
        zombieCount: Math.floor(Math.random() * 6) + 2,
        severity: 'medium'
      },
      'desperate_scavengers': {
        name: 'Desperate Scavengers',
        description: 'Human scavengers tried to raid your camp but attracted zombies in the process.',
        zombieCount: Math.floor(Math.random() * 7) + 3,
        severity: 'medium'
      }
    };
    
    // Get attack details
    const attack = attackTypes[attackType as keyof typeof attackTypes] || attackTypes.small_breach;
    setCurrentAttack(attack);
    
    // Generate defense options based on game state
    const defenseOptions: any[] = [];
    
    // Fight Back option - requires ammo and survivors
    if (gameState.resources.ammo >= 3 && gameState.survivors >= 2) {
      defenseOptions.push({
        id: 'fight_back',
        name: 'Fight Back',
        description: 'Engage the zombies with weapons to protect your camp.',
        successChance: Math.min(0.95, 0.7 + (gameState.campDefense * 0.05) + (Math.min(5, gameState.survivors) * 0.1)),
        consequences: {
          ammoUsed: Math.floor(Math.random() * 5) + 3,
          casualties: {
            success: Math.floor(Math.random() * 2),
            failure: Math.floor(Math.random() * 3) + 1
          }
        }
      });
    }
    
    // Barricade option - always available
    defenseOptions.push({
      id: 'barricade',
      name: 'Barricade',
      description: 'Reinforce weak points and hold out against the attack.',
      successChance: Math.min(0.95, 0.5 + (gameState.campDefense * 0.1)),
      consequences: {
        casualties: {
          success: 0,
          failure: Math.floor(Math.random() * 2) + 1
        },
        defenseImprovement: 1
      }
    });
    
    // Evacuate option - harder in buildings
    const evacuateBonus = gameState.campType === 'open' ? 0.15 : -0.2;
    defenseOptions.push({
      id: 'evacuate',
      name: 'Evacuate',
      description: 'Abandon camp temporarily and escape with what you can carry.',
      successChance: Math.min(0.95, Math.max(0.1, 0.8 + evacuateBonus - (gameState.survivors * 0.05))),
      consequences: {
        casualties: {
          success: 0,
          failure: Math.floor(Math.random() * 4) + 1
        },
        resourceLoss: 2.0 // Multiplier for resource loss
      }
    });
    
    setAttackDefenseOptions(defenseOptions);
    setShowCampAttackDialog(true);
  };
  
  // Handle defense choice
  const handleDefenseChoice = (defenseOption: any) => {
    if (!currentAttack) return;
    
    // Roll for success
    const success = Math.random() < defenseOption.successChance;
    
    // Calculate casualties
    let casualties = 0;
    if (success) {
      casualties = defenseOption.consequences.casualties.success;
    } else {
      casualties = defenseOption.consequences.casualties.failure;
    }
    casualties = Math.min(casualties, gameState.survivors);
    
    // Calculate zombie kills
    let zombieKills = 0;
    if (success) {
      // More kills if fighting back
      if (defenseOption.id === 'fight_back') {
        zombieKills = Math.floor(currentAttack.zombieCount * 0.7);
      } else {
        zombieKills = Math.floor(currentAttack.zombieCount * 0.3);
      }
    } else {
      // Some kills even on failure
      zombieKills = Math.floor(currentAttack.zombieCount * 0.2);
    }
    
    // Calculate resource loss
    const resourceLoss: {[key in keyof typeof gameState.resources]?: number} = {};
    const lossMultiplier = defenseOption.consequences.resourceLoss || 1.0;
    
    if (currentAttack.severity === 'low') {
      resourceLoss.food = Math.floor(Math.random() * 3) * lossMultiplier;
      resourceLoss.medicine = Math.floor(Math.random() * 2) * lossMultiplier;
    } else if (currentAttack.severity === 'medium') {
      resourceLoss.food = Math.floor(Math.random() * 3 + 1) * lossMultiplier;
      resourceLoss.medicine = Math.floor(Math.random() * 3) * lossMultiplier;
      resourceLoss.water = Math.floor(Math.random() * 3) * lossMultiplier;
    } else {
      resourceLoss.food = Math.floor(Math.random() * 4 + 2) * lossMultiplier;
      resourceLoss.medicine = Math.floor(Math.random() * 3 + 1) * lossMultiplier;
      resourceLoss.water = Math.floor(Math.random() * 4 + 1) * lossMultiplier;
    }
    
    // Ammo used for fighting back
    let ammoUsed = 0;
    if (defenseOption.id === 'fight_back') {
      ammoUsed = defenseOption.consequences.ammoUsed;
      ammoUsed = Math.min(ammoUsed, gameState.resources.ammo);
    }
    
    // Defense damage or improvement
    let defenseDamage = 0;
    let defenseImprovement = 0;
    
    if (!success) {
      // Defense damage on failure
      if (currentAttack.severity === 'low') {
        defenseDamage = Math.floor(Math.random() * 2);
      } else if (currentAttack.severity === 'medium') {
        defenseDamage = Math.floor(Math.random() * 2) + 1;
      } else {
        defenseDamage = Math.floor(Math.random() * 3) + 2;
      }
    }
    
    if (success && defenseOption.id === 'barricade') {
      defenseImprovement = defenseOption.consequences.defenseImprovement || 0;
    }
    
    // Apply all effects to game state
    const newGameState = {...gameState};
    
    // Update survivors
    newGameState.survivors = Math.max(0, newGameState.survivors - casualties);
    
    // Update zombies
    newGameState.zombies = Math.max(0, newGameState.zombies - zombieKills);
    
    // Update camp defense
    newGameState.campDefense = Math.max(0, newGameState.campDefense - defenseDamage + defenseImprovement);
    
    // Update resources
    if (ammoUsed > 0) {
      newGameState.resources.ammo = Math.max(0, newGameState.resources.ammo - ammoUsed);
    }
    
    Object.keys(resourceLoss).forEach(resource => {
      const resourceKey = resource as keyof typeof gameState.resources;
      if (resourceLoss[resourceKey] && resourceLoss[resourceKey]! > 0 && newGameState.resources[resourceKey] !== undefined) {
        newGameState.resources[resourceKey] = Math.max(
          0, 
          newGameState.resources[resourceKey] - resourceLoss[resourceKey]!
        );
      }
    });
    
    // Generate outcome message
    let outcomeMessage = success 
      ? `You successfully defended against the ${currentAttack.name.toLowerCase()}.` 
      : `Your defense against the ${currentAttack.name.toLowerCase()} failed.`;
      
    if (casualties > 0) {
      outcomeMessage += ` You lost ${casualties} ${casualties === 1 ? 'survivor' : 'survivors'}.`;
    }
    
    if (zombieKills > 0) {
      outcomeMessage += ` You killed ${zombieKills} zombies.`;
    }
    
    if (defenseDamage > 0) {
      outcomeMessage += ` Your camp defenses were damaged by ${defenseDamage} points.`;
    }
    
    if (defenseImprovement > 0) {
      outcomeMessage += ` You improved your camp defenses by ${defenseImprovement} points.`;
    }
    
    if (ammoUsed > 0) {
      outcomeMessage += ` Used ${ammoUsed} ammunition.`;
    }
    
    const resourceMessages: string[] = [];
    Object.keys(resourceLoss).forEach(resource => {
      const resourceKey = resource as keyof typeof gameState.resources;
      if (resourceLoss[resourceKey] && resourceLoss[resourceKey]! > 0) {
        resourceMessages.push(`${resourceLoss[resourceKey]} ${resource}`);
      }
    });
    
    if (resourceMessages.length > 0) {
      outcomeMessage += ` Lost ${resourceMessages.join(', ')}.`;
    }
    
    // Check for loot opportunity
    if (success && Math.random() < (currentAttack.severity === 'high' ? 0.7 : currentAttack.severity === 'medium' ? 0.5 : 0.3)) {
      const loot = findLoot('zombie_' + currentAttack.name.toLowerCase().replace(' ', '_'));
      outcomeMessage += ` You found ${loot.emoji} ${loot.name} while defending!`;
    }
    
    addLog(outcomeMessage);
    setGameState(newGameState);
    setShowCampAttackDialog(false);
    
    // Check if this defense resulted in game over
    setTimeout(() => {
      if (newGameState.survivors <= 0) {
        checkGameOver();
      }
    }, 0);
  };

  // Toggle party dialog
  const togglePartyView = () => {
    setShowPartyDialog(!showPartyDialog);
  };

  // Generate sample survivors for party view when we don't have individual data
  const generateSurvivorProfiles = () => {
    if (gameState.survivors <= 0) return [];
    
    const names = ["Alex", "Morgan", "Casey", "Jordan", "Taylor", "Riley", "Quinn", "Avery", "Blake", "Cameron"];
    const skills = ["Medicine", "Hunting", "Defense", "Engineering", "Crafting", "Leadership", "Scavenging"];
    const traits = ["Brave", "Cautious", "Optimistic", "Resourceful", "Loyal", "Paranoid", "Quick-witted", "Strong", "Stealthy"];
    
    return Array.from({ length: gameState.survivors }).map((_, index) => {
      // Generate a consistent survivor based on the index to avoid randomizing on every render
      const nameIndex = index % names.length;
      const skillIndex1 = (index * 3) % skills.length;
      const skillIndex2 = (index * 7) % skills.length;
      const traitIndex1 = (index * 5) % traits.length;
      const traitIndex2 = (index * 11) % traits.length;
      
      return {
        id: `survivor-${index}`,
        name: names[nameIndex],
        skills: [skills[skillIndex1], skillIndex1 !== skillIndex2 ? skills[skillIndex2] : skills[(skillIndex2 + 1) % skills.length]],
        traits: [traits[traitIndex1], traitIndex1 !== traitIndex2 ? traits[traitIndex2] : traits[(traitIndex2 + 1) % traits.length]],
        joinedDay: Math.max(1, gameState.day - (index % gameState.day)) // Make sure they joined on a valid day
      };
    });
  };

  // Return appropriate content based on game phase
  if (!mounted) {
    return null;
  } else if (gameState.phase === 'dead') {
    // Game Over Screen
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url("/images/death-bg.jpg")',
          backgroundSize: 'cover',
          color: '#ff4d4d',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          p: 3
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <Typography variant="h2" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            You Died
          </Typography>
          
          <Typography variant="h5" sx={{ mb: 4, color: '#aaa' }}>
            You survived for {gameState.day} days
          </Typography>
          
          <Box sx={{ my: 4, borderTop: '1px solid rgba(255,77,77,0.3)', borderBottom: '1px solid rgba(255,77,77,0.3)', py: 4 }}>
            <Typography variant="body1" sx={{ mb: 3, color: '#ddd', maxWidth: '600px' }}>
              Your journey has come to an end in this zombie-infested wasteland. The dead have claimed another victim.
            </Typography>
            
            <Typography variant="body1" sx={{ color: '#ddd', maxWidth: '600px' }}>
              But your story will be remembered by those who find your remains... 
              {gameState.survivors > 0 && ` and perhaps the ${gameState.survivors} survivors who escaped might continue your legacy.`}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2, mb: 5 }}>
            <Typography variant="h6" sx={{ color: '#aaa', mb: 2 }}>
              Final Stats
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                  Days Survived
                </Typography>
                <Typography variant="h4" sx={{ color: '#fff' }}>
                  {gameState.day}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                  Survivors
                </Typography>
                <Typography variant="h4" sx={{ color: '#fff' }}>
                  {gameState.survivors}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                  Zombies Killed
                </Typography>
                <Typography variant="h4" sx={{ color: '#fff' }}>
                  {gameState.zombies > 0 ? 20 - gameState.zombies : 20}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            onClick={() => router.push('/')}
            sx={{ 
              px: 4, 
              py: 1,
              mt: 3,
              fontSize: '1.2rem',
              border: '1px solid #ff4d4d',
              '&:hover': {
                backgroundColor: 'rgba(255,77,77,0.2)'
              }
            }}
          >
            Return to Main Menu
          </Button>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#121212',
        color: '#fff',
        p: 2,
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <IconButton
          onClick={() => router.push('/')}
          sx={{ color: '#ff4d4d' }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h6" sx={{ color: '#ff4d4d' }}>
          Day {gameState.day} - {gameState.phase === 'solo' ? 'Solo Exploration' : 'Camp Management'}
        </Typography>
        
        <Box>
          <IconButton 
            onClick={togglePartyView}
            sx={{ color: '#4caf50', mr: 1 }}
          >
            <Badge badgeContent={gameState.survivors} color="primary">
              <PeopleIcon />
            </Badge>
          </IconButton>
          
          <IconButton 
            onClick={toggleInventory}
            sx={{ color: '#ff9800' }}
          >
            <Badge badgeContent={gameState.loot.length} color="primary">
              <InventoryIcon />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* Main Game Grid */}
      <Grid container spacing={2}>
        {/* Game Grid */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              background: '#1e1e1e',
              height: 'calc(100vh - 200px)',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {/* Show different UI based on game phase */}
            {gameState.phase === 'solo' ? (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
                    gap: '1px',
                    background: '#333',
                    p: 1,
                    width: 'fit-content',
                    height: 'fit-content',
                    mb: 2
                  }}
                  key={gridRefreshKey} // Add key to force complete remount and rerender
                >
                  {gameState.cityGrid.map((cell, index) => (
                    <motion.div
                      key={`${index}-${cell.type}-${cell.hasPlayer ? 'player' : 'empty'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.001 }}
                    >
                      <Tooltip 
                        title={`${cell.hasPlayer ? 'You (Player) - ' : ''}${cellGraphics[cell.type].label}`}
                        arrow
                      >
                        <Box
                          sx={{
                            width: cellSize,
                            height: cellSize,
                            background: cellGraphics[cell.type].color,
                            border: cell.hasPlayer ? '2px solid white' : '1px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            cursor: 'pointer',
                            position: 'relative',
                            '&:hover': {
                              background: `${cellGraphics[cell.type].color}dd`,
                              transform: 'scale(1.1)',
                              zIndex: 1,
                            },
                            transition: 'all 0.2s ease',
                          }}
                          onClick={() => handleCellClick(index)}
                        >
                          {cell.hasPlayer ? playerEmoji : cellGraphics[cell.type].emoji}
                        </Box>
                      </Tooltip>
                    </motion.div>
                  ))}
                </Box>
                
                {/* End Day Button for Solo Phase */}
                <Button 
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, width: '50%' }}
                  onClick={handleEndDay}
                >
                  {gameState.hasMoved ? 'End Day' : 'Skip Movement & End Day'}
                </Button>
              </>
            ) : (
              // Camp Phase UI
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" sx={{ color: '#ff9800', mb: 2, textAlign: 'center' }}>
                  Your Camp
                </Typography>
                
                {/* Instructions */}
                <Typography variant="body2" sx={{ color: '#aaa', mb: 2, textAlign: 'center' }}>
                  Click on a tile to perform your daily action:
                  • Empty Space: Explore the area
                  • Building: Scavenge for supplies
                  • Survivor: Make contact
                  • Zombie: Send hunting party
                </Typography>
                
                {/* Grid for camp phase */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
                    gap: '1px',
                    background: '#333',
                    p: 1,
                    width: 'fit-content',
                    height: 'fit-content',
                    mb: 2,
                    alignSelf: 'center'
                  }}
                  key={gridRefreshKey} // Add key to force complete remount and rerender
                >
                  {gameState.cityGrid.map((cell, index) => (
                    <motion.div
                      key={`${index}-${cell.type}-${index === gameState.campPosition ? 'camp' : 'empty'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.001 }}
                    >
                      <Tooltip 
                        title={`${index === gameState.campPosition ? 'Your Camp - ' : ''}${cellGraphics[cell.type].label}${gameState.hasPerformedAction ? ' (Already performed daily action)' : ''}`}
                        arrow
                      >
                        <Box
                          sx={{
                            width: cellSize,
                            height: cellSize,
                            background: cellGraphics[cell.type].color,
                            border: index === gameState.campPosition ? '2px solid #ff9800' : '1px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            cursor: gameState.hasPerformedAction ? 'default' : 'pointer',
                            position: 'relative',
                            opacity: index === gameState.campPosition || !gameState.hasPerformedAction ? 1 : 0.7,
                            '&:hover': gameState.hasPerformedAction ? {} : {
                              transform: 'scale(1.1)',
                              zIndex: 1,
                              boxShadow: '0 0 5px rgba(255,255,255,0.5)'
                            },
                            transition: 'all 0.2s ease',
                          }}
                          onClick={() => gameState.hasPerformedAction ? null : handleCampCellClick(index)}
                        >
                          {cellGraphics[cell.type].emoji}
                        </Box>
                      </Tooltip>
                    </motion.div>
                  ))}
                </Box>
                
                {/* Status message */}
                <Typography variant="body1" sx={{ color: '#ff9800', textAlign: 'center', mb: 2 }}>
                  {gameState.hasPerformedAction ? 'Daily action completed. End the day when ready.' : 'Choose a tile to perform your daily action.'}
                </Typography>
                
                {/* End Day Button for Camp Phase */}
                <Button 
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, width: '100%' }}
                  onClick={handleEndDay}
                >
                  End Day
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Game Stats */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              background: '#1e1e1e',
              height: 'calc(100vh - 200px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#ff4d4d' }}>
              Game Stats
            </Typography>
            
            {/* Phase-specific stats */}
            {gameState.phase === 'solo' ? (
              // Solo phase stats
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#4caf50' }}>
                  Status: Lone Survivor
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#4caf50' }}>
                  Your Group: {1 + gameState.survivors} ({gameState.survivors} survivors + you)
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#ff4d4d' }}>
                  Zombies in Area: {gameState.zombies}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#ff9800', mt: 1 }}>
                  Goal: Find a suitable location to establish camp
                </Typography>
              </Box>
            ) : (
              // Camp phase stats
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#4caf50' }}>
                  Status: Camp Established ({gameState.campType === 'building' ? 'Building' : 'Open Area'})
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#4caf50' }}>
                  Survivors: {1 + gameState.survivors} (including you)
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#64b5f6' }}>
                  Camp Defense: {gameState.campDefense} {gameState.campDefense >= 5 ? '(Strong)' : gameState.campDefense >= 3 ? '(Moderate)' : '(Weak)'}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#ba68c8' }}>
                  Scout Range: {gameState.scoutRange} tiles
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#ff4d4d' }}>
                  Zombie Threat: {gameState.zombies} in vicinity
                </Typography>
              </Box>
            )}
            
            {/* Faction Reputations Section */}
            <Typography variant="h6" sx={{ mb: 1, color: '#ff4d4d' }}>
              Faction Relations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
              {Object.entries(gameState.factionReputations).map(([faction, reputation]) => {
                // Skip showing factions with 0 reputation that haven't been encountered
                if (reputation === 0 && gameState.day < 5) return null;
                
                // Determine status and color
                let status = '';
                let color = '#ffffff';
                if (reputation >= 75) {
                  status = 'Allied';
                  color = '#4CAF50'; // green
                } else if (reputation >= 30) {
                  status = 'Friendly';
                  color = '#8BC34A'; // light green
                } else if (reputation >= 10) {
                  status = 'Cordial';
                  color = '#CDDC39'; // lime
                } else if (reputation > -10) {
                  status = 'Neutral';
                  color = '#9E9E9E'; // gray
                } else if (reputation > -30) {
                  status = 'Wary';
                  color = '#FFC107'; // amber
                } else if (reputation > -75) {
                  status = 'Hostile';
                  color = '#FF5722'; // deep orange
                } else {
                  status = 'Enemy';
                  color = '#F44336'; // red
                }
                
                return (
                  <Box key={faction} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {faction}:
                    </Typography>
                    <Typography variant="body2" sx={{ color }}>
                      {status} ({reputation})
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            
            <Typography variant="h6" sx={{ mb: 2, color: '#ff4d4d' }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#ffd700' }}>
                Food: {gameState.resources.food}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4fc3f7' }}>
                Water: {gameState.resources.water}
              </Typography>
              <Typography variant="body2" sx={{ color: '#81c784' }}>
                Medicine: {gameState.resources.medicine}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff8a65' }}>
                Ammo: {gameState.resources.ammo}
              </Typography>
            </Box>

            {/* Event Log */}
            <Typography variant="h6" sx={{ color: '#ff4d4d', mt: 2 }}>
              Event Log
            </Typography>
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                mt: 1,
                p: 1,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 1,
              }}
            >
              {gameState.log.map((entry, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{
                    color: '#fff',
                    mb: 1,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    pb: 1,
                  }}
                >
                  {entry}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Camp Setup Dialog */}
      <Dialog 
        open={showCampDialog} 
        onClose={() => setShowCampDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#ff4d4d' }}>
          Set Up Your Camp
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#fff', my: 2 }}>
            Do you want to establish your camp at your current location? This will end your solo journey and begin the camp phase of the game.
          </Typography>
          <Typography sx={{ color: '#fff', mb: 2 }}>
            • Setting up in an open area makes evacuation easier, but you'll face more casualties if attacked.<br/>
            • Setting up in a building provides better protection during attacks, but evacuation will be more difficult.
          </Typography>
          <Typography sx={{ color: '#ff9800', my: 2 }}>
            <strong>Important:</strong> Once you establish a camp, you will no longer be able to move around the map. Your camp becomes your fixed position.
          </Typography>
          {gameState.cityGrid[gameState.playerPosition]?.type === 'building' && (
            <Typography sx={{ color: '#4caf50', mt: 2 }}>
              You are currently in a building.
            </Typography>
          )}
          {gameState.cityGrid[gameState.playerPosition]?.type === 'empty' && (
            <Typography sx={{ color: '#4caf50', mt: 2 }}>
              You are currently in an open area.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {gameState.cityGrid[gameState.playerPosition]?.type === 'building' && (
            <Button 
              onClick={() => setupCamp('building')}
              variant="contained"
              color="primary"
            >
              Set up in Building
            </Button>
          )}
          {gameState.cityGrid[gameState.playerPosition]?.type === 'empty' && (
            <Button 
              onClick={() => setupCamp('open')}
              variant="contained"
              color="primary"
            >
              Set up in Open Area
            </Button>
          )}
          <Button 
            onClick={() => setShowCampDialog(false)}
            variant="contained"
            color="secondary"
          >
            Not Yet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Combat Dialog */}
      <Dialog 
        open={showCombatDialog} 
        onClose={() => setShowCombatDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#ff4d4d' }}>
          Zombie Encounter
        </DialogTitle>
        <DialogContent>
          {selectedCellIndex !== null && gameState.cityGrid[selectedCellIndex]?.type === 'zombie' && (
            <Typography sx={{ color: '#fff', my: 2 }}>
              You encountered a lone zombie. You have a good chance of defeating it.
            </Typography>
          )}
          {selectedCellIndex !== null && gameState.cityGrid[selectedCellIndex]?.type === 'zombieGroup' && (
            <Typography sx={{ color: '#fff', my: 2 }}>
              You encountered a group of zombies. This will be a challenging fight.
            </Typography>
          )}
          {selectedCellIndex !== null && gameState.cityGrid[selectedCellIndex]?.type === 'zombieHorde' && (
            <Typography sx={{ color: '#ff4d4d', my: 2 }}>
              WARNING: You encountered a massive zombie horde. Fighting is extremely dangerous.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => handleCombat('fight')}
            variant="contained"
            color="primary"
          >
            Fight
          </Button>
          <Button 
            onClick={() => handleCombat('flee')}
            variant="contained"
            color="secondary"
          >
            Flee
          </Button>
        </DialogActions>
      </Dialog>

      {/* Survivor Dialog */}
      <Dialog 
        open={showSurvivorDialog} 
        onClose={() => setShowSurvivorDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#4caf50' }}>
          Survivor Encountered
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#fff', my: 2 }}>
            You found another survivor. Would you like to recruit them to your group?
          </Typography>
          <Typography sx={{ color: '#ddd', my: 2, fontStyle: 'italic' }}>
            Note: Whether they join depends on their disposition towards you. Some survivors may be friendly, others neutral or hostile. Your faction reputation can influence their decision.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => handleSurvivor('recruit')}
            variant="contained"
            color="primary"
          >
            Recruit
          </Button>
          <Button 
            onClick={() => handleSurvivor('ignore')}
            variant="contained"
            color="secondary"
          >
            Ignore
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog 
        open={showContactDialog} 
        onClose={() => setShowContactDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#ff4d4d' }}>
          Survivor Contact
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#fff', my: 2 }}>
            {currentSurvivor?.description}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => handleSurvivorContact('recruit')}
            variant="contained"
            color="primary"
          >
            Recruit
          </Button>
          <Button 
            onClick={() => handleSurvivorContact('trade')}
            variant="contained"
            color="primary"
          >
            Trade
          </Button>
          <Button 
            onClick={() => handleSurvivorContact('leave')}
            variant="contained"
            color="secondary"
          >
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Night Event Dialog */}
      <Dialog 
        open={showNightEventDialog} 
        onClose={() => setShowNightEventDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#ff4d4d' }}>
          Night Event
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#fff', my: 2 }}>
            What would you like to do during the night?
          </Typography>
          <Typography sx={{ color: '#fff', mb: 2 }}>
            • Sleep: Everyone regains some strength.
          </Typography>
          <Typography sx={{ color: '#fff', mb: 2 }}>
            • Guard: Set up guard shifts for the night.
          </Typography>
          <Typography sx={{ color: '#fff', mb: 2 }}>
            • Scavenge: Send a few people out to find resources during the night.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => handleNightAction('sleep')}
            variant="contained"
            color="primary"
          >
            Sleep
          </Button>
          <Button 
            onClick={() => handleNightAction('guard')}
            variant="contained"
            color="primary"
          >
            Guard
          </Button>
          <Button 
            onClick={() => handleNightAction('scavenge')}
            variant="contained"
            color="primary"
          >
            Scavenge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Dialog */}
      <Dialog 
        open={showInventoryDialog} 
        onClose={() => {
          setShowInventoryDialog(false);
          setSelectedLootItem(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: '#ff9800', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Inventory</span>
          <Typography variant="subtitle1" sx={{ color: '#aaa' }}>
            {gameState.loot.length} Items ({gameState.loot.filter(item => item.equipped).length} Equipped)
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', height: '60vh' }}>
          {/* Item List */}
          <Box sx={{ width: '40%', borderRight: '1px solid #333', pr: 2, overflowY: 'auto' }}>
            {gameState.loot.length === 0 ? (
              <Typography sx={{ color: '#aaa', fontStyle: 'italic', mt: 2 }}>
                You haven't found any items yet.
              </Typography>
            ) : (
              gameState.loot.map(item => (
                <Box 
                  key={item.id}
                  sx={{
                    p: 1, 
                    mb: 1, 
                    border: `1px solid ${getLootRarityColor(item.rarity)}`,
                    background: item === selectedLootItem ? 'rgba(255,255,255,0.1)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.05)'
                    }
                  }}
                  onClick={() => handleLootItemClick(item)}
                >
                  <Box sx={{ fontSize: 24, mr: 2 }}>{item.emoji}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: getLootRarityColor(item.rarity) }}>
                      {item.name} {item.equipped && '(Equipped)'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#aaa' }}>
                      {item.category} - {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>
          
          {/* Item Details */}
          <Box sx={{ width: '60%', pl: 2, overflowY: 'auto' }}>
            {selectedLootItem ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ fontSize: 40, mr: 3 }}>{selectedLootItem.emoji}</Box>
                  <Box>
                    <Typography variant="h5" sx={{ color: getLootRarityColor(selectedLootItem.rarity) }}>
                      {selectedLootItem.name}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#aaa' }}>
                      {selectedLootItem.category.charAt(0).toUpperCase() + selectedLootItem.category.slice(1)} • {selectedLootItem.rarity.charAt(0).toUpperCase() + selectedLootItem.rarity.slice(1)}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ color: '#fff', mb: 3 }}>
                  {selectedLootItem.description}
                </Typography>
                
                {selectedLootItem.effects.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ color: '#ff9800', mb: 1 }}>
                      Effects:
                    </Typography>
                    {selectedLootItem.effects.map((effect, idx) => (
                      <Typography key={idx} sx={{ color: '#4fc3f7' }}>
                        • +{effect.value}% {effect.name.replace(/_/g, ' ')}
                      </Typography>
                    ))}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#aaa' }}>
                      Source: {selectedLootItem.source}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#aaa' }}>
                      Found: {selectedLootItem.date_found}
                    </Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    color={selectedLootItem.equipped ? "secondary" : "primary"}
                    onClick={() => toggleEquipItem(selectedLootItem)}
                  >
                    {selectedLootItem.equipped ? 'Unequip' : 'Equip'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ color: '#aaa', fontStyle: 'italic', mt: 2 }}>
                Select an item to view details.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setShowInventoryDialog(false);
              setSelectedLootItem(null);
            }}
            variant="contained"
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Camp Attack Dialog */}
      <Dialog 
        open={showCampAttackDialog} 
        onClose={() => {}} // Can't close this dialog by clicking outside
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: '#ff4d4d', display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2, fontSize: '24px' }}>⚠️</Box>
          {currentAttack?.name || 'Camp Attack!'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#fff', my: 2, fontSize: '18px' }}>
            {currentAttack?.description || 'Your camp is under attack by zombies!'}
          </Typography>
          
          <Typography sx={{ color: '#ff4d4d', my: 2 }}>
            Approximately {currentAttack?.zombieCount || 'several'} zombies are attempting to break into your camp.
            You must decide how to respond.
          </Typography>
          
          <Typography variant="h6" sx={{ color: '#ff9800', mt: 3 }}>
            Defense Options:
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {attackDefenseOptions.map((option, index) => (
              <Paper key={index} sx={{ p: 2, background: '#2a2a2a', borderLeft: `4px solid ${option.id === 'fight_back' ? '#ff4d4d' : option.id === 'barricade' ? '#4caf50' : '#ff9800'}` }}>
                <Typography variant="h6" sx={{ color: '#fff' }}>
                  {option.name} - {Math.round(option.successChance * 100)}% Success Chance
                </Typography>
                <Typography sx={{ color: '#ccc', mb: 2 }}>
                  {option.description}
                </Typography>
                <Typography variant="caption" sx={{ color: '#aaa' }}>
                  {option.id === 'fight_back' && `Requires: ${option.consequences.ammoUsed} ammo minimum`}
                  {option.id === 'evacuate' && `Warning: Will result in significant resource loss`}
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ mt: 1 }}
                  color={option.id === 'fight_back' ? 'error' : option.id === 'barricade' ? 'success' : 'warning'}
                  onClick={() => handleDefenseChoice(option)}
                >
                  Choose this option
                </Button>
              </Paper>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Party Dialog */}
      <Dialog 
        open={showPartyDialog} 
        onClose={() => setShowPartyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: '#4caf50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Survivor Group</span>
          <Typography variant="subtitle1" sx={{ color: '#aaa' }}>
            {gameState.survivors} {gameState.survivors === 1 ? 'Survivor' : 'Survivors'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {gameState.survivors <= 0 ? (
            <Typography sx={{ color: '#aaa', my: 2, textAlign: 'center' }}>
              You are alone. No other survivors in your group yet.
            </Typography>
          ) : (
            <Box sx={{ my: 2 }}>
              {generateSurvivorProfiles().map((survivor, index) => (
                <Paper 
                  key={survivor.id} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#4caf50' }}>
                        {survivor.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#aaa' }}>
                        Joined on Day {survivor.joinedDay}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#fff', 
                      background: 'rgba(76,175,80,0.2)', 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: '4px'
                    }}>
                      Survivor #{index + 1}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#ff9800', mb: 0.5 }}>
                      Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {survivor.skills.map(skill => (
                        <Typography 
                          key={skill} 
                          variant="body2" 
                          sx={{ 
                            color: '#fff',
                            background: 'rgba(255,152,0,0.2)',
                            px: 1, 
                            py: 0.5,
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                          }}
                        >
                          {skill}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#2196f3', mb: 0.5 }}>
                      Traits:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {survivor.traits.map(trait => (
                        <Typography 
                          key={trait} 
                          variant="body2" 
                          sx={{ 
                            color: '#fff',
                            background: 'rgba(33,150,243,0.2)',
                            px: 1, 
                            py: 0.5,
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                          }}
                        >
                          {trait}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
          
          <Box sx={{ mt: 3, p: 2, background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
            <Typography variant="subtitle1" sx={{ color: '#4caf50', mb: 1 }}>
              Group Benefits
            </Typography>
            <Typography variant="body2" sx={{ color: '#ddd' }}>
              • Each survivor increases your camp's resource gathering abilities
            </Typography>
            <Typography variant="body2" sx={{ color: '#ddd' }}>
              • Survivors help defend your camp against zombie attacks
            </Typography>
            <Typography variant="body2" sx={{ color: '#ddd' }}>
              • More survivors make hunting parties more effective
            </Typography>
            <Typography variant="body2" sx={{ color: '#ddd' }}>
              • Survivors help reinforce camp defenses more quickly
            </Typography>
          </Box>
          
          {/* Blockchain Integration */}
          <Box sx={{ mt: 3 }}>
            <SurvivorMinter 
              onMintSuccess={(tokenId, txHash) => {
                addLog(`🔗 Survivor NFT #${tokenId} minted successfully on Base blockchain!`);
                addLog(`📜 Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`);
              }}
              onMintError={(error) => {
                addLog(`❌ Failed to mint survivor NFT: ${error}`);
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPartyDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 