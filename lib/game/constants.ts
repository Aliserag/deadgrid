export const GAME_CONFIG = {
  MAP_WIDTH: 50,
  MAP_HEIGHT: 50,
  TILE_SIZE: 32,
  VIEWPORT_WIDTH: 20,
  VIEWPORT_HEIGHT: 15,
  
  TURN_DURATION: 1000,
  HOURS_PER_DAY: 24,
  TURNS_PER_HOUR: 10,
  
  PLAYER_INITIAL_HEALTH: 100,
  PLAYER_INITIAL_HUNGER: 100,
  PLAYER_INITIAL_THIRST: 100,
  PLAYER_INITIAL_STAMINA: 100,
  
  HUNGER_DECAY_RATE: 0.5,
  THIRST_DECAY_RATE: 1,
  STAMINA_DECAY_RATE: 2,
  STAMINA_RECOVERY_RATE: 5,
  
  ZOMBIE_SPAWN_CHANCE: {
    SINGLE: 0.05,
    GROUP: 0.02,
    SWARM: 0.005
  },
  
  ZOMBIE_STATS: {
    SINGLE: {
      health: 30,
      damage: 10,
      speed: 1,
      detectionRange: 5,
      lootChance: 0.3
    },
    GROUP: {
      health: 50,
      damage: 15,
      speed: 1,
      detectionRange: 7,
      lootChance: 0.5,
      count: { min: 3, max: 6 }
    },
    SWARM: {
      health: 40,
      damage: 20,
      speed: 2,
      detectionRange: 10,
      lootChance: 0.7,
      count: { min: 8, max: 15 }
    }
  },
  
  BASE_STATS: {
    CAMP_OPEN: {
      defense: 10,
      fleeSpeed: 0.8,
      casualtyRate: 0.2
    },
    CAMP_FOREST: {
      defense: 15,
      fleeSpeed: 0.7,
      casualtyRate: 0.25
    },
    BUILDING: {
      defense: 30,
      fleeSpeed: 0.4,
      casualtyRate: 0.4
    }
  },
  
  WEAPON_RANGES: {
    MELEE: 1,
    PISTOL: 5,
    RIFLE: 10,
    SHOTGUN: 3
  },
  
  WEATHER_EFFECTS: {
    CLEAR: { visibility: 1, movementSpeed: 1 },
    RAIN: { visibility: 0.7, movementSpeed: 0.9 },
    FOG: { visibility: 0.4, movementSpeed: 1 },
    STORM: { visibility: 0.5, movementSpeed: 0.7 },
    SNOW: { visibility: 0.6, movementSpeed: 0.6 }
  },
  
  NPC_FACTION_RELATIONS: {
    SURVIVORS: { SURVIVORS: 1, RAIDERS: -1, TRADERS: 0.5, MILITARY: 0.3, CANNIBALS: -1 },
    RAIDERS: { SURVIVORS: -1, RAIDERS: 0.5, TRADERS: -0.5, MILITARY: -1, CANNIBALS: 0 },
    TRADERS: { SURVIVORS: 0.5, RAIDERS: -0.5, TRADERS: 1, MILITARY: 0.5, CANNIBALS: -0.5 },
    MILITARY: { SURVIVORS: 0.3, RAIDERS: -1, TRADERS: 0.5, MILITARY: 1, CANNIBALS: -1 },
    CANNIBALS: { SURVIVORS: -1, RAIDERS: 0, TRADERS: -0.5, MILITARY: -1, CANNIBALS: 0.5 }
  }
};

export const TERRAIN_MOVEMENT_COST = {
  GRASS: 1,
  FOREST: 2,
  ROAD: 0.5,
  BUILDING: 1,
  WATER: 999,
  MOUNTAIN: 3
};

export const LOOT_TABLES = {
  COMMON: [
    { name: 'Canned Food', type: 'food', weight: 0.5, chance: 0.3 },
    { name: 'Water Bottle', type: 'food', weight: 0.5, chance: 0.3 },
    { name: 'Bandage', type: 'medical', weight: 0.1, chance: 0.2 },
    { name: 'Scrap Metal', type: 'material', weight: 1, chance: 0.2 }
  ],
  UNCOMMON: [
    { name: 'Baseball Bat', type: 'weapon', weight: 2, chance: 0.15 },
    { name: 'Knife', type: 'weapon', weight: 0.5, chance: 0.2 },
    { name: 'First Aid Kit', type: 'medical', weight: 1, chance: 0.15 },
    { name: 'Flashlight', type: 'tool', weight: 0.3, chance: 0.2 },
    { name: 'Rope', type: 'tool', weight: 1, chance: 0.15 },
    { name: '9mm Ammo', type: 'ammo', weight: 0.1, chance: 0.15 }
  ],
  RARE: [
    { name: 'Pistol', type: 'weapon', weight: 1.5, chance: 0.05 },
    { name: 'Rifle', type: 'weapon', weight: 3, chance: 0.03 },
    { name: 'Shotgun', type: 'weapon', weight: 3.5, chance: 0.03 },
    { name: 'Body Armor', type: 'armor', weight: 5, chance: 0.04 },
    { name: 'Medicine', type: 'medical', weight: 0.2, chance: 0.05 },
    { name: 'Radio', type: 'tool', weight: 0.5, chance: 0.05 }
  ]
};

export const COLORS = {
  UI: {
    BACKGROUND: '#0a0a0a',
    PANEL: '#1a1a1a',
    BORDER: '#333333',
    TEXT: '#e0e0e0',
    TEXT_DIM: '#888888',
    HEALTH: '#ff4444',
    STAMINA: '#44ff44',
    HUNGER: '#ffaa44',
    THIRST: '#4488ff',
    DANGER: '#ff2222',
    WARNING: '#ffaa00',
    SUCCESS: '#00ff00'
  },
  TERRAIN: {
    GRASS: 0x2d4a2b,
    FOREST: 0x1a2f1a,
    ROAD: 0x3a3a3a,
    BUILDING: 0x4a4a4a,
    WATER: 0x2a3f5f,
    MOUNTAIN: 0x5a5a5a
  },
  ENTITIES: {
    PLAYER: 0x4444ff,
    ZOMBIE: 0x884444,
    NPC_FRIENDLY: 0x44ff44,
    NPC_NEUTRAL: 0xffff44,
    NPC_HOSTILE: 0xff4444,
    LOOT: 0xffaa44,
    BASE: 0x8844ff
  }
};