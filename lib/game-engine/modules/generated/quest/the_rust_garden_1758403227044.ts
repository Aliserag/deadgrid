/**
 * quest: The Rust Garden
 */

import { GameModule } from '../../../core/GameModule';

export interface TheRustGardenData {
  id: string;
  title: string;
  giver: string;
  description: string;
  objectives: any[];
  rewards: any;
  prerequisites: any;
  dialogue: any;
}

export class TheRustGardenModule extends GameModule {
  static readonly metadata: TheRustGardenData = {
      "id": "quest_rust_garden",
      "title": "The Rust Garden",
      "giver": "Old Man Hemlock",
      "description": "Old Man Hemlock, one of the last surviving botanists from before the collapse, believes he's found a strain of pre-war corn that could grow in the contaminated soil. He needs samples from an abandoned agricultural research station overrun by mutated flora and fauna to confirm his theory and potentially provide a sustainable food source for the settlement.",
      "objectives": [
          "Travel to the Overgrown Research Station",
          "Retrieve 5 Genetic Samples from mutated plants",
          "Recover the Head Researcher's Data Log",
          "Clear the greenhouse of hostile flora",
          "Return to Old Man Hemlock with the samples"
      ],
      "rewards": {
          "experience": 750,
          "items": [
              "Purified Water x5",
              "Healing Salve x3"
          ],
          "reputation": "+25 with Settlement",
          "unlocks": "Access to Hemlock's Special Seeds"
      },
      "prerequisites": {
          "level": 5,
          "completed_quests": [
              "quest_water_purity"
          ],
          "faction_standing": "Neutral or higher with Settlement"
      },
      "dialogue": {
          "initial": "These hands have nurtured life for sixty years, but what's growing out there now... it's all wrong. The old research station might hold the key to proper crops again, if you're brave enough to face what's taken root there.",
          "accept": "You'll help? Good. Bring me samples from the mutated plants - carefully now - and any research data you can salvage. And watch for the Thornsprouts; they don't take kindly to visitors.",
          "decline": "I understand. It's not for everyone. Come back if you change your mind - hunger waits for no one.",
          "completion": "By the old world's science... these samples are perfect! With this data, we might actually grow something that won't poison us. You've given this settlement hope, wanderer. Take these supplies - you've earned them."
      }
  };
  
  static readonly type = 'quest';
  static readonly version = '1.0.0';
  static readonly generated = 1758403227046;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheRustGardenModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered quest: The Rust Garden`);
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

export default TheRustGardenModule;
