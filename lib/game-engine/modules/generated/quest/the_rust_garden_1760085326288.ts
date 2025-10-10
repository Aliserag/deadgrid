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
      "description": "Old Man Hemlock, one of the last botanists from before the Fall, believes he's discovered a strain of edible fungi growing on irradiated machinery in the Scrap Yards. He needs samples to verify if they're safe for consumption and potentially cultivate them as a new food source for the settlement.",
      "objectives": [
          {
              "id": "collect_fungal_samples",
              "description": "Collect 5 Rust Mold samples from irradiated machinery in the Scrap Yards",
              "target_count": 5
          },
          {
              "id": "test_radiation_levels",
              "description": "Use Geiger counter to verify samples have radiation levels below 0.8 rads",
              "target_count": 5
          },
          {
              "id": "return_to_hemlock",
              "description": "Bring the safe samples back to Old Man Hemlock",
              "target_count": 1
          }
      ],
      "rewards": {
          "experience": 750,
          "items": [
              {
                  "name": "Radiation Antidote",
                  "quantity": 3
              },
              {
                  "name": "Preserved Rations",
                  "quantity": 5
              }
          ],
          "reputation": {
              "settlement": 25
          }
      },
      "prerequisites": {
          "completed_quests": [
              "quest_first_steps"
          ],
          "minimum_level": 3,
          "required_items": [
              "Geiger Counter"
          ]
      },
      "dialogue": {
          "initial_greeting": "You look like someone who isn't afraid to get their hands dirty. I've found something remarkable in the Scrap Yards - fungi growing on the rusted metal. If they're safe to eat, this could change everything for our settlement.",
          "accept_quest": "Excellent! Bring me 5 samples, but make sure they test under 0.8 rads. We don't need more mutations around here.",
          "decline_quest": "I understand. It's dangerous out there. Come back if you change your mind - our people need this.",
          "completion_dialogue": "You did it! These samples are perfect. Low radiation, high nutritional value. This discovery will save lives. Take these supplies as thanks - you've earned them."
      }
  };
  
  static readonly type = 'quest';
  static readonly version = '1.0.0';
  static readonly generated = 1760085326289;
  
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
