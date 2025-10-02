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
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying his university's experimental greenhouse. Lost his wife and daughter to raiders six months ago, now survives alone with deep-seated trust issues and clinical depression."
      },
      "setting": {
          "location": "Abandoned vertical farm complex in what was downtown Chicago, now called 'The Rust Gardens' by survivors",
          "time": "Three years after the Resource Wars collapsed global civilization. Late autumn, with winter's approach making every resource critical."
      },
      "situation": "Aris discovered a functioning hydroponic bay with genetically modified wheat that could feed dozens for months. However, the automated systems were failing, and the nutrient solution would be depleted in days. The complex was also occupied by a small group of desperate survivors called the 'Scrap Collectors' who didn't understand the farm's value but defended it fiercely. Aris faced the choice of sharing knowledge and risking betrayal or working alone and likely losing everything.",
      "attempted_solution": "Aris attempted a cautious approach, offering to trade his technical expertise for a share of the harvest. He spent three days slowly gaining their trust, teaching them basic maintenance while secretly creating backup nutrient solutions. He bonded with a young mother named Lena who reminded him of his daughter, showing her how to monitor pH levels and oxygenate the water. He began to hope that collaboration might work, that he could rebuild some small piece of the community he'd lost.",
      "complications": "Just as the first wheat heads began to form, raiders from the 'Iron Jackals' gang discovered the operation. They attacked during the night, using firebombs that threatened to destroy the entire complex. In the chaos, the Scrap Collectors' leader accused Aris of leading the raiders to them. The automated climate control systems failed, and the backup power Aris had been counting on had been secretly cannibalized by the collectors for trade goods. Trust shattered as quickly as the greenhouse glass.",
      "resolution": "During the firefight, Aris made a desperate choice - he triggered the emergency containment protocols, flooding the main growing chamber with fire-suppressant foam. The wheat crop was ruined, but the complex was saved. Lena was mortally wounded protecting the control room. With her dying breath, she gave Aris her daughter's location. Aris used his knowledge of the ventilation systems to funnel smoke into the raiders' positions, driving them out. The remaining Scrap Collectors, seeing his sacrifice, accepted his leadership.",
      "lesson_learned": "Trust must be earned slowly but given freely when proven. Survival requires community, but community requires vulnerability. Technical knowledge means nothing without human connection to give it purpose.",
      "casualties": [
          "Lena (young mother, 28)",
          "Two Scrap Collectors (Marcus and Jax)",
          "Three Iron Jackal raiders"
      ],
      "resources_gained": [
          "Salvaged hydroponic equipment",
          "Preserved wheat seeds from unaffected chambers",
          "Lena's daughter (7-year-old girl named Elara)",
          "Loyalty of remaining Scrap Collectors (4 adults)",
          "Complete maps of the complex's utility tunnels"
      ],
      "moral_choice": "Whether to use the ventilation system to flood the raiders' position with carbon monoxide from the backup generators - guaranteed to kill them all but violating his oath to preserve life, or risk his people in direct combat.",
      "long_term_impact": "Aris became the reluctant leader of a new community called 'The Gardeners,' combining his scientific knowledge with the collectors' practical skills. The incident created a lasting alliance based on shared sacrifice rather than mere convenience. Elara became the emotional center of the group, helping Aris heal from his own losses. The vertical farm became a beacon of hope in the Chicago ruins, but also a constant target for those who would take rather than build."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1759257936962;
  
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
