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
          "max": 40
      },
      "speed": "normal",
      "behavior": "stalker",
      "abilities": [
          "Acidic Spit: Ranged attack that deals damage over time and corrodes armor",
          "Camouflage: Can blend with ruined environments, becoming nearly invisible when stationary",
          "Pack Tactics: Gains damage bonus when other Corrupted Scavengers are nearby",
          "Carrion Call: Summons 1-2 lesser mutants when health drops below 30%"
      ],
      "loot": [
          "Mutated Gland (uncommon)",
          "Corroded Scrap Metal (common)",
          "Bio-Organic Circuitry (rare)",
          "Preserved Rations (common)",
          "Stimpak Components (uncommon)"
      ],
      "description": "A humanoid mutant with patchy, mottled skin that shifts color to match its surroundings. Its limbs are elongated and jointed in unnatural ways, allowing it to climb ruined structures with ease. The creature's mouth is distended, revealing multiple rows of needle-like teeth and a secondary throat sac used for storing and projecting acidic fluids. Its eyes glow with a faint bioluminescent green light in darkness, and it moves with an unsettling, jerky grace that suggests both human and insectoid influences."
  };
  
  static readonly type = 'enemy';
  static readonly version = '1.0.0';
  static readonly generated = 1759893925065;
  
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
