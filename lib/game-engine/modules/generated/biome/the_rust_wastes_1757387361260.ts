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
      "description": "A vast expanse of corroded metal and industrial decay where nature has begun reclaiming the ruins of forgotten factories. Twisted steel structures rise like skeletal trees from acidic pools, while strange metallic flora glows with faint bioluminescence in the perpetual twilight.",
      "terrain_type": "Metallic plains with acidic marshlands and rust-dunes",
      "hazards": [
          "Corrosive acid pools",
          "Unstable metal structures that may collapse",
          "Radioactive hot spots",
          "Sharp metal debris causing bleeding wounds"
      ],
      "resources": [
          "Salvaged electronics",
          "Rare metal alloys",
          "Acid-resistant materials",
          "Scrap components",
          "Chemically-purified water"
      ],
      "ambient_sounds": [
          "Distant metal groaning and shifting",
          "Faint acidic bubbling",
          "Metallic wind chimes created by hanging debris",
          "Occasional deep structural collapses echoing through the wastes"
      ],
      "weather_patterns": [
          "Acid rain showers",
          "Metallic dust storms",
          "Radioactive fog banks",
          "Static electricity storms that disrupt electronics"
      ],
      "entry_message": "The air tastes of ozone and rust as you step into the metallic graveyard. Your Geiger counter begins clicking rhythmically, and strange glowing plants pulse in the shadows between towering ruins of industry."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1757387361264;
  
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
