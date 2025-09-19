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
          "backstory": "A former agricultural scientist who lost her family during the initial collapse. She now leads a small community of survivors, using her knowledge to maintain a fragile food supply in their fortified greenhouse complex."
      },
      "setting": "The ruins of a university botanical research center, now repurposed as a survival enclave. 12 years after the global infrastructure collapse, during an unseasonably cold autumn that threatens the last viable crops.",
      "situation": "The community's primary food source—a genetically modified strain of quick-growing wheat—has been infected with a mutated blight. Within days, the entire crop shows signs of rapid decay. With winter approaching and supplies critically low, starvation becomes an imminent threat. Panic spreads through the enclave as people realize this could mean the end of their three-year struggle for stability. Elara watches children already looking thinner and knows she has maybe two weeks before people start dying.",
      "attempted_solution": "Elara organizes a desperate expedition to retrieve original seed samples from her old research laboratory across the contaminated city. She selects four capable survivors, including her second-in-command Marcus and young but quick Liam. They plan a three-day journey using old sewer tunnels to avoid the worst radiation zones and raider territories. They carry minimal supplies to move quickly, hoping to retrieve the sealed seed vaults that might contain blight-resistant variants.",
      "complications": "The sewer routes they memorized from old maps have collapsed in multiple places, forcing them to navigate through unfamiliar and dangerous surface areas. They encounter a previously unknown raider group that tracks them relentlessly. During a frantic firefight, Marcus takes a bullet to the leg, slowing their progress dramatically. When they finally reach the laboratory, they find it partially collapsed and occupied by aggressive mutants. The seed vault door is sealed with a security system that requires power they don't have.",
      "resolution": "Liam sacrifices himself by creating a diversion to draw the mutants away while Elara jury-rigs the laboratory's emergency solar backup to open the vault. They retrieve three sealed seed canisters but take heavy fire during their escape. Marcus, realizing his injured leg makes him a liability, stays behind to hold off pursuers. Elara returns alone with the seeds, arriving to find her community has lost two more people to hunger in her absence. The new seeds show promise but require months of careful cultivation.",
      "lesson_learned": "Never rely on a single solution for survival. Redundancy and multiple backup plans are essential. Knowledge and preparation are more valuable than any single resource.",
      "casualties": [
          "Liam (22, scout)",
          "Marcus (45, security lead)",
          "Two elderly community members who succumbed to malnutrition during the expedition"
      ],
      "resources_gained": [
          "Three sealed canisters of heritage seeds",
          "Laboratory research notes on crop rotation",
          "Two functional solar panels from the lab roof",
          "A partially charged radiation detector"
      ],
      "moral_choice": "Whether to abandon Marcus when his injury slowed them down, or risk everyone's safety trying to carry him. Elara chose to try saving him, which ultimately led to his sacrificial death and nearly cost them the entire mission.",
      "long_term_impact": "The community becomes more self-sufficient but deeply traumatized. They establish multiple smaller growing locations instead of relying on one main greenhouse. A culture of caution replaces previous optimism, making them more resilient but less willing to help outsiders. Elara's leadership becomes unquestioned but lonely, as she carries the guilt of both successes and failures."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1757986840143;
  
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
