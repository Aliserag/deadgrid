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
          "backstory": "A former agricultural scientist who survived the initial collapse by fortifying her university's experimental greenhouse. Haunted by the memory of losing her research team during the early riots, she now distrusts large groups but possesses unparalleled knowledge of post-collapse botany."
      },
      "setting": "The irradiated floodplains of former Nebraska, 12 years after the nuclear winter. The setting is a crumbling agricultural research station surrounded by salt-contaminated fields, with a partially functional geothermal generator providing minimal power.",
      "situation": "Elara's greenhouse food production has been failing for months due to mutated soil bacteria. Her six surviving community members are showing signs of radiation sickness and malnutrition. The last seed bank—containing genetically resilient crops she developed—is threatened by rising groundwater contamination. With winter approaching and food stores nearly exhausted, she must find a way to save both her people and the future of sustainable agriculture in the wasteland.",
      "attempted_solution": "Elara led a desperate expedition to the nearby ruins of a pre-collapse hydroponics facility, believing she could salvage nutrient solutions and sterile growing medium. She took three volunteers through the contaminated zones, using radiation suits patched together from old laboratory gear. Their plan was to secure the materials, establish a clean growing environment in the facility's sealed chambers, and begin immediate crop cultivation while protecting the precious seed bank from further contamination.",
      "complications": "The hydroponics facility was not abandoned—it had been occupied by a survivalist group who viewed the equipment as their property. When Elara's team began collecting materials, they were ambushed. During the confrontation, young Liam—Elara's apprentice—panicked and fired warning shots, sparking a violent exchange. The facility's fragile environmental seals were compromised in the struggle, flooding the growing chambers with contaminated air. The survivalists retreated, but not before destroying most of the nutrient solution stores out of spite.",
      "resolution": "Bleeding from a graze wound and facing complete failure, Elara made a heartbreaking choice. She used the last of their medical supplies to save a critically wounded survivalist they'd captured, then negotiated a truce by offering half their remaining seeds in exchange for access to the least-damaged growing chamber. Working together with their former enemies, they established a shared cultivation system. The first harvest—though meager—provided enough food to survive the winter and proved that cooperation could yield results where conflict had only brought ruin.",
      "lesson_learned": "Hoarding knowledge and resources ultimately weakens everyone. Survival sometimes requires trusting former enemies—the greatest harvest comes from planted bridges, not burned ones.",
      "casualties": [
          "Liam (apprentice, shot during the firefight)",
          "Anya (community elder, succumbed to radiation sickness during the expedition)"
      ],
      "resources_gained": [
          "Functional hydroponic growing system",
          "15 surviving seed varieties from the bank",
          "Alliance with the survivalist group",
          "Salvaged water purification components"
      ],
      "moral_choice": "Whether to let the wounded survivalist die to conserve medical supplies for her own people, or use their precious antibiotics on an enemy who might later turn against them.",
      "long_term_impact": "The uneasy alliance evolved into a thriving agricultural collective that became known as the 'New Plains Covenant.' Elara's shared seeds eventually developed into drought-resistant staple crops that spread across the wasteland, making her both a legendary figure and a controversial one—praised for feeding thousands but criticized for 'watering down' humanity's genetic future through cooperation with former enemies."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1758302144705;
  
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
