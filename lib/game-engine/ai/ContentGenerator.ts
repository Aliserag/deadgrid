/**
 * AI Content Generator using DeepSeek API
 * Generates procedural content that automatically expands the game
 */

import { GameEngine } from '../core/GameEngine';

export interface GeneratedContent {
  type: 'biome' | 'event' | 'survivor_log' | 'item' | 'enemy' | 'quest';
  data: any;
  timestamp: number;
  version: string;
}

export class ContentGenerator {
  private engine: GameEngine;
  private apiKey: string;
  private apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  private generationQueue: GeneratedContent[] = [];
  
  constructor(engine: GameEngine) {
    this.engine = engine;
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
  }
  
  async initialize(): Promise<void> {
    // Start background generation
    this.startGenerationCycle();
  }
  
  private startGenerationCycle(): void {
    // Run generation every few hours with randomization
    const scheduleNext = () => {
      const minHours = 2;
      const maxHours = 8;
      const hours = minHours + Math.random() * (maxHours - minHours);
      const ms = hours * 60 * 60 * 1000;
      
      setTimeout(async () => {
        await this.generateBatch();
        scheduleNext();
      }, ms);
    };
    
    scheduleNext();
  }
  
  async generateBatch(): Promise<void> {
    const types: GeneratedContent['type'][] = [
      'biome', 'event', 'survivor_log', 'item', 'enemy', 'quest'
    ];
    
    const selectedType = types[Math.floor(Math.random() * types.length)];
    const content = await this.generate(selectedType);
    
    if (content) {
      this.generationQueue.push(content);
      await this.integrateContent(content);
    }
  }
  
  async generate(type: GeneratedContent['type']): Promise<GeneratedContent | null> {
    const prompts = this.getPromptForType(type);
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a game content generator for a post-apocalyptic survival game. Generate unique, coherent content that fits the game world.'
            },
            {
              role: 'user',
              content: prompts
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      });
      
      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const generatedData = JSON.parse(data.choices[0].message.content);
        
        return {
          type,
          data: generatedData,
          timestamp: Date.now(),
          version: '1.0.0'
        };
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
    
    return null;
  }
  
  private getPromptForType(type: GeneratedContent['type']): string {
    const existingContent = this.getExistingContentContext();
    
    const prompts = {
      biome: `Generate a new biome for a post-apocalyptic game. Include:
        - name: unique biome name
        - description: atmospheric description
        - terrain: terrain type and features
        - danger_level: 1-10
        - resources: available resources
        - unique_features: special characteristics
        - color_palette: hex colors for rendering
        Existing biomes: ${existingContent.biomes}
        Return as JSON.`,
        
      event: `Generate a random event for survivors. Include:
        - title: event name
        - description: what happens
        - choices: array of {text, consequences}
        - rarity: common/uncommon/rare/legendary
        - prerequisites: conditions to trigger
        Context: ${existingContent.events}
        Return as JSON.`,
        
      survivor_log: `Generate a survivor's journal entry. Include:
        - author: survivor name
        - day: day number
        - location: where written
        - content: the journal entry (150-300 words)
        - mood: emotional state
        - found_items: items mentioned
        Previous logs: ${existingContent.logs}
        Return as JSON.`,
        
      item: `Generate a new item/weapon. Include:
        - name: item name
        - type: weapon/tool/consumable/material
        - rarity: common/uncommon/rare/legendary
        - stats: relevant statistics
        - description: item lore
        - crafting_recipe: if craftable
        Existing items: ${existingContent.items}
        Return as JSON.`,
        
      enemy: `Generate a new enemy type. Include:
        - name: enemy name
        - type: zombie/mutant/raider/creature
        - health: HP value
        - damage: attack damage
        - speed: movement speed
        - behavior: AI behavior pattern
        - description: appearance and lore
        - drops: loot table
        Existing enemies: ${existingContent.enemies}
        Return as JSON.`,
        
      quest: `Generate a new quest/mission. Include:
        - title: quest name
        - description: quest story
        - objectives: array of tasks
        - rewards: completion rewards
        - difficulty: easy/medium/hard/extreme
        - npc_giver: who gives the quest
        - dialogue: quest dialogue
        Context: ${existingContent.quests}
        Return as JSON.`
    };
    
    return prompts[type];
  }
  
  private getExistingContentContext(): any {
    // Load existing content for context
    return {
      biomes: 'Urban Ruins, Toxic Wasteland',
      events: 'Survivor Encounter, Resource Cache Found',
      logs: 'Day 1 - Found shelter, Day 15 - Running low on food',
      items: 'Rusty Knife, Canned Food, Medical Kit',
      enemies: 'Walker Zombie, Runner Zombie, Raider Scout',
      quests: 'Find Water Source, Clear the Hospital'
    };
  }
  
  async integrateContent(content: GeneratedContent): Promise<void> {
    // Generate the appropriate module file
    const moduleCode = this.generateModuleCode(content);
    const fileName = this.generateFileName(content);
    
    // Write the new module
    const fs = require('fs').promises;
    const path = `./lib/game-engine/modules/generated/${fileName}`;
    await fs.writeFile(path, moduleCode);
    
    // Hot reload the module
    await this.engine.hotReload(`generated/${fileName}`);
    
    // Emit event for tracking
    this.engine.emit('content:generated', content);
  }
  
  private generateModuleCode(content: GeneratedContent): string {
    const templates = {
      biome: `/**
 * Auto-generated Biome: ${content.data.name}
 * Generated: ${new Date(content.timestamp).toISOString()}
 */

export class ${this.toCamelCase(content.data.name)}Biome {
  static metadata = ${JSON.stringify(content.data, null, 2)};
  
  static initialize(engine) {
    engine.getWorld().registerBiome(this.metadata);
  }
}

export default ${this.toCamelCase(content.data.name)}Biome;`,

      event: `/**
 * Auto-generated Event: ${content.data.title}
 * Generated: ${new Date(content.timestamp).toISOString()}
 */

export class ${this.toCamelCase(content.data.title)}Event {
  static metadata = ${JSON.stringify(content.data, null, 2)};
  
  static initialize(engine) {
    engine.getSystems().eventSystem.register(this.metadata);
  }
}

export default ${this.toCamelCase(content.data.title)}Event;`,

      item: `/**
 * Auto-generated Item: ${content.data.name}
 * Generated: ${new Date(content.timestamp).toISOString()}
 */

export class ${this.toCamelCase(content.data.name)}Item {
  static metadata = ${JSON.stringify(content.data, null, 2)};
  
  static initialize(engine) {
    engine.getSystems().itemSystem.register(this.metadata);
  }
}

export default ${this.toCamelCase(content.data.name)}Item;`,

      enemy: `/**
 * Auto-generated Enemy: ${content.data.name}
 * Generated: ${new Date(content.timestamp).toISOString()}
 */

export class ${this.toCamelCase(content.data.name)}Enemy {
  static metadata = ${JSON.stringify(content.data, null, 2)};
  
  static initialize(engine) {
    engine.getEntities().registerEnemyType(this.metadata);
  }
}

export default ${this.toCamelCase(content.data.name)}Enemy;`
    };
    
    return templates[content.type] || templates.item;
  }
  
  private generateFileName(content: GeneratedContent): string {
    const name = content.data.name || content.data.title || 'unnamed';
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${content.type}_${sanitized}_${Date.now()}.ts`;
  }
  
  private toCamelCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }
}