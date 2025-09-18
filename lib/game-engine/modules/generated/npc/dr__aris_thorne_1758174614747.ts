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
          "Obsessive",
          "Secretive"
      ],
      "faction": "The Verdant Guild",
      "dialogue_style": "Precise and academic, with occasional bursts of excitement when discussing plants",
      "inventory": [
          "Botany journal",
          "Seed pouch",
          "Crude plant extract still",
          "Worn machete",
          "5 dried ration bars"
      ],
      "quests": [
          {
              "name": "Seeds of Hope",
              "description": "Retrieve rare pre-war seeds from an overgrown research facility"
          },
          {
              "name": "Toxic Bloom",
              "description": "Investigate mutated flora that's poisoning the local water supply"
          }
      ],
      "backstory": "Dr. Thorne was studying plant mutations when the collapse occurred. Using his knowledge, he founded the Verdant Guild to preserve botanical knowledge and develop sustainable food sources. He carries guilt over experimental plants that escaped containment after the fall."
  };
  
  static readonly type = 'npc';
  static readonly version = '1.0.0';
  static readonly generated = 1758174614748;
  
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
