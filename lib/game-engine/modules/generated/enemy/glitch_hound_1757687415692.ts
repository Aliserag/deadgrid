/**
 * enemy: Glitch-Hound
 */

import { GameModule } from '../../../core/GameModule';

export interface GlitchHoundData {
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

export class GlitchHoundModule extends GameModule {
  static readonly metadata: GlitchHoundData = {
      "name": "Glitch-Hound",
      "type": "machine",
      "tier": 3,
      "health": "120-180",
      "damage": "25-40",
      "speed": "fast",
      "behavior": "stalker",
      "abilities": [
          "EMP Burst (disables electronics in 10m radius)",
          "Target Lock (increased accuracy on next attack)",
          "Self-Repair (regains 20 HP if not interrupted)"
      ],
      "loot": [
          "Scrap Metal",
          "Energy Cell",
          "Broken Circuitry",
          "Rusted Bolts"
      ],
      "description": "A quadrupedal robotic unit with rusted titanium plating and exposed wiring. Its single red optic sensor glows ominously as it tracks prey. Moves with unnerving silence except for the occasional whir of servos and spark of malfunctioning components."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1757687415693;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(GlitchHoundModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered enemy: Glitch-Hound`);
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

export default GlitchHoundModule;
