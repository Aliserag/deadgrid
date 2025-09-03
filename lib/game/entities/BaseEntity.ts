/**
 * Base Entity Class - Foundation for all game entities
 */

import { GridPosition } from '../GridManager';

export interface EntityConfig {
  id: string;
  name: string;
  position: GridPosition;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  type: 'player' | 'zombie' | 'npc' | 'item';
}

export abstract class BaseEntity {
  protected id: string;
  protected name: string;
  protected position: GridPosition;
  protected health: number;
  protected maxHealth: number;
  protected damage: number;
  protected speed: number;
  protected sprite!: Phaser.GameObjects.Sprite;
  protected scene: Phaser.Scene;
  protected type: string;
  protected isAlive: boolean = true;
  protected currentAnimation: string = '';
  
  constructor(scene: Phaser.Scene, config: EntityConfig) {
    this.scene = scene;
    this.id = config.id;
    this.name = config.name;
    this.position = config.position;
    this.health = config.health;
    this.maxHealth = config.maxHealth;
    this.damage = config.damage;
    this.speed = config.speed;
    this.type = config.type;
  }
  
  /**
   * Initialize the entity sprite
   */
  abstract initSprite(): void;
  
  /**
   * Update entity each frame
   */
  update(time: number, delta: number): void {
    // Override in subclasses
  }
  
  /**
   * Move entity to new position with animation
   */
  moveTo(newPosition: GridPosition, tileSize: number): Promise<void> {
    return new Promise((resolve) => {
      this.position = newPosition;
      const worldPos = this.gridToWorld(newPosition, tileSize);
      
      // Play walk animation if available
      this.playAnimation('walk');
      
      // Tween to new position
      this.scene.tweens.add({
        targets: this.sprite,
        x: worldPos.x,
        y: worldPos.y,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          this.playAnimation('idle');
          resolve();
        }
      });
    });
  }
  
  /**
   * Take damage
   */
  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    
    // Flash red
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });
    
    // Show damage text
    this.showDamageText(amount);
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  /**
   * Show damage text above entity
   */
  protected showDamageText(damage: number): void {
    const text = this.scene.add.text(
      this.sprite.x,
      this.sprite.y - 30,
      `-${damage}`,
      {
        fontSize: '18px',
        color: '#ff0000',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * Handle entity death
   */
  die(): void {
    this.isAlive = false;
    this.playAnimation('death');
    
    // Fade out and destroy
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 500,
      onComplete: () => {
        this.sprite.destroy();
      }
    });
  }
  
  /**
   * Play animation
   */
  playAnimation(animKey: string): void {
    const fullKey = `${this.getAnimationPrefix()}-${animKey}`;
    if (this.sprite.anims && this.scene.anims.exists(fullKey)) {
      this.sprite.play(fullKey, true);
      this.currentAnimation = fullKey;
    }
  }
  
  /**
   * Get animation prefix for this entity type
   */
  protected abstract getAnimationPrefix(): string;
  
  /**
   * Convert grid position to world coordinates
   */
  protected gridToWorld(gridPos: GridPosition, tileSize: number): { x: number; y: number } {
    return {
      x: gridPos.x * tileSize + tileSize / 2,
      y: gridPos.y * tileSize + tileSize / 2
    };
  }
  
  // Getters
  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getPosition(): GridPosition { return this.position; }
  getHealth(): number { return this.health; }
  getMaxHealth(): number { return this.maxHealth; }
  getDamage(): number { return this.damage; }
  getType(): string { return this.type; }
  getSprite(): Phaser.GameObjects.Sprite { return this.sprite; }
  getIsAlive(): boolean { return this.isAlive; }
  
  // Setters
  setPosition(pos: GridPosition): void { this.position = pos; }
  setHealth(health: number): void { this.health = Math.min(health, this.maxHealth); }
}