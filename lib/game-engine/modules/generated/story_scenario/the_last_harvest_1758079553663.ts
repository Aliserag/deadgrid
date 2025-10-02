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
          "backstory": "A former botanist who lost her family in the initial collapse, now leads a small agricultural settlement called New Eden. She carries her daughter's tattered journal filled with pressed flowers as her only memento."
      },
      "setting": "The overgrown ruins of Sacramento, California, 12 years after the Great Collapse. New Eden operates from a repurposed hydroelectric plant, using its water channels for irrigation amid crumbling concrete and rusted machinery.",
      "situation": "A mutated blight has infected New Eden's primary food crops—the last surviving strain of pre-collapse potatoes. The settlement's 47 inhabitants face starvation within three weeks. Children already show signs of malnutrition. Elara discovered the infection spreading through the root systems during her morning inspection, the leaves curling into blackened crisps. Panic whispers through the community as food rationing begins immediately. The blight seems to spread through soil contact, threatening to wipe out their entire food supply.",
      "attempted_solution": "Elara led a team to scavenge hydroponic equipment from a university agricultural research lab 20 miles east. They planned to create isolated growing environments to save uninfected seed stock. Using reclaimed solar panels and water purifiers, they intended to establish a sterile growing operation in the hydroplant's basement. For three days, they fortified the basement area, sealing cracks and sterilizing surfaces with precious bleach reserves. Elara personally selected the healthiest remaining seedlings, her hands trembling as she handled the last viable roots.",
      "complications": "Raiders from the 'Rust Hounds' tribe ambushed the scavenging team returning with hydroponic tanks. Two settlers fell immediately, their screams echoing through the concrete canyons. The survivors abandoned most equipment to flee. Back at New Eden, the blight spread faster than anticipated—contaminated irrigation water had already reached the secondary crops. Elara's deputy, Marcus, accidentally tracked contaminated soil into the sterile basement while helping a wounded scavenger. Within hours, white mold appeared on the precious seed trays. Elara watched in horror as the last hope turned fuzzy and gray.",
      "resolution": "Elara remembered her daughter's journal mentioning wild tomatoes that grew near radiation zones. Risking mutation, she led a desperate expedition to the contaminated river delta. They found thriving cherry tomatoes growing near a chemical spill—apparently resistant to the blight. While two scouts succumbed to radiation sickness, they returned with baskets of acidic but edible fruit and seeds. New Eden survived on tomato stews and preserves while developing blight-resistant hybrids. The settlement became permanently smaller but more resilient, with everyone now understanding the fragility of their existence.",
      "lesson_learned": "Never put all seeds in one basket—maintain geographically separated food sources with different genetic strains. Survival depends on biodiversity, not efficiency.",
      "casualties": [
          "Marcus (deputy leader, soil contamination exposure)",
          "Lena (scout, radiation poisoning)",
          "Jin (guard, raider ambush)",
          "Two unnamed children (malnutrition complications)"
      ],
      "resources_gained": [
          "42 viable tomato seed varieties",
          "3 partially functional hydroponic tanks",
          "Raider weapons (2 rifles, ammunition)",
          "Radiation mapping data of northern delta"
      ],
      "moral_choice": "Whether to use the contaminated but fertile river delta soil for faster crop growth, knowing it would cause slow health deterioration in consumers but prevent immediate starvation.",
      "long_term_impact": "New Eden became known as 'Tomato Town,' trading blight-resistant seeds across territories. The settlement developed a caste system between those willing to work contaminated lands and those who refused. Elara's leadership became more authoritarian, implementing strict quarantine protocols that sometimes cost lives but ensured the community's survival. The event created lasting tension between safety and abundance that would define generations."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1758079553663;
  
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
