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
  casualties: any;
  resources_gained: string;
  moral_choice: string;
  long_term_impact: any;
}

export class TheLastHarvestModule extends GameModule {
  static readonly metadata: TheLastHarvestData = {
      "title": "The Last Harvest",
      "protagonist": {
          "name": "Elara Vance",
          "backstory": "Former agricultural scientist who lost her family in the initial collapse. Survived by turning her suburban home into a fortified greenhouse, using her knowledge to grow food when others starved. Haunted by memories but driven by the belief that sustainable agriculture is humanity's only hope."
      },
      "setting": "Ruined suburbs outside Chicago, 12 years after the Resource Wars. Eternal autumn caused by atmospheric changes, with early snows and perpetual gray skies. Elara's compound consists of a reinforced house surrounded by hydroponic gardens and makeshift greenhouses.",
      "situation": "Elara's food stores are critically low after raiders destroyed her main greenhouse. The first winter frost is days away, threatening her remaining crops. She discovers wild corn growing in contaminated soil near an old industrial park—potentially enough to save her community through the winter, but radiation levels make harvesting dangerous. Her eight survivors, including two children, face starvation without this food.",
      "attempted_solution": "Elara assembled a team with radiation suits salvaged from a university lab. They planned quick harvesting shifts, using Geiger counters to identify the least contaminated areas. She developed a decontamination protocol using vinegar and salt solutions learned from pre-war research. The plan was to harvest at dawn when radiation levels were slightly lower, working in 15-minute rotations to minimize exposure while gathering every viable ear of corn.",
      "complications": "The radiation suits turned out to be compromised—their seals degraded by time and previous use. Young Liam's suit failed completely within minutes, yet he kept working, too afraid to admit the malfunction. Then unexpected wind shifts blew radioactive dust across the harvesting team. When Elara ordered retreat, they discovered raiders had found their transport—the only vehicle capable of carrying their harvest—and disabled it, trapping them in the toxic fields.",
      "resolution": "Elara made the agonizing choice to sacrifice their vehicle's battery to power a makeshift signal booster, calling for help from a nearby settlement they'd been avoiding due to past conflicts. In exchange for half the harvest and medical supplies, the neighboring community provided transport and radiation treatment. They saved most of the corn but lost Liam to radiation poisoning. The collaboration forged an uneasy alliance between the two groups.",
      "lesson_learned": "Never trust old equipment without thorough testing. Sometimes survival requires reaching out to former enemies. The greatest resource isn't food or weapons—it's other people willing to cooperate.",
      "casualties": "Liam Chen (age 17) - radiation poisoning; Marta Rodriguez - severe radiation sickness (survived but with permanent health damage); Two members of the neighboring community died later from secondary exposure during decontamination efforts.",
      "resources_gained": "387 ears of radiation-resistant corn (now being cultivated as new seed stock), two functional radiation suits from the neighboring settlement, established trade route with another community, knowledge of effective decontamination techniques for irradiated food.",
      "moral_choice": "Whether to abandon Liam when his suit failed to save the others, or risk everyone trying to evacuate him immediately. Elara chose to try saving everyone, resulting in greater overall exposure but preserving their community's humanity.",
      "long_term_impact": "The corn seeds became the foundation of a new radiation-resistant crop strain that spread across multiple settlements. The alliance with the neighboring community evolved into a protective coalition. However, Elara developed severe guilt over Liam's death, becoming increasingly cautious and sometimes missing opportunities that required risk. The incident also established that some human bonds transcend survival pragmatism."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1757082649189;
  
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
