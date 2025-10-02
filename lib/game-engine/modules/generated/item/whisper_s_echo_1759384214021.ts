/**
 * item: Whisper's Echo
 */

import { GameModule } from '../../../core/GameModule';

export interface Whisper'SEchoData {
  name: string;
  category: string;
  rarity: string;
  weight: number;
  value: number;
  stats: string;
  description: string;
  special_effects: any[];
}

export class Whisper'SEchoModule extends GameModule {
  static readonly metadata: Whisper'SEchoData = {
      "name": "Whisper's Echo",
      "category": "weapon",
      "rarity": "epic",
      "weight": 1.2,
      "value": 850,
      "stats": {
          "damage": 45,
          "fire_rate": 2,
          "accuracy": 85,
          "durability": 120,
          "noise_level": 5
      },
      "description": "A custom-built suppressed sniper rifle from before the Fall. Originally crafted by a legendary assassin known only as 'Whisper,' this weapon was designed for eliminating high-value targets without alerting nearby infected. The barrel bears faint etchings of ghostly figures, and the stock shows signs of countless hours of careful maintenance. Found in an abandoned bunker deep in the Quarantine Zone, it seems to almost hum with silent purpose.",
      "special_effects": [
          "Silent Strikes: Kills with this weapon do not alert nearby enemies within 50 meters",
          "Ghost's Mark: Headshots against human targets have a 25% chance to instantly kill regardless of health",
          "Echo Location: Successful kills reveal all enemies within 30 meters of the target for 3 seconds",
          "Whisper's Legacy: While aiming, movement speed is reduced by 60% less than normal sniper rifles"
      ]
  };
  
  static readonly type = 'item';
  static readonly version = '1.0.0';
  static readonly generated = 1759384214023;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(Whisper'SEchoModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered item: Whisper's Echo`);
  }
  
  private getTargetSystem(engine: any): any {
    const systemMap: Record<string, string> = {
      'biome': 'world.biomeSystem',
      'event': 'systems.eventSystem',
      'item': 'systems.itemSystem',
      'enemy': 'entities.enemySystem',
      'quest': 'systems.questSystem',
      'npc': 'entities.npcSystem',
      'location': 'world.locationSystem',
      'mechanic': 'systems.mechanicSystem',
      'survivor_log': 'world.loreSystem'
    };
    
    const path = systemMap[this.constructor.name] || 'systems.contentSystem';
    return path.split('.').reduce((obj, key) => obj?.[key], engine);
  }
  
  async update(deltaTime: number): Promise<void> {
    // Module-specific update logic if needed
  }
  
  async cleanup(): Promise<void> {
    // Cleanup resources if needed
  }
}

export default Whisper'SEchoModule;
