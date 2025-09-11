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
          "age": 34,
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying her university's research greenhouse. Lost her family to the early riots and now leads a small community of survivors focused on sustainable food production."
      },
      "setting": "The ruins of Cornell University's agricultural research campus, 12 years after the Collapse. Late autumn with early frost threatening the last crops.",
      "situation": "Elara's community faces starvation after contaminated water destroyed their primary grain harvest. Their emergency supplies will last only three weeks. Scouts report a massive untouched seed vault at the abandoned USDA research facility 40 miles away - potentially containing drought-resistant super-seeds that could ensure their survival through the coming winter. However, the facility lies in irradiated territory from an old military strike, and rumors speak of 'Twisted' mutants nesting in the complex.",
      "attempted_solution": "Elara assembled a team of six skilled survivors, including her best scout Marcus and medical expert Dr. Chen. They modified an old delivery truck with radiation shielding and planned a lightning raid during daylight hours when mutants were less active. The plan involved entering through ventilation shafts to avoid main entrances, using Geiger counters to navigate the least contaminated paths, and prioritizing seed samples that could grow in their contaminated soil. They prepared for a 36-hour mission with minimal supplies to maximize cargo space.",
      "complications": "The ventilation shafts had collapsed from years of neglect, forcing them through the main entrance where they triggered ancient security systems. The resulting noise attracted a horde of Twisted - humans mutated by radiation and biological weapons. During the frantic retreat, Marcus sacrificed himself to hold a blast door open while others escaped. Dr. Chen suffered radiation poisoning when their protective gear tore during the scramble. They managed to grab only one seed crate instead of the planned ten, and the modified truck's engine failed two miles from the facility, forcing them to continue on foot through mutant-patrolled territory.",
      "resolution": "Carrying the wounded Dr. Chen and their single crate of seeds, the survivors took shelter in a collapsed highway tunnel. Elara realized they'd never make it back without transportation. Remembering Marcus's sacrifice, she led a desperate night operation to salvage parts from their disabled truck to create radiation-distraction devices. Using these to lure mutants away, they managed to recover a abandoned military vehicle from a nearby ditch. They arrived home after five days instead of two, with only three survivors. Dr. Chen died two days later from radiation sickness, but not before helping identify the salvaged seeds as viable.",
      "lesson_learned": "No preparation survives first contact with the unknown. Sometimes the greatest resource isn't what you bring back, but the knowledge of what dangers exist and how to avoid them next time. Sacrifices made in desperation must be honored through better planning, not repeated through necessity.",
      "casualties": [
          "Marcus (scout) - killed holding door against mutants",
          "Dr. Chen (medical expert) - radiation poisoning",
          "Two security team members - mutant ambush during retreat"
      ],
      "resources_gained": [
          "One crate of drought-resistant seed variants",
          "Salvaged military vehicle with partial radiation shielding",
          "Detailed maps of contaminated zones",
          "Knowledge of mutant behavior patterns"
      ],
      "moral_choice": "When Dr. Chen's radiation sickness became critical, the team had to decide whether to euthanize him to prevent his suffering (and potential mutation), attempt a dangerous radiation treatment using their limited medical supplies that might fail, or leave him behind to increase their own survival chances. Elara chose the treatment, using 80% of their medical resources despite the low success probability.",
      "long_term_impact": "The seeds allowed development of radiation-resistant crops that became the community's primary food source, eventually traded with other settlements. The loss of their medical expert and head scout created security and health vulnerabilities that took years to address. Elara's leadership was questioned, leading to a more democratic decision-making process. The community became more cautious about expeditions but also more innovative in preparation and contingency planning."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1757459445260;
  
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
