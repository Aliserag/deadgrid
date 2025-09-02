import { useState, useEffect } from 'react';

// Types for AI-generated content
export interface Faction {
  id: string;
  name: string;
  emoji: string;
  description: string;
  ideology: string;
  territory: string;
  resources: string[];
  hostility: number;
  perks: string[];
  weaknesses: string[];
  discovered_day: number;
  members: string[];
  relations: Record<string, number>;
}

export interface NPC {
  id: string;
  name: string;
  emoji: string;
  age: number;
  background: string;
  description: string;
  motivation: string;
  skills: string[];
  items: string[];
  quirk: string;
  secret: string;
  discovered_day: number;
  faction_id?: string;
  faction_name?: string;
  status: string;
  relationship: number;
}

export interface LootItem {
  id: number;
  name: string;
  emoji: string;
  description: string;
  category: string;
  rarity: string;
  effects: Array<{ name: string; value: number }>;
  source: string;
  discovered_day: number;
  date_found?: string;
  equipped?: boolean;
}

export interface Weather {
  current: {
    condition: string;
    emoji: string;
    temperature: number;
    description: string;
  };
  forecast: Array<{
    day: number;
    condition: string;
    emoji: string;
    temperature: number;
  }>;
}

export interface PlayerStats {
  day: number;
  health: number;
  stamina: number;
  morale: number;
  experience: number;
  level: number;
  skills: string[];
  equipment: Record<string, any>;
  resources: {
    food: number;
    water: number;
    medicine: number;
    ammo: number;
  };
  camp?: {
    established: boolean;
    defense: number;
    survivors: number;
  };
}

export interface ExplorationEvent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  triggers: Record<string, any>;
  weight: number;
  choices: Array<{
    id: string;
    text: string;
    emoji: string;
    requirements: Record<string, any>;
    outcomes: Array<{
      probability: number;
      type: string;
      description: string;
      rewards?: Record<string, any>;
      consequences?: Record<string, any>;
    }>;
  }>;
}

export interface FactionEvent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  triggers: Record<string, any>;
  weight: number;
  choices: Array<{
    id: string;
    text: string;
    emoji: string;
    requirements: Record<string, any>;
    outcomes: Array<{
      probability: number;
      type: string;
      description: string;
      rewards?: Record<string, any>;
      consequences?: Record<string, any>;
    }>;
  }>;
}

export interface GameData {
  factions: Faction[];
  npcs: NPC[];
  items: LootItem[];
  weather: Weather;
  playerStats: PlayerStats;
  explorationEvents: ExplorationEvent[];
  factionEvents: FactionEvent[];
  isLoading: boolean;
  error: string | null;
}

export function useGameData(): GameData {
  const [gameData, setGameData] = useState<GameData>({
    factions: [],
    npcs: [],
    items: [],
    weather: { current: { condition: '', emoji: '', temperature: 0, description: '' }, forecast: [] },
    playerStats: {
      day: 1,
      health: 100,
      stamina: 100,
      morale: 50,
      experience: 0,
      level: 1,
      skills: [],
      equipment: {},
      resources: { food: 10, water: 10, medicine: 5, ammo: 15 }
    },
    explorationEvents: [],
    factionEvents: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setGameData(prev => ({ ...prev, isLoading: true, error: null }));

        // Load all data in parallel
        const [
          factionsRes,
          npcsRes,
          itemsRes,
          weatherRes,
          statsRes,
          explorationEventsRes,
          factionEventsRes
        ] = await Promise.all([
          fetch('/api/factions'),
          fetch('/api/npcs'),
          fetch('/api/items'),
          fetch('/api/weather'),
          fetch('/api/stats'),
          fetch('/api/events?type=exploration'),
          fetch('/api/events?type=faction')
        ]);

        // Parse responses
        const factionsData = await factionsRes.json();
        const npcsData = await npcsRes.json();
        const itemsData = await itemsRes.json();
        const weatherData = await weatherRes.json();
        const statsData = await statsRes.json();
        const explorationEventsData = await explorationEventsRes.json();
        const factionEventsData = await factionEventsRes.json();

        setGameData(prev => ({
          ...prev,
          factions: factionsData.factions || [],
          npcs: npcsData.npcs || [],
          items: itemsData.items || [],
          weather: weatherData,
          playerStats: statsData,
          explorationEvents: explorationEventsData.exploration_events || [],
          factionEvents: factionEventsData.faction_events || [],
          isLoading: false
        }));

      } catch (error) {
        console.error('Error loading game data:', error);
        setGameData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load game data'
        }));
      }
    };

    loadGameData();
  }, []);

  return gameData;
}

// Helper functions for working with AI-generated content
export function getFactionByName(factions: Faction[], name: string): Faction | undefined {
  return factions.find(faction => faction.name === name);
}

export function getNPCsByFaction(npcs: NPC[], factionId: string): NPC[] {
  return npcs.filter(npc => npc.faction_id === factionId);
}

export function getItemsByCategory(items: LootItem[], category: string): LootItem[] {
  return items.filter(item => item.category === category);
}

export function getItemsByRarity(items: LootItem[], rarity: string): LootItem[] {
  return items.filter(item => item.rarity === rarity);
}

export function getRandomEvent(events: ExplorationEvent[] | FactionEvent[]): ExplorationEvent | FactionEvent | null {
  if (events.length === 0) return null;
  
  // Use weighted selection based on event weights
  const totalWeight = events.reduce((sum, event) => sum + event.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const event of events) {
    random -= event.weight;
    if (random <= 0) {
      return event;
    }
  }
  
  return events[0]; // Fallback
}

export function checkEventTriggers(event: ExplorationEvent | FactionEvent, gameState: any): boolean {
  const triggers = event.triggers;
  
  // Check minimum day requirement
  if (triggers.min_day && gameState.day < triggers.min_day) {
    return false;
  }
  
  // Check maximum day requirement
  if (triggers.max_day && gameState.day > triggers.max_day) {
    return false;
  }
  
  // Check weather conditions
  if (triggers.weather_conditions && triggers.weather_conditions !== 'any') {
    const currentWeather = gameState.weather?.current?.condition;
    if (Array.isArray(triggers.weather_conditions)) {
      if (!triggers.weather_conditions.includes(currentWeather)) {
        return false;
      }
    } else if (triggers.weather_conditions !== currentWeather) {
      return false;
    }
  }
  
  // Check faction relations
  if (triggers.faction_relations) {
    // Add faction relation checks here based on game state
  }
  
  return true;
} 