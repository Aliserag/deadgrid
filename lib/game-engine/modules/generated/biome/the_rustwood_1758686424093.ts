/**
 * biome: The Rustwood
 */

import { GameModule } from '../../../core/GameModule';

export interface TheRustwoodData {
  name: string;
  description: string;
  terrain_type: string;
  hazards: any[];
  resources: any[];
  ambient_sounds: any[];
  weather_patterns: any[];
  entry_message: string;
}

export class TheRustwoodModule extends GameModule {
  static readonly metadata: TheRustwoodData = {
      "name": "The Rustwood",
      "description": "A bizarre forest where metal and nature have fused in the aftermath of the cataclysm. Trees grow with steel bark and copper leaves, while rust-colored moss carpets the ground. The air carries the scent of ozone and damp earth, creating an unsettling blend of industrial decay and organic growth.",
      "terrain_type": "Metallic forest with rolling hills and crystalline outcroppings",
      "hazards": [
          "Corrosive rain that damages equipment",
          "Magnetic anomalies that disrupt electronics",
          "Aggressive rust-vines that constrict intruders",
          "Unstable ground where metal plates shift unexpectedly"
      ],
      "resources": [
          "Conductive copper leaves",
          "Reinforced steelwood lumber",
          "Purified water from crystalline springs",
          "Salvageable pre-fall technology",
          "Rare earth elements in crystal formations"
      ],
      "ambient_sounds": [
          "Metallic creaking of swaying trees",
          "Distant electrical humming from crystalline formations",
          "Gentle pinging of copper leaves colliding",
          "Echoing drips from corrosive condensation"
      ],
      "weather_patterns": [
          "Acid fog that reduces visibility and corrodes metal",
          "Magnetic storms that create temporary energy surges",
          "Clear nights with bizarre auroras from mineral particulates",
          "Heavy rust-storms that coat everything in orange dust"
      ],
      "entry_message": "The air shifts as you cross into the Rustwood. Metallic trees tower overhead, their copper leaves chiming softly in the breeze. Strange energies make your hair stand on end, and the ground beneath your feet feels unnaturally solid."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1758686424094;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheRustwoodModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered biome: The Rustwood`);
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

export default TheRustwoodModule;
