import { GameSystem } from './GameSystem';
import { IGameState, IEntity, IAction } from '../core/interfaces';

export class TurnSystem extends GameSystem {
  private turnQueue: IEntity[] = [];
  private currentTurn: number = 0;
  private turnCallbacks: Map<string, (entity: IEntity) => void> = new Map();
  
  constructor() {
    super('TurnSystem');
  }
  
  initialize(state: IGameState): void {
    this.currentTurn = 0;
    this.buildTurnQueue(state);
  }
  
  update(state: IGameState, deltaTime: number): void {
    if (!this.enabled) return;
    
    // Process current entity's turn
    if (this.turnQueue.length > 0) {
      const currentEntity = this.turnQueue[0];
      
      // Execute turn callback if exists
      const callback = this.turnCallbacks.get(currentEntity.id);
      if (callback) {
        callback(currentEntity);
      }
      
      // Rotate queue
      this.turnQueue.push(this.turnQueue.shift()!);
      this.currentTurn++;
      
      // Rebuild queue periodically to account for new entities
      if (this.currentTurn % 10 === 0) {
        this.buildTurnQueue(state);
      }
    }
  }
  
  cleanup(): void {
    this.turnQueue = [];
    this.turnCallbacks.clear();
  }
  
  registerTurnCallback(entityId: string, callback: (entity: IEntity) => void): void {
    this.turnCallbacks.set(entityId, callback);
  }
  
  unregisterTurnCallback(entityId: string): void {
    this.turnCallbacks.delete(entityId);
  }
  
  getCurrentTurn(): number {
    return this.currentTurn;
  }
  
  getCurrentEntity(): IEntity | null {
    return this.turnQueue.length > 0 ? this.turnQueue[0] : null;
  }
  
  private buildTurnQueue(state: IGameState): void {
    const entities: IEntity[] = [];
    
    // Add player
    entities.push(state.getPlayer());
    
    // Add NPCs
    entities.push(...state.getNPCs());
    
    // Add zombies
    entities.push(...state.getZombies());
    
    // Sort by initiative or other criteria
    this.turnQueue = entities.sort((a, b) => {
      // Implement initiative logic here
      return 0;
    });
  }
  
  processTurn(entity: IEntity, action: IAction): void {
    // Process the action for the entity
    switch (action.type) {
      case 'move':
        this.processMovement(entity, action);
        break;
      case 'attack':
        this.processAttack(entity, action);
        break;
      case 'interact':
        this.processInteraction(entity, action);
        break;
      case 'wait':
        // Do nothing
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }
  
  private processMovement(entity: IEntity, action: IAction): void {
    if (action.parameters?.direction) {
      const { direction } = action.parameters;
      const newPosition = { ...entity.position };
      
      switch (direction) {
        case 'north':
          newPosition.y -= 1;
          break;
        case 'south':
          newPosition.y += 1;
          break;
        case 'east':
          newPosition.x += 1;
          break;
        case 'west':
          newPosition.x -= 1;
          break;
      }
      
      entity.position = newPosition;
    }
  }
  
  private processAttack(entity: IEntity, action: IAction): void {
    if (action.target) {
      // Implement combat logic
      console.log(`${entity.id} attacks ${action.target.id}`);
    }
  }
  
  private processInteraction(entity: IEntity, action: IAction): void {
    // Implement interaction logic
    console.log(`${entity.id} interacts with environment`);
  }
}