/**
 * enemy: Rust-Stalker
 */

import { GameModule } from '../../../core/GameModule';

export interface RustStalkerData {
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

export class RustStalkerModule extends GameModule {
  static readonly metadata: RustStalkerData = {
      "name": "Rust-Stalker",
      "type": "machine",
      "tier": 3,
      "health": "120-160",
      "damage": "25-40",
      "speed": "fast",
      "behavior": "stalker",
      "abilities": [
          "Electro-Lash Whip",
          "Stealth Cloaking",
          "Overcharge Burst"
      ],
      "loot": [
          "Scrap Metal",
          "Energy Cell",
          "Rusted Processor",
          "Worn Servos"
      ],
      "description": "A pre-war security automaton repurposed by scavengers, now roaming the wastes autonomously. It stands 7 feet tall with a rust-pitted metallic frame, multiple red optical sensors, and a retractable electro-lash whip extending from its right arm. Moves with unnerving silence despite its size, often concealing itself in shadows or debris before striking."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1757373013335;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(RustStalkerModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered enemy: Rust-Stalker`);
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

export default RustStalkerModule;
