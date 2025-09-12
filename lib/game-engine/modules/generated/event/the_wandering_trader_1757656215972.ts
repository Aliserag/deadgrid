/**
 * event: The Wandering Trader
 */

import { GameModule } from '../../../core/GameModule';

export interface TheWanderingTraderData {
  title: string;
  trigger_condition: string;
  description: string;
  choices: any[];
  rarity: string;
  duration: string;
}

export class TheWanderingTraderModule extends GameModule {
  static readonly metadata: TheWanderingTraderData = {
      "title": "The Wandering Trader",
      "trigger_condition": "Player enters a previously cleared urban area during daylight hours",
      "description": "A lone figure pushing a heavily modified shopping cart approaches your position. The cart is covered in makeshift armor plating and adorned with various trinkets and supplies. The trader wears a patched-up hazmat suit and offers a cautious but friendly wave.",
      "choices": [
          {
              "option": "Trade peacefully",
              "consequence": "Gain rare crafting materials and information about nearby locations, but lose some common supplies"
          },
          {
              "option": "Rob the trader",
              "consequence": "Gain all trader's goods immediately, but suffer reputation loss with future NPCs and risk injury from hidden defenses"
          },
          {
              "option": "Ignore and move on",
              "consequence": "No gains or losses, but miss potential opportunities"
          },
          {
              "option": "Offer protection in exchange for goods",
              "consequence": "Gain moderate supplies and temporary follower, but attract unwanted attention from raiders"
          }
      ],
      "rarity": "uncommon",
      "duration": "15 minutes (in-game time)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1757656215973;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheWanderingTraderModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered event: The Wandering Trader`);
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

export default TheWanderingTraderModule;
