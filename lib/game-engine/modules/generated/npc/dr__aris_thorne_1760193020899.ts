/**
 * npc: Dr. Aris Thorne
 */

import { GameModule } from '../../../core/GameModule';

export interface Dr.ArisThorneData {
  name: string;
  occupation: string;
  personality: any[];
  faction: string;
  dialogue_style: string;
  inventory: any[];
  quests: any[];
  backstory: string;
}

export class Dr.ArisThorneModule extends GameModule {
  static readonly metadata: Dr.ArisThorneData = {
      "name": "Dr. Aris Thorne",
      "occupation": "University History Professor",
      "personality": [
          "Analytical",
          "Cautious",
          "Nostalgic",
          "Methodical",
          "Secretly Hopeful"
      ],
      "faction": "Archivists of Tomorrow",
      "dialogue_style": "Precise and academic, with occasional slips into emotional vulnerability when discussing the past",
      "inventory": [
          "Leather-bound journal filled with observations",
          "Pre-war history books (heavily annotated)",
          "Hand-crank radio receiver",
          "Antique fountain pen and ink bottles",
          "Emergency medical supplies",
          "Dried rations (carefully portioned)",
          "Map of the region with marked safe zones"
      ],
      "quests": [
          {
              "name": "Recover the Lost Archives",
              "description": "Retrieve historical documents from the ruined university library before scavengers destroy them",
              "reward": "Rare pre-war knowledge and access to restricted Archive materials"
          },
          {
              "name": "The Last Broadcast",
              "description": "Find and repair a radio transmitter to send a message of hope to other survivors",
              "reward": "Radio communication equipment and faction reputation"
          },
          {
              "name": "Oral Histories",
              "description": "Record interviews with elderly survivors about life before the collapse",
              "reward": "Unique historical insights and rare trading opportunities"
          }
      ],
      "backstory": "Dr. Thorne was lecturing on 20th century history when the alarms sounded. He survived the initial chaos by sheltering in the university's archive vault with a handful of students. Now he leads the Archivists of Tomorrow, believing that preserving knowledge and human history is the key to rebuilding civilization. He carries the guilt of being unable to save more of his students, and secretly hopes to find his missing wife, who was across town when the collapse began."
  };
  
  static readonly type = 'npc';
  static readonly version = '1.0.0';
  static readonly generated = 1760193020901;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(Dr.ArisThorneModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered npc: Dr. Aris Thorne`);
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

export default Dr.ArisThorneModule;
