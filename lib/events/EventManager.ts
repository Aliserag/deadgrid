import { DeepSeekClient } from '../ai/DeepSeekClient';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
  type: 'encounter' | 'discovery' | 'crisis' | 'opportunity';
  day: number;
  processed?: boolean;
}

export interface Choice {
  text: string;
  outcome: {
    description: string;
    effects: {
      health?: number;
      ammo?: number;
      food?: number;
      water?: number;
      medicine?: number;
      materials?: number;
      survivors?: number;
      morale?: number;
    };
    spawnZombies?: number;
    spawnNPCs?: { count: number; faction: string; attitude: string }[];
  };
}

export class EventManager {
  private client: DeepSeekClient;
  private events: GameEvent[] = [];
  private currentDay: number = 1;
  
  constructor() {
    this.client = new DeepSeekClient(process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || 'sk-88d05991389d45fbaee750ee9724a38c');
  }
  
  async generateDailyEvent(day: number, context?: any): Promise<GameEvent | null> {
    try {
      const event = await this.client.generateEvent({
        day,
        playerHealth: context?.health || 100,
        resources: context?.resources || {},
        baseDefense: context?.baseDefense || 0,
        survivors: context?.survivors || 1
      });
      
      if (event) {
        const gameEvent: GameEvent = {
          id: `event_${day}_${Date.now()}`,
          title: event.title,
          description: event.description,
          choices: event.choices.map(c => ({
            text: c.text,
            outcome: {
              description: c.outcome,
              effects: this.parseEffects(c.outcome)
            }
          })),
          type: this.determineEventType(event.description),
          day
        };
        
        this.events.push(gameEvent);
        return gameEvent;
      }
    } catch (error) {
      console.error('Failed to generate event:', error);
    }
    
    return null;
  }
  
  private determineEventType(description: string): 'encounter' | 'discovery' | 'crisis' | 'opportunity' {
    const desc = description.toLowerCase();
    if (desc.includes('survivor') || desc.includes('trader') || desc.includes('raider')) {
      return 'encounter';
    } else if (desc.includes('found') || desc.includes('discover') || desc.includes('stumble')) {
      return 'discovery';
    } else if (desc.includes('attack') || desc.includes('danger') || desc.includes('threat')) {
      return 'crisis';
    }
    return 'opportunity';
  }
  
  private parseEffects(outcome: string): any {
    const effects: any = {};
    
    // Parse common resource changes from outcome text
    const patterns = [
      { regex: /\+(\d+) health/i, key: 'health' },
      { regex: /-(\d+) health/i, key: 'health', negative: true },
      { regex: /\+(\d+) ammo/i, key: 'ammo' },
      { regex: /\+(\d+) food/i, key: 'food' },
      { regex: /-(\d+) food/i, key: 'food', negative: true },
      { regex: /\+(\d+) water/i, key: 'water' },
      { regex: /-(\d+) water/i, key: 'water', negative: true },
      { regex: /\+(\d+) medicine/i, key: 'medicine' },
      { regex: /\+(\d+) materials?/i, key: 'materials' }
    ];
    
    patterns.forEach(pattern => {
      const match = outcome.match(pattern.regex);
      if (match) {
        effects[pattern.key] = parseInt(match[1]) * (pattern.negative ? -1 : 1);
      }
    });
    
    return effects;
  }
  
  async generateNPCEncounter(faction?: string): Promise<any> {
    try {
      const npc = await this.client.generateNPC({
        faction: faction || undefined,
        day: this.currentDay
      });
      
      return npc;
    } catch (error) {
      console.error('Failed to generate NPC:', error);
      return null;
    }
  }
  
  async generateWeatherEvent(): Promise<any> {
    try {
      const weather = await this.client.generateWeather();
      return weather;
    } catch (error) {
      console.error('Failed to generate weather:', error);
      return null;
    }
  }
  
  async generateLocationDescription(locationType: string): Promise<string> {
    try {
      const location = await this.client.generateLocation({ type: locationType });
      return location?.description || 'An abandoned place, eerily quiet.';
    } catch (error) {
      console.error('Failed to generate location:', error);
      return 'An abandoned place, eerily quiet.';
    }
  }
  
  getUnprocessedEvents(): GameEvent[] {
    return this.events.filter(e => !e.processed);
  }
  
  markEventProcessed(eventId: string): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.processed = true;
    }
  }
  
  // Generate a quick random event without API call (fallback)
  generateFallbackEvent(day: number): GameEvent {
    const events = [
      {
        title: 'Abandoned Supply Cache',
        description: 'You found an old supply cache hidden in a collapsed building.',
        choices: [
          {
            text: 'Take everything',
            outcome: {
              description: 'You gather supplies but make noise, attracting zombies.',
              effects: { food: 5, water: 5, ammo: 10 },
              spawnZombies: 3
            }
          },
          {
            text: 'Take only essentials',
            outcome: {
              description: 'You quietly take what you need.',
              effects: { food: 3, water: 3 }
            }
          }
        ]
      },
      {
        title: 'Survivor in Need',
        description: 'A wounded survivor begs for medicine.',
        choices: [
          {
            text: 'Help them',
            outcome: {
              description: 'The survivor thanks you and shares information about a nearby cache.',
              effects: { medicine: -2, materials: 10 }
            }
          },
          {
            text: 'Refuse',
            outcome: {
              description: 'The survivor limps away, disappointed.',
              effects: { morale: -1 }
            }
          }
        ]
      },
      {
        title: 'Strange Noise',
        description: 'You hear strange noises coming from a nearby building.',
        choices: [
          {
            text: 'Investigate',
            outcome: {
              description: 'You find a group of survivors who trade with you.',
              effects: { food: 5, ammo: -5 }
            }
          },
          {
            text: 'Avoid',
            outcome: {
              description: 'You continue on safely.',
              effects: {}
            }
          }
        ]
      }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    return {
      id: `fallback_${day}_${Date.now()}`,
      title: randomEvent.title,
      description: randomEvent.description,
      choices: randomEvent.choices,
      type: 'encounter',
      day
    };
  }
}