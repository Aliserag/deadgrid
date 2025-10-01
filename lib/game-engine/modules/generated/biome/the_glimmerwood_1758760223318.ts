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
      "description": "A forest where radioactive rain has caused the flora to mutate into phosphorescent forms. The trees glow with an eerie green light, casting shifting shadows that dance unnervingly. Fungal growths pulse with bioluminescence, creating an otherworldly landscape that's both beautiful and deadly.",
      "terrain_type": "Mutated forest with phosphorescent vegetation and soft, fungal ground cover",
      "hazards": [
          "Radioactive hotspots",
          "Sporadic fungal spore bursts that cause hallucinations",
          "Unstable glowing sinkholes hidden under fungal mats",
          "Aggressive bioluminescent predators attracted to light"
      ],
      "resources": [
          "Glow-cap mushrooms (edible with proper preparation)",
          "Radiocrystal shards (power source)",
          "Luminous sap (medical and crafting uses)",
          "Mutated animal pelts with natural glow patterns"
      ],
      "ambient_sounds": [
          "Faint, melodic humming from vibrating fungal stalks",
          "Soft squelching of footsteps on fungal ground",
          "Distant, distorted animal calls echoing through glowing trunks",
          "Occasional crackle of discharging energy from radiant plants"
      ],
      "weather_patterns": [
          "Acid-rain showers that intensify the forest's glow",
          "Radiation fog that reduces visibility but amplifies bioluminescence",
          "Spore storms where fungal particles fill the air with hallucinogenic dust"
      ],
      "entry_message": "The air grows thick with the scent of ozone and decay. Before you stretches a forest alive with an unnatural green glow, where every step causes the ground to pulse with light. Shadowy forms move between the luminous trees, and you can't shake the feeling of being watched by the forest itself."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1758760223319;
  
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
