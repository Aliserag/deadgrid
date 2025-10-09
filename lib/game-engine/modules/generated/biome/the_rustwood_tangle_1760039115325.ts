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
      "description": "A bizarre fusion of industrial decay and aggressive biological reclamation. Twisted metal structures are slowly being consumed by a strange, rust-colored flora that emits a faint phosphorescent glow at night. The air carries the scent of ozone and decaying metal, creating an unsettling atmosphere of unnatural growth.",
      "terrain_type": "Industrial forest with metal ruins and fungal growth",
      "hazards": [
          "Corrosive pollen clouds",
          "Unstable collapsing structures",
          "Aggressive rust-mold colonies",
          "Magnetic anomalies that disrupt electronics"
      ],
      "resources": [
          "Salvaged electronics",
          "Rare metal alloys",
          "Bio-luminescent fungi",
          "Purified water from condensation collectors",
          "Ancient data drives"
      ],
      "ambient_sounds": [
          "Metallic creaking and groaning",
          "Faint electrical humming",
          "Soft fungal popping sounds",
          "Distant metal-on-metal scraping",
          "Eerie wind through rusted structures"
      ],
      "weather_patterns": [
          "Acid mist showers",
          "Static-charged fog",
          "Metallic dust storms",
          "Bioluminescent rainfall at night"
      ],
      "entry_message": "You step into the Rustwood Tangle, where nature and industry have merged in a grotesque dance. Towering metal skeletons loom through the rust-colored canopy, their surfaces crawling with phosphorescent fungi. The air tastes of copper and decay, and every surface seems to pulse with unnatural life."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1760039115326;
  
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
