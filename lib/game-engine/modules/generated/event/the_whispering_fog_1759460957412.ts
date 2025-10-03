/**
 * event: The Whispering Fog
 */

import { GameModule } from '../../../core/GameModule';

export interface TheWhisperingFogData {
  title: string;
  trigger_condition: string;
  description: string;
  choices: any[];
  rarity: string;
  duration: string;
}

export class TheWhisperingFogModule extends GameModule {
  static readonly metadata: TheWhisperingFogData = {
      "title": "The Whispering Fog",
      "trigger_condition": "When traveling through marshlands at dawn with low sanity",
      "description": "An unnaturally thick, pale green fog rolls across the wetlands. Strange, whispering voices echo through the mist, seeming to call your name. The air grows cold, and ghostly shapes flicker at the edge of your vision. Your compass spins wildly, and familiar landmarks seem to shift positions.",
      "choices": [
          {
              "option": "Follow the whispers deeper into the fog",
              "consequence": "Gain temporary supernatural insight (+15% to perception checks for 24 hours) but lose 30 sanity and risk encountering hostile spectral entities"
          },
          {
              "option": "Build a protective circle and wait it out",
              "consequence": "Lose 6 hours of travel time and consume resources, but maintain current sanity and avoid direct danger"
          },
          {
              "option": "Use flares to burn away the mist",
              "consequence": "Immediately dispels the fog but consumes 3 flare resources and attracts attention from nearby creatures due to the bright light"
          },
          {
              "option": "Cover ears and navigate by touch alone",
              "consequence": "Successfully navigate through with minimal sanity loss (-10) but risk stumbling into environmental hazards like sinkholes or contaminated water"
          }
      ],
      "rarity": "uncommon",
      "duration": "4-8 hours or until resolved"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1759460957414;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheWhisperingFogModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered event: The Whispering Fog`);
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

export default TheWhisperingFogModule;
