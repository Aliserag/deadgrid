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
      "trigger_condition": "When the player enters a forest biome during a full moon night",
      "description": "You stumble upon an ancient grove where the trees seem to whisper in an unknown language. Strange, bioluminescent fungi pulse with soft light, casting eerie shadows. In the center stands a petrified tree with glowing runes carved into its bark, and the air hums with ancient energy.",
      "choices": [
          {
              "option": "Investigate the petrified tree",
              "consequence": "Gain +1 Intelligence and learn an ancient survival technique, but attract the attention of spectral guardians who will hunt you for the next 3 days"
          },
          {
              "option": "Harvest the glowing fungi",
              "consequence": "Collect 5 Bioluminescent Spores (valuable crafting material), but the grove's magic fades permanently, reducing future rare encounters in this area by 50%"
          },
          {
              "option": "Listen carefully to the whispers",
              "consequence": "Decipher a fragment of the ancient language, unlocking hidden lore and gaining temporary night vision for 24 hours, but suffer -1 Sanity from the disturbing revelations"
          },
          {
              "option": "Leave immediately",
              "consequence": "Avoid all risks, but the grove vanishes and cannot be found again, missing potential rewards"
          }
      ],
      "rarity": "rare",
      "duration": "Until dawn (approximately 8 hours in-game time)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1759425316582;
  
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
