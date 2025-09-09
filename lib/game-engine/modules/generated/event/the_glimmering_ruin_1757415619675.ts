/**
 * event: The Glimmering Ruin
 */

import { GameModule } from '../../../core/GameModule';

export interface TheGlimmeringRuinData {
  title: string;
  trigger_condition: string;
  description: string;
  choices: any[];
  rarity: string;
  duration: string;
}

export class TheGlimmeringRuinModule extends GameModule {
  static readonly metadata: TheGlimmeringRuinData = {
      "title": "The Glimmering Ruin",
      "trigger_condition": "Player enters an abandoned industrial zone at night",
      "description": "A faint, rhythmic humming draws your attention to a half-collapsed factory. Through a cracked window, you see a soft blue glow pulsating from machinery that somehow still has power. The air smells of ozone and rust.",
      "choices": [
          {
              "option": "Investigate the source of the glow",
              "consequence": "Find a functioning power core (+1 Energy Cell), but trigger a security system (-15 Health)"
          },
          {
              "option": "Attempt to scavenge nearby debris quietly",
              "consequence": "Find some usable scrap metal (+3 Scrap), but alert nearby feral dogs"
          },
          {
              "option": "Mark the location and leave immediately",
              "consequence": "No immediate rewards, but location is added to map for future exploration"
          },
          {
              "option": "Set up an ambush for other scavengers",
              "consequence": "Gain supplies from unaware travelers (+2 Food, +1 Medicine), but lose reputation with nearby factions"
          }
      ],
      "rarity": "uncommon",
      "duration": "Until dawn (6 in-game hours)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1757415619676;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheGlimmeringRuinModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered event: The Glimmering Ruin`);
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

export default TheGlimmeringRuinModule;
