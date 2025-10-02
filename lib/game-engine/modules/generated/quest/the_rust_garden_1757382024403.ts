/**
 * quest: The Rust Garden
 */

import { GameModule } from '../../../core/GameModule';

export interface TheRustGardenData {
  id: string;
  title: string;
  giver: string;
  description: string;
  objectives: any[];
  rewards: any;
  prerequisites: any;
  dialogue: any;
}

export class TheRustGardenModule extends GameModule {
  static readonly metadata: TheRustGardenData = {
      "id": "quest_rust_garden",
      "title": "The Rust Garden",
      "giver": "Old Man Hemlock",
      "description": "Old Man Hemlock, a reclusive botanist who survived the collapse, believes he has discovered a strain of rust-immune seeds in an abandoned agricultural research facility. He needs someone brave enough to retrieve them from the overgrown ruins, fighting through mutated flora and territorial scavengers.",
      "objectives": [
          "Travel to the overgrown AgraSeed Research Facility",
          "Retrieve 5 packets of rust-immune seeds from the seed vault",
          "Clear the facility of 3 mutated 'Thorn-Crawlers'",
          "Return safely to Old Man Hemlock with the seeds"
      ],
      "rewards": {
          "experience": 750,
          "items": [
              "Rust-Immune Seed Pack",
              "Hemlock's Herbal Poultice x3"
          ],
          "reputation": {
              "Hemlock's Homestead": 25
          }
      },
      "prerequisites": {
          "completed_quests": [
              "first_steps_outpost"
          ],
          "minimum_level": 5
      },
      "dialogue": {
          "greeting": "You look capable. Listen... the world is dying, but I might have a way to save a piece of it. Interested in a real challenge?",
          "accept": "Excellent! The AgraSeed facility isn't far, but it's... occupied. Bring back those seeds, and I'll make it worth your while.",
          "decline": "Suit yourself. But when your stomach's empty and the soil's dead, remember I offered you hope.",
          "completion": "You did it! These... these are the key. Now we can grow something that won't wither in a week. Take this—my thanks, and a little something for the road."
      }
  };
  
  static readonly type = 'quest';
  static readonly version = '1.0.0';
  static readonly generated = 1757382024405;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheRustGardenModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered quest: The Rust Garden`);
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

export default TheRustGardenModule;
