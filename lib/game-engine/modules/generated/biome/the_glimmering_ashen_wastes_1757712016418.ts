/**
 * biome: The Glimmering Ashen Wastes
 */

import { GameModule } from '../../../core/GameModule';

export interface TheGlimmeringAshenWastesData {
  name: string;
  description: string;
  terrain_type: string;
  hazards: any[];
  resources: any[];
  ambient_sounds: any[];
  weather_patterns: any[];
  entry_message: string;
}

export class TheGlimmeringAshenWastesModule extends GameModule {
  static readonly metadata: TheGlimmeringAshenWastesData = {
      "name": "The Glimmering Ashen Wastes",
      "description": "A vast, desolate expanse covered in fine, phosphorescent ash that glows faintly in the dark. The remnants of a cataclysmic event have left the soil unstable, with pockets of toxic gas and shifting terrain. Strange, bioluminescent fungi dot the landscape, providing the only source of natural light.",
      "terrain_type": "Sandy ash dunes with unstable sinkholes",
      "hazards": [
          "Toxic gas vents",
          "Quicksand-like ash pits",
          "Radiation storms"
      ],
      "resources": [
          "Phosphorescent spores",
          "Scrap metal",
          "Purified water caches",
          "Rare crystalline shards"
      ],
      "ambient_sounds": [
          "Low, eerie hum from glowing fungi",
          "Distant howling winds",
          "Occasional toxic gas hisses"
      ],
      "weather_patterns": [
          "Ash storms",
          "Acidic drizzle",
          "Calm but hazy nights"
      ],
      "entry_message": "You step into the Glimmering Ashen Wastes. The ground crunches underfoot, emitting a soft, eerie glow. The air tastes of ozone and decay."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1757712016420;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheGlimmeringAshenWastesModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered biome: The Glimmering Ashen Wastes`);
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

export default TheGlimmeringAshenWastesModule;
