/**
 * biome: The Glimmering Mire
 */

import { GameModule } from '../../../core/GameModule';

export interface TheGlimmeringMireData {
  name: string;
  description: string;
  terrain_type: string;
  hazards: any[];
  resources: any[];
  ambient_sounds: any[];
  weather_patterns: any[];
  entry_message: string;
}

export class TheGlimmeringMireModule extends GameModule {
  static readonly metadata: TheGlimmeringMireData = {
      "name": "The Glimmering Mire",
      "description": "A vast wetland where bioluminescent fungi and mutated flora cast an eerie, perpetual twilight. The ground is a treacherous mix of shallow water, thick mud, and decaying organic matter, with strange, softly pulsing lights guiding—or misleading—travelers.",
      "terrain_type": "Swamp/Marsh",
      "hazards": [
          "Sinking mud pits",
          "Toxic spore clouds from glowing fungi",
          "Aggressive amphibious mutants"
      ],
      "resources": [
          "Bioluminescent fungi (for light and crafting)",
          "Purified bog water",
          "Rare medicinal herbs",
          "Scrap metal from sunken pre-war vehicles"
      ],
      "ambient_sounds": [
          "Gentle squelching of mud",
          "Distant, echoing croaks and clicks",
          "Soft hum of glowing plants",
          "Occasional deep bubbles surfacing"
      ],
      "weather_patterns": [
          "Thick, glowing fog",
          "Acidic drizzle",
          "Sudden downpours that flood low areas"
      ],
      "entry_message": "The air grows thick and humid as you step into the Glimmering Mire. Strange, soft lights pulse in the distance, and the ground squelches uneasily underfoot. Every shadow seems to move on its own."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1758246016823;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheGlimmeringMireModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered biome: The Glimmering Mire`);
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

export default TheGlimmeringMireModule;
