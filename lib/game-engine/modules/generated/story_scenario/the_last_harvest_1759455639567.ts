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
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying his university's experimental greenhouse. Lost his family to the early riots and now sees preserving knowledge as his redemption."
      },
      "setting": {
          "location": "The ruins of Westwood University's Agricultural Research Center, surrounded by the skeletal remains of suburban Los Angeles",
          "time": "Three years after the Great Burn - a global collapse triggered by simultaneous crop failures and energy wars"
      },
      "situation": "Aris has maintained a small but vital greenhouse of genetically diverse crops - the last known repository of several key food plants. When raiders discover his location, they systematically destroy the perimeter defenses. With winter approaching and his food stores running dangerously low, Aris faces the impossible choice of abandoning his life's work or risking starvation to protect the last viable seeds that could one day restore agriculture. The greenhouse's climate control systems are failing, and every day brings new scavenger attacks on the weakened defenses.",
      "attempted_solution": "Aris attempted to negotiate with the local scavenger tribe, offering them regular food rations in exchange for protection. He shared his precious seed bank knowledge, demonstrating how proper cultivation could provide sustainable food rather than temporary scavenging. He even taught them basic agricultural techniques, hoping to transform raiders into farmers. For two months, the arrangement seemed to work - the scavengers provided security while Aris expanded the greenhouse operations, creating a fragile but functioning micro-community where knowledge and protection were exchanged for food and safety.",
      "complications": "The scavenger leader, a brutal man named Kael, grew impatient with the slow pace of farming and decided to seize control of the entire operation. He betrayed Aris during the first major harvest, locking him out of the greenhouse and taking several graduate students hostage. The delicate climate control systems were damaged during the takeover, causing temperature fluctuations that threatened the most vulnerable seedlings. Worse, Kael's men began consuming the seed stock itself rather than planting it, destroying years of painstaking preservation work in mere days of reckless consumption.",
      "resolution": "Aris rallied the remaining loyal students and a faction of scavengers who had genuinely embraced farming. In a desperate night assault, they retook the greenhouse but found most of the rare seed varieties already consumed or contaminated. During the fighting, the main growth chamber was set ablaze. Aris managed to save only one sealed container of base genetic stock and three students. They escaped into the ruined city as the last greenhouse dome collapsed behind them, the flames consuming years of research and the dream of immediate agricultural restoration.",
      "lesson_learned": "Knowledge without the means to defend it is worthless in the new world. Good intentions must be backed by strength and vigilance. Preservation requires not just wisdom but the capability to protect what you've preserved.",
      "casualties": [
          "Two graduate students killed during the initial betrayal",
          "Three scavengers who sided with Aris during the retaking",
          "The entire genetic library of specialized crops",
          "The university's last functional greenhouse"
      ],
      "resources_gained": [
          "One sealed cryo-container with base genetic material",
          "Three surviving trained agricultural assistants",
          "Two converted scavengers with combat skills",
          "Detailed notes on which crops failed and why",
          "Hard lessons about human nature in collapse"
      ],
      "moral_choice": "Whether to destroy the greenhouse himself to prevent the scavengers from misusing the genetic material, potentially setting back agricultural recovery by decades, or continue fighting to reclaim it and risk the knowledge falling into permanently destructive hands.",
      "long_term_impact": "The loss of the specialized seed bank means future agricultural recovery will depend on more primitive, less productive crop varieties. The incident created deep distrust between knowledge-keepers and survival groups, making future collaborations more difficult. However, the three surviving students became determined evangelists for agricultural knowledge, spreading basic farming techniques more widely but more cautiously throughout the wasteland."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1759455639568;
  
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
