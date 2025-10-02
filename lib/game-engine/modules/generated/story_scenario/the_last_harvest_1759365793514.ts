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
          "name": "Dr. Aris Thorne",
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying his university's experimental farm. Lost his family to the early riots, now leads a small community of survivors who depend on his knowledge of sustainable farming."
      },
      "setting": {
          "location": "The overgrown ruins of Blackwood University's agricultural research center, surrounded by contaminated fields and crumbling campus buildings",
          "time": "Seven years after the Great Collapse, during the first promising harvest season in three years"
      },
      "situation": "The community's primary food supply - a carefully cultivated strain of radiation-resistant wheat - shows signs of a mysterious blight just days before harvest. Simultaneously, their water filtration system fails, and raider activity increases along their perimeter. With winter approaching and food reserves critically low, Aris must find a solution before starvation and desperation tear his community apart. The children are already showing signs of malnutrition, and trust in his leadership begins to waver as fear spreads through the settlement.",
      "attempted_solution": "Aris organized a desperate three-pronged approach: he took a small team to scavenge replacement parts for the water system from abandoned laboratories, sent the community's best fighters to establish a defensive perimeter against raiders, and assigned the remaining healthy adults to harvest what viable crops remained. He believed speed and coordination could overcome the multiple threats. Using his scientific knowledge, he attempted to isolate unaffected wheat samples for seed preservation while directing others to gather edible wild plants from the safer perimeter zones.",
      "complications": "The scavenging team returned empty-handed after encountering a new mutant predator species in the science building. The defense team suffered casualties when raiders used advanced weaponry they'd never seen before. Meanwhile, the early harvest revealed the blight had spread further than anticipated, contaminating nearly 70% of their food supply. To make matters worse, two community members attempting to gather wild food beyond the perimeter disappeared, likely captured by raiders. The remaining survivors began turning on each other, with some accusing Aris of incompetence while others advocated abandoning the settlement entirely.",
      "resolution": "In a last-ditch effort, Aris led a night raid on the raider camp to rescue the captured members and scavenge what supplies they could. During the chaotic fight, he discovered the raiders had been poisoning their fields intentionally. Though they rescued one captive and secured some food, they lost three more people. Returning to the settlement, Aris made the painful decision to abandon the farm, leading the remaining twenty survivors toward a rumored safe haven to the north. They left behind years of work, taking only what they could carry and the precious few uncontaminated seeds.",
      "lesson_learned": "No single solution can overcome multiple simultaneous crises. Sometimes survival means knowing when to cut losses and retreat rather than stubbornly defending unsustainable positions. Community trust is as vital as food and water.",
      "casualties": [
          "Marcus - defense team leader",
          "Lena - skilled mechanic",
          "Two unnamed defense team members",
          "Old Man Henderson - community elder",
          "The two captured foragers presumed dead"
      ],
      "resources_gained": [
          "15 pounds of mixed canned goods",
          "Functional water purification tablets",
          "Three working firearms with limited ammunition",
          "Medical supplies including antibiotics",
          "The remaining viable seed bank",
          "One rescued community member with intelligence about northern settlements"
      ],
      "moral_choice": "Whether to risk the entire community in a rescue attempt for two captured members or preserve resources for the majority. Aris chose rescue, costing additional lives but preserving the community's humanity and mutual protection pact.",
      "long_term_impact": "The community became nomadic, losing their agricultural knowledge base and becoming dependent on scavenging. The decision to rescue their captured members strengthened their bonds but left them more vulnerable. The loss of the seed bank meant future generations would struggle to reestablish sustainable farming. Aris's leadership was forever changed - he became more cautious but also more willing to make difficult sacrifices for long-term survival."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1759365793514;
  
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
