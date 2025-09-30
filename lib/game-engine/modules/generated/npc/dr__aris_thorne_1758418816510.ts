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
      "occupation": "Botanical Geneticist",
      "personality": [
          "Analytical",
          "Cautious",
          "Idealistic",
          "Obsessive",
          "Secretive"
      ],
      "faction": "The Verdant Covenant",
      "dialogue_style": "Precise and academic, with occasional lapses into passionate monologues about plant biology",
      "inventory": [
          "Mutated seed samples",
          "Hand-crank DNA sequencer",
          "Botany journal with coded notes",
          "Improvised plant-based antitoxin",
          "Worn lab coat with protective patches"
      ],
      "quests": [
          {
              "name": "Seeds of Salvation",
              "description": "Retrieve rare pre-war seeds from an overgrown agricultural research station"
          },
          {
              "name": "The Blight's Source",
              "description": "Investigate the mysterious plant disease affecting the Covenant's crops"
          }
      ],
      "backstory": "Before the collapse, Dr. Thorne worked on developing drought-resistant crops. When society fell, she used her knowledge to help found the Verdant Covenant - a group dedicated to restoring agriculture. She secretly experiments with mutated plants, believing they hold the key to humanity's survival, but keeps her most radical research hidden from her own faction."
  };
  
  static readonly type = 'npc';
  static readonly version = '1.0.0';
  static readonly generated = 1758418816511;
  
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
