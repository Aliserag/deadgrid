/**
 * event: The Scavenger's Bargain
 */

import { GameModule } from '../../../core/GameModule';

export interface TheScavenger'SBargainData {
  title: string;
  trigger_condition: string;
  description: string;
  choices: any[];
  rarity: string;
  duration: string;
}

export class TheScavenger'SBargainModule extends GameModule {
  static readonly metadata: TheScavenger'SBargainData = {
      "title": "The Scavenger's Bargain",
      "trigger_condition": "Player enters an abandoned market district with less than 3 days of food supplies",
      "description": "A gaunt figure emerges from behind a collapsed storefront, holding up a surprisingly intact canned good. 'Trade?' they rasp, eyeing your gear suspiciously. They seem to have a small stash of supplies hidden nearby, but their nervous glances suggest they might not be working alone.",
      "choices": [
          {
              "option": "Trade spare ammunition for their food",
              "consequence": "Lose 5 rounds of ammunition, gain 3 days of food. The scavenger disappears into the ruins without incident."
          },
          {
              "option": "Attempt to intimidate them into giving up their stash",
              "consequence": "50% chance: Gain 5 days of food and medical supplies. 50% chance: Trigger ambush by scavenger's allies, losing health and 1 random item."
          },
          {
              "option": "Share your own meager supplies to gain their trust",
              "consequence": "Lose 1 day of food, gain temporary follower who provides +10% scavenging success for 3 days before moving on"
          },
          {
              "option": "Ignore them and leave immediately",
              "consequence": "No gains or losses, but area becomes marked as 'hostile territory' reducing future scavenging yields here"
          }
      ],
      "rarity": "uncommon",
      "duration": "Instant resolution (choice-dependent consequences may persist)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1757447121223;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheScavenger'SBargainModule.metadata);
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

export default TheScavenger'SBargainModule;
