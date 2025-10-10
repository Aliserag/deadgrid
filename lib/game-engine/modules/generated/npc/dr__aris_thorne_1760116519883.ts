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
      "occupation": "University Linguistics Professor",
      "personality": [
          "Analytical",
          "Cautious",
          "Curious",
          "Methodical",
          "Patient"
      ],
      "faction": "Archivists of the Fallen World",
      "dialogue_style": "Precise and academic, with frequent references to pre-collapse literature and careful word choice",
      "inventory": [
          "Leather-bound journal filled with linguistic notes",
          "Fountain pen with homemade ink",
          "Pocket multilingual dictionary",
          "Hand-crank radio receiver",
          "Water filtration straw",
          "Dried rations (3 days worth)",
          "Tarnished silver pocket watch"
      ],
      "quests": [
          {
              "name": "Voices of the Ruins",
              "description": "Recover audio recordings from the old university library to preserve pre-collapse languages and dialects",
              "reward": "Language primer book + reputation with Archivists"
          },
          {
              "name": "The Last Broadcast",
              "description": "Investigate rumors of a repeating emergency broadcast in an unknown language from a military installation",
              "reward": "Encrypted radio frequencies + advanced communication equipment"
          },
          {
              "name": "Linguistic Contamination",
              "description": "Track down and document the spread of a new post-apocalyptic dialect emerging among raider groups",
              "reward": "Raider language translation key + unique trading opportunities"
          }
      ],
      "backstory": "Dr. Thorne was giving a lecture on dead languages when the collapse began. He survived the initial chaos by barricading himself in the university's rare books collection. For years, he meticulously documented the linguistic shifts occurring in the new world, eventually joining the Archivists to preserve knowledge. He believes understanding how language evolves post-collapse is key to rebuilding civilization. His wife and children were visiting family in another city when everything fell apart - he still searches for any record of their fate."
  };
  
  static readonly type = 'npc';
  static readonly version = '1.0.0';
  static readonly generated = 1760116519883;
  
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
