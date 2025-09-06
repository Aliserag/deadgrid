/**
 * event: The Glimmering Hive
 */

import { GameModule } from '../../../core/GameModule';

export interface TheGlimmeringHiveData {
  title: string;
  trigger_condition: string;
  description: string;
  choices: any[];
  rarity: string;
  duration: string;
}

export class TheGlimmeringHiveModule extends GameModule {
  static readonly metadata: TheGlimmeringHiveData = {
      "title": "The Glimmering Hive",
      "trigger_condition": "Player enters an abandoned industrial zone at night",
      "description": "A faint, pulsating blue glow emanates from a collapsed factory. Inside, a hive of mutated bioluminescent insects has made its home, their light revealing scattered pre-war machinery and supplies—but the buzzing grows louder as you approach.",
      "choices": [
          {
              "option": "Harvest the glow-sacs quietly",
              "consequence": "Gain 3 Biolight Pods (usable as light sources), but risk 25% chance of alerting the hive and taking minor poison damage."
          },
          {
              "option": "Lure a Scavenger Mongrel into the hive as distraction",
              "consequence": "Lose 1 Raw Meat bait, but safely loot 2 Random Electronic Components and 1 Energy Cell with no combat."
          },
          {
              "option": "Set the hive ablaze with makeshift fuel",
              "consequence": "Gain 5 Insect Chitin (crafting material) and clear the area permanently, but destroy all other loot and draw attention from nearby hostile creatures."
          },
          {
              "option": "Leave immediately and seal the entrance",
              "consequence": "Avoid all risk, but gain nothing. Area remains inaccessible for 7 days."
          }
      ],
      "rarity": "uncommon",
      "duration": "Until dawn (in-game 8 hours) or until player resolves the event"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1757128160952;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheGlimmeringHiveModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered event: The Glimmering Hive`);
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

export default TheGlimmeringHiveModule;
