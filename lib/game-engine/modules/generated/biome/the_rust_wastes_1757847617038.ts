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
      "description": "A vast expanse of corroded metal and industrial decay, where the skeletons of forgotten machinery loom like metallic mountains. The air is thick with the scent of rust and ozone, and strange, phosphorescent fungi cling to every surface, casting an eerie glow across the landscape.",
      "terrain_type": "Industrial ruins and metallic debris fields",
      "hazards": [
          "Corrosive acid pools",
          "Unstable metal structures that may collapse",
          "Aggressive rust-mites that swarm intruders"
      ],
      "resources": [
          "Salvaged electronics",
          "Scrap metal",
          "Rare phosphorescent fungi (used for crafting light sources)"
      ],
      "ambient_sounds": [
          "Distant groaning of shifting metal",
          "Faint, rhythmic hum of dormant machinery",
          "Occasional screech of rust-mites"
      ],
      "weather_patterns": [
          "Acid rain showers",
          "Metallic dust storms",
          "Static-charged fog"
      ],
      "entry_message": "You step into the Rust-Wastes. The ground crunches underfoot with oxidized metal, and the air tastes of iron and decay. Strange, glowing fungi provide the only light in this graveyard of industry."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1757847617038;
  
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
