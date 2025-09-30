/**
 * enemy: Corpse-Crawler
 */

import { GameModule } from '../../../core/GameModule';

export interface CorpseCrawlerData {
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

export class CorpseCrawlerModule extends GameModule {
  static readonly metadata: CorpseCrawlerData = {
      "name": "Corpse-Crawler",
      "type": "mutant",
      "tier": 2,
      "health": {
          "min": 80,
          "max": 120
      },
      "damage": {
          "min": 15,
          "max": 25
      },
      "speed": "normal",
      "behavior": "stalker",
      "abilities": [
          "Burrow Ambush - Can briefly tunnel underground and emerge near prey",
          "Acidic Spit - Ranged attack that deals damage over time",
          "Corpse Mimicry - Can play dead to lure in curious survivors"
      ],
      "loot": [
          "Mutated Glands (crafting component)",
          "Acid Sacs (alchemy ingredient)",
          "Tattered Scraps",
          "Small Medkit (rare)"
      ],
      "description": "A humanoid creature that moves on all fours with disturbing grace. Its pale, hairless skin is stretched taut over an emaciated frame, and its limbs are elongated with claw-like digits. The most unsettling feature is its jaw - unhinged and filled with needle-like teeth, capable of distending to unnatural proportions. They emit low, guttural clicking sounds when hunting and often drag their bellies along the ground, leaving faint trails in the dust."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1759223717012;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(CorpseCrawlerModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered enemy: Corpse-Crawler`);
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

export default CorpseCrawlerModule;
