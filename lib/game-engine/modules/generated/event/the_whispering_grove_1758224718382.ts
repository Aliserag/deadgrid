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
      "trigger_condition": "Player enters a forest biome at night",
      "description": "A faint, melodic hum fills the air as you notice the trees around you subtly shifting. Their bark glows with a soft, phosphorescent light, and ghostly whispers seem to emanate from the leaves. The grove feels both inviting and unnerving, as if it holds ancient secrets and forgotten dangers.",
      "choices": [
          {
              "option": "Investigate the source of the whispers",
              "consequence": "Gain +1 Wisdom but suffer -5 Sanity as you uncover haunting memories of the past"
          },
          {
              "option": "Collect glowing bark samples",
              "consequence": "Gain 3 Bioluminescent Resources (crafting material) but attract a hostile mutated creature"
          },
          {
              "option": "Leave the grove immediately",
              "consequence": "Lose nothing, but miss potential rewards and clues about the area's history"
          },
          {
              "option": "Attempt to communicate with the whispers",
              "consequence": "50% chance to gain a temporary ally (forest spirit) or trigger a hallucination trap (-10 Sanity)"
          }
      ],
      "rarity": "uncommon",
      "duration": "Until dawn or until the player leaves the grove"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1758224718382;
  
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
