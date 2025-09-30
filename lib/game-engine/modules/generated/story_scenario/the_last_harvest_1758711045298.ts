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
          "backstory": "Former agricultural scientist who specialized in drought-resistant crops. Lost her family during the initial collapse and now leads a small community of survivors. Haunted by memories of watching her daughter starve, she's obsessed with finding sustainable food sources."
      },
      "setting": {
          "location": "The ruins of Sacramento, California, in what was once the Central Valley breadbasket",
          "time": "12 years after the Great Burn - a series of nuclear exchanges that triggered permanent climate disruption"
      },
      "situation": "Elara's community of 47 survivors faces starvation after their rooftop gardens failed due to acid rain. Their emergency supplies will last only three weeks. Scouts reported an untouched pre-Collapse agricultural research facility 20 miles east, but the area is controlled by the 'Ash Wolves' - a ruthless gang that crucifies trespassers. The facility might contain preserved seeds and working hydroponic systems that could save them. Elara must decide whether to risk everything on a desperate mission or watch her people slowly waste away like her family did.",
      "attempted_solution": "Elara assembled a team of six volunteers, including her best scout Marcus and young Liam who knew the old irrigation canals. They planned to approach through the flooded underground drainage system, avoiding Ash Wolf patrols. Using makeshift rebreathers from firefighter masks, they'd navigate the toxic waterways at night. The plan was to infiltrate, grab whatever seeds and equipment they could carry, and retreat before dawn. Elara spent days studying old sewer maps, identifying an entry point miles from the facility that would emerge directly beneath the research building's basement level.",
      "complications": "The drainage tunnels were more collapsed than expected, forcing them to surface early near an Ash Wolf outpost. Liam panicked when a mutant rat swarm attacked in the tight confines, firing his weapon and alerting the gang. Marcus took a bullet to the leg during the ensuing firefight. As they dragged him to safety, Ash Wolves set up perimeter lights and began systematic hunting. Trapped in a maintenance tunnel with Marcus bleeding out and gang members methodically checking each passage, Elara realized their escape route was completely compromised. The facility was now swarming with enemies, and their carefully planned stealth mission had turned into a desperate survival situation.",
      "resolution": "Elara made the agonizing choice to split the group. She sent three members back through a risky alternative route with Marcus, knowing he'd likely die en route. She and Liam created a diversion by setting fire to an old fuel depot, drawing most Ash Wolves away. While the gang fought the blaze, they breached the facility's lower levels. They found the seed vault intact but the hydroponics destroyed. As Ash Wolves returned, Liam sacrificed himself holding a choke point while Elara escaped with 20 pounds of precious seeds. Only Elara and one other survivor made it back to camp after four days in the wasteland.",
      "lesson_learned": "No plan survives contact with the enemy. Preparation matters, but adaptability matters more. Sometimes the cost of survival is measured in lives, not resources.",
      "casualties": [
          "Marcus (bled out during escape)",
          "Liam (killed holding the choke point)",
          "Two other team members captured/crucified by Ash Wolves"
      ],
      "resources_gained": [
          "20 lbs of heirloom seeds (including drought-resistant strains)",
          "Agricultural research data on surviving hard drives",
          "Two functional solar panels from the facility's roof"
      ],
      "moral_choice": "Whether to abandon the wounded Marcus to improve the others' survival chances, or risk everyone trying to save one dying man.",
      "long_term_impact": "The seeds allowed the community to establish sustainable agriculture, becoming a regional food hub. However, Elara's leadership became more authoritarian, her decisions driven by cold calculus rather than compassion. The Ash Wolves launched retaliatory raids, beginning a bloody feud that would claim more lives over the years. Liam's sacrifice became community legend, inspiring both heroic devotion and reckless martyrdom among younger survivors."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1758711045300;
  
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
