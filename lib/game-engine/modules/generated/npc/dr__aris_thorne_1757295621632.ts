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
          "Obsessive",
          "Secretly Hopeful"
      ],
      "faction": "The Greenthumb Collective",
      "dialogue_style": "Precise and academic, with occasional slips into emotional intensity when discussing plants",
      "inventory": [
          "Modified Seed Packets (Radiation-resistant)",
          "Hand-crank DNA Sequencer",
          "Botany Journal with Mutated Plant Sketches",
          "Improvised Plant Growth Serum",
          "Worn Lab Coat (patched multiple times)",
          "Water Purification Tablets"
      ],
      "quests": [
          {
              "name": "Seeds of Tomorrow",
              "description": "Recover rare pre-war plant specimens from an abandoned agricultural research facility",
              "reward": "Radiation-resistant crop seeds and temporary shelter"
          },
          {
              "name": "The Blighted Bloom",
              "description": "Investigate a strangely mutated plant that seems to be purifying soil radiation",
              "reward": "Permanent access to The Greenthumb Collective's safehouse network"
          }
      ],
      "backstory": "Dr. Thorne was working on radiation-resistant crops when the bombs fell. She survived in her sealed laboratory for months before emerging to find the world changed. She founded The Greenthumb Collective with other survivors who believe that restoring plant life is key to humanity's survival. Her work has led to several stable mutant crop varieties, though she keeps her most promising discoveries secret until she can ensure they won't be weaponized."
  };
  
  static readonly type = 'npc';
  static readonly version = '1.0.0';
  static readonly generated = 1757295621634;
  
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
