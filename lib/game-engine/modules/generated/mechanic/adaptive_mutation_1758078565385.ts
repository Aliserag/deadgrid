/**
 * mechanic: Adaptive Mutation
 */

import { GameModule } from '../../../core/GameModule';

export interface AdaptiveMutationData {
  name: string;
  category: string;
  description: string;
  requirements: any;
  benefits: any;
  drawbacks: any;
  progression: any;
  ui_elements: any;
}

export class AdaptiveMutationModule extends GameModule {
  static readonly metadata: AdaptiveMutationData = {
      "name": "Adaptive Mutation",
      "category": "survival",
      "description": "After prolonged exposure to environmental hazards or consuming contaminated resources, players can develop temporary mutations that provide unique survival advantages. These mutations last for 1-3 in-game days and are triggered automatically when certain thresholds of radiation, toxicity, or other environmental factors are reached. Each mutation has both beneficial and detrimental effects, forcing players to adapt their playstyle accordingly.",
      "requirements": "Must have at least 50% exposure to a specific environmental hazard (radiation, chemical, biological) or consume 3+ contaminated resources within a 24-hour game period. Requires the 'Genetic Instability' perk to be unlocked.",
      "benefits": "Possible mutations include: Night Vision (see clearly in darkness), Toxin Resistance (reduced damage from environmental hazards), Enhanced Metabolism (faster healing and stamina recovery), or Dermal Armor (increased damage resistance).",
      "drawbacks": "Each mutation comes with a corresponding weakness: Night Vision causes light sensitivity, Toxin Resistance increases hunger rate, Enhanced Metabolism causes faster thirst depletion, Dermal Armor reduces movement speed. Mutations cannot be removed early once triggered.",
      "progression": "Mutations become more potent and last longer as players invest in the Genetic Instability perk tree. Higher tiers allow players to influence which mutation triggers, reduce drawback severity, or even combine multiple mutations at once with advanced drawbacks.",
      "ui_elements": "Mutation status bar showing remaining duration, visual effect filters (e.g., green tint for toxin resistance), mutation icon with tooltip in HUD, genetic instability perk tree in character menu, and environmental exposure meters for different hazard types."
  };
  
  static readonly type = 'mechanic';
  static readonly version = '1.0.0';
  static readonly generated = 1758078565386;
  
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
