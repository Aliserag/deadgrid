/**
 * biome: The Rust-Wastes
 */

import { GameModule } from '../../../core/GameModule';

export interface TheRustWastesData {
  name: string;
  description: string;
  terrain_type: string;
  hazards: any[];
  resources: any[];
  ambient_sounds: any[];
  weather_patterns: any[];
  entry_message: string;
}

export class TheRustWastesModule extends GameModule {
  static readonly metadata: TheRustWastesData = {
      "name": "The Rust-Wastes",
      "description": "A vast expanse of corroded metal and industrial decay, where the remnants of old-world machinery have fused with the earth. Toxic pools of chemical runoff dot the landscape, and twisted metal structures loom like skeletal giants.",
      "terrain_type": "Industrial wasteland with metallic plains and chemical marshes",
      "hazards": [
          "Corrosive acid pools",
          "Unstable metal structures that may collapse",
          "Toxic air requiring respiratory protection"
      ],
      "resources": [
          "Salvaged electronics",
          "Scrap metal",
          "Rare chemical compounds",
          "Filtered water from condensation collectors"
      ],
      "ambient_sounds": [
          "Distant groaning of metal under stress",
          "Dripping chemicals",
          "Faint hum of dormant machinery",
          "Scuttling of mutated insects"
      ],
      "weather_patterns": [
          "Acid rain showers",
          "Metal-shard dust storms",
          "Heavy toxic fogs",
          "Occasional clear but hazardous skies"
      ],
      "entry_message": "You step into the Rust-Wastes. The air burns with the scent of oxidation and decay. Towering ruins of industry cast long shadows, and the ground crunches underfoot with fragments of forgotten machinery."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1758164958258;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheRustWastesModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered biome: The Rust-Wastes`);
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

export default TheRustWastesModule;
