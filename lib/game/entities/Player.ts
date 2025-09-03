/**
 * Player Entity Class
 */

import { BaseEntity, EntityConfig } from './BaseEntity';
import { GridPosition } from '../GridManager';

export class Player extends BaseEntity {
  private ammo: number = 20;
  private inventory: string[] = [];
  
  constructor(scene: Phaser.Scene, position: GridPosition) {
    const config: EntityConfig = {
      id: 'player',
      name: 'Survivor',
      position,
      health: 100,
      maxHealth: 100,
      damage: 20,
      speed: 1,
      type: 'player'
    };
    
    super(scene, config);
    this.initSprite();
  }
  
  initSprite(): void {
    const worldPos = this.gridToWorld(this.position, 48);
    this.sprite = this.scene.add.sprite(worldPos.x, worldPos.y, 'player-idle-down', 0);
    this.sprite.setScale(2);
    this.sprite.setDepth(10);
    this.sprite.setData('entity', this);
    
    // Play idle animation if it exists, otherwise just show first frame
    if (this.scene.anims.exists('player-idle')) {
      this.sprite.play('player-idle');
    }
  }
  
  protected getAnimationPrefix(): string {
    return 'player';
  }
  
  /**
   * Override playAnimation to handle player sprite
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
   * Move player with keyboard input
   */
  handleMovement(direction: 'up' | 'down' | 'left' | 'right'): GridPosition {
    const newPos = { ...this.position };
    
    switch(direction) {
      case 'up':
        newPos.y--;
        break;
      case 'down':
        newPos.y++;
        break;
      case 'left':
        newPos.x--;
        this.sprite.setFlipX(true);
        break;
      case 'right':
        newPos.x++;
        this.sprite.setFlipX(false);
        break;
    }
    
    return newPos;
  }
  
  /**
   * Perform melee attack
   */
  meleeAttack(): number {
    this.playAnimation('attack');
    return this.damage + Math.floor(Math.random() * 10);
  }
  
  /**
   * Perform ranged attack
   */
  rangedAttack(): number | null {
    if (this.ammo <= 0) return null;
    
    this.ammo--;
    this.playAnimation('shoot');
    return this.damage + 10 + Math.floor(Math.random() * 15);
  }
  
  /**
   * Add item to inventory
   */
  addItem(item: string): void {
    this.inventory.push(item);
  }
  
  /**
   * Use healing item
   */
  useHealthItem(itemType: string): boolean {
    const index = this.inventory.indexOf(itemType);
    if (index === -1) return false;
    
    this.inventory.splice(index, 1);
    
    switch(itemType) {
      case 'medkit':
        this.health = Math.min(this.maxHealth, this.health + 50);
        break;
      case 'bandage':
        this.health = Math.min(this.maxHealth, this.health + 20);
        break;
      case 'food':
        this.health = Math.min(this.maxHealth, this.health + 10);
        break;
    }
    
    return true;
  }
  
  // Getters
  getAmmo(): number { return this.ammo; }
  getInventory(): string[] { return this.inventory; }
  
  // Setters
  setAmmo(ammo: number): void { this.ammo = ammo; }
  addAmmo(amount: number): void { this.ammo += amount; }
}