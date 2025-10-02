/**
 * enemy: Glitch-Walker
 */

import { GameModule } from '../../../core/GameModule';

export interface GlitchWalkerData {
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

export class GlitchWalkerModule extends GameModule {
  static readonly metadata: GlitchWalkerData = {
      "name": "Glitch-Walker",
      "type": "machine",
      "tier": 3,
      "health": {
          "min": 180,
          "max": 220
      },
      "damage": {
          "min": 25,
          "max": 40
      },
      "speed": "normal",
      "behavior": "stalker",
      "abilities": [
          "EMP Burst: Disables electronic equipment within 15 meters for 10 seconds",
          "Target Lock: Marks a player, increasing damage taken by 25% for 15 seconds",
          "Self-Repair: Regenerates 2% health per second when not in combat for 5 seconds"
      ],
      "loot": [
          "Scrap Metal (3-5)",
          "Circuit Boards (1-3)",
          "Power Cell (1, 25% chance)",
          "Broken Targeting Module (1, 10% chance)"
      ],
      "description": "A corrupted pre-war security automaton that moves with unsettling, jerky motions. Its metallic frame is rusted and scarred from decades of exposure, with flickering red optic sensors that glow ominously in the dark. Wires dangle from its joints, sparking occasionally, and its movements are accompanied by the whirring of strained servos and distorted audio fragments of its original programming."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1759367881294;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(GlitchWalkerModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered enemy: Glitch-Walker`);
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

export default GlitchWalkerModule;
