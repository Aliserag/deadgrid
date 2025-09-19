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
      "health": "120-180 HP",
      "damage": "25-40 per bite",
      "speed": "fast",
      "behavior": "stalker",
      "abilities": [
          "EMP Burst (disables electronics in 10m radius)",
          "Overcharge Lunge (double damage on next attack)",
          "Target Lock (ignores stealth and cover)"
      ],
      "loot": [
          "Scrap Metal",
          "Energy Cell",
          "Damaged Circuitry",
          "Rare: Hound's Targeting Chip"
      ],
      "description": "A quadrupedal robotic hunter with rusted titanium plating and exposed wiring. Its single red photoreceptor scans erratically, and hydraulic joints emit a low hiss when moving. Jagged metal teeth line its crushing jaw assembly, and sparks occasionally leap from damaged panels along its spine."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1758159612653;
  
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
