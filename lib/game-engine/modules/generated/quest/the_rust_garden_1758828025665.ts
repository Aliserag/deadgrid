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
  rewards: string;
  prerequisites: string;
  dialogue: string;
}

export class TheRustGardenModule extends GameModule {
  static readonly metadata: TheRustGardenData = {
      "id": "quest_rust_garden",
      "title": "The Rust Garden",
      "giver": "Old Man Hemlock",
      "description": "Old Man Hemlock, a survivor who's been cultivating a hidden garden in the ruins of a pre-war botanical research facility, needs help defending his crops from mutated insects. The 'Rust Garden' contains rare medicinal plants that could save lives in the settlement, but giant rad-roaches and thorny vine creepers have infested the greenhouse.",
      "objectives": [
          "Travel to the overgrown botanical research facility",
          "Clear the greenhouse of 8 mutated insects",
          "Repair the broken irrigation system valve",
          "Retrieve Hemlock's stolen gardening tools from the insect nest"
      ],
      "rewards": {
          "experience": 750,
          "items": [
              "Hemlock's Herbal Poultice",
              "Bag of Mutated Seeds",
              "250 Caps"
          ],
          "reputation": {
              "Settlement": 15,
              "Scavengers": 5
          }
      },
      "prerequisites": {
          "level": 8,
          "completed_quests": [
              "first_light_settlement"
          ],
          "skills": [
              "Survival 25"
          ]
      },
      "dialogue": {
          "initial": "You look capable. My garden... it's being overrun. The plants there could save people, but these bugs... they're not normal. Big as dogs, with shells like rusted metal. Help me clear them out, and I'll share what we harvest.",
          "accept": "Thank you. The facility is northeast, past the broken highway. Watch for the thorny vines - they move.",
          "decline": "Suit yourself. More medicine for the bugs, I suppose.",
          "completion": "You did it! The garden is safe. Here, take these - my poultice will heal any wound, and these seeds... well, let's just say they grow in soil that would kill anything else."
      }
  };
  
  static readonly type = 'quest';
  static readonly version = '1.0.0';
  static readonly generated = 1758828025666;
  
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
