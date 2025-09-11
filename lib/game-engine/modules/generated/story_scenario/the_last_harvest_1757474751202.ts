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
          "backstory": "Former agricultural scientist who lost her family during the initial collapse. Survived by turning her suburban home into a fortified greenhouse, using her knowledge to grow food in contaminated soil. Haunted by memories but driven by the belief that sustainable agriculture is key to rebuilding."
      },
      "setting": "The irradiated remains of California's Central Valley, 12 years after the nuclear exchange known as 'The Severance'. Eternal autumn caused by atmospheric changes, with toxic red rains and mutated wildlife.",
      "situation": "Elara's greenhouse has been failing for months. The soil toxicity is increasing, and her remaining crops are dying. Her small community of 15 survivors faces starvation within weeks. When rumors surface of a pre-collapse seed vault at an abandoned agricultural research station 40 miles away, she becomes obsessed with reaching it. The journey would take her through the most contaminated zones and territory controlled by the 'Dust Raiders', cannibalistic scavengers who worship the radiation.",
      "attempted_solution": "Elara assembled a team of four: Marcus (a former soldier), Lena (a medic), and young Noah who knew the terrain. They modified an old radiation-shielded delivery truck, packing Geiger counters, filtration masks, and what little food remained. Their plan was to travel at night, avoid major roads, and use Noah's knowledge of drainage tunnels to bypass Raider territory. They carried precious antibiotics for trade and hoped to reach the research station within three days, believing the vault's lead shielding would have preserved the seeds.",
      "complications": "Two days in, they hit an unseen radiation sinkhole that disabled their vehicle. Forced to continue on foot, Marcus took a bullet protecting them from Raider scouts. Lena stayed behind to tend to his worsening wound while Elara and Noah pressed on. They found the research station buried under a collapsed greenhouse dome. While digging through debris, Noah triggered an old security system that alerted nearby Raiders. As they finally reached the seed vault, they found it partially flooded - most seeds were ruined except for a single sealed container of drought-resistant wheat.",
      "resolution": "Trapped by approaching Raiders, Elara made Noah hide with the seeds while she created a diversion. She triggered a methane buildup in the ruined labs, causing an explosion that took out several Raiders but left her captured. Marcus succumbed to his wounds despite Lena's efforts. Lena managed to find Noah and the seeds, and they barely escaped back to their community. Elara was presumed dead, though Raiders later traded her to another group for supplies. The wheat seeds became the foundation of their new agriculture, but the cost weighed heavily on the survivors.",
      "lesson_learned": "No single resource is worth the entire community's safety. Preparation must include multiple contingency plans, and sometimes the greatest survival skill is knowing when to abandon a mission rather than sacrifice everything for potential gain.",
      "casualties": [
          "Marcus (bled out from gunshot wound)",
          "Elara (captured, presumed dead though actually traded to slavers)",
          "3 Dust Raiders killed in explosion"
      ],
      "resources_gained": [
          "1 sealed container of drought-resistant wheat seeds (approximately 200 seeds)",
          "2 radiation medkits from research station",
          "Pre-collapse agricultural research data on hardened drives"
      ],
      "moral_choice": "Whether to sacrifice Marcus by leaving him behind to increase their escape chances, or risk everyone by slowing down to carry him. They chose to stay with him, which ultimately led to his death anyway and nearly cost them the seeds.",
      "long_term_impact": "The wheat seeds allowed the community to develop radiation-resistant crops, making them agriculturally independent. However, the loss of Elara and Marcus created leadership void and trauma that took years to heal. The community became more cautious and isolationist, refusing future missions despite potential gains. Noah, burdened by survivor's guilt, eventually left to search for Elara, sparking rumors she might still be alive somewhere in the wasteland."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1757474751203;
  
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
