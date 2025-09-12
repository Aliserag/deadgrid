/**
 * quest: Radio Silence
 */

import { GameModule } from '../../../core/GameModule';

export interface RadioSilenceData {
  id: string;
  title: string;
  giver: string;
  description: string;
  objectives: any[];
  rewards: string;
  prerequisites: string;
  dialogue: string;
}

export class RadioSilenceModule extends GameModule {
  static readonly metadata: RadioSilenceData = {
      "id": "quest_radio_silence",
      "title": "Radio Silence",
      "giver": "Old Man Jenkins",
      "description": "The settlement's primary radio receiver has gone silent, cutting off vital communications with other survivor groups. Old Man Jenkins, the settlement's makeshift engineer, believes the antenna array on the nearby transmission tower has been damaged, possibly by recent storms or scavengers. He needs someone brave enough to venture out and repair it before the settlement becomes completely isolated.",
      "objectives": [
          "Travel to the Rustpeak Transmission Tower",
          "Clear the tower base of any hostiles",
          "Climb to the antenna array (150m elevation)",
          "Repair the damaged antenna components using the repair kit",
          "Restore power to the transmitter by resetting the breakers",
          "Return to Old Man Jenkins with confirmation of success"
      ],
      "rewards": {
          "experience": 750,
          "items": [
              "High-Quality Radio",
              "5x Electronic Scrap",
              "3x Clean Water"
          ],
          "reputation": 25
      },
      "prerequisites": {
          "level": 8,
          "skills": [
              "Electronics 3"
          ],
          "quests": [
              "quest_power_up"
          ]
      },
      "dialogue": {
          "initiation": [
              "Hey there, wanderer. Got a moment? Our comms are down and we're flying blind.",
              "The antenna array at Rustpeak Tower has gone silent. Without it, we can't reach the other settlements.",
              "I'm too old to make the climb myself. Think you could handle it? I'll make it worth your while."
          ],
          "completion": [
              "You did it! The static is gone - clear signals coming through!",
              "The other settlements were starting to worry. You might have just saved us all from isolation.",
              "Take this radio - tuned it myself. Should help you stay in touch out there."
          ],
          "failure": [
              "No luck? Damn. We'll have to try again soon before we lose contact completely.",
              "That tower's dangerous, I know. Maybe come back when you're better prepared."
          ]
      }
  };
  
  static readonly type = 'quest';
  static readonly version = '1.0.0';
  static readonly generated = 1757706328850;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(RadioSilenceModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered quest: Radio Silence`);
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

export default RadioSilenceModule;
