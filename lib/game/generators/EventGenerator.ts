import { ContentGeneratorBase } from './ContentGeneratorBase';
import { IGameEvent, IEventChoice, IEventEffect } from '../core/interfaces';

export interface EventTemplate {
  id: string;
  title: string;
  descriptionTemplate: string;
  choiceTemplates: ChoiceTemplate[];
  tags: string[];
  rarity: number;
}

export interface ChoiceTemplate {
  textTemplate: string;
  effectTypes: string[];
  successRate: number;
}

export class EventGenerator extends ContentGeneratorBase<IGameEvent> {
  private templates: EventTemplate[] = [
    {
      id: 'survivor_encounter',
      title: 'Survivor Encounter',
      descriptionTemplate: 'You encounter {number} survivor(s) {location}. They appear {mood}.',
      choiceTemplates: [
        {
          textTemplate: 'Approach cautiously',
          effectTypes: ['dialogue', 'trade'],
          successRate: 0.7
        },
        {
          textTemplate: 'Avoid them',
          effectTypes: ['stealth'],
          successRate: 0.9
        },
        {
          textTemplate: 'Rob them',
          effectTypes: ['combat', 'loot'],
          successRate: 0.4
        }
      ],
      tags: ['social', 'encounter'],
      rarity: 0.3
    },
    {
      id: 'supply_cache',
      title: 'Hidden Supply Cache',
      descriptionTemplate: 'You discover a {condition} supply cache {location}. It appears {security}.',
      choiceTemplates: [
        {
          textTemplate: 'Search carefully',
          effectTypes: ['loot'],
          successRate: 0.8
        },
        {
          textTemplate: 'Quick grab and run',
          effectTypes: ['loot', 'noise'],
          successRate: 0.6
        },
        {
          textTemplate: 'Set up ambush',
          effectTypes: ['trap', 'wait'],
          successRate: 0.5
        }
      ],
      tags: ['exploration', 'loot'],
      rarity: 0.2
    },
    {
      id: 'zombie_horde',
      title: 'Approaching Horde',
      descriptionTemplate: 'A {size} horde of zombies is {distance} away, moving {direction}.',
      choiceTemplates: [
        {
          textTemplate: 'Hide and wait',
          effectTypes: ['stealth', 'wait'],
          successRate: 0.7
        },
        {
          textTemplate: 'Create distraction',
          effectTypes: ['noise', 'redirect'],
          successRate: 0.6
        },
        {
          textTemplate: 'Fight through',
          effectTypes: ['combat'],
          successRate: 0.3
        }
      ],
      tags: ['danger', 'zombies'],
      rarity: 0.25
    }
  ];
  
  async generate(seed?: string): Promise<IGameEvent> {
    const template = this.weightedRandom(
      this.templates.map(t => ({ item: t, weight: t.rarity })),
      seed
    );
    
    const event: IGameEvent = {
      id: `${template.id}_${this.generateSeed()}`,
      title: template.title,
      description: this.fillTemplate(template.descriptionTemplate, seed),
      choices: this.generateChoices(template.choiceTemplates, seed),
      effects: this.generateEffects(template.tags, seed),
      metadata: {
        generated: true,
        template: template.id,
        seed: seed || this.seed
      }
    };
    
    return event;
  }
  
  validate(content: IGameEvent): boolean {
    return !!(
      content.id &&
      content.title &&
      content.description &&
      content.choices &&
      content.choices.length > 0
    );
  }
  
  private fillTemplate(template: string, seed?: string): string {
    const replacements: Record<string, string[]> = {
      '{number}': ['a lone', 'two', 'three', 'a small group of'],
      '{location}': ['near an abandoned building', 'by the roadside', 'in the forest', 'at a crossroads'],
      '{mood}': ['desperate', 'cautious', 'hostile', 'friendly', 'exhausted'],
      '{condition}': ['well-hidden', 'partially looted', 'booby-trapped', 'untouched'],
      '{security}': ['unguarded', 'to have a simple lock', 'heavily secured', 'recently disturbed'],
      '{size}': ['small', 'medium', 'large', 'massive'],
      '{distance}': ['very close', 'nearby', 'in the distance', 'on the horizon'],
      '{direction}': ['towards you', 'away from you', 'parallel to your position', 'erratically']
    };
    
    let result = template;
    for (const [placeholder, options] of Object.entries(replacements)) {
      if (result.includes(placeholder)) {
        result = result.replace(placeholder, this.randomChoice(options, seed));
      }
    }
    
    return result;
  }
  
  private generateChoices(templates: ChoiceTemplate[], seed?: string): IEventChoice[] {
    return templates.map((template, index) => ({
      id: `choice_${index}`,
      text: this.fillTemplate(template.textTemplate, (seed || '') + index),
      effects: this.generateEffectsForChoice(template.effectTypes, (seed || '') + index)
    }));
  }
  
  private generateEffects(tags: string[], seed?: string): IEventEffect[] {
    const effects: IEventEffect[] = [];
    
    if (tags.includes('danger')) {
      effects.push({
        type: 'stress',
        apply: (context) => {
          // Implementation will be added in the actual game logic
        }
      });
    }
    
    if (tags.includes('exploration')) {
      effects.push({
        type: 'discover_location',
        apply: (context) => {
          // Implementation will be added in the actual game logic
        }
      });
    }
    
    return effects;
  }
  
  private generateEffectsForChoice(effectTypes: string[], seed?: string): IEventEffect[] {
    return effectTypes.map(type => ({
      type,
      apply: (context) => {
        // Implementation will be added in the actual game logic
      }
    }));
  }
  
  async generateFromAI(prompt: string): Promise<IGameEvent> {
    // This method will be implemented to call DeepSeek API
    // For now, return a generated event using templates
    return this.generate();
  }
}