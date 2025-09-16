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
      "occupation": "Botanist and Geneticist",
      "personality": [
          "Analytical",
          "Cautious",
          "Idealistic",
          "Obsessive",
          "Secretive"
      ],
      "faction": "The Greenthumb Collective",
      "dialogue_style": "Precise and academic, with occasional bursts of passion when discussing plants or genetics. Tends to use technical terms even when simpler words would suffice.",
      "inventory": [
          "Seed preservation kit",
          "Hybrid plant samples",
          "Water filtration tablets",
          "Journal with coded notes",
          "Worn lab coat",
          "Botany field guide"
      ],
      "quests": [
          {
              "name": "Seeds of Hope",
              "description": "Retrieve rare pre-apocalypse seeds from an abandoned agricultural research station overrun by mutated flora."
          },
          {
              "name": "The Blight Sample",
              "description": "Collect samples of a mysterious plant disease affecting safe zones; dangerous but critical for research."
          }
      ],
      "backstory": "Before the collapse, Dr. Thorne worked on developing drought-resistant crops. When society fell, he used his knowledge to help found the Greenthumb Collective—a group dedicated to preserving botanical knowledge and creating sustainable food sources. He carries guilt over a failed experiment that may have contributed to one of the more aggressive mutated plant species now roaming the wastes."
  };
  
  static readonly type = 'npc';
  static readonly version = '1.0.0';
  static readonly generated = 1757742619954;
  
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
