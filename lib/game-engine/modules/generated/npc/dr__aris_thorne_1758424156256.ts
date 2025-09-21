/**
 * npc: Dr. Aris Thorne
 */

import { GameModule } from '../../../core/GameModule';

export interface Dr.ArisThorneData {
  name: string;
  occupation: string;
  personality: any[];
  faction: string;
  dialogue_style: string;
  inventory: any[];
  quests: any[];
  backstory: string;
}

export class Dr.ArisThorneModule extends GameModule {
  static readonly metadata: Dr.ArisThorneData = {
      "name": "Dr. Aris Thorne",
      "occupation": "Botanist",
      "personality": [
          "Analytical",
          "Cautious",
          "Idealistic",
          "Obsessive"
      ],
      "faction": "The Greenthumb Collective",
      "dialogue_style": "Precise and academic, with occasional bursts of enthusiasm when discussing plants",
      "inventory": [
          "Seed preservation kit",
          "Botany journal",
          "Improvised plant extracts",
          "Worn leather satchel",
          "Water filtration straw"
      ],
      "quests": [
          {
              "name": "Seeds of Hope",
              "description": "Recover rare pre-collapse seeds from an abandoned agricultural research facility"
          },
          {
              "name": "Toxic Bloom",
              "description": "Investigate and collect samples from mutated flora in the contaminated zones"
          }
      ],
      "backstory": "Dr. Thorne was conducting research on drought-resistant crops when the collapse occurred. She survived by bartering her knowledge of edible and medicinal plants, eventually forming the Greenthumb Collective - a group dedicated to preserving botanical knowledge and rebuilding sustainable agriculture."
  };
  
  static readonly type = 'npc';
  static readonly version = '1.0.0';
  static readonly generated = 1758424156257;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(Dr.ArisThorneModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered npc: Dr. Aris Thorne`);
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

export default Dr.ArisThorneModule;
