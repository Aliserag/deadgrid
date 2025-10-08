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
          "Burrow Ambush - Can quickly dig underground and emerge near prey",
          "Acidic Spit - Ranged attack that deals damage over time",
          "Corpse Mimicry - Remains perfectly still, appearing as a dead body until prey approaches"
      ],
      "loot": [
          "Mutated Gland",
          "Acidic Sac",
          "Tattered Hide",
          "Scrap Metal"
      ],
      "description": "A humanoid mutant with pale, mottled skin that blends with the wasteland. Its limbs are elongated and jointed in unnatural ways, allowing it to crawl with disturbing fluidity. The mouth splits vertically to reveal multiple rows of needle-like teeth, and its eyes are milky white and sunken. It moves with a hunched, skittering gait when not using its burrowing ability."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1759943713643;
  
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
