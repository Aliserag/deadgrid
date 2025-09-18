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
      "health": "180-220",
      "damage": "25-40",
      "speed": "fast",
      "behavior": "stalker",
      "abilities": [
          "EMP Burst (disables electronics in a 10m radius)",
          "Target Lock (increased accuracy and damage on marked targets)",
          "Self-Repair (regenerates 2 HP per second when not in combat)"
      ],
      "loot": [
          "Scrap Metal",
          "Energy Cell",
          "Damaged Circuit Board",
          "Rusted Bolts"
      ],
      "description": "A quadrupedal robotic unit with a corroded metal frame and exposed wiring. Its single red photoreceptor scans erratically, and its movements are accompanied by the whir of strained servos and the clank of loose components. Originally a pre-war security drone, it now prowls ruined urban zones, hunting anything with a power signature."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1758193214182;
  
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
