/**
 * Core Game Engine - Modular Architecture
 * This engine is designed to be completely modular and self-expanding
 */

import { EventEmitter } from 'events';
import { SystemManager } from './SystemManager';
import { EntityManager } from './EntityManager';
import { WorldManager } from './WorldManager';
import { ContentGenerator } from '../ai/ContentGenerator';

export interface GameConfig {
  version: string;
  seed: string;
  difficulty: number;
  autoExpand: boolean;
}

export class GameEngine extends EventEmitter {
  private static instance: GameEngine;
  private systems: SystemManager;
  private entities: EntityManager;
  private world: WorldManager;
  private contentGen: ContentGenerator;
  private config: GameConfig;
  
  private constructor(config: GameConfig) {
    super();
    this.config = config;
    this.systems = new SystemManager(this);
    this.entities = new EntityManager(this);
    this.world = new WorldManager(this);
    this.contentGen = new ContentGenerator(this);
  }
  
  static getInstance(config?: GameConfig): GameEngine {
    if (!GameEngine.instance && config) {
      GameEngine.instance = new GameEngine(config);
    }
    return GameEngine.instance;
  }
  
  async initialize(): Promise<void> {
    await this.systems.initialize();
    await this.entities.initialize();
    await this.world.initialize();
    await this.contentGen.initialize();
    
    this.emit('engine:initialized');
  }
  
  async update(deltaTime: number): Promise<void> {
    await this.systems.update(deltaTime);
    await this.entities.update(deltaTime);
    await this.world.update(deltaTime);
    
    this.emit('engine:updated', deltaTime);
  }
  
  // Expose managers for modular access
  getSystems(): SystemManager { return this.systems; }
  getEntities(): EntityManager { return this.entities; }
  getWorld(): WorldManager { return this.world; }
  getContentGenerator(): ContentGenerator { return this.contentGen; }
  
  // Hot reload support for live updates
  async hotReload(module: string): Promise<void> {
    this.emit('engine:hot-reload', module);
    // Dynamically reload the module
    await this.reloadModule(module);
  }
  
  private async reloadModule(module: string): Promise<void> {
    // Implementation for dynamic module reloading
    const path = `../modules/${module}`;
    delete require.cache[require.resolve(path)];
    const newModule = await import(path);
    await newModule.default.initialize(this);
  }
}