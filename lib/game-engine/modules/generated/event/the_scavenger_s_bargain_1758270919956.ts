/**
 * event: The Scavenger's Bargain
 */

import { GameModule } from '../../../core/GameModule';

export interface TheScavengerSBargainData {
  title: string;
  trigger_condition: string;
  description: string;
  choices: any[];
  rarity: string;
  duration: string;
}

export class TheScavengerSBargainModule extends GameModule {
  static readonly metadata: TheScavengerSBargainData = {
      "title": "The Scavenger's Bargain",
      "trigger_condition": "Player enters an abandoned market district with less than 3 days of food supplies",
      "description": "A gaunt figure emerges from behind a collapsed stall, holding a rusted but functional can opener. They offer to trade it for half your current food, claiming it's the last one in the district.",
      "choices": [
          {
              "option": "Accept the trade",
              "consequence": "Lose 50% of current food supplies. Gain 'Reliable Can Opener' item (permanently removes penalty for consuming canned food)."
          },
          {
              "option": "Refuse and threaten them",
              "consequence": "Small chance to gain can opener through intimidation (15% success). If failed, lose 10% health from a scuffle and the scavenger flees."
          },
          {
              "option": "Offer to share a meal and talk",
              "consequence": "Lose 1 day of food. 50% chance to gain temporary follower (Scavenger) who helps with looting for 3 days. 50% chance they steal extra supplies and leave."
          }
      ],
      "rarity": "uncommon",
      "duration": "5 minutes (real-time) to make decision before event expires"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1758270919957;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheScavengerSBargainModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered event: The Scavenger's Bargain`);
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

export default TheScavengerSBargainModule;
