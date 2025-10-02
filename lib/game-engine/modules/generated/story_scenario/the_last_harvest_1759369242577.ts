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
          "backstory": "Former botanist and university professor who survived the initial collapse by fortifying his agricultural research station. Lost his wife and daughter to the early riots over food shortages. Now leads a small community of survivors focused on sustainable farming, haunted by memories of his family's starvation."
      },
      "setting": {
          "location": "The overgrown ruins of Rockwood University's experimental farm, 50 miles outside the quarantine zone",
          "time": "Late autumn, 7 years after the Collapse"
      },
      "situation": "The community's winter food reserves were destroyed when raiders poisoned their main storage silo. With only two weeks of emergency rations left and winter approaching, 32 people faced starvation. The community's morale shattered as parents watched their children grow thinner each day. Aris watched the same hollow-eyed desperation he'd seen in his daughter's face years earlier return to the community's children. The pressure mounted as elderly members began voluntarily reducing their rations to save the younger ones, creating an atmosphere of quiet sacrifice and impending doom.",
      "attempted_solution": "Aris remembered pre-Collapse research about a rare cold-resistant potato variant that might have survived in the university's sealed underground seed vault. He organized a small team to breach the vault, which required navigating through collapsed tunnels and the university's infested botany building. They prepared for two days, gathering ropes, gas masks, and emergency supplies. Maya, a young mother whose daughter was showing signs of malnutrition, insisted on joining despite the dangers. The team hoped to retrieve not just the potatoes but any surviving seeds that could secure their future food supply, making the risk worth the potential reward.",
      "complications": "The vault's emergency seal had held for years but released a cloud of preserved chemical gases when breached. Maya, rushing ahead to find food for her daughter, was overcome and collapsed. While Aris dragged her to safety, raiders who had been tracking their movements ambushed the remaining team members. In the chaotic firefight, the vault's climate control system was damaged, threatening to destroy the remaining seeds. Aris faced an impossible choice: continue the rescue or save the seeds that could feed dozens for years. The team's communications failed, leaving them isolated as the raiders closed in from both ends of the tunnel.",
      "resolution": "Aris made the gut-wrenching decision to seal Maya in a side room with emergency oxygen while he stabilized the climate controls. He managed to save three seed varieties before the raiders broke through. In the ensuing confrontation, two raiders were killed and one captured. The team escaped with minimal seed stock but had to leave behind most of their equipment. Maya survived with permanent lung damage, and the community gained enough seeds for one planting season. The victory felt hollow as they buried their dead, but the captured raider provided crucial intelligence about upcoming attacks, allowing them to better prepare their defenses.",
      "lesson_learned": "Hope can be as dangerous as despair when it clouds judgment. Proper preparation means anticipating both environmental threats and human desperation. Sometimes saving a community requires sacrificing individual lives, but that calculus leaves permanent scars on the soul.",
      "casualties": [
          "Lena Petrov (security specialist)",
          "Tom Chen (engineer)",
          "Two unidentified raiders"
      ],
      "resources_gained": [
          "3 varieties of cold-resistant potato seeds (enough for 2 acres)",
          "Emergency medical supplies from vault storage",
          "Intelligence about raider movements from captured combatant",
          "Two functioning firearms with limited ammunition"
      ],
      "moral_choice": "Whether to execute the captured raider who participated in poisoning their food supplies, knowing he might have family depending on him, or keep him prisoner using valuable resources during a famine. The community was divided between those seeking vengeance and those who believed maintaining their humanity was what separated them from the raiders.",
      "long_term_impact": "The community became more militarized but also more isolated, trusting outsiders less. Maya's survival created a debt that bound her family to Aris, changing the community's power dynamics. The successful seed harvest the following spring established their reputation, attracting both desperate refugees and unwanted attention from larger survivor groups. The moral choice regarding the prisoner created a lasting philosophical rift between the 'pragmatists' and 'humanists' in their community that would influence all future decisions."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1759369242579;
  
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
