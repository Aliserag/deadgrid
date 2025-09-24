/**
 * event: The Weeping Grove
 */

import { GameModule } from '../../../core/GameModule';

export interface TheWeepingGroveData {
  title: string;
  trigger_condition: string;
  description: string;
  choices: any[];
  rarity: string;
  duration: string;
}

export class TheWeepingGroveModule extends GameModule {
  static readonly metadata: TheWeepingGroveData = {
      "title": "The Weeping Grove",
      "trigger_condition": "Player enters a previously unexplored forest biome during rainfall",
      "description": "You stumble upon a grove of trees with bark that appears to be weeping black sap. The air hums with low-frequency vibrations, and the rain sizzles as it touches the sap-covered ground. Strange, phosphorescent fungi pulse in rhythmic patterns around the base of the trees.",
      "choices": [
          {
              "option": "Collect the black sap carefully",
              "consequence": "Gain 3 units of 'Weeping Resin' (rare alchemical ingredient), but suffer -10% movement speed for 2 hours due to sap residue"
          },
          {
              "option": "Investigate the pulsing fungi",
              "consequence": "Discover a hidden cache of pre-collapse medical supplies behind the largest tree, but trigger a temporary hallucination effect (-15% accuracy for 1 hour)"
          },
          {
              "option": "Burn the grove to cleanse the area",
              "consequence": "Permanently remove the grove (cannot re-trigger event), gain 50 reputation with nearby settlements, but lose karma and attract mutated wildlife for 24 hours"
          },
          {
              "option": "Leave immediately without interacting",
              "consequence": "Avoid all risks, but the grove remains marked on your map for potential future exploration"
          }
      ],
      "rarity": "rare",
      "duration": "48 hours (event disappears if not triggered within this timeframe)"
  };
  
  static readonly type = 'event';
  static readonly version = '1.0.0';
  static readonly generated = 1758751520394;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheWeepingGroveModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered event: The Weeping Grove`);
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

export default TheWeepingGroveModule;
