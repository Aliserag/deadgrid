/**
 * quest: The Omega Silo
 */

import { GameModule } from '../../../core/GameModule';

export interface TheOmegaSiloData {
  id: string;
  title: string;
  giver: string;
  description: string;
  objectives: any[];
  rewards: string;
  prerequisites: string;
  dialogue: string;
}

export class TheOmegaSiloModule extends GameModule {
  static readonly metadata: TheOmegaSiloData = {
      "id": "quest_silo_omega",
      "title": "The Omega Silo",
      "giver": "Old Man Finch",
      "description": "Before the Collapse, a secret military project known as 'Silo Omega' was rumored to house a self-sustaining ecosystem and advanced technology. Old Man Finch, a former engineer who worked on the project, believes it could be the key to rebuilding civilization—if its automated defenses haven't decayed into chaos. He needs someone brave (or foolish) enough to venture into the silo and retrieve the core data drive.",
      "objectives": [
          "Locate the hidden entrance to Silo Omega in the Scorchlands",
          "Bypass or disable the automated security systems",
          "Retrieve the core data drive from the central server room",
          "Return to Old Man Finch with the drive"
      ],
      "rewards": {
          "experience": 1500,
          "items": [
              "Advanced Geiger Counter",
              "5x Military-Grade Medkits"
          ],
          "reputation": {
              "Finch's Camp": 50
          }
      },
      "prerequisites": {
          "min_level": 12,
          "required_quests": [
              "quest_scorchlands_access"
          ],
          "required_items": [
              "Electronic Toolkit"
          ]
      },
      "dialogue": {
          "greeting": "You look like you can handle yourself. I've got a job that pays well, but it ain't for the faint of heart. Interested?",
          "accept": "Excellent. The silo's entrance is hidden in the northern Scorchlands. Look for a rusted maintenance hatch near the old radio tower. And watch out for the defenses—they were designed to keep everyone out.",
          "decline": "Suit yourself. Come back if you change your mind. This opportunity won't last forever.",
          "completion": "You actually made it back alive? And with the drive! This data... it's everything I hoped for. Here's your reward—you've earned it."
      }
  };
  
  static readonly type = 'quest';
  static readonly version = '1.0.0';
  static readonly generated = 1758311124851;
  
  async initialize(engine: any): Promise<void> {
    // Register with appropriate system
    const system = this.getTargetSystem(engine);
    if (system) {
      await system.register(TheOmegaSiloModule.metadata);
    }
    
    // Log registration
    console.log(`[Module] Registered quest: The Omega Silo`);
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

export default TheOmegaSiloModule;
