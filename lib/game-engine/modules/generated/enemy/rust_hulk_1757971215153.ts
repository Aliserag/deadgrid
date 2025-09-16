/**
 * enemy: Rust-Hulk
 */

import { GameModule } from '../../../core/GameModule';

export interface RustHulkData {
  name: string;
  type: string;
  tier: number;
  health: string;
  damage: string;
  speed: string;
  behavior: string;
  abilities: any[];
  loot: any[];
  description: string;
}

export class RustHulkModule extends GameModule {
  static readonly metadata: RustHulkData = {
      "name": "Rust-Hulk",
      "type": "machine",
      "tier": 4,
      "health": "350-450",
      "damage": "40-60",
      "speed": "slow",
      "behavior": "aggressive",
      "abilities": [
          "Magnetic Crush",
          "Scrap Cannon",
          "Overload Pulse"
      ],
      "loot": [
          "Scrap Metal x10",
          "Rusted Circuitry x5",
          "Energy Core (rare)",
          "High-Grade Bolts x3"
      ],
      "description": "A towering, rust-covered automaton standing over 8 feet tall, assembled from scavenged industrial parts, vehicle frames, and broken machinery. Its movements are heavy and deliberate, accompanied by the grinding of metal and sporadic sparks from exposed wiring. Glowing red photoreceptors scan the environment from within a welded helmet-like head."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1757971215177;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(RustHulkModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered enemy: Rust-Hulk`);
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

export default RustHulkModule;
