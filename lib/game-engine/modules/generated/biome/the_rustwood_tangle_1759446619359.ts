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
      "description": "A bizarre forest where metallic trees have fused with organic matter, creating a landscape of rust-colored vegetation and twisted metal structures. The air hums with residual energy from the cataclysm that transformed this region, and strange crystalline formations pulse with faint light among the hybrid flora.",
      "terrain_type": "Metallic-organic hybrid forest with crystalline outcroppings",
      "hazards": [
          "Corrosive sap dripping from metallic trees",
          "Unstable electromagnetic fields that disrupt electronics",
          "Sharp crystalline shards that can cause deep lacerations",
          "Sporadic energy discharges between metal trees"
      ],
      "resources": [
          "Rustwood lumber (strong but lightweight)",
          "Energy crystals (power sources)",
          "Scrap metal fragments",
          "Conductive vines",
          "Purified tree sap (useful for adhesives and fuel)"
      ],
      "ambient_sounds": [
          "Metallic creaking and groaning as trees shift",
          "Faint crystalline humming",
          "Distant energy crackles",
          "Rustling of metallic leaves in the wind"
      ],
      "weather_patterns": [
          "Acid mist that accelerates corrosion",
          "Energy storms that cause temporary power surges",
          "Heavy metallic rain that can dent unprotected surfaces",
          "Clear periods with eerie green-tinged sunlight"
      ],
      "entry_message": "You step into the Rustwood Tangle, where nature and machine have become one. Metallic trees tower overhead, their rust-colored bark fused with steel, while glowing crystals pulse rhythmically from the forest floor. The air tastes of ozone and iron, and every sound echoes with both organic and mechanical resonance."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1759446619360;
  
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
