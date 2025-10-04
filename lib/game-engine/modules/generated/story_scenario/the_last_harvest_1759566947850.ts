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
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying his university's experimental greenhouse. Lost his family to the early riots and now suffers from survivor's guilt, channeling all his energy into preserving botanical knowledge and viable seeds."
      },
      "setting": {
          "location": "The ruins of Weston University's Agricultural Research Center, now surrounded by the decaying urban sprawl of what was once a major metropolitan area",
          "time": "Three years after the 'Great Burn' - a series of coordinated nuclear strikes that triggered global crop failures and societal collapse"
      },
      "situation": "Aris has maintained a small but vital greenhouse operation, preserving the last known specimens of blight-resistant wheat. When his water purification system fails during a critical growth phase, he faces watching three years of painstaking work wither in days. The nearest functional water source is the contaminated river two miles through hostile territory. His calculations show the plants have 72 hours before irreversible damage occurs. Each trip to the river risks exposure to raiders and radiation, but staying means certain loss of humanity's best chance at sustainable agriculture.",
      "attempted_solution": "Aris devised a nighttime expedition using his knowledge of old maintenance tunnels to reach the river undetected. He constructed a makeshift filtration system from laboratory equipment - activated charcoal from medical supplies, sand from construction debris, and cloth from abandoned clothing. He planned three rapid trips over two nights, carrying just enough water each time to sustain the most vulnerable seedlings. Using moonlight and his intimate knowledge of the campus layout, he mapped a route that avoided known raider camps and radiation hotspots. He prepared emergency hiding spots and diversion tactics, including noise-makers from broken equipment.",
      "complications": "On his second trip, Aris discovered raiders had occupied the tunnel exit near the river. Forced to take an overland route, he encountered a family of survivors - a mother and two children - hiding in the ruins. The youngest child had radiation sickness and begged for help. Helping them would reveal his position and consume precious time. As he hesitated, raiders spotted the family's shelter. In the ensuing chaos, Aris used his diversion devices to create an escape opportunity but sustained a leg injury from falling debris. The mother was captured while trying to protect her children, her screams echoing through the ruins as Aris helped the children to temporary safety.",
      "resolution": "Aris sheltered the children in a secure basement near his greenhouse, treating the sick child with his limited medical supplies. Knowing he couldn't complete his water mission and protect them simultaneously, he made the agonizing choice to sacrifice half his crop to save the remaining plants with available water. The two surviving children, Lena (12) and Milo (8), became his unexpected wards. While he lost the most experimental wheat strains, the core blight-resistant variety survived. The children brought new purpose to his isolation, and their different skills - Lena's scavenging ability and Milo's quiet observation - complemented his scientific knowledge, forming the foundation of an unlikely new family.",
      "lesson_learned": "Survival cannot be measured solely in resources preserved, but in humanity maintained. The most carefully calculated plans remain vulnerable to the unpredictable human element. Sometimes preserving the future means accepting losses in the present, and the greatest strength often comes from unexpected alliances.",
      "casualties": [
          "The children's mother (name unknown) - captured by raiders",
          "37% of the experimental wheat strains - lost to water shortage",
          "Two raiders killed during the diversion - though Aris takes no pride in this"
      ],
      "resources_gained": [
          "Two capable young survivors with unique skills",
          "Information about new raider movements and tactics",
          "The mother's hidden cache of medical supplies and tools",
          "Strengthened blight-resistant wheat seeds (reduced variety but viable)",
          "Renewed purpose and emotional connection"
      ],
      "moral_choice": "Whether to abandon the children to complete his mission and save all the wheat, or protect them while sacrificing part of humanity's agricultural future. He chose protection over preservation, valuing immediate human life against long-term species survival.",
      "long_term_impact": "The surviving wheat became the foundation of a new agricultural community, though with less genetic diversity than hoped. The children grew into key members of the settlement, with Lena becoming an expert scout and Milo developing into a skilled plant tender. Aris's decision created a community ethos that valued people over projects, shaping their recruitment and protection policies. The raiders, now aware of the greenhouse's location, became a persistent threat that required ongoing defense strategies. Most importantly, the incident proved that rebuilding civilization required not just preserving knowledge, but nurturing the next generation to carry it forward."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1759566947851;
  
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
