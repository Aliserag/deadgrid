/**
 * npc: Dr Aris Thorne
 */

import { GameModule } from '../../../core/GameModule';

export interface DrArisThorneData {
  name: string;
  occupation: string;
  personality: any[];
  faction: string;
  dialogue_style: string;
  inventory: any[];
  quests: any[];
  backstory: any;
}

export class DrArisThorneModule extends GameModule {
  static readonly metadata: DrArisThorneData = {
      "name": "Dr. Aris Thorne",
      "occupation": "Botanist",
      "personality": [
          "Analytical",
          "Cautious",
          "Idealistic",
          "Obsessive"
      ],
      "faction": "The Greenhouse Collective",
      "dialogue_style": "Precise and academic, with occasional bursts of excitement when discussing plants",
      "inventory": [
          "Seed preservation kit",
          "Botany journal",
          "Improvised herbal remedies",
          "Water filtration straw",
          "Weathered lab coat"
      ],
      "quests": [
          {
              "name": "Pollen from the Ashes",
              "description": "Retrieve rare mutated plant samples from the irradiated Red Zone for research"
          },
          {
              "name": "Thirsty Roots",
              "description": "Establish a clean water irrigation system for the greenhouse without attracting raiders"
          }
      ],
      "backstory": "Dr. Thorne was conducting agricultural research when the collapse occurred. Using his knowledge, he secured a university greenhouse and now leads a group of survivors trying to develop sustainable food sources and counteract environmental mutations. He believes botanical science holds the key to humanity's survival."
  };
  
  static readonly type = 'npc';
  static readonly version = '1.0.0';
  static readonly generated = 1758064216535;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(DrArisThorneModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered npc: Dr Aris Thorne`);
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

export default DrArisThorneModule;
