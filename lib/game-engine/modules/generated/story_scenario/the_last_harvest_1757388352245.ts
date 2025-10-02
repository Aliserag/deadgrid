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
          "backstory": "Former agricultural scientist who lost her family in the initial collapse. Survived by turning her suburban home into a fortified greenhouse, using her knowledge to grow food where others failed. Haunted by the memory of watching her daughter starve despite her expertise."
      },
      "setting": "Ruined suburbs outside Chicago, 12 years after the 'Gray Blight' wiped out most crops and livestock. Permanent twilight skies from atmospheric dust, with temperatures rarely rising above freezing even in summer.",
      "situation": "Elara's greenhouse has been failing for months. The soil has become toxic, and her remaining seed bank is dwindling. Her small community of 15 survivors faces starvation within weeks. When a scavenger brings rumors of a pre-collapse agricultural research facility with intact seed vaults and functioning hydroponics, Elara knows she must lead an expedition despite the dangers of traveling through raider-controlled territories and mutated wildlife zones.",
      "attempted_solution": "Elara assembles a team of six capable survivors. They modify an old delivery truck with armor plating, load it with trade goods, weapons, and enough supplies for the two-week journey. Using her knowledge of old agricultural maps, Elara plots a route through lesser-used service roads. They plan to trade medical supplies they've hoarded for access to the facility's resources, hoping to bring back not just seeds but working hydroponic equipment that could save their community.",
      "complications": "The raider ambush came at the worst possible moment - during a radioactive dust storm that disabled their vehicle's electronics. Though they fought off the initial attack, their medic was fatally wounded, and they lost most of their trade goods. Stranded without transportation, they discovered the research facility was actually controlled by a cult that worshipped the 'pure' pre-collapse seeds as religious relics. The cult leader demanded they prove their worth by sacrificing one of their own to 'purify' the seeds before allowing any trade.",
      "resolution": "Elara made the gut-wrenching decision to offer herself as the sacrifice, knowing her knowledge could help the cult actually use the seeds rather than hoard them. As she prepared for the ritual, her second-in-command staged a diversion that allowed the team to steal a critical selection of seeds and equipment. In the chaos, Elara was wounded but escaped. They commandeered a cult vehicle and barely made it back to their community, but only three of the original six returned alive. The stolen resources would save their people, but at a terrible personal cost.",
      "lesson_learned": "Hope can be as dangerous as despair when it makes you desperate. Sometimes survival means making choices that leave you alive but hollowed out. The greatest resources aren't seeds or equipment, but the people willing to make unbearable choices for the community's sake.",
      "casualties": [
          "Dr. Marcus Chen (medic, died from raider wounds)",
          "Jessa Morales (scout, killed protecting the retreat)",
          "Tommy Vance (Elara's nephew, sacrificed himself to create the diversion)"
      ],
      "resources_gained": [
          "18 varieties of cold-resistant seeds",
          "Portable hydroponic system",
          "Agricultural research data on surviving crops",
          "Two functioning solar panels",
          "Cult vehicle modified for wasteland travel"
      ],
      "moral_choice": "Whether to sacrifice one team member to potentially save the entire community, or abandon the mission and condemn everyone to slow starvation. Elara chose to offer herself, but Tommy made the choice for her by taking her place.",
      "long_term_impact": "The community survives and even thrives with the new resources, but Elara becomes increasingly isolated, tormented by guilt over Tommy's death. The cult swears vengeance, creating a new external threat. The success of the mission makes other communities see Elara's group as targets, leading to increased raids. Tommy's sacrifice becomes community legend, creating both inspiration and trauma that shapes their culture for generations."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1757388352246;
  
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
