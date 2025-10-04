/**
 * biome: The Rustwood Expanse
 */

import { GameModule } from '../../../core/GameModule';

export interface TheRustwoodExpanseData {
  name: string;
  description: string;
  terrain_type: string;
  hazards: any[];
  resources: any[];
  ambient_sounds: any[];
  weather_patterns: any[];
  entry_message: string;
}

export class TheRustwoodExpanseModule extends GameModule {
  static readonly metadata: TheRustwoodExpanseData = {
      "name": "The Rustwood Expanse",
      "description": "A bizarre forest where metallic trees have grown through the ruins of an ancient industrial complex. The air hums with residual energy from forgotten machinery, and strange crystalline formations pulse with faint light among the rust-colored foliage. This hybrid ecosystem has adapted to incorporate both organic and synthetic elements in unexpected ways.",
      "terrain_type": "Metallic forest with industrial ruins",
      "hazards": [
          "Corrosive sap dripping from metallic trees",
          "Unstable energy fields that disrupt electronics",
          "Collapsing industrial structures",
          "Aggressive rust-mites that consume metal equipment"
      ],
      "resources": [
          "Salvaged electronics",
          "Rare metal alloys",
          "Energy crystals",
          "Purified water from condensation collectors",
          "Medicinal fungi that grow on rust surfaces"
      ],
      "ambient_sounds": [
          "Deep metallic groaning from shifting structures",
          "Faint electrical humming",
          "Dripping water and corrosive fluids",
          "Echoing clangs from distant collapses",
          "Whispering wind through perforated metal leaves"
      ],
      "weather_patterns": [
          "Acid mist that slowly damages unprotected surfaces",
          "Energy storms that temporarily power ancient machinery",
          "Heavy metallic rainfall",
          "Static fog that obscures vision and interferes with communications"
      ],
      "entry_message": "You step into the Rustwood Expanse. Towering metallic trees creak ominously as rust-colored leaves drift downward. The air tastes of ozone and iron, and in the distance, you hear the groaning of ancient structures settling into their final decay."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1759547356652;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheRustwoodExpanseModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered biome: The Rustwood Expanse`);
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

export default TheRustwoodExpanseModule;
