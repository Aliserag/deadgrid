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
  casualties: string;
  resources_gained: string;
  moral_choice: string;
  long_term_impact: string;
}

export class TheLastHarvestModule extends GameModule {
  static readonly metadata: TheLastHarvestData = {
      "title": "The Last Harvest",
      "protagonist": {
          "name": "Elara Vance",
          "backstory": "Former botanist and community gardener who lost her family in the early collapse. Survived by turning her apartment complex's rooftop into a hidden greenhouse, becoming the reluctant caretaker of a small group of survivors who depend on her crops."
      },
      "setting": "The overgrown ruins of downtown Seattle, 12 years after the 'Gray Fever' pandemic collapsed society. Late autumn, with freezing rains and dwindling daylight.",
      "situation": "Elara's rooftop greenhouse—the group's only reliable food source—is failing. A mutated blight has infected the soil, withering their remaining crops. With winter approaching and supplies critically low, the twelve survivors face starvation. Tensions rise as rationing tightens, and hope dwindles with each yellowed leaf. Elara feels the weight of their dependence; every glance from the hungry feels like an accusation. The children are growing thin, and the adults speak in hushed tones about impossible choices.",
      "attempted_solution": "Remembering her research, Elara recalled a rare, blight-resistant root vegetable that once grew in a sealed university bio-lab a mile away. She proposed a desperate expedition: navigate through collapsed streets and infected zones to retrieve seeds or samples. She and two volunteers, Leo and Mara, armed themselves with makeshift weapons and set out at dawn, hoping the lab's isolation had preserved something viable.",
      "complications": "The route was more treacherous than expected. A recent landslide had blocked their planned path, forcing them through a territory controlled by a hostile scavenger gang. They were ambushed. Leo fought to give them time, shouting for Elara and Mara to run. Mara was grazed by a bullet but kept moving. They reached the lab, only to find it looted and burned years prior. The seed vault was smashed open, its contents scattered and ruined. As they retreated, they realized they were being hunted—the gang had followed their trail.",
      "resolution": "Cornered in a crumbling office building, with Mara bleeding and their ammunition spent, Elara used her knowledge of the city's old steam tunnels to escape. They emerged miles away, exhausted and empty-handed. Leo never made it out of the ambush. They returned at nightfall to a group whose hope turned to ashes upon seeing their faces. There would be no miracle crop. They faced the winter with what little they had, and the harsh reality that some wouldn't survive it.",
      "lesson_learned": "Hope is a plan, not a feeling. Never risk everything on a single desperate gamble without contingencies. Preparation and diversified resources are the only true insurance in a broken world.",
      "casualties": "Leo, killed in the ambush. Two elderly survivors and one child succumbed to malnutrition over the winter due to the failed food supply.",
      "resources_gained": "A half-empty can of fuel, a functional hand-crank radio salvaged from the ruins, and a detailed map of the old steam tunnels found during their escape.",
      "moral_choice": "During the escape, Elara and Mara encountered a lone, injured scavenger—a young boy—left behind by his gang. They had to choose: kill him to eliminate a potential threat, leave him to die, or risk bringing him along, potentially endangering the entire group with his loyalties or by slowing them down.",
      "long_term_impact": "The group's trust in Elara's leadership was deeply fractured. The loss of life and failed mission created a lasting undercurrent of resentment and grief. However, the discovery of the steam tunnels opened up new, safer travel routes, eventually allowing them to establish contact with another small settlement, leading to a fragile but crucial trade network. The winter of starvation became a foundational trauma, forever changing the community's psychology and their approach to risk and cooperation."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1757718647134;
  
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
