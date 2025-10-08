/**
 * enemy: Corrupted Scavenger
 */

import { GameModule } from '../../../core/GameModule';

export interface CorruptedScavengerData {
  name: string;
  type: string;
  tier: number;
  health: string;
  damage: string;
  speed: string;
  behavior: string;
  abilities: any[];
  loot: any[];
  description: string;
}

export class CorruptedScavengerModule extends GameModule {
  static readonly metadata: CorruptedScavengerData = {
      "name": "Corrupted Scavenger",
      "type": "mutant",
      "tier": 3,
      "health": {
          "min": 180,
          "max": 240
      },
      "damage": {
          "min": 25,
          "max": 45
      },
      "speed": "normal",
      "behavior": "stalker",
      "abilities": [
          "Toxic Spit: Ranged attack that deals poison damage over time",
          "Camouflage: Can blend with ruined environments, becoming harder to detect",
          "Pack Call: Summons 1-2 lesser mutants if health drops below 50%"
      ],
      "loot": [
          "Mutated Gland (crafting component)",
          "Tattered Scavenger Gear",
          "Corrupted Meat (consumable with risk)",
          "Assorted Scrap Parts"
      ],
      "description": "A humanoid mutant with patchy, mottled skin that shifts color to match its surroundings. Its limbs are unnaturally elongated, ending in claw-like hands. The creature's face is mostly featureless except for a wide, lipless mouth that can distend to spit corrosive venom. Moves with an unsettling, deliberate gait when stalking prey."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1759933818742;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(CorruptedScavengerModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered enemy: Corrupted Scavenger`);
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

export default CorruptedScavengerModule;
