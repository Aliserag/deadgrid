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
          "backstory": "Former agricultural scientist specializing in drought-resistant crops. Lost her family during the Great Collapse when food riots destroyed their community shelter. Survived by hiding in research facilities, haunted by the memory of her daughter's starvation. Now leads a small settlement of 23 survivors, using her knowledge to cultivate what little arable land remains."
      },
      "setting": {
          "location": "The Sunken Valley, former agricultural research station in what was once California's Central Valley",
          "time": "12 years after the Great Collapse. Permanent dust storms have turned most of the world into barren wasteland. The year is roughly 2042, though calendars have lost meaning."
      },
      "situation": "The settlement's primary food source—a genetically modified corn strain Elara developed—has been infected with a mysterious blight. Within days, the entire crop shows signs of rapid decay. The community has only three weeks of emergency rations left. Panic spreads as parents watch their children grow thinner each day. Elara's leadership is questioned for the first time as desperate whispers suggest abandoning the valley in search of mythical 'green zones' rumored to exist beyond the dust storms. The very survival of the community hangs on finding a solution before starvation or mutiny tears them apart.",
      "attempted_solution": "Elara remembered a pre-Collapse seed vault hidden beneath the ruins of a university 40 miles away. She organized a scavenging party of their six most capable members, planning a three-day expedition. They modified an old solar-powered vehicle to carry supplies, armed themselves with makeshift weapons against the valley's mutated predators, and prepared for the harsh journey through radioactive dust plains. Elara believed the vault might contain alternative seed strains resistant to the blight. She promised the community they would return with salvation, leaving detailed instructions for the remaining settlers on how to preserve their remaining food and maintain the settlement's defenses in their absence.",
      "complications": "Two days into the journey, a massive dust storm forced the team to take shelter in a collapsed highway tunnel. While waiting out the storm, raiders ambushed them, killing two members instantly and wounding another. The solar vehicle was destroyed, along with most of their supplies. The remaining four survivors—Elara included—were forced to continue on foot through toxic air, their protective filters deteriorating rapidly. When they finally reached the university, they found the seed vault flooded with contaminated water, most seeds ruined beyond recovery. The only salvageable specimens were experimental drought-resistant potatoes—but extracting them required navigating unstable rubble that claimed another life.",
      "resolution": "Elara returned to the settlement with only two survivors, carrying 50 pounds of viable potato seeds. They arrived to find the community on the brink of collapse—three more had died from malnutrition, and the others were barely coherent. Using the last of her strength, Elara organized immediate planting of the potatoes in soil treated with their remaining fertilizers. The potatoes grew with surprising speed, yielding their first harvest in just six weeks. The settlement survived, but the cost was immense. Elara's hands shook as she distributed the first meal of boiled potatoes, seeing the hollow-eyed gratitude of children who would live another season.",
      "lesson_learned": "Never rely on a single solution for survival. Diversity in food sources, routes, and strategies is essential. Preparation for multiple failure points can mean the difference between extinction and continuation.",
      "casualties": [
          "Marcus Chen (scout, killed in raider ambush)",
          "Isabella Rodriguez (medic, died protecting the seed samples)",
          "David Chen (Marcus's brother, crushed in vault collapse)",
          "Mrs. Gable (elderly settler, starvation)",
          "Two unnamed children (malnutrition)"
      ],
      "resources_gained": [
          "47 lbs of drought-resistant potato seeds",
          "University agricultural research data on surviving storage drives",
          "Three functional gas masks from raiders",
          "Map of underground water sources near the university"
      ],
      "moral_choice": "When they found the flooded vault, Elara had to choose between attempting to salvage the deeper, more dangerous seed containers (potentially losing more team members) or retreating with the easily accessible but less nutritious legume seeds near the entrance. She chose the dangerous option, believing the higher-calorie potatoes offered their best chance against starvation.",
      "long_term_impact": "The settlement permanently shifted from corn-based agriculture to potato cultivation, changing their entire food culture and survival strategy. Elara's authority became absolute but burdened by guilt, making her increasingly risk-averse in future decisions. The community developed a deep-seated fear of expeditions beyond the valley, becoming more isolated but also more self-sufficient. The potato strain eventually became known as 'Elara's Redemption' and was traded sparingly with other surviving communities, creating fragile new alliances."
  };
  
  static readonly type = 'story_scenario';
  static readonly version = '1.0.0';
  static readonly generated = 1758726661926;
  
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
