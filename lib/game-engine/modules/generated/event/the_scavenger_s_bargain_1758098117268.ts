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
      "trigger_condition": "Player enters an abandoned market district during daylight hours",
      "description": "A hunched figure emerges from behind a collapsed storefront, clutching a makeshift bag. They offer to trade rare supplies for a favor—retrieving a family heirloom from a nearby infested building.",
      "choices": [
          {
              "option": "Accept the trade",
              "consequence": "Gain +1 Rare Item, but lose -15 Health from radiation exposure in the infested building"
          },
          {
              "option": "Demand immediate payment",
              "consequence": "50% chance to gain +1 Uncommon Item; 50% chance the scavenger flees and you gain nothing"
          },
          {
              "option": "Refuse and move on",
              "consequence": "No gains or losses, but the scavenger mutters a curse—future trades in this area may be more expensive"
          }
      ],
      "rarity": "uncommon",
      "duration": "10 minutes (in-game time)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1758098117270;
  
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
