/**
 * story_scenario: The Last Harvest
 */

import { GameModule } from '../../../core/GameModule';

export interface TheLastHarvestData {
  title: string;
  protagonist: string;
  setting: string;
  situation: string;
  attempted_solution: string;
  complications: string;
  resolution: string;
  lesson_learned: string;
  casualties: any[];
  resources_gained: any[];
  moral_choice: string;
  long_term_impact: string;
}

export class TheLastHarvestModule extends GameModule {
  static readonly metadata: TheLastHarvestData = {
      "title": "The Last Harvest",
      "protagonist": {
          "name": "Elara Vance",
          "age": 32,
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying her university's experimental greenhouse. Lost her entire research team to raiders six months ago and has been surviving alone, using her knowledge to cultivate what little remains edible in the toxic soil."
      },
      "setting": {
          "location": "The ruins of Cornell University's agricultural research campus, Ithaca, New York",
          "time": "3 years after the 'Gray Blight' wiped out 90% of global food sources"
      },
      "situation": "Elara's carefully cultivated underground garden - the last known source of non-toxic food in the region - has been contaminated by radioactive runoff from recent acid rains. Her entire crop of genetically-resistant potatoes and tomatoes is developing black lesions. She has exactly 72 hours before the entire harvest becomes inedible, and winter is approaching. Without this food, she'll starve within weeks. The contamination is spreading faster than she anticipated, and the air inside her bunker grows thick with the scent of rotting vegetation and despair.",
      "attempted_solution": "Elara attempted to create an emergency isolation barrier using salvaged plastic sheeting and the last of her clean water to wash the unaffected plants. She worked through the night, her hands raw from handling the contaminated plants, using her scientific knowledge to try to neutralize the radioactivity with a makeshift chemical treatment made from crushed limestone and activated charcoal from her water filters. She sang old folk songs to keep her panic at bay, the melodies echoing strangely in the metallic confines of her bunker as she desperately tried to save even a portion of the harvest.",
      "complications": "The chemical treatment reacted violently with the radioactive particles, creating toxic fumes that forced her to abandon the bunker temporarily. During her evacuation, a group of desperate scavengers discovered her hideout's secondary entrance. While she was coughing outside, they breached her storage room and stole her emergency seed bank and water purification system. When she returned, gasping for clean air, she found both her harvest and her future compromised - the scavengers had trampled the remaining healthy plants in their rush to grab anything valuable.",
      "resolution": "With nothing left to lose, Elara tracked the scavengers to their camp downriver. Instead of attacking, she approached them at dawn with her hands raised, offering to teach them agricultural science in exchange for sharing what remained of her stolen seeds. The group's leader, a former teacher named Marcus, recognized her genuine expertise. They formed an uneasy alliance. Using combined resources, they managed to salvage about 30% of the seeds and established a new, better-protected greenhouse using knowledge from both communities.",
      "lesson_learned": "Isolation is a temporary defense, but knowledge shared becomes collective survival. The deepest resources aren't stored in bunkers but in the willingness to build new communities from broken remnants.",
      "casualties": [
          "Two scavenger children who had eaten contaminated food from Elara's bunker before realizing it was toxic",
          "Elara's faith in solitary survival"
      ],
      "resources_gained": [
          "17 loyal community members with diverse skills",
          "Expanded seed library with radiation-resistant strains",
          "Shared security system",
          "Marcus's knowledge of local water sources and geology"
      ],
      "moral_choice": "Whether to withhold the knowledge that the stolen seeds they were about to plant came from partially contaminated stock, potentially jeopardizing the new community's first harvest, or to tell the truth and risk being cast out as the bearer of bad news.",
      "long_term_impact": "The collaboration grew into 'New Agrarian Collective,' the first sustainable farming community in the northeastern wasteland. Elara's decision to share knowledge rather than hoard it created a model for other survivors, ultimately leading to the establishment of multiple interconnected settlements that began slowly reclaiming the poisoned earth through cooperation and shared purpose."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1757366444539;
  
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
