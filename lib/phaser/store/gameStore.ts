import { create } from 'zustand';

export interface Position {
  x: number;
  y: number;
}

export interface Survivor {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  skills: string[];
  position: Position;
}

export interface Zombie {
  id: string;
  type: 'walker' | 'runner' | 'tank';
  health: number;
  position: Position;
  speed: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'food' | 'medicine' | 'ammo' | 'material';
  quantity: number;
  icon: string;
}

export interface GameState {
  // Player
  player: {
    position: Position;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    hunger: number;
    thirst: number;
  };
  
  // Game progress
  day: number;
  time: number; // 0-24 hours
  phase: 'day' | 'night';
  
  // Entities
  survivors: Survivor[];
  zombies: Zombie[];
  
  // Inventory
  inventory: Item[];
  equippedWeapon: Item | null;
  
  // Camp
  hasCamp: boolean;
  campPosition: Position | null;
  campDefense: number;
  
  // Resources
  resources: {
    food: number;
    water: number;
    medicine: number;
    ammo: number;
    materials: number;
  };
  
  // UI State
  isPaused: boolean;
  showInventory: boolean;
  showMap: boolean;
  currentScene: string;
  
  // Actions
  setPlayerPosition: (position: Position) => void;
  updatePlayerHealth: (health: number) => void;
  updatePlayerStamina: (stamina: number) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  equipWeapon: (item: Item | null) => void;
  updateResources: (resources: Partial<GameState['resources']>) => void;
  advanceTime: (hours: number) => void;
  togglePause: () => void;
  toggleInventory: () => void;
  toggleMap: () => void;
  setCurrentScene: (scene: string) => void;
  addZombie: (zombie: Zombie) => void;
  removeZombie: (zombieId: string) => void;
  addSurvivor: (survivor: Survivor) => void;
  removeSurvivor: (survivorId: string) => void;
  setCamp: (position: Position) => void;
  resetGame: () => void;
}

const initialState = {
  player: {
    position: { x: 640, y: 360 },
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    hunger: 100,
    thirst: 100,
  },
  day: 1,
  time: 8,
  phase: 'day' as const,
  survivors: [],
  zombies: [],
  inventory: [],
  equippedWeapon: null,
  hasCamp: false,
  campPosition: null,
  campDefense: 0,
  resources: {
    food: 10,
    water: 10,
    medicine: 5,
    ammo: 20,
    materials: 0,
  },
  isPaused: false,
  showInventory: false,
  showMap: false,
  currentScene: 'MenuScene',
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  
  setPlayerPosition: (position) => set((state) => ({
    player: { ...state.player, position }
  })),
  
  updatePlayerHealth: (health) => set((state) => ({
    player: { ...state.player, health: Math.max(0, Math.min(health, state.player.maxHealth)) }
  })),
  
  updatePlayerStamina: (stamina) => set((state) => ({
    player: { ...state.player, stamina: Math.max(0, Math.min(stamina, state.player.maxStamina)) }
  })),
  
  addItem: (item) => set((state) => {
    const existingItem = state.inventory.find(i => i.id === item.id);
    if (existingItem && item.type !== 'weapon') {
      return {
        inventory: state.inventory.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      };
    }
    return { inventory: [...state.inventory, item] };
  }),
  
  removeItem: (itemId, quantity = 1) => set((state) => {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return state;
    
    if (item.quantity > quantity) {
      return {
        inventory: state.inventory.map(i =>
          i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
        )
      };
    }
    return { inventory: state.inventory.filter(i => i.id !== itemId) };
  }),
  
  equipWeapon: (item) => set({ equippedWeapon: item }),
  
  updateResources: (resources) => set((state) => ({
    resources: { ...state.resources, ...resources }
  })),
  
  advanceTime: (hours) => set((state) => {
    const newTime = state.time + hours;
    const daysToAdd = Math.floor(newTime / 24);
    const finalTime = newTime % 24;
    const phase = finalTime >= 6 && finalTime < 18 ? 'day' : 'night';
    
    return {
      time: finalTime,
      day: state.day + daysToAdd,
      phase,
      player: {
        ...state.player,
        hunger: Math.max(0, state.player.hunger - hours * 2),
        thirst: Math.max(0, state.player.thirst - hours * 3),
      }
    };
  }),
  
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  toggleInventory: () => set((state) => ({ showInventory: !state.showInventory })),
  toggleMap: () => set((state) => ({ showMap: !state.showMap })),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  
  addZombie: (zombie) => set((state) => ({
    zombies: [...state.zombies, zombie]
  })),
  
  removeZombie: (zombieId) => set((state) => ({
    zombies: state.zombies.filter(z => z.id !== zombieId)
  })),
  
  addSurvivor: (survivor) => set((state) => ({
    survivors: [...state.survivors, survivor]
  })),
  
  removeSurvivor: (survivorId) => set((state) => ({
    survivors: state.survivors.filter(s => s.id !== survivorId)
  })),
  
  setCamp: (position) => set({
    hasCamp: true,
    campPosition: position,
    campDefense: 10,
  }),
  
  resetGame: () => set(initialState),
}));