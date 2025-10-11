/**
 * event: The Whispering Grove
 */

import { GameModule } from '../../../core/GameModule';

export interface TheWhisperingGroveData {
  title: string;
  trigger_condition: string;
  description: string;
  choices: any[];
  rarity: string;
  duration: string;
}

export class TheWhisperingGroveModule extends GameModule {
  static readonly metadata: TheWhisperingGroveData = {
      "title": "The Whispering Grove",
      "trigger_condition": "When the player explores a forest area during a full moon night",
      "description": "You stumble upon an eerie grove where the trees seem to whisper in a language just beyond comprehension. Strange, bioluminescent fungi pulse with soft light, and the air hums with ancient energy. At the center stands a petrified tree with glowing runes carved into its bark.",
      "choices": [
          {
              "option": "Listen carefully to the whispers",
              "consequence": "Gain temporary ability to detect hidden dangers in forest areas for 3 days, but suffer -10% sanity"
          },
          {
              "option": "Harvest the glowing fungi",
              "consequence": "Obtain 3 Rare Medicinal Mushrooms (can cure radiation sickness), but the grove becomes hostile and attacks with psychic damage"
          },
          {
              "option": "Study the runes on the petrified tree",
              "consequence": "Learn an ancient survival technique (+5% to all crafting skills permanently), but attract the attention of a mysterious watcher who may appear later"
          },
          {
              "option": "Leave immediately and mark the location",
              "consequence": "Avoid immediate danger and can return later with proper preparation, but the grove may not be there when you return"
          }
      ],
      "rarity": "rare",
      "duration": "Until dawn (approximately 6 hours in-game time)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1760153117402;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheWhisperingGroveModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered event: The Whispering Grove`);
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

export default TheWhisperingGroveModule;
