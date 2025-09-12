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
      "health": "120-180",
      "damage": "25-40",
      "speed": "normal",
      "behavior": "stalker",
      "abilities": [
          "EMP Burst (disables electronics in 10m radius)",
          "Target Lock (increased accuracy on next attack)",
          "Self-Repair (regains 10 HP if not damaged for 5s)"
      ],
      "loot": [
          "Scrap Metal",
          "Energy Cell",
          "Damaged Circuit Board",
          "Rusted Bolts"
      ],
      "description": "A pre-war security drone, now corroded and malfunctioning. Its once-sleek chrome frame is pitted with rust and scorch marks, with one optical sensor flickering erratically. Moves with jerky, uneven motions, emitting a low hum interspersed with static bursts. Often found lurking in shadows of ruined buildings before engaging."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1757647514037;
  
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
