/**
 * Zombie Entity Class
 */

import { BaseEntity, EntityConfig } from './BaseEntity';
import { GridPosition } from '../GridManager';

export type ZombieType = 'small' | 'big' | 'axe';

export class Zombie extends BaseEntity {
  private zombieType: ZombieType;
  private detectionRange: number;
  private isDetected: boolean = false;
  private attackRange: number = 1;
  
  constructor(scene: Phaser.Scene, position: GridPosition, type: ZombieType) {
    const stats = Zombie.getZombieStats(type);
    
    const config: EntityConfig = {
      id: `zombie-${Math.random().toString(36).substr(2, 9)}`,
      name: `${type} Zombie`,
      position,
      health: stats.health,
      maxHealth: stats.health,
      damage: stats.damage,
      speed: stats.speed,
      type: 'zombie'
    };
    
    super(scene, config);
    this.zombieType = type;
    this.detectionRange = stats.detectionRange;
    this.initSprite();
  }
  
  /**
   * Get stats based on zombie type
   */
  private static getZombieStats(type: ZombieType) {
    switch(type) {
      case 'small':
        return {
          health: 30,
          damage: 10,
          speed: 1,
          detectionRange: 5
        };
      case 'big':
        return {
          health: 60,
          damage: 20,
          speed: 0.8,
          detectionRange: 4
        };
      case 'axe':
        return {
          health: 45,
          damage: 25,
          speed: 0.9,
          detectionRange: 6
        };
    }
  }
  
  initSprite(): void {
    const worldPos = this.gridToWorld(this.position, 48);
    this.sprite = this.scene.add.sprite(
      worldPos.x, 
      worldPos.y, 
      `zombie-${this.zombieType}-idle-down`,
      0
    );
    this.sprite.setScale(2);
    this.sprite.setDepth(5);
    this.sprite.setData('entity', this);
    
    // Play idle animation if it exists
    const animKey = `zombie-${this.zombieType}-idle`;
    if (this.scene.anims.exists(animKey)) {
      this.sprite.play(animKey);
    }
  }
  
  protected getAnimationPrefix(): string {
    return `zombie-${this.zombieType}`;
  }
  
  /**
   * Override playAnimation to handle zombie sprites
   */
  playAnimation(animKey: string): void {
    if (!this.sprite) return;
    
    const fullKey = `${this.getAnimationPrefix()}-${animKey}`;
    if (this.scene.anims.exists(fullKey)) {
      this.sprite.play(fullKey, true);
      this.currentAnimation = fullKey;
    }
  }
  
  /**
   * Check if player is within detection range
   */
  checkDetection(playerPos: GridPosition): boolean {
    const distance = Math.abs(this.position.x - playerPos.x) + 
                    Math.abs(this.position.y - playerPos.y);
    
    if (distance <= this.detectionRange) {
      // Distance-based detection probability
      const detectionChance = 1 - (distance / this.detectionRange) * 0.5;
      
      if (!this.isDetected && Math.random() < detectionChance) {
        this.isDetected = true;
        this.showDetectionIndicator();
      }
    }
    
    return this.isDetected;
  }
  
  /**
   * Show exclamation mark when detected
   */
  private showDetectionIndicator(): void {
    const indicator = this.scene.add.text(
      this.sprite.x,
      this.sprite.y - 40,
      '!',
      {
        fontSize: '24px',
        color: '#ff0000',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: indicator,
      y: indicator.y - 20,
      alpha: 0,
      duration: 1500,
      onComplete: () => indicator.destroy()
    });
  }
  
  /**
   * Move towards target position
   */
  moveTowardsTarget(targetPos: GridPosition): GridPosition {
    const newPos = { ...this.position };
    
    // Simple pathfinding - move towards target
    if (this.position.x < targetPos.x) {
      newPos.x++;
    } else if (this.position.x > targetPos.x) {
      newPos.x--;
    } else if (this.position.y < targetPos.y) {
      newPos.y++;
    } else if (this.position.y > targetPos.y) {
      newPos.y--;
    }
    
    return newPos;
  }
  
  /**
   * Perform attack
   */
  attack(): number {
    this.playAnimation('attack');
    return this.damage + Math.floor(Math.random() * 5);
  }
  
  /**
   * Check if target is within attack range
   */
  canAttack(targetPos: GridPosition): boolean {
    const distance = Math.abs(this.position.x - targetPos.x) + 
                    Math.abs(this.position.y - targetPos.y);
    return distance <= this.attackRange;
  }
  
  /**
   * Override die to potentially drop loot
   */
  die(): void {
    super.die();
    
    // Chance to drop loot
    if (Math.random() < 0.5) {
      this.dropLoot();
    }
  }
  
  /**
   * Drop loot on death
   */
  private dropLoot(): void {
    const lootTypes = ['ammo', 'bandage', 'food'];
    const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
    
    // Emit event for loot drop
    this.scene.events.emit('lootDropped', {
      position: this.position,
      type: lootType
    });
  }
  
  // Getters
  getZombieType(): ZombieType { return this.zombieType; }
  getIsDetected(): boolean { return this.isDetected; }
  getDetectionRange(): number { return this.detectionRange; }
}