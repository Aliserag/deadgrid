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
      "faction": "The Verdant Covenant",
      "dialogue_style": "Precise and academic, with occasional slips into fervent passion when discussing plant life or genetics",
      "inventory": [
          "Customized seed vault",
          "Hand-crank DNA sequencer",
          "Botany journal (heavily annotated)",
          "Hybrid plant samples",
          "Water filtration tablets",
          "Improvised plant-based toxin antidotes"
      ],
      "quests": [
          {
              "name": "Seeds of Salvation",
              "description": "Retrieve rare pre-war seeds from an overgrown agricultural research station overrun by mutated flora."
          },
          {
              "name": "The Blight's Source",
              "description": "Investigate a mysterious plant disease affecting the Covenant's crops and find a cure."
          },
          {
              "name": "Pollinator Protocol",
              "description": "Capture and return a rare species of mutated bee crucial for cross-pollination efforts."
          }
      ],
      "backstory": "Before the collapse, Dr. Thorne worked on developing drought-resistant crops for arid regions. When society fell, he used his knowledge to establish the Verdant Covenant—a group dedicated to restoring agriculture and combating mutated plant life. He believes that the key to humanity's survival lies not in scavenging the old world, but in cultivating a new one, though his methods sometimes border on reckless experimentation."
  };
  
  static readonly type = 'npc';
  static readonly version = '1.0.0';
  static readonly generated = 1757646558897;
  
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
