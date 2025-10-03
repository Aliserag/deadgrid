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
      "description": "A bizarre forest where metal and organic matter have fused into a single ecosystem. Twisted trees with metallic bark grow alongside crystalline fungi that pulse with faint energy. The air smells of ozone and damp earth, creating an unsettling yet strangely beautiful landscape.",
      "terrain_type": "Metallic-organic hybrid forest with crystalline formations",
      "hazards": [
          "Corrosive sap dripping from metallic trees",
          "Unstable energy discharges from crystal formations",
          "Magnetic anomalies that disrupt electronics",
          "Razor-sharp metallic foliage"
      ],
      "resources": [
          "Conductive crystal shards",
          "Purified metallic sap",
          "Rare earth elements",
          "Bio-metallic alloys",
          "Energy cells from crystal formations"
      ],
      "ambient_sounds": [
          "Metallic creaking and groaning from shifting trees",
          "Faint crystalline humming",
          "Distant electrical crackling",
          "Echoing drips of corrosive fluids"
      ],
      "weather_patterns": [
          "Acidic mist storms",
          "Energy surges that make crystals glow intensely",
          "Magnetic disturbances",
          "Heavy metallic rain that pings against surfaces"
      ],
      "entry_message": "You step into the Rustwood Tangle, where nature and machine have become one. Metallic trees creak ominously as crystalline fungi cast an eerie glow across the landscape. The air hums with latent energy, warning of the dangers hidden within this strange fusion of worlds."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1759533016091;
  
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
