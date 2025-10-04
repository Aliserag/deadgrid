/**
 * mechanic: Adaptive Mutation
 */

import { GameModule } from '../../../core/GameModule';

export interface AdaptiveMutationData {
  name: string;
  category: string;
  description: string;
  requirements: string;
  benefits: any[];
  drawbacks: any[];
  progression: string;
  ui_elements: string;
}

export class AdaptiveMutationModule extends GameModule {
  static readonly metadata: AdaptiveMutationData = {
      "name": "Adaptive Mutation",
      "category": "survival",
      "description": "After prolonged exposure to environmental hazards or consuming contaminated resources, players can develop temporary mutations that provide unique abilities. These mutations activate automatically when specific survival thresholds are met (radiation levels, toxin buildup, etc.) and last for a limited duration before causing exhaustion.",
      "requirements": {
          "environmental_exposure": "Must reach 70% radiation/toxin threshold",
          "consumption": "Ingest 3+ contaminated food/water items within 24 in-game hours",
          "health_state": "Below 50% maximum health"
      },
      "benefits": [
          "Radiation Resistance: 40% reduced damage from radioactive zones",
          "Toxic Immunity: Complete immunity to poison effects",
          "Enhanced Senses: See thermal signatures in darkness",
          "Regenerative Metabolism: Health regenerates 1% per second",
          "Brute Strength: +30% melee damage"
      ],
      "drawbacks": [
          "Mutation Fatigue: -20% movement speed after mutation ends",
          "Cognitive Impairment: -15% accuracy with ranged weapons",
          "Social Stigma: NPCs become hostile or fearful",
          "Resource Drain: 50% increased food/water consumption",
          "Uncontrollable Triggers: Mutations can activate at inopportune times"
      ],
      "progression": {
          "basic": "Random single mutation for 2 minutes",
          "intermediate": "Choose from 2 mutations for 4 minutes",
          "advanced": "Stack 2 mutations for 6 minutes",
          "master": "Control activation timing + 3 mutation stack for 8 minutes"
      },
      "ui_elements": {
          "mutation_gauge": "Circular meter showing environmental exposure buildup",
          "ability_wheel": "Radial menu for selecting available mutations",
          "duration_timer": "Countdown display for active mutation time remaining",
          "symptom_indicators": "Icon-based warning system for approaching thresholds",
          "exhaustion_bar": "Post-mutation fatigue meter"
      }
  };
  
  static readonly type = 'mechanic';
  static readonly version = '1.0.0';
  static readonly generated = 1759542022886;
  
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
