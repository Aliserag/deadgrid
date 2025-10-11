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
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying her university's experimental greenhouse. Lost her family to the radiation sickness that swept through the cities. Now leads a small community of survivors who depend on her knowledge of sustainable farming."
      },
      "setting": {
          "location": "The Radiance Blightlands - formerly the American Midwest breadbasket, now a contaminated wasteland with pockets of habitable land around old agricultural research stations",
          "time": "15 years after The Great Burn - a nuclear exchange that triggered permanent environmental collapse"
      },
      "situation": "Elara's community faces starvation after their primary hydroponic system failed. Their emergency supplies will last only two weeks. Satellite imagery from before the collapse showed an experimental seed vault at a corporate agricultural research facility 40 miles away, potentially containing radiation-resistant crop strains. The journey would take them through territory controlled by the Ashen Raiders, a ruthless gang that preys on travelers. With winter approaching and children already showing signs of malnutrition, Elara must decide whether to risk the dangerous expedition or try to stretch their dwindling supplies.",
      "attempted_solution": "Elara assembled a team of six experienced scavengers. They planned a three-day round trip using old service tunnels to bypass the Raiders' main patrol routes. The team carried lightweight gear, radiation medication, and traded for maps from a traveling merchant. Elara's strategy involved moving at night, using thermal blankets to hide body heat signatures, and establishing hidden waystations for emergency retreat. They brought precious antibiotics and painkillers as bargaining chips in case of capture, hoping the Raiders valued medicine more than additional captives. The plan relied on speed and stealth rather than confrontation.",
      "complications": "On the second night, young Liam accidentally triggered an old seismic sensor, alerting Raiders to their position. During the frantic escape through drainage tunnels, Elara's second-in-command Marcus took a bullet protecting the others. The injury wasn't immediately fatal, but he couldn't keep pace. To make matters worse, they discovered the seed vault's main entrance had collapsed during the initial bombings. The only alternative access required navigating through unstable laboratory ruins flooded with radioactive water. Their radiation counters began clicking ominously as they debated whether to continue or retreat with their wounded companion.",
      "resolution": "Elara made the agonizing choice to continue while two team members stayed with Marcus in a relatively safe alcove. Using rebreathers from their emergency kits, she and two others swam through the flooded laboratories, finding the seed vault intact behind reinforced glass. They used their last explosive charge to breach it, retrieving three sealed containers of seeds. Returning for Marcus, they found him feverish but alive. The journey back became a desperate race against infection and radiation sickness. They lost two members to Raider ambushes but made it home after five brutal days instead of three. The seeds survived, but the cost haunted everyone.",
      "lesson_learned": "No survival plan survives first contact with the wasteland. Always prepare multiple extraction routes and assume every piece of old-world technology will either fail or betray you. The most valuable resource isn't supplies—it's the trust and coordination of your team.",
      "casualties": [
          "Jenna Morrow - shot during initial Raider encounter",
          "David Chen - sacrificed himself as rearguard during final ambush",
          "Marcus Rodriguez - survived but lost his leg to infection and now uses a prosthetic"
      ],
      "resources_gained": [
          "3 sealed containers of radiation-resistant crop seeds (wheat, soy, potato)",
          "2 functional laboratory water purifiers",
          "Agricultural data drives with soil remediation techniques",
          "8 doses of unexpired antibiotics"
      ],
      "moral_choice": "Elara had to choose between leaving Marcus behind to ensure the seeds reached the community or risking everyone by slowing their escape. She chose to split the team, gambling that some might survive both missions. This decision directly led to Jenna's death when the smaller group proved more vulnerable to Raiders.",
      "long_term_impact": "The seeds allowed the community to establish radiation-resistant crops, making them less dependent on dangerous scavenging runs. However, the mission's casualties created lasting divisions—some survivors blamed Elara for the deaths, questioning her leadership. Marcus, once her closest advisor, became distant and bitter. The community now faces internal strife even as their food security improves, proving that survival requires more than just resources—it demands maintaining the human connections that make life worth preserving."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1760180445126;
  
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
