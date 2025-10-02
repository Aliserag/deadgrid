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
      "trigger_condition": "Player enters an abandoned market district during daylight hours",
      "description": "A hunched figure emerges from a ruined storefront, clutching a burlap sack. They offer to trade rare supplies for a favor—retrieving a family heirloom from a nearby infested building.",
      "choices": [
          {
              "option": "Accept the trade",
              "consequence": "Gain +1 Rare Item, but suffer -15 Health from fighting creatures in the building"
          },
          {
              "option": "Refuse and demand supplies",
              "consequence": "50% chance to gain +1 Common Item, 50% chance the scavenger flees and you get nothing"
          },
          {
              "option": "Attack the scavenger",
              "consequence": "Gain +2 Common Items from the sack, but suffer -10 Morale and future traders avoid you"
          }
      ],
      "rarity": "uncommon",
      "duration": "15 minutes (in-game time)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1757783714971;
  
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
