/**
 * Turn Manager - Handles turn-based gameplay
 */

import { Player } from './entities/Player';
import { Zombie } from './entities/Zombie';
import { GridManager } from './GridManager';

export type TurnPhase = 'player' | 'enemies' | 'environment';

export interface TurnListener {
  onTurnStart(phase: TurnPhase): void;
  onTurnEnd(phase: TurnPhase): void;
}

export class TurnManager {
  private currentPhase: TurnPhase = 'player';
  private turnNumber: number = 0;
  private day: number = 1;
  private isProcessing: boolean = false;
  private listeners: TurnListener[] = [];
  private scene: Phaser.Scene;
  private gridManager: GridManager;
  
  constructor(scene: Phaser.Scene, gridManager: GridManager) {
    this.scene = scene;
    this.gridManager = gridManager;
  }
  
  /**
   * Add turn listener
   */
  addListener(listener: TurnListener): void {
    this.listeners.push(listener);
  }
  
  /**
   * Start player turn
   */
  startPlayerTurn(): void {
    this.currentPhase = 'player';
    this.isProcessing = false;
    this.notifyListeners('start');
  }
  
  /**
   * End player turn and start enemy turn
   */
  async endPlayerTurn(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.notifyListeners('end');
    
    // Start enemy turn
    await this.processEnemyTurn();
    
    // Process environment
    await this.processEnvironmentTurn();
    
    // Increment turn counter
    this.turnNumber++;
    if (this.turnNumber % 15 === 0) {
      this.day++;
      this.scene.events.emit('newDay', this.day);
    }
    
    // Start new player turn
    this.startPlayerTurn();
  }
  
  /**
   * Process all enemy turns
   */
  private async processEnemyTurn(): Promise<void> {
    this.currentPhase = 'enemies';
    this.notifyListeners('start');
    
    const zombies = this.gridManager.getEntitiesByType('zombie');
    const player = this.gridManager.getEntitiesByType('player')[0];
    
    if (!player) return;
    
    // Process each zombie turn sequentially
    for (const zombieEntity of zombies) {
      const zombie = zombieEntity.sprite.getData('entity') as Zombie;
      if (!zombie || !zombie.getIsAlive()) continue;
      
      await this.processZombieTurn(zombie, player);
      
      // Small delay between zombie moves
      await this.delay(200);
    }
    
    this.notifyListeners('end');
  }
  
  /**
   * Process individual zombie turn
   */
  private async processZombieTurn(zombie: Zombie, playerEntity: any): Promise<void> {
    const player = playerEntity.sprite.getData('entity') as Player;
    if (!player) return;
    
    const playerPos = player.getPosition();
    const zombiePos = zombie.getPosition();
    
    // Check detection
    zombie.checkDetection(playerPos);
    
    // If detected or close, move towards player
    if (zombie.getIsDetected()) {
      if (zombie.canAttack(playerPos)) {
        // Attack player
        const damage = zombie.attack();
        player.takeDamage(damage);
        
        // Camera shake on hit
        this.scene.cameras.main.shake(100, 0.01);
        this.scene.cameras.main.flash(100, 255, 0, 0, false);
        
        // Check for game over
        if (player.getHealth() <= 0) {
          this.scene.events.emit('gameOver');
        }
      } else {
        // Move towards player
        const newPos = zombie.moveTowardsTarget(playerPos);
        
        // Check if position is valid and not occupied
        if (!this.gridManager.isOccupied(newPos)) {
          // Update grid
          this.gridManager.moveEntity(zombie.getId(), newPos);
          
          // Animate movement
          await zombie.moveTo(newPos, this.gridManager.getTileSize());
        }
      }
    }
  }
  
  /**
   * Process environment turn (spawn new enemies, events, etc.)
   */
  private async processEnvironmentTurn(): Promise<void> {
    this.currentPhase = 'environment';
    this.notifyListeners('start');
    
    // Chance to spawn new zombies
    if (Math.random() < 0.1 + (this.day * 0.02)) {
      this.spawnNewZombies();
    }
    
    // Chance for random event
    if (Math.random() < 0.05) {
      this.scene.events.emit('randomEvent');
    }
    
    this.notifyListeners('end');
  }
  
  /**
   * Spawn new zombies based on current day
   */
  private spawnNewZombies(): void {
    const spawnCount = Math.min(3, Math.floor(this.day / 3) + 1);
    
    for (let i = 0; i < spawnCount; i++) {
      // Determine zombie type based on day
      let type: 'small' | 'big' | 'axe';
      if (this.day < 3) {
        type = 'small';
      } else if (this.day < 6) {
        type = Math.random() < 0.7 ? 'small' : 'big';
      } else {
        const rand = Math.random();
        if (rand < 0.5) type = 'small';
        else if (rand < 0.8) type = 'big';
        else type = 'axe';
      }
      
      // Find spawn position
      const edge = Math.floor(Math.random() * 4);
      let x, y;
      
      switch(edge) {
        case 0: // Top
          x = Math.floor(Math.random() * this.gridManager.getGridWidth());
          y = 0;
          break;
        case 1: // Right
          x = this.gridManager.getGridWidth() - 1;
          y = Math.floor(Math.random() * this.gridManager.getGridHeight());
          break;
        case 2: // Bottom
          x = Math.floor(Math.random() * this.gridManager.getGridWidth());
          y = this.gridManager.getGridHeight() - 1;
          break;
        default: // Left
          x = 0;
          y = Math.floor(Math.random() * this.gridManager.getGridHeight());
      }
      
      // Emit spawn event
      this.scene.events.emit('spawnZombie', { x, y, type });
    }
  }
  
  /**
   * Notify all listeners of turn change
   */
  private notifyListeners(event: 'start' | 'end'): void {
    this.listeners.forEach(listener => {
      if (event === 'start') {
        listener.onTurnStart(this.currentPhase);
      } else {
        listener.onTurnEnd(this.currentPhase);
      }
    });
  }
  
  /**
   * Helper function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }
  
  // Getters
  getCurrentPhase(): TurnPhase { return this.currentPhase; }
  getTurnNumber(): number { return this.turnNumber; }
  getDay(): number { return this.day; }
  isPlayerTurn(): boolean { return this.currentPhase === 'player' && !this.isProcessing; }
}