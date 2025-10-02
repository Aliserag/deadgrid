/**
 * story_scenario: The Last Harvest
 */

import { GameModule } from '../../../core/GameModule';

export interface TheLastHarvestData {
  title: string;
  protagonist: any;
  setting: any;
  situation: string;
  attempted_solution: any;
  complications: string;
  resolution: any;
  lesson_learned: string;
  casualties: any[];
  resources_gained: any[];
  moral_choice: string;
  long_term_impact: any;
}

export class TheLastHarvestModule extends GameModule {
  static readonly metadata: TheLastHarvestData = {
      "title": "The Last Harvest",
      "protagonist": {
          "name": "Elara Vance",
          "age": 32,
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying her university's experimental greenhouse. Lost her family to the early riots and now leads a small community of survivors who depend on her knowledge of sustainable farming."
      },
      "setting": "The overgrown ruins of Roth University's bio-research campus, 12 years after the Collapse. Late autumn with an early frost threatening the last viable crops in the region.",
      "situation": "Elara's community faces starvation after blight destroyed their primary crops. Their remaining food stores will last only three weeks. Scouts reported an untouched pre-Collapse seed vault in the flooded lower levels of the agricultural building, but the area is unstable and occupied by 'Drowners' - mutated humans adapted to the submerged tunnels. The community's children are already showing signs of malnutrition, and winter approaches faster than anticipated.",
      "attempted_solution": "Elara organized a team of six to navigate through the ventilation systems above the flooded levels. They crafted makeshift rebreathers from salvaged materials and planned to lower themselves into the vault chamber from above, avoiding the main flooded corridors. Using her knowledge of the building's blueprints, Elara believed they could retrieve the seeds without engaging the Drowners. They brought torches and noise-makers to distract any creatures they might encounter, hoping to complete the mission in under four hours.",
      "complications": "The ventilation shafts had collapsed in sections, forcing them to take a riskier route through partially flooded maintenance tunnels. Liam, their best swimmer, was dragged under by a Drowner that had learned to hide in air pockets. His screams alerted more creatures. Then the ancient structure shifted, sealing their exit route and flooding their intended path back. They found the seed vault intact but protected by a security system that required power they couldn't restore. Trapped with limited oxygen and creatures gathering outside, they had to choose between abandoning the mission or finding another way in.",
      "resolution": "Elara realized the security system had a manual override in a submerged control room. Against all protests, she dove into the murky water, fighting through Drowners to reach the panel. She succeeded in opening the vault but suffered multiple bites in the process. The team escaped with the seed canisters by creating a diversion that collapsed part of the tunnel, sacrificing their escape route but sealing the creatures behind them. They returned with enough seeds to ensure future harvests, but the cost was heavier than anyone anticipated.",
      "lesson_learned": "No preparation survives first contact with the unknown. Sometimes the greatest risks come not from what we expect, but from what we've forgotten or never knew to anticipate. Always have multiple exit strategies and be willing to abandon a mission rather than lose everything.",
      "casualties": [
          "Liam (drowned and taken by Drowners)",
          "Dr. Chen (sacrificed himself to trigger the tunnel collapse)",
          "Elara (infected with an unknown pathogen from Drowner bites)"
      ],
      "resources_gained": [
          "18 sealed canisters of heirloom seeds",
          "3 agricultural data drives",
          "1 functional water filtration unit",
          "Drowner venom samples (for potential antidote research)"
      ],
      "moral_choice": "Whether to mercy-kill Liam when he was being dragged away (which might have saved him from worse suffering but would have meant abandoning any chance of rescue) or try to save him and risk everyone else.",
      "long_term_impact": "The community gained food security but lost trust in Elara's leadership due to the high casualties. The Drowner venom infection caused Elara to develop unusual abilities but also physical deterioration, making her both revered and feared. The tunnel collapse altered the water table, eventually making the entire campus area unstable and forcing relocation."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1757397049047;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheLastHarvestModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered story_scenario: The Last Harvest`);
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

export default TheLastHarvestModule;
