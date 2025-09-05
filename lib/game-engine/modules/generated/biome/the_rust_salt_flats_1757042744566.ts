/**
 * biome: The Rust-Salt Flats
 */

import { GameModule } from '../../../core/GameModule';

export interface TheRustSaltFlatsData {
  name: string;
  description: string;
  terrain_type: string;
  hazards: any[];
  resources: any[];
  ambient_sounds: any[];
  weather_patterns: any[];
  entry_message: string;
}

export class TheRustSaltFlatsModule extends GameModule {
  static readonly metadata: TheRustSaltFlatsData = {
      "name": "The Rust-Salt Flats",
      "description": "A vast, desolate expanse where ancient industrial ruins are slowly being consumed by crystalline salt formations. The air carries a metallic tang and the ground crunches underfoot with a mix of rust flakes and salt crystals. Strange, bioluminescent lichen glows faintly across the salt-crusted machinery.",
      "terrain_type": "Salt flat with industrial debris",
      "hazards": [
          "Corrosive salt storms",
          "Unstable ground pockets",
          "Rust-metal shrapnel winds",
          "Bioluminescent lichen toxicity"
      ],
      "resources": [
          "Salvaged electronics",
          "Salt crystals",
          "Rare metal scraps",
          "Purified water deposits",
          "Bioluminescent fungus samples"
      ],
      "ambient_sounds": [
          "Distant metallic groaning",
          "Constant gritty wind",
          "Crackling salt crystals",
          "Faint humming from buried machinery"
      ],
      "weather_patterns": [
          "Static-charged salt fog",
          "Corrosive salt rainfall",
          "Clear metallic-skied nights",
          "Sudden rust-storms"
      ],
      "entry_message": "The air turns sharp and metallic as your boots crunch through a landscape of rust-red salt and forgotten industry. Glowing patches of lichen pulse rhythmically across collapsed structures, casting long shadows in the hazy light."
  };
  
  static readonly type = 'biome';
  static readonly version = '1.0.0';
  static readonly generated = 1757042744566;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheRustSaltFlatsModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered biome: The Rust-Salt Flats`);
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

export default TheRustSaltFlatsModule;
