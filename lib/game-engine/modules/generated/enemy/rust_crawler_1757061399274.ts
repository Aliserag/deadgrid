/**
 * enemy: Rust-Crawler
 */

import { GameModule } from '../../../core/GameModule';

export interface RustCrawlerData {
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

export class RustCrawlerModule extends GameModule {
  static readonly metadata: RustCrawlerData = {
      "name": "Rust-Crawler",
      "type": "machine",
      "tier": 3,
      "health": "120-180",
      "damage": "25-40",
      "speed": "normal",
      "behavior": "stalker",
      "abilities": [
          "EMP Burst (disables electronics in 10m radius)",
          "Corrosive Spit (applies armor degradation)",
          "Self-Destruct Sequence (activates at 10% health)"
      ],
      "loot": [
          "Scrap Metal",
          "Energy Cell",
          "Corroded Circuitry",
          "Rare: Intact CPU"
      ],
      "description": "A spider-like autonomous security drone, roughly the size of a large dog, with rusted metal plating and exposed wiring. Its central optic sensor glows with a faint red light, and it moves with unnerving precision on six jointed legs. Often found lurking in shadowy corners of ruined facilities before initiating ambushes."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1757061399275;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(RustCrawlerModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered enemy: Rust-Crawler`);
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

export default RustCrawlerModule;
