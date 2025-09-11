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
      "description": "A vast expanse of corroded metal and toxic soil, where the remnants of industrial civilization have bled into the earth. Strange, phosphorescent fungi grow in patches, casting an eerie glow across the shattered landscape.",
      "terrain_type": "Metal-scarred plains with acidic pools and rust dunes",
      "hazards": [
          "Corrosive acid rain",
          "Unstable ground prone to collapse",
          "Toxic spore clouds from glowing fungi"
      ],
      "resources": [
          "Salvaged scrap metal",
          "Rare phosphorescent fungi (used for bioluminescent crafting)",
          "Filtered acid (for chemical refining)"
      ],
      "ambient_sounds": [
          "Distant groaning of shifting metal",
          "Faint sizzling from acidic pools",
          "Echoing drips in rusted structures"
      ],
      "weather_patterns": [
          "Acid downpours",
          "Static-charged metal dust storms",
          "Occasional eerie calm with glowing fog"
      ],
      "entry_message": "The air grows thick with the scent of rust and decay. Before you stretches a wasteland of corroded metal and glowing fungi—every step risks the ground giving way."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1757610916728;
  
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
