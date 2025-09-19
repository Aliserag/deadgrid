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
      "description": "A forest where the trees have absorbed residual radiation, causing them to glow with an eerie bioluminescence. The air hums with unstable energy, and strange, mutated flora carpets the forest floor. Navigating this biome requires caution, as its beauty masks numerous dangers.",
      "terrain_type": "Luminous forest with soft, spongy ground",
      "hazards": [
          "Radiation hotspots",
          "Bioluminescent spores that cause hallucinations",
          "Unstable energy discharges from trees"
      ],
      "resources": [
          "Glow-wood",
          "Mutated herbs",
          "Energy crystals",
          "Purified water from glowing streams"
      ],
      "ambient_sounds": [
          "Faint humming from energy-charged trees",
          "Soft crackling of bioluminescent plants",
          "Distant, distorted animal calls"
      ],
      "weather_patterns": [
          "Energy storms with visible arcs of electricity",
          "Heavy fog that amplifies radiation effects",
          "Calm, clear nights with intensified glowing"
      ],
      "entry_message": "You step into the Glimmerwood, where an otherworldly glow casts long, shifting shadows. The air tingles with energy, and the forest seems to breathe around you."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1758279616586;
  
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
