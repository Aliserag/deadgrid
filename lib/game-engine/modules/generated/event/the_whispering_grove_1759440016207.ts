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
      "trigger_condition": "When traveling through a forest region at night with high radiation levels",
      "description": "You stumble upon a grove where the trees glow with an eerie blue luminescence. The air hums with energy, and strange, whispering voices seem to emanate from the twisted trunks. Strange, bioluminescent fungi grow in intricate patterns across the ground, pulsating in rhythm with the whispers.",
      "choices": [
          {
              "option": "Investigate the glowing fungi",
              "consequence": "Gain 3 units of Glowing Spores (rare crafting material), but suffer -15% health from radiation exposure"
          },
          {
              "option": "Attempt to communicate with the whispers",
              "consequence": "Learn a fragment of pre-collapse knowledge (+1 Intelligence permanently), but risk temporary insanity (-20% sanity)"
          },
          {
              "option": "Harvest the luminescent bark from the trees",
              "consequence": "Obtain 5 units of Glowing Wood (uncommon building material), angering the grove spirits (-25 reputation with Forest Faction)"
          },
          {
              "option": "Leave immediately and avoid the area",
              "consequence": "No immediate gains or losses, but miss potential rewards"
          }
      ],
      "rarity": "rare",
      "duration": "Single encounter (immediate consequences)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1759440016209;
  
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
