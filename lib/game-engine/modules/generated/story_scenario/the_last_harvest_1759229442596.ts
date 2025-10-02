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
          "name": "Dr. Aris Thorne",
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying his university's experimental greenhouse. Lost his family to the radiation sickness that followed the nuclear winter. Now leads a small community of survivors who depend on his knowledge of sustainable farming."
      },
      "setting": {
          "location": "The ruins of Blackwood University's agricultural campus, now known as 'The Greenhouse' settlement",
          "time": "Seven years after The Great Burn - late autumn, during the first hard frost"
      },
      "situation": "The settlement's primary food supply - a strain of radiation-resistant potatoes - has been infected with a mysterious blight. With winter approaching and supplies dwindling, the community faces starvation within weeks. Children are already showing signs of malnutrition, and morale has collapsed. Aris discovers the blight is mutating rapidly, threatening to wipe out their entire seed bank. The community's survival hinges on finding a solution before the first snowfall seals their fate.",
      "attempted_solution": "Aris organized a desperate expedition to the pre-collapse USDA seed vault located 20 miles away in the contaminated city ruins. He assembled a team of six skilled scavengers, planning to navigate through abandoned subway tunnels to avoid radiation hotspots. They carried Geiger counters, gas masks, and makeshift radiation suits. The plan was to retrieve any surviving seed samples that could replace their dying crops. Aris believed the vault's reinforced construction might have preserved some viable seeds, even after years of neglect and potential looting.",
      "complications": "The subway tunnels collapsed halfway through their journey, forcing the team to surface in a highly radioactive zone. Two members immediately fell ill from radiation exposure. Then they discovered the seed vault had been breached years earlier - most samples were destroyed or contaminated. While searching the ruins, raiders ambushed them, killing two more team members in the initial attack. The remaining survivors became trapped in a collapsed laboratory building, with the raiders laying siege outside. Their communication equipment was damaged, cutting them off from the settlement.",
      "resolution": "After three days trapped without food or clean water, Aris made a desperate gamble. He used his knowledge of chemistry to create makeshift explosives from laboratory chemicals, creating a diversion that allowed one team member to escape. The escapee made it back to the settlement, but Aris and the remaining survivor were captured by the raiders. In a final act of defiance, Aris triggered the building's emergency containment system, flooding it with fire-suppressant chemicals that created a thick fog. He used the confusion to escape with a single case of preserved seeds he'd hidden during the initial attack, though his companion didn't survive the escape.",
      "lesson_learned": "Never stake survival on a single solution. Always have multiple backup plans and diversify resources. The expedition's failure nearly doomed the entire settlement because they'd become over-reliant on one food source and one rescue plan.",
      "casualties": [
          "Lena Chen - radiation poisoning",
          "Marcus Rodriguez - tunnel collapse",
          "Sarah Jenkins - raider ambush",
          "David Kim - raider ambush",
          "Dr. Isabel Reyes - captured and executed during escape"
      ],
      "resources_gained": [
          "One case of heirloom tomato seeds",
          "Three vials of preserved legume samples",
          "Two functional Geiger counters",
          "Medical supplies from the laboratory",
          "Detailed maps of the city's underground systems"
      ],
      "moral_choice": "Aris had to choose between saving the captured seed samples or risking everything to rescue Dr. Reyes from the raiders. He chose the seeds, rationalizing that saving the settlement required sacrificing one life for many. The decision haunts him, as he heard Isabel's screams while escaping with the precious genetic material.",
      "long_term_impact": "The settlement successfully cultivated the new seeds, ensuring their survival through winter. However, trust in Aris's leadership fractured - many questioned his decision to abandon Isabel. The community implemented new rules about resource diversification and established multiple hidden food caches. The incident also revealed that organized raider groups were becoming more sophisticated, prompting the settlement to strengthen defenses and form alliances with other survivor communities for mutual protection."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1759229442598;
  
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
