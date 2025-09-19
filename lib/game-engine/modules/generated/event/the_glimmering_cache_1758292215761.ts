/**
 * event: The Glimmering Cache
 */

import { GameModule } from '../../../core/GameModule';

export interface TheGlimmeringCacheData {
  title: string;
  trigger_condition: string;
  description: string;
  choices: any[];
  rarity: string;
  duration: string;
}

export class TheGlimmeringCacheModule extends GameModule {
  static readonly metadata: TheGlimmeringCacheData = {
      "title": "The Glimmering Cache",
      "trigger_condition": "Player enters an abandoned industrial zone at night",
      "description": "A faint, rhythmic humming draws your attention to a half-collapsed warehouse. Inside, a flickering light reveals a pre-war automated storage unit, miraculously still powered by a failing generator. Its display glows weakly, offering access to one sealed container—but the noise may attract unwanted attention.",
      "choices": [
          {
              "option": "Attempt to hack the terminal quietly",
              "consequence": "Gain advanced tech components, but risk alerting nearby Scavengers if failed"
          },
          {
              "option": "Smash the container open with tools",
              "consequence": "Guaranteed supplies, but loud noise attracts a hostile patrol"
          },
          {
              "option": "Rig the generator to overload and create a distraction",
              "consequence": "Loot safely during the chaos, but lose half the contents to explosion damage"
          },
          {
              "option": "Leave immediately to avoid risk",
              "consequence": "No rewards, but avoid potential combat"
          }
      ],
      "rarity": "uncommon",
      "duration": "15 minutes (in-game time)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1758292215762;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheGlimmeringCacheModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered event: The Glimmering Cache`);
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

export default TheGlimmeringCacheModule;
