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
          "backstory": "Former botanist and university professor who survived the initial collapse by fortifying his agricultural research station. Lost his wife to raiders two years ago and now leads a small community of survivors focused on sustainable farming."
      },
      "setting": {
          "location": "The Greenhaven Agricultural Research Station, nestled in what was once Oregon's Willamette Valley",
          "time": "Seven years after the Great Collapse, during the first promising harvest season in three years"
      },
      "situation": "The community's entire winter food supply depends on the ripening grain fields when Aris discovers a fast-spreading fungal blight that could destroy everything within days. The fungus produces toxic spores that could contaminate their soil for years. With only 48 hours before complete crop failure, the community faces starvation. Panic spreads as parents calculate how little food remains in storage. Children sense the tension and cling to their parents, while older survivors remember previous famines that claimed loved ones.",
      "attempted_solution": "Aris organized teams to harvest what grain they could salvage before the blight spread further. He mixed emergency antifungal compounds from their limited medical supplies with rainwater, creating treatment sprays. Teams worked in rotating shifts through the night, their headlamps cutting through the darkness as they raced against time. Aris himself worked 36 hours straight, his hands raw from handling sick plants, voice hoarse from shouting instructions. They erected makeshift barriers around unaffected sections and burned infected plants downwind to contain the spores.",
      "complications": "The fungal spores triggered severe allergic reactions in several harvesters, including Aris's lead assistant, Maya, who collapsed in the fields. Then raiders, attracted by the nighttime activity, attacked the perimeter. During the firefight, storage silos were breached, contaminating previously safe grain. Heavy rain washed the antifungal treatment away while spreading the blight to previously healthy sections. The community became divided between those wanting to abandon the harvest and flee, and those determined to save what they could. Morale shattered when they realized half the crop was already lost.",
      "resolution": "Aris made the heartbreaking decision to sacrifice the northern fields as a firebreak, burning their second-largest grain plot to save the core harvest. During the controlled burn, he rescued two children who had wandered into the danger zone, suffering burns to his hands. The community managed to salvage 30% of their expected yield—enough to survive winter if strictly rationed. Maya survived but lost vision in one eye from spore exposure. The raiders were driven off but promised to return. As snow began falling, the community gathered in their makeshift chapel, quietly grateful for what remained.",
      "lesson_learned": "Never put all survival eggs in one basket—diversify crops and storage locations. Some losses must be accepted to prevent total destruction.",
      "casualties": [
          "Old Man Henderson (smoke inhalation during firefighting)",
          "Lena Petrov (raider gunshot wound)",
          "The Miller family's infant son (complications from spore exposure)"
      ],
      "resources_gained": [
          "18 bushels of salvageable grain",
          "3 barrels of medical-grade alcohol from the research lab",
          "2 captured rifles from raiders",
          "Detailed notes on fungal resistance for future planting"
      ],
      "moral_choice": "Whether to use their last reserves of antibiotics to treat the spore-afflicted or save them for combat injuries from future raider attacks. Aris chose to treat the sick, believing preserving community trust was more valuable than preparing for hypothetical future violence.",
      "long_term_impact": "The community established satellite growing plots in hidden locations to prevent total crop failure. Relationships with neighboring settlements improved through shared food preservation techniques developed from this crisis. However, the raider group vowed vengeance, ensuring future conflicts. Aris's leadership was unquestioned but at the cost of deep personal guilt over the lives lost."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1759526439268;
  
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
