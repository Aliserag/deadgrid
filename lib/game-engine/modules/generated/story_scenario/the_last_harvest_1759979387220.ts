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
          "backstory": "Former agricultural scientist who survived the initial collapse by fortifying his university's experimental farm. Lost his wife to radiation sickness two years prior, now protects their teenage daughter, Maya. Haunted by memories of the world before, he clings to scientific principles as his moral compass."
      },
      "setting": {
          "location": "The ruins of Westwood Agricultural Research Station, surrounded by the toxic remains of what was once California's central valley",
          "time": "Seven years after the Great Burn - a nuclear winter that permanently altered the climate"
      },
      "situation": "The community's food reserves have dwindled to critical levels. Radiation-resistant crops Aris developed are failing due to mutated soil fungi. Children are showing signs of malnutrition, and winter approaches. Maya has developed a persistent cough that worries everyone. The community of forty-seven survivors faces starvation within weeks if no solution is found. Arguments break out daily over rationing, and trust in Aris's leadership is eroding as hunger overrides reason.",
      "attempted_solution": "Aris organized a dangerous expedition to the sealed hydroponics lab in the contaminated university basement. He believed preserved seed banks and working growth lamps might save them. Taking three volunteers - young engineer Liam, former soldier Maria, and his own daughter Maya who insisted on contributing - they spent days preparing radiation suits from salvaged hazmat gear. Aris calculated they had six hours before cumulative exposure became lethal. They rehearsed the route, prepared decontamination procedures, and packed every available container for what they hoped to recover.",
      "complications": "The basement tunnels had flooded with radioactive water, forcing a detour through collapsed structures. Maya's suit tore on jagged rebar, but she concealed it rather than abort the mission. Inside the lab, they found most seeds rotted - except one sealed cryo-chamber requiring power they couldn't restore. While attempting to jury-rig a solution, Liam panicked upon realizing Maya's exposure and rushed to help her, tearing his own suit. Then the emergency containment doors sealed automatically, trapping them. Their communication devices failed against the reinforced concrete, and their air supply began running out.",
      "resolution": "Aris made the agonizing choice to trigger the lab's emergency oxygen purge - destroying the remaining seeds but blowing the doors. He carried his collapsing daughter while Maria supported Liam. Back at camp, Maya and Liam received blood transfusions and the community's entire stock of anti-rad drugs. Liam died three days later in agony. Maya survived but with permanent lung damage. The single box of seeds they recovered before the purge contained only decorative flowers - useless for nutrition. The community's hope died with Liam.",
      "lesson_learned": "No survival objective is worth the entire next generation. Sacrificing the young for temporary security ultimately destroys what we're trying to preserve. Sometimes the wisest leadership means accepting defeat today to fight tomorrow.",
      "casualties": [
          "Liam Chen (age 22) - radiation poisoning",
          "Unborn child of Maria and Tom (miscarriage from stress and malnutrition)"
      ],
      "resources_gained": [
          "Three functional growth lamps",
          "Assorted laboratory equipment",
          "Decorative flower seeds (symbolic only)",
          "Two salvaged radiation suits (damaged)"
      ],
      "moral_choice": "Whether to use their limited anti-radiation medication on Liam (low survival chance) or conserve it for future emergencies. Aris advocated for treating Liam despite the odds, while others argued for the greater good. The community ultimately voted to treat him, using their entire supply.",
      "long_term_impact": "The failed mission shattered community cohesion. Many blamed Aris for poor planning and his daughter for the disaster. Maria left with her partner to find another settlement, taking six families with them. Those who remained developed a deep aversion to risky expeditions, becoming increasingly isolated. Maya's survival created a permanent reminder of the cost of failed hope, while the decorative flowers now growing around camp serve as both memorial and indictment of their losses."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1759979387222;
  
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
