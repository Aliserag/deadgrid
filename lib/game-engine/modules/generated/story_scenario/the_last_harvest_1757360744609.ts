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
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying her university's experimental farm. Lost her family to the early riots and now leads a small community of survivors who depend on her knowledge of sustainable farming."
      },
      "setting": {
          "location": "The overgrown ruins of Rockwood University's agricultural research center, surrounded by decaying suburbs of what was once a mid-sized city",
          "time": "Late autumn, 7 years after the Collapse. The first frost is approaching."
      },
      "situation": "The community's primary food stores have been contaminated by a mysterious mold that destroys both crops and preserved goods. With winter approaching and only three weeks of safe rations remaining, Elara must find a solution before starvation sets in. The community's morale is crumbling as parents watch their children grow thinner each day, and some are already discussing desperate measures like venturing into the irradiated city center for canned goods.",
      "attempted_solution": "Elara remembered the university's underground seed vault containing genetically modified drought-resistant crops. She organized a team to excavate the collapsed entrance tunnel, working in shifts around the clock. They constructed makeshift supports from reclaimed building materials and used hand-powered drills to carefully clear debris. For five grueling days, they fought against time and unstable rubble, fueled by the hope that the vault might contain viable seeds that could be quickly cultivated in their hydroponic systems.",
      "complications": "On the sixth day, as they broke through to the vault chamber, they discovered the university's head of security had survived there since the collapse. Paranoid and armed with preserved university weapons, he believed they were raiders coming to steal 'his' seeds. He opened fire, wounding two of Elara's team. The gunfire destabilized the tunnel, causing a secondary collapse that trapped both parties inside the unstable structure. They found themselves in a standoff—armed and desperate on both sides, with limited oxygen and no clear escape route.",
      "resolution": "Elara risked everything by laying down her weapon and approaching the security chief with open hands. She shared their community's plight, showing photos of the starving children back at camp. The old man, realizing he'd been guarding dead seeds for living people, broke down weeping. He helped them locate the emergency exit tunnel, sacrificing himself to hold off the structural collapse while the others escaped. They emerged with only a third of the seeds they'd hoped for, but enough to ensure survival.",
      "lesson_learned": "Preparing for human nature is as important as preparing for environmental threats. The greatest dangers often come not from the wasteland itself, but from the fear and isolation it creates in survivors.",
      "casualties": [
          "Marcus (security chief)",
          "Lena (hydroponics specialist, died from wounds)",
          "Two unnamed community members (tunnel collapse)"
      ],
      "resources_gained": [
          "378 viable drought-resistant seed varieties",
          "University's agricultural research data",
          "Security chief's firearm collection",
          "Emergency tunnel maps of campus"
      ],
      "moral_choice": "Whether to use their limited medical supplies on their wounded comrade or save them for the inevitable winter illnesses that would affect the children and elderly. Elara chose to treat Lena, who died anyway, leaving them with depleted medical stores.",
      "long_term_impact": "The seeds allowed the community to develop frost-resistant crops, making them self-sufficient but also making their settlement a target for other survivor groups. Elara's willingness to trust strangers fundamentally changed their community's isolationist policies, leading to both new alliances and new vulnerabilities."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1757360744610;
  
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
