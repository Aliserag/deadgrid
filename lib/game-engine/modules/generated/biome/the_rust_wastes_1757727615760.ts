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
      "description": "A vast expanse of corroded metal and industrial decay, where the remnants of old-world factories have merged with the poisoned earth. Strange, phosphorescent fungi grow in patches, casting an eerie glow across the jagged terrain.",
      "terrain_type": "Metal-scarred plains with rust dunes and skeletal structures",
      "hazards": [
          "Corrosive acid pools",
          "Collapsing metal structures",
          "Toxic spore clouds from glowing fungi"
      ],
      "resources": [
          "Salvaged scrap metal",
          "Rare electronic components",
          "Chemically purified water",
          "Glowing fungal samples"
      ],
      "ambient_sounds": [
          "Distant creaking of metal",
          "Acidic drips and sizzles",
          "Low hum from unstable energy cores"
      ],
      "weather_patterns": [
          "Acid rain showers",
          "Toxic fog banks",
          "Metallic dust storms"
      ],
      "entry_message": "The air grows thick with the scent of rust and ozone. Before you stretches a landscape of twisted metal and eerie green light—enter the Rust-Wastes at your own peril."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1757727615761;
  
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
