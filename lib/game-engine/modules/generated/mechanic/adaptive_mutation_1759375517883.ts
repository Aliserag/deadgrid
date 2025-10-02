/**
 * mechanic: Adaptive Mutation
 */

import { GameModule } from '../../../core/GameModule';

export interface AdaptiveMutationData {
  name: string;
  category: string;
  description: string;
  requirements: any;
  benefits: any[];
  drawbacks: any[];
  progression: any;
  ui_elements: any[];
}

export class AdaptiveMutationModule extends GameModule {
  static readonly metadata: AdaptiveMutationData = {
      "name": "Adaptive Mutation",
      "category": "survival",
      "description": "Through prolonged exposure to the post-apocalyptic environment, survivors can develop temporary biological mutations that provide unique advantages. These mutations activate automatically when specific survival thresholds are met (hunger, radiation, injury, etc.) and last for a limited duration before requiring a cooldown period.",
      "requirements": {
          "basic": "Reach critical levels in one survival metric (below 15% health, above 85% radiation, or 24+ hours without sleep)",
          "advanced": "Multiple critical survival metrics simultaneously or extreme environmental conditions (toxic storms, extreme temperatures)"
      },
      "benefits": [
          "Enhanced night vision when starving",
          "Radiation resistance and temporary healing during high radiation exposure",
          "Increased strength and pain tolerance when severely injured",
          "Improved stealth and agility when exhausted"
      ],
      "drawbacks": [
          "Mutations cause temporary stat debuffs in other areas",
          "High calorie consumption during mutation activation",
          "Risk of permanent negative mutations if overused",
          "Visible physical changes that may affect social interactions"
      ],
      "progression": {
          "unlock": "Survive first critical survival event",
          "improve": "Successfully activate mutations multiple times in different environments",
          "master": "Learn to control mutation triggers and reduce cooldown times",
          "specialize": "Focus on specific mutation trees (combat, stealth, endurance)"
      },
      "ui_elements": [
          "Mutation readiness meter showing activation proximity",
          "Active mutation indicator with duration timer",
          "Physical change visualization on character model",
          "Mutation tree progression menu",
          "Environmental trigger warnings",
          "Cooldown status display"
      ]
  };
  
  static readonly type = 'mechanic';
  static readonly version = '1.0.0';
  static readonly generated = 1759375517885;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(AdaptiveMutationModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered mechanic: Adaptive Mutation`);
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

export default AdaptiveMutationModule;
