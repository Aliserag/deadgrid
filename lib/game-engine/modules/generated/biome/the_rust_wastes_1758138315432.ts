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
      "description": "A vast expanse of corroded metal and decaying industrial structures, reclaimed by nature in twisted forms. The air is thick with the scent of rust and ozone, and strange, phosphorescent fungi glow faintly among the wreckage.",
      "terrain_type": "Metal plains with scattered ruins and sinkholes",
      "hazards": [
          "Acid rain",
          "Unstable ground prone to collapse",
          "Corrosive mist that damages equipment"
      ],
      "resources": [
          "Salvaged electronics",
          "Rare metal alloys",
          "Chemically purified water",
          "Glowing fungi (used for bioluminescence)"
      ],
      "ambient_sounds": [
          "Distant creaking of metal",
          "Faint, eerie hum from underground generators",
          "Occasional metallic crashes as structures collapse"
      ],
      "weather_patterns": [
          "Acid downpours",
          "Static-charged fog",
          "Occasional metallic dust storms"
      ],
      "entry_message": "You step into the Rust-Wastes. The ground crunches underfoot with oxidized metal, and the horizon shimmers with the ghosts of industry long dead."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1758138315433;
  
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
