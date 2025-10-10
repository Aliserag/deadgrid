/**
 * biome: The Rustwood Tangle
 */

import { GameModule } from '../../../core/GameModule';

export interface TheRustwoodTangleData {
  name: string;
  description: string;
  terrain_type: string;
  hazards: any[];
  resources: any[];
  ambient_sounds: any[];
  weather_patterns: any[];
  entry_message: string;
}

export class TheRustwoodTangleModule extends GameModule {
  static readonly metadata: TheRustwoodTangleData = {
      "name": "The Rustwood Tangle",
      "description": "A bizarre forest where metallic trees have fused with organic vegetation, creating a biome of rust-colored flora and crystalline growths. The air hums with residual energy from whatever cataclysm transformed this place, and strange magnetic anomalies distort compasses and electronics.",
      "terrain_type": "Metallic-organic hybrid forest with crystalline formations",
      "hazards": [
          "Magnetic storms that disable electronics",
          "Corrosive sap from metallic trees",
          "Unstable crystalline structures that can shatter explosively",
          "Disorienting magnetic fields that cause vertigo"
      ],
      "resources": [
          "Rust-metal scrap",
          "Energy crystals",
          "Conductive vines",
          "Purified tree sap",
          "Magnetic ore fragments",
          "Radiation-shielded wood"
      ],
      "ambient_sounds": [
          "Metallic creaking and groaning",
          "Faint crystalline chimes",
          "Low-frequency hum from magnetic fields",
          "Echoing drips of corrosive fluids",
          "Occasional sharp cracks from shifting crystals"
      ],
      "weather_patterns": [
          "Acidic mist",
          "Magnetic storms",
          "Crystalline hail",
          "Heavy metallic rain",
          "Energy surges that make flora glow"
      ],
      "entry_message": "The air grows heavy with the scent of ozone and rust as twisted metallic trees rise before you. Strange crystalline formations pulse with faint light, and your equipment begins to flicker erratically. Welcome to the Rustwood Tangle."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1760137816288;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheRustwoodTangleModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered biome: The Rustwood Tangle`);
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

export default TheRustwoodTangleModule;
