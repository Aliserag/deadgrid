/**
 * biome: The Glimmerwood
 */

import { GameModule } from '../../../core/GameModule';

export interface TheGlimmerwoodData {
  name: string;
  description: string;
  terrain_type: string;
  hazards: any[];
  resources: any[];
  ambient_sounds: any[];
  weather_patterns: any[];
  entry_message: string;
}

export class TheGlimmerwoodModule extends GameModule {
  static readonly metadata: TheGlimmerwoodData = {
      "name": "The Glimmerwood",
      "description": "A forest where the trees have absorbed radiation and now glow with a faint, eerie luminescence. The ground is soft and spongy, covered in bioluminescent fungi that pulse with a slow, rhythmic light.",
      "terrain_type": "Luminous Forest",
      "hazards": [
          "Radiation Pockets",
          "Sporadic Fungal Spores",
          "Unstable, Sinkhole-Prone Ground"
      ],
      "resources": [
          "Glowcap Mushrooms",
          "Irradiated Wood",
          "Rare Crystalline Shards",
          "Purified Water from Hidden Springs"
      ],
      "ambient_sounds": [
          "Faint, rhythmic pulsing hum",
          "Distant, echoing drips",
          "Soft rustling of glowing leaves"
      ],
      "weather_patterns": [
          "Acid Rain Showers",
          "Radiation Fog",
          "Bioluminescent Storms"
      ],
      "entry_message": "You step into the Glimmerwood. The air hums with energy, and an otherworldly glow casts long, shifting shadows. Every step sinks slightly into the soft, fungal ground."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1758425116053;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheGlimmerwoodModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered biome: The Glimmerwood`);
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

export default TheGlimmerwoodModule;
