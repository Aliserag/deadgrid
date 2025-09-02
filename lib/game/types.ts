export interface Position {
  x: number;
  y: number;
}

export interface GameEntity {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
}

export enum ZombieType {
  SINGLE = 'single',
  GROUP = 'group',
  SWARM = 'swarm'
}

export interface Zombie extends GameEntity {
  type: ZombieType;
  speed: number;
  damage: number;
  detectionRange: number;
  isChasing: boolean;
  target?: Position;
}

export enum NPCAlignment {
  FRIENDLY = 'friendly',
  NEUTRAL = 'neutral',
  HOSTILE = 'hostile'
}

export interface NPC extends GameEntity {
  name: string;
  alignment: NPCAlignment;
  faction: string;
  isAlive: boolean;
  inventory: Item[];
}

export enum ItemType {
  WEAPON = 'weapon',
  AMMO = 'ammo',
  FOOD = 'food',
  MEDICAL = 'medical',
  MATERIAL = 'material',
  TOOL = 'tool'
}

export enum WeaponType {
  MELEE = 'melee',
  RANGED = 'ranged'
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  weight: number;
  stackable: boolean;
  quantity: number;
}

export interface Weapon extends Item {
  weaponType: WeaponType;
  damage: number;
  range: number;
  ammoType?: string;
  durability: number;
  maxDurability: number;
}

export interface Player extends GameEntity {
  name: string;
  hunger: number;
  thirst: number;
  stamina: number;
  inventory: Item[];
  equippedWeapon?: Weapon;
  baseLocation?: Base;
}

export enum BaseType {
  CAMP_OPEN = 'camp_open',
  CAMP_FOREST = 'camp_forest',
  BUILDING = 'building'
}

export interface Base {
  id: string;
  position: Position;
  type: BaseType;
  defense: number;
  resources: Item[];
  survivors: NPC[];
  isUnderSiege: boolean;
}

export enum TerrainType {
  GRASS = 'grass',
  FOREST = 'forest',
  ROAD = 'road',
  BUILDING = 'building',
  WATER = 'water',
  MOUNTAIN = 'mountain'
}

export interface Tile {
  position: Position;
  terrain: TerrainType;
  isExplored: boolean;
  hasLoot: boolean;
  loot?: Item[];
  building?: Building;
}

export interface Building {
  id: string;
  name: string;
  isAbandoned: boolean;
  isSearched: boolean;
  defense: number;
  loot: Item[];
}

export enum GameMode {
  SOLO = 'solo',
  BASE = 'base'
}

export enum WeatherType {
  CLEAR = 'clear',
  RAIN = 'rain',
  FOG = 'fog',
  STORM = 'storm',
  SNOW = 'snow'
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  timestamp: number;
  isRandom: boolean;
}

export interface EventChoice {
  text: string;
  outcome: () => void;
  requirements?: {
    items?: string[];
    skills?: string[];
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: Item[];
  isCompleted: boolean;
  isActive: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  isCompleted: boolean;
  progress: number;
  target: number;
}

export interface GameState {
  mode: GameMode;
  turn: number;
  day: number;
  hour: number;
  weather: WeatherType;
  player: Player;
  map: Tile[][];
  zombies: Zombie[];
  npcs: NPC[];
  bases: Base[];
  events: GameEvent[];
  quests: Quest[];
  isGameOver: boolean;
  seed: string;
}

export interface CombatResult {
  damage: number;
  isCritical: boolean;
  targetKilled: boolean;
  message: string;
}

export interface MovementResult {
  success: boolean;
  encounterTriggered: boolean;
  encounter?: GameEvent;
}