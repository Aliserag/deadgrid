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
          "time": "Late autumn, seven years after the Great Collapse. The air carries the bite of coming winter and the scent of decay."
      },
      "situation": "The community's winter food stores have been contaminated by a mysterious mold, and their remaining supplies will only last three weeks. With winter approaching and game becoming scarce, Aris discovers wild grain growing in the radiation-zone fields—potentially edible but possibly toxic. The community faces starvation if they don't risk harvesting these mutated crops, but consumption could mean poisoning or slow death from radiation sickness. Children are already showing signs of malnutrition, and trust in Aris's leadership is fraying as desperation grows.",
      "attempted_solution": "Aris proposed a careful harvesting operation using the community's remaining protective gear. He planned to test small batches of the grain on laboratory rats they'd maintained, then gradually introduce safe portions into their diet. He led a team of six volunteers into the contaminated zone, wearing patched-up hazmat suits and carrying makeshift radiation detectors. They worked in rotating shifts to minimize exposure, carefully harvesting the strange golden grain that glowed faintly in the twilight. Aris believed they could process the grain to reduce toxicity, using his knowledge of food science to make the dangerous harvest survivable.",
      "complications": "On the third day of harvesting, raiders attacked the research center, drawn by rumors of the grain discovery. The community's defenders were overwhelmed, and the raiders breached the perimeter. During the chaos, young Liam—a boy Aris had sworn to protect—sneaked out to help defend the harvest and was captured. The raiders offered a trade: all their harvested grain for the boy's life. To make matters worse, the test rats began showing signs of radiation poisoning, indicating the grain was more dangerous than Aris had estimated. The community fractured between those willing to sacrifice Liam for the food and those who couldn't bear another loss.",
      "resolution": "Aris made the impossible choice to trade half the grain for Liam, knowing it might doom them all. In the tense exchange, one of the raiders panicked and shot Liam anyway. Enraged, Aris triggered a controlled explosion in the chemistry lab, creating a diversion that allowed his people to retrieve both Liam's body and the remaining grain. Back at the compound, they discovered the grain could be made safe through extensive processing—but the yield was barely enough to see them through winter. Liam died in Aris's arms, his last words begging Aris to keep the others safe. The community survived, but something in Aris broke that day.",
      "lesson_learned": "No survival plan survives contact with human desperation. Sometimes the choice isn't between right and wrong, but between terrible and catastrophic. Trust must be earned daily in this new world, and hope can be more dangerous than radiation.",
      "casualties": [
          "Liam Petrov (age 12) - shot during hostage exchange",
          "Maya Chen - killed defending the perimeter",
          "Two unnamed raiders"
      ],
      "resources_gained": [
          "18kg of processed safe grain",
          "Two functional radiation meters from raiders",
          "Medical supplies from raider packs",
          "Knowledge of grain detoxification process"
      ],
      "moral_choice": "Whether to sacrifice an innocent child for the survival of the many, or risk starvation for everyone to uphold their humanity. Aris chose a middle path that cost them food and still lost the child.",
      "long_term_impact": "The community became more militarized but less trusting. Aris's authority shifted from respected leader to necessary burden. They developed successful grain processing techniques that became valuable trade knowledge, but the memory of Liam's death haunted every harvest. The incident attracted other desperate groups, both traders and raiders, making their location permanently less secure. Aris began training others to lead, knowing his decisions were becoming increasingly detached from human costs."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1759952740380;
  
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
