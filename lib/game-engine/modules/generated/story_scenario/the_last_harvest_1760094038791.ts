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
          "backstory": "Former botanist and university professor who survived the initial collapse by fortifying his agricultural research station. Lost his wife to raiders two years ago, now protects his teenage daughter Lena while trying to preserve knowledge of sustainable farming."
      },
      "setting": {
          "location": "Abandoned Redwood Biosphere research facility in Northern California",
          "time": "Late autumn, 7 years after the Great Collapse"
      },
      "situation": "The community's winter food reserves have been contaminated by mold, and early frosts have destroyed their fall crops. With three months until spring and sixty people to feed, starvation becomes imminent. Children are already showing signs of malnutrition, and tensions are rising as families hoard what little they have. Aris discovers records indicating the biosphere's underground seed vault might contain viable drought-resistant grains, but the facility is deep in contaminated territory where the 'Ash-Sick' - mutated survivors - are known to hunt.",
      "attempted_solution": "Aris assembles a small team including his most trusted scavenger, Marcus, and two former biosphere technicians. They plan a swift three-day expedition using knowledge of old service tunnels to avoid major threats. The strategy involves traveling light with gas masks and silent weapons, using the cover of an approaching storm to mask their movement. They bring emergency rations for five days and plan to seal themselves inside the biosphere overnight, using their technical knowledge to restore minimal power to the vault's preservation systems.",
      "complications": "The service tunnels have collapsed from earthquakes, forcing them through contaminated surface routes. During their first night, one technician develops radiation sickness from unexpected hot zones. Then they discover the Ash-Sick have become more organized than anyone realized - setting traps and using pack hunting tactics. Marcus sacrifices himself to create a diversion so the others can reach the biosphere. Inside, they find the backup generators non-functional and the vault's climate control failing. The remaining technician panics and triggers a security lockdown, trapping them with limited oxygen.",
      "resolution": "Using his knowledge of the facility's architecture, Aris manages to bypass the emergency systems by flooding the control room with fire suppression foam, short-circuiting the locks. They recover three cases of viable seeds but lose the remaining technician to Ash-Sick ambush during escape. Aris returns alone, frostbitten and grieving, but with enough seeds to ensure the community's survival through hybrid planting. The victory feels hollow as he delivers the news to Marcus's widow and children, watching their faces crumple with the weight of their loss.",
      "lesson_learned": "No single life is worth sacrificing for potential resources, but sometimes circumstances force impossible choices. Preparation must include multiple contingency plans for when the expected fails.",
      "casualties": [
          "Marcus (experienced scavenger, father of two)",
          "Dr. Chen (biosphere technician)",
          "Jamal (second technician, radiation poisoning)"
      ],
      "resources_gained": [
          "18 varieties of drought-resistant grain seeds",
          "3 intact soil revitalization kits",
          "Biosphere technical manuals",
          "Emergency medical supplies from facility infirmary"
      ],
      "moral_choice": "Whether to mercy-kill the radiation-sick technician who was slowing them down and risking everyone's survival, or honor their commitment to leave no one behind despite the danger.",
      "long_term_impact": "The community survives the winter but fractures emotionally. Marcus's family leaves, taking valuable survival skills with them. The successful harvest creates food security but attracts attention from larger survivor groups. Aris's relationship with his daughter becomes strained as she blames him for the deaths, particularly Marcus who was like an uncle to her. The community establishes regular patrols to the biosphere, creating both a valuable resource outpost and a perpetual drain on their security forces."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1760094038792;
  
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
