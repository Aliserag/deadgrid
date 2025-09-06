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
      "description": "A faint, rhythmic blue glow pulses from a collapsed factory building. Strange, harmonic humming echoes through the rusted structures, and the air smells of ozone and decay. Scavenger birds circle overhead but refuse to land near the source.",
      "choices": [
          {
              "option": "Investigate the light source cautiously",
              "consequence": "Discover a functional pre-collapse energy core. Gain +2 Energy Cells but risk radiation exposure (-15% health if failed protection check)"
          },
          {
              "option": "Scavenge the perimeter for useful materials",
              "consequence": "Find abandoned toolboxes and wiring. Gain +1 Scrap Parts and +1 Electronics without danger"
          },
          {
              "option": "Mark the location and leave immediately",
              "consequence": "Avoid all risks. Gain +1 Map Data for future exploration"
          },
          {
              "option": "Attempt to sabotage the phenomenon from a distance",
              "consequence": "Cause an energy backlash. 50% chance to destroy the source (gaining nothing) or cause a chain reaction that reveals hidden loot (+3 Rare Components)"
          }
      ],
      "rarity": "uncommon",
      "duration": "Until dawn (in-game 8 hours)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1757129120067;
  
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
