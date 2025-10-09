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
      "trigger_condition": "When traveling through forest regions at night with low sanity",
      "description": "As you push through the dense undergrowth, the forest suddenly falls silent. The normal night sounds vanish, replaced by faint, melodic whispers that seem to emanate from the trees themselves. Strange, bioluminescent fungi pulse with soft light, illuminating a clearing where the whispers grow clearer. The trees appear to be subtly shifting, their branches reaching out like beckoning hands.",
      "choices": [
          {
              "option": "Follow the whispers deeper into the grove",
              "consequence": "Gain temporary sanity boost and discover rare medicinal herbs, but risk encountering the grove's guardian spirit"
          },
          {
              "option": "Harvest the glowing fungi quickly and retreat",
              "consequence": "Obtain valuable crafting materials for light sources, but suffer minor sanity loss from the grove's displeasure"
          },
          {
              "option": "Mark the location and leave immediately",
              "consequence": "Avoid immediate danger and can return later with proper preparation, but miss current opportunities"
          },
          {
              "option": "Attempt to communicate with the whispers",
              "consequence": "Chance to learn ancient survival knowledge or gain permanent stat boost, but high risk of severe sanity damage if failed"
          }
      ],
      "rarity": "rare",
      "duration": "Until dawn or until player leaves the area"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1759980316409;
  
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
