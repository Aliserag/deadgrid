/**
 * event: The Last Broadcast
 */

import { GameModule } from '../../../core/GameModule';

export interface TheLastBroadcastData {
  title: string;
  trigger_condition: string;
  description: string;
  choices: any[];
  rarity: string;
  duration: string;
}

export class TheLastBroadcastModule extends GameModule {
  static readonly metadata: TheLastBroadcastData = {
      "title": "The Last Broadcast",
      "trigger_condition": "Player enters a ruined radio station or activates a functioning ham radio",
      "description": "A faint, looping signal cuts through the static—a pre-recorded voice repeating coordinates and a plea for survivors to gather. The signal is weak and fading, suggesting it's been transmitting for years. Could this be a genuine safe haven, or a trap set by raiders?",
      "choices": [
          {
              "option": "Follow the coordinates",
              "consequence": "Gain a marker to a hidden bunker with valuable supplies, but risk ambush by opportunistic scavengers."
          },
          {
              "option": "Attempt to trace the signal source",
              "consequence": "Discover the broadcast originates from an automated system in a decaying military outpost, yielding tech scraps but alerting nearby feral ghouls."
          },
          {
              "option": "Ignore and jam the signal",
              "consequence": "Avoid potential danger but lose the opportunity for rare loot; gain temporary reputation with local isolationist factions."
          }
      ],
      "rarity": "uncommon",
      "duration": "48 in-game hours (signal fades after this time)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1758252318721;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheLastBroadcastModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered event: The Last Broadcast`);
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

export default TheLastBroadcastModule;
