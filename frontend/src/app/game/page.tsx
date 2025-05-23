'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

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

// Interface for faction reputation
interface FactionReputation {
  [key: string]: number; // Reputation score for each faction (-100 to 100)
}

// Game state interface
interface GameState {
  day: number;
  phase: 'solo' | 'camp';
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
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [currentSurvivor, setCurrentSurvivor] = useState<SurvivorData | null>(null);
  
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
      movePlayer(index);
      addResources();
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
      if (zombieType === 'zombie') {
        // 80% chance to win against a single zombie
        combatSuccess = Math.random() < 0.8;
        casualties = 0;
      } else if (zombieType === 'zombieGroup') {
        // 50% chance to win against a zombie group
        combatSuccess = Math.random() < 0.5;
        casualties = combatSuccess ? 0 : 1;
      } else if (zombieType === 'zombieHorde') {
        // 20% chance to win against a zombie horde
        combatSuccess = Math.random() < 0.2;
        casualties = combatSuccess ? 1 : (gameState.survivors > 0 ? gameState.survivors : 1);
      }
      
      // Apply combat effects
      if (combatSuccess) {
        const newGrid = [...gameState.cityGrid];
        // Remove player from current position
        newGrid[gameState.playerPosition].hasPlayer = false;
        // Move player to zombie position and clear zombie
        newGrid[selectedCellIndex] = {
          type: 'empty',
          hasPlayer: true
        };
        
        setGameState(prev => ({
          ...prev,
          playerPosition: selectedCellIndex,
          survivors: Math.max(0, prev.survivors - casualties),
          zombies: prev.zombies - 1,
          resources: {
            ...prev.resources,
            ammo: Math.max(0, prev.resources.ammo - 2)
          },
          cityGrid: newGrid
        }));
        
        addLog(`You successfully defeated the ${zombieType === 'zombie' ? 'zombie' : zombieType === 'zombieGroup' ? 'group of zombies' : 'zombie horde'}. ${casualties > 0 ? `Lost ${casualties} survivors.` : ''} -2 ammo.`);
        
        // Chance to find loot
        if (Math.random() < 0.4) {
          addResources();
        }
      } else {
        if (casualties >= gameState.survivors + 1) {
          // Game over - player died
          addLog('You were overwhelmed by zombies and died.');
          setShowCombatDialog(false);
          // TODO: Add game over screen
          return;
        }
        
        setGameState(prev => ({
          ...prev,
          survivors: Math.max(0, prev.survivors - casualties),
          resources: {
            ...prev.resources,
            ammo: Math.max(0, prev.resources.ammo - 2),
            medicine: Math.max(0, prev.resources.medicine - 1)
          }
        }));
        
        addLog(`You failed to defeat the ${zombieType === 'zombie' ? 'zombie' : zombieType === 'zombieGroup' ? 'group of zombies' : 'zombie horde'} and retreated. ${casualties > 0 ? `Lost ${casualties} survivors.` : ''} -2 ammo, -1 medicine.`);
      }
    } else {
      // Flee action
      addLog(`You decided to flee from the ${zombieType === 'zombie' ? 'zombie' : zombieType === 'zombieGroup' ? 'group of zombies' : 'zombie horde'}.`);
    }
    
    setShowCombatDialog(false);
    endDay();
  };

  // Handle encountering survivors
  const handleSurvivor = (action: 'recruit' | 'ignore') => {
    if (selectedCellIndex === null) return;
    
    if (action === 'recruit') {
      // Add survivor to group
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
      
      addLog('You recruited a survivor to your group.');
    } else {
      addLog('You decided to leave the survivor alone.');
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
    
    // Get target position (player or camp)
    const targetPosition = gameState.phase === 'solo' 
      ? gameState.playerPosition 
      : gameState.campPosition || 0;
    
    // Process each cell for potential zombie movement
    for (let i = 0; i < newGrid.length; i++) {
      // Skip if this is not a zombie cell
      if (newGrid[i].type !== 'zombie' && newGrid[i].type !== 'zombieGroup' && newGrid[i].type !== 'zombieHorde') continue;
      
      const zombieType = newGrid[i].type;
      const distance = getDistance(i, targetPosition);
      const chaseChance = getChaseChance(distance);
      
      // Decide if zombie will chase player/camp or move randomly
      const willChase = Math.random() < chaseChance;
      
      if (willChase) {
        // Chase player/camp - get adjacent cells that are closer to target
        const adjacentCells = getAdjacentCells(i);
        let bestCells: number[] = [];
        
        for (const adjIdx of adjacentCells) {
          // Skip occupied cells
          if (newGrid[adjIdx].type !== 'empty') continue;
          
          // Check if this cell is closer to target
          if (getDistance(adjIdx, targetPosition) < distance) {
            bestCells.push(adjIdx);
          }
        }
        
        // If there are cells closer to target, move zombie to a random one
        if (bestCells.length > 0) {
          const targetCell = bestCells[Math.floor(Math.random() * bestCells.length)];
          
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
            newGrid[cellIdx].type === 'empty'
          );
          
          // If there are empty adjacent cells, move zombie to a random one
          if (emptyCells.length > 0) {
            const targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            
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
        newGrid[cellIdx].type === 'empty'
      );
      
      if (emptyCells.length > 0) {
        const targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
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
    
    // Update the grid
    setGameState(prev => ({
      ...prev,
      cityGrid: newGrid
    }));
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
  };

  // Consume daily resources at camp
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
      addLog("You've already performed a camp action today. End the day before performing another action.");
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
  };

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#121212',
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
        <IconButton onClick={() => router.push('/')} sx={{ color: '#ff4d4d' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: '#ff4d4d' }}>
          Day {gameState.day} 
        </Typography>
        <Typography variant="body2" sx={{ color: '#4fc3f7' }}>
          {gameState.hasCamp ? 'Camp established' : 'No camp yet'}
        </Typography>
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
                >
                  {gameState.cityGrid.map((cell, index) => (
                    <motion.div
                      key={index}
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
                >
                  {gameState.cityGrid.map((cell, index) => (
                    <motion.div
                      key={index}
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
    </Box>
  );
} 