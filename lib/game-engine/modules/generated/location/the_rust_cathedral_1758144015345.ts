/**
 * location: The Rust-Cathedral
 */

import { GameModule } from '../../../core/GameModule';

export interface TheRustCathedralData {
  name: string;
  type: string;
  size: string;
  danger_level: number;
  loot_quality: string;
  occupants: string;
  notable_features: any[];
  exploration_notes: string;
}

export class TheRustCathedralModule extends GameModule {
  static readonly metadata: TheRustCathedralData = {
      "name": "The Rust-Cathedral",
      "type": "building",
      "size": "large",
      "danger_level": 7,
      "loot_quality": "good",
      "occupants": "Feral Ghouls, Rust-Crawlers (mutated insects), and a territorial Scrap-Scavenger clan",
      "notable_features": [
          "Repurposed pre-war industrial cathedral with towering rusted spires",
          "Interior maze of conveyor belts and catwalks suspended over acidic vats",
          "Functioning but unstable steam-powered forge in the central nave",
          "Whispering echoes that seem to guide or mislead explorers"
      ],
      "exploration_notes": "Players may discover rare crafting blueprints near the forge, salvageable steam-tech components, and a hidden sub-level containing pre-war chemical reserves—guarded by a bloated Glow-Ghoul abomination."
  };
  
  static readonly type = 'location';
  static readonly version = '1.0.0';
  static readonly generated = 1758144015346;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheRustCathedralModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered location: The Rust-Cathedral`);
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

export default TheRustCathedralModule;
