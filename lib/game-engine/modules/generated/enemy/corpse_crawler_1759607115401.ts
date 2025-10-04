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
          "Acid Spit - Projectile that deals damage over time and weakens armor",
          "Corpse Mimicry - Can play dead to lure in curious survivors"
      ],
      "loot": [
          "Mutated Gland (crafting component)",
          "Acid Sac (alchemical ingredient)",
          "Tattered Scavenger Gear",
          "Rotten Meat",
          "Occasional low-tier weapon"
      ],
      "description": "A humanoid mutant that moves with an unnerving crawl, its limbs elongated and joints reversed. Pale, hairless skin stretches tight over a bony frame, with patches of weeping sores that drip corrosive fluid. Its mouth opens far wider than humanly possible, revealing multiple rows of needle-like teeth and a secondary, tube-like tongue used for spitting acid. Often found lurking near old graveyards or mass burial sites, where it uses its burrowing ability to surprise unwary travelers."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1759607115401;
  
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
