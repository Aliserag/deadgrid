'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';

const GRID_WIDTH = 20;
const GRID_HEIGHT = 15;
const TILE_SIZE = 32;

interface GridEntity {
  id: string;
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Sprite;
  type: string;
  health?: number;
}

class CombatDeadGridScene extends Phaser.Scene {
  // Player
  private player!: GridEntity;
  private playerHealth = 100;
  private playerMaxHealth = 100;
  private playerAmmo = 30;
  private playerMeleeWeapon = true; // Start with melee weapon
  
  // Zombies
  private zombies: GridEntity[] = [];
  
  // Combat state
  private isPlayerTurn = true;
  private combatMode: 'move' | 'shoot' | 'melee' = 'move';
  private targetingMode = false;
  private targetCursor!: Phaser.GameObjects.Rectangle;
  
  // Turn system
  private dayNumber = 1;
  private actionsRemaining = 3;
  private maxActionsPerDay = 3;
  
  // Inventory
  private inventory: string[] = [];
  private inventoryOpen = false;
  
  // Resources
  private food = 10;
  private water = 10;
  private medicine = 3;
  
  // UI Elements
  private healthBar!: Phaser.GameObjects.Rectangle;
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private actionText!: Phaser.GameObjects.Text;
  private modeText!: Phaser.GameObjects.Text;
  private inventoryContainer!: Phaser.GameObjects.Container;
  private combatLog: string[] = [];
  private combatLogText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'CombatDeadGridScene' });
  }

  preload(): void {
    const basePath = '/assets/PostApocalypse_AssetPack_v1.1.2';
    
    // Player sprite
    this.load.spritesheet('player', 
      `${basePath}/Character/Main/Idle/Character_down_idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Zombie sprite
    this.load.spritesheet('zombie',
      `${basePath}/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Tiles
    this.load.spritesheet('tiles-green', 
      `${basePath}/Tiles/Background_Dark-Green_TileSet.png`,
      { frameWidth: 16, frameHeight: 16 }
    );
    
    this.load.spritesheet('tiles-road', 
      `${basePath}/Tiles/Background_Bleak-Yellow_TileSet.png`,
      { frameWidth: 16, frameHeight: 16 }
    );
    
    // Objects
    this.load.image('barrel', `${basePath}/Objects/Barrel_red_1.png`);
    this.load.image('trash', `${basePath}/Objects/Trash-bag_1.png`);
    
    // UI
    this.load.image('heart', `${basePath}/UI/HP/Heart_Full.png`);
  }

  create(): void {
    // Enable keyboard
    this.input.keyboard!.enabled = true;
    
    // Create world
    this.createWorld();
    
    // Create entities
    this.createPlayer();
    this.createZombies();
    this.createLootables();
    
    // Create UI
    this.createCombatUI();
    
    // Setup controls
    this.setupCombatControls();
    
    // Create targeting cursor
    this.targetCursor = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, 0xff0000, 0.3);
    this.targetCursor.setStrokeStyle(2, 0xff0000);
    this.targetCursor.setVisible(false);
    this.targetCursor.setDepth(50);
    
    // Camera
    this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    this.cameras.main.centerOn(GRID_WIDTH * TILE_SIZE / 2, GRID_HEIGHT * TILE_SIZE / 2);
    
    // Start message
    this.addCombatLog("=== SURVIVAL DAY 1 ===");
    this.addCombatLog("Use [1] Move, [2] Shoot, [3] Melee");
  }

  createWorld(): void {
    this.cameras.main.setBackgroundColor('#1a1a1a');
    
    // Create grid pattern
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const worldX = x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = y * TILE_SIZE + TILE_SIZE / 2;
        
        // Checkerboard pattern for visibility
        const isDark = (x + y) % 2 === 0;
        const tileColor = isDark ? 0x2a2a2a : 0x333333;
        
        const tile = this.add.rectangle(worldX, worldY, TILE_SIZE - 1, TILE_SIZE - 1, tileColor);
        tile.setStrokeStyle(1, 0x444444, 0.3);
        tile.setDepth(-1);
      }
    }
    
    // Grid coordinates for reference
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        if (x === 0 || y === 0) {
          const coordText = this.add.text(
            x * TILE_SIZE + 2,
            y * TILE_SIZE + 2,
            x === 0 ? y.toString() : x.toString(),
            {
              fontSize: '8px',
              color: '#555555',
              fontFamily: 'monospace'
            }
          );
          coordText.setDepth(0);
        }
      }
    }
  }

  createPlayer(): void {
    const startX = Math.floor(GRID_WIDTH / 2);
    const startY = Math.floor(GRID_HEIGHT / 2);
    
    const worldX = startX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = startY * TILE_SIZE + TILE_SIZE / 2;
    
    const sprite = this.add.sprite(worldX, worldY, 'player', 0);
    sprite.setScale(2);
    sprite.setDepth(10);
    sprite.setTint(0x00ff00); // Green tint for player
    
    this.player = {
      id: 'player',
      x: startX,
      y: startY,
      sprite: sprite,
      type: 'player'
    };
    
    // Player idle animation
    this.anims.create({
      key: 'player-idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    sprite.play('player-idle');
  }

  createZombies(): void {
    const zombieCount = 4 + this.dayNumber;
    
    for (let i = 0; i < zombieCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * GRID_WIDTH);
        y = Math.floor(Math.random() * GRID_HEIGHT);
      } while (
        (Math.abs(x - this.player.x) < 3 && Math.abs(y - this.player.y) < 3) ||
        this.getEntityAt(x, y)
      );
      
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;
      
      const sprite = this.add.sprite(worldX, worldY, 'zombie', 0);
      sprite.setScale(2);
      sprite.setDepth(9);
      sprite.setTint(0xff6666); // Red tint for zombies
      
      const zombie: GridEntity = {
        id: `zombie-${i}`,
        x,
        y,
        sprite: sprite,
        type: 'zombie',
        health: 20
      };
      
      this.zombies.push(zombie);
      
      // Zombie animation
      this.anims.create({
        key: 'zombie-idle',
        frames: this.anims.generateFrameNumbers('zombie', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
      sprite.play('zombie-idle');
      
      // Add health bar above zombie
      this.createEntityHealthBar(zombie);
    }
  }

  createLootables(): void {
    const lootCount = 5;
    
    for (let i = 0; i < lootCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * GRID_WIDTH);
        y = Math.floor(Math.random() * GRID_HEIGHT);
      } while (this.getEntityAt(x, y));
      
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;
      
      const loot = this.add.image(worldX, worldY, Math.random() < 0.5 ? 'barrel' : 'trash');
      loot.setScale(1.5);
      loot.setDepth(5);
      loot.setData('lootable', true);
      loot.setData('x', x);
      loot.setData('y', y);
    }
  }

  createEntityHealthBar(entity: GridEntity): void {
    if (entity.health) {
      const barBg = this.add.rectangle(0, -12, 24, 4, 0x000000);
      const barFill = this.add.rectangle(0, -12, 22, 3, 0x00ff00);
      barBg.setDepth(15);
      barFill.setDepth(16);
      
      entity.sprite.setData('healthBarBg', barBg);
      entity.sprite.setData('healthBarFill', barFill);
      
      this.updateEntityHealthBar(entity);
    }
  }

  updateEntityHealthBar(entity: GridEntity): void {
    if (entity.health && entity.sprite.getData('healthBarFill')) {
      const barBg = entity.sprite.getData('healthBarBg') as Phaser.GameObjects.Rectangle;
      const barFill = entity.sprite.getData('healthBarFill') as Phaser.GameObjects.Rectangle;
      
      barBg.setPosition(entity.sprite.x, entity.sprite.y - 12);
      
      const healthPercent = entity.health / 20; // Max zombie health is 20
      barFill.setSize(22 * healthPercent, 3);
      barFill.setPosition(entity.sprite.x, entity.sprite.y - 12);
      
      // Color based on health
      if (healthPercent > 0.5) barFill.setFillStyle(0x00ff00);
      else if (healthPercent > 0.25) barFill.setFillStyle(0xffff00);
      else barFill.setFillStyle(0xff0000);
    }
  }

  createCombatUI(): void {
    // Main UI container at top
    const uiBg = this.add.rectangle(320, 40, 640, 80, 0x000000, 0.9);
    uiBg.setScrollFactor(0);
    uiBg.setDepth(100);
    uiBg.setStrokeStyle(2, 0x00ff00);
    
    // Health display
    this.healthBarBg = this.add.rectangle(100, 20, 150, 20, 0x333333);
    this.healthBarBg.setScrollFactor(0);
    this.healthBarBg.setDepth(101);
    this.healthBarBg.setStrokeStyle(2, 0xffffff);
    
    this.healthBar = this.add.rectangle(100, 20, 146, 16, 0x00ff00);
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(102);
    
    this.healthText = this.add.text(100, 20, `${this.playerHealth}/${this.playerMaxHealth}`, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    this.healthText.setOrigin(0.5);
    this.healthText.setScrollFactor(0);
    this.healthText.setDepth(103);
    
    // Ammo display
    this.ammoText = this.add.text(250, 20, `🔫 Ammo: ${this.playerAmmo}`, {
      fontSize: '14px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
    this.ammoText.setScrollFactor(0);
    this.ammoText.setDepth(101);
    
    // Actions remaining
    this.actionText = this.add.text(400, 20, `Actions: ${this.actionsRemaining}/${this.maxActionsPerDay}`, {
      fontSize: '14px',
      color: '#00ffff',
      fontFamily: 'monospace'
    });
    this.actionText.setScrollFactor(0);
    this.actionText.setDepth(101);
    
    // Current mode
    this.modeText = this.add.text(320, 50, `MODE: MOVEMENT`, {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.modeText.setOrigin(0.5);
    this.modeText.setScrollFactor(0);
    this.modeText.setDepth(101);
    
    // Combat log
    const logBg = this.add.rectangle(520, 350, 200, 200, 0x000000, 0.8);
    logBg.setScrollFactor(0);
    logBg.setDepth(100);
    logBg.setStrokeStyle(1, 0x666666);
    
    this.add.text(520, 260, 'COMBAT LOG', {
      fontSize: '12px',
      color: '#ffff00',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    
    this.combatLogText = this.add.text(430, 280, '', {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace',
      lineSpacing: 2,
      wordWrap: { width: 180 }
    });
    this.combatLogText.setScrollFactor(0);
    this.combatLogText.setDepth(101);
    
    // Controls help
    const helpText = this.add.text(320, 460, 
      `[1] Move Mode | [2] Shoot Mode (Cost: 5 ammo) | [3] Melee Mode
[WASD/Arrows] Move/Target | [SPACE] Confirm Action | [E] Loot
[I] Inventory | [R] End Day | [ESC] Cancel`,
      {
        fontSize: '11px',
        color: '#888888',
        fontFamily: 'monospace',
        align: 'center'
      }
    );
    helpText.setOrigin(0.5);
    helpText.setScrollFactor(0);
    helpText.setDepth(101);
    
    // Create inventory
    this.createInventory();
  }

  createInventory(): void {
    this.inventoryContainer = this.add.container(320, 240);
    
    const bg = this.add.rectangle(0, 0, 400, 300, 0x222222, 0.95);
    bg.setStrokeStyle(3, 0x00ff00);
    
    const title = this.add.text(0, -130, 'INVENTORY', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    const itemsText = this.add.text(-180, -100, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      lineSpacing: 5
    });
    itemsText.setData('itemsText', true);
    
    const resourcesText = this.add.text(-180, 50, 
      `Resources:\nFood: ${this.food}\nWater: ${this.water}\nMedicine: ${this.medicine}`,
      {
        fontSize: '12px',
        color: '#ffff00',
        fontFamily: 'monospace',
        lineSpacing: 5
      }
    );
    resourcesText.setData('resourcesText', true);
    
    const closeText = this.add.text(0, 130, '[I] or [ESC] to close', {
      fontSize: '10px',
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.inventoryContainer.add([bg, title, itemsText, resourcesText, closeText]);
    this.inventoryContainer.setScrollFactor(0);
    this.inventoryContainer.setDepth(200);
    this.inventoryContainer.setVisible(false);
  }

  setupCombatControls(): void {
    const keyboard = this.input.keyboard!;
    
    // Mode switching
    keyboard.on('keydown-ONE', () => this.switchMode('move'));
    keyboard.on('keydown-TWO', () => this.switchMode('shoot'));
    keyboard.on('keydown-THREE', () => this.switchMode('melee'));
    
    // Movement/Targeting
    keyboard.on('keydown-W', () => this.handleInput(0, -1));
    keyboard.on('keydown-UP', () => this.handleInput(0, -1));
    keyboard.on('keydown-S', () => this.handleInput(0, 1));
    keyboard.on('keydown-DOWN', () => this.handleInput(0, 1));
    keyboard.on('keydown-A', () => this.handleInput(-1, 0));
    keyboard.on('keydown-LEFT', () => this.handleInput(-1, 0));
    keyboard.on('keydown-D', () => this.handleInput(1, 0));
    keyboard.on('keydown-RIGHT', () => this.handleInput(1, 0));
    
    // Actions
    keyboard.on('keydown-SPACE', () => this.confirmAction());
    keyboard.on('keydown-E', () => this.tryLoot());
    keyboard.on('keydown-I', () => this.toggleInventory());
    keyboard.on('keydown-R', () => this.endDay());
    keyboard.on('keydown-ESC', () => this.cancelAction());
  }

  switchMode(mode: 'move' | 'shoot' | 'melee'): void {
    this.combatMode = mode;
    this.targetingMode = false;
    this.targetCursor.setVisible(false);
    
    let modeColor = 0x00ff00;
    let modeText = 'MOVEMENT';
    
    if (mode === 'shoot') {
      if (this.playerAmmo < 5) {
        this.addCombatLog("Not enough ammo!");
        this.combatMode = 'move';
        return;
      }
      modeColor = 0xffff00;
      modeText = 'SHOOTING (5 ammo)';
      this.targetingMode = true;
      this.updateTargetCursor();
    } else if (mode === 'melee') {
      modeColor = 0xff8800;
      modeText = 'MELEE ATTACK';
      this.targetingMode = true;
      this.updateTargetCursor();
    }
    
    this.modeText.setText(`MODE: ${modeText}`);
    const colorObj = Phaser.Display.Color.IntegerToRGB(modeColor);
    this.modeText.setColor(`rgb(${colorObj.r}, ${colorObj.g}, ${colorObj.b})`);
  }

  handleInput(dx: number, dy: number): void {
    if (this.inventoryOpen || !this.isPlayerTurn || this.actionsRemaining <= 0) return;
    
    if (this.combatMode === 'move') {
      this.movePlayer(dx, dy);
    } else if (this.targetingMode) {
      this.moveTargetCursor(dx, dy);
    }
  }

  movePlayer(dx: number, dy: number): void {
    const newX = Phaser.Math.Clamp(this.player.x + dx, 0, GRID_WIDTH - 1);
    const newY = Phaser.Math.Clamp(this.player.y + dy, 0, GRID_HEIGHT - 1);
    
    if (newX === this.player.x && newY === this.player.y) return;
    
    // Check for zombie collision
    const zombie = this.getZombieAt(newX, newY);
    if (zombie) {
      this.addCombatLog("Can't move there - zombie blocking!");
      return;
    }
    
    // Move player
    this.player.x = newX;
    this.player.y = newY;
    
    const worldX = newX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = newY * TILE_SIZE + TILE_SIZE / 2;
    
    this.tweens.add({
      targets: this.player.sprite,
      x: worldX,
      y: worldY,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.actionsRemaining--;
        this.updateUI();
        this.addCombatLog(`Moved to (${newX}, ${newY})`);
        this.endPlayerTurn();
      }
    });
  }

  updateTargetCursor(): void {
    if (!this.targetingMode) return;
    
    // Start cursor at player position
    const cursorX = this.player.x * TILE_SIZE + TILE_SIZE / 2;
    const cursorY = this.player.y * TILE_SIZE + TILE_SIZE / 2;
    
    this.targetCursor.setPosition(cursorX, cursorY);
    this.targetCursor.setVisible(true);
    this.targetCursor.setData('gridX', this.player.x);
    this.targetCursor.setData('gridY', this.player.y);
  }

  moveTargetCursor(dx: number, dy: number): void {
    if (!this.targetingMode) return;
    
    const currentX = this.targetCursor.getData('gridX') || this.player.x;
    const currentY = this.targetCursor.getData('gridY') || this.player.y;
    
    const newX = Phaser.Math.Clamp(currentX + dx, 0, GRID_WIDTH - 1);
    const newY = Phaser.Math.Clamp(currentY + dy, 0, GRID_HEIGHT - 1);
    
    this.targetCursor.setData('gridX', newX);
    this.targetCursor.setData('gridY', newY);
    
    const worldX = newX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = newY * TILE_SIZE + TILE_SIZE / 2;
    
    this.targetCursor.setPosition(worldX, worldY);
    
    // Check range
    const distance = Math.abs(newX - this.player.x) + Math.abs(newY - this.player.y);
    const maxRange = this.combatMode === 'melee' ? 1 : 5;
    
    if (distance <= maxRange) {
      this.targetCursor.setFillStyle(0x00ff00, 0.3);
    } else {
      this.targetCursor.setFillStyle(0xff0000, 0.3);
    }
  }

  confirmAction(): void {
    if (!this.targetingMode || this.actionsRemaining <= 0) return;
    
    const targetX = this.targetCursor.getData('gridX');
    const targetY = this.targetCursor.getData('gridY');
    const distance = Math.abs(targetX - this.player.x) + Math.abs(targetY - this.player.y);
    
    if (this.combatMode === 'shoot') {
      const maxRange = 5;
      if (distance > maxRange) {
        this.addCombatLog("Target out of range!");
        return;
      }
      
      const zombie = this.getZombieAt(targetX, targetY);
      if (zombie) {
        this.shootZombie(zombie);
      } else {
        this.addCombatLog("No target at location!");
      }
    } else if (this.combatMode === 'melee') {
      if (distance > 1) {
        this.addCombatLog("Too far for melee!");
        return;
      }
      
      const zombie = this.getZombieAt(targetX, targetY);
      if (zombie) {
        this.meleeZombie(zombie);
      } else {
        this.addCombatLog("No target at location!");
      }
    }
  }

  shootZombie(zombie: GridEntity): void {
    if (this.playerAmmo < 5) {
      this.addCombatLog("Not enough ammo!");
      return;
    }
    
    this.playerAmmo -= 5;
    zombie.health! -= 15;
    
    // Visual feedback
    this.cameras.main.shake(50, 0.005);
    const flash = this.add.rectangle(
      zombie.sprite.x, zombie.sprite.y,
      TILE_SIZE, TILE_SIZE,
      0xffff00, 0.8
    );
    flash.setDepth(20);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
    
    this.addCombatLog(`Shot zombie for 15 damage!`);
    
    if (zombie.health! <= 0) {
      this.killZombie(zombie);
    } else {
      this.updateEntityHealthBar(zombie);
    }
    
    this.actionsRemaining--;
    this.updateUI();
    this.endPlayerTurn();
  }

  meleeZombie(zombie: GridEntity): void {
    zombie.health! -= 10;
    
    // Visual feedback
    zombie.sprite.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      if (zombie.sprite.active) zombie.sprite.setTint(0xff6666);
    });
    
    this.addCombatLog(`Melee attack for 10 damage!`);
    
    if (zombie.health! <= 0) {
      this.killZombie(zombie);
    } else {
      this.updateEntityHealthBar(zombie);
      // Melee counter-attack chance
      if (Math.random() < 0.3) {
        this.time.delayedCall(300, () => {
          this.damagePlayer(5);
          this.addCombatLog("Zombie counter-attacks!");
        });
      }
    }
    
    this.actionsRemaining--;
    this.updateUI();
    this.endPlayerTurn();
  }

  killZombie(zombie: GridEntity): void {
    // Remove health bars
    const barBg = zombie.sprite.getData('healthBarBg');
    const barFill = zombie.sprite.getData('healthBarFill');
    if (barBg) barBg.destroy();
    if (barFill) barFill.destroy();
    
    // Death animation
    this.tweens.add({
      targets: zombie.sprite,
      alpha: 0,
      scale: 0,
      rotation: Math.PI,
      duration: 300,
      onComplete: () => {
        zombie.sprite.destroy();
        const index = this.zombies.indexOf(zombie);
        if (index > -1) this.zombies.splice(index, 1);
        
        // Drop loot
        if (Math.random() < 0.5) {
          this.playerAmmo += 5;
          this.addCombatLog("Found 5 ammo!");
        }
      }
    });
    
    this.addCombatLog(`Zombie killed!`);
  }

  tryLoot(): void {
    if (this.actionsRemaining <= 0) {
      this.addCombatLog("No actions remaining!");
      return;
    }
    
    // Check for lootables at player position
    const lootables = this.children.getChildren().filter(
      child => child.getData('lootable') &&
               child.getData('x') === this.player.x &&
               child.getData('y') === this.player.y
    );
    
    if (lootables.length > 0) {
      const loot = lootables[0];
      loot.destroy();
      
      // Random loot
      const roll = Math.random();
      if (roll < 0.3) {
        this.playerAmmo += 10;
        this.inventory.push('Ammo Box (+10)');
        this.addCombatLog("Found ammo box! +10 ammo");
      } else if (roll < 0.6) {
        this.food += 5;
        this.inventory.push('Food Ration (+5)');
        this.addCombatLog("Found food! +5 food");
      } else if (roll < 0.8) {
        this.water += 3;
        this.inventory.push('Water Bottle (+3)');
        this.addCombatLog("Found water! +3 water");
      } else {
        this.medicine += 1;
        this.inventory.push('Medicine (+1)');
        this.addCombatLog("Found medicine! +1 medicine");
      }
      
      this.actionsRemaining--;
      this.updateUI();
      this.endPlayerTurn();
    } else {
      this.addCombatLog("Nothing to loot here!");
    }
  }

  endPlayerTurn(): void {
    if (this.actionsRemaining > 0) return;
    
    this.isPlayerTurn = false;
    this.targetCursor.setVisible(false);
    this.addCombatLog("=== ZOMBIE TURN ===");
    
    this.time.delayedCall(500, () => {
      this.processZombieTurns();
    });
  }

  processZombieTurns(): void {
    let zombieIndex = 0;
    
    const processNextZombie = () => {
      if (zombieIndex >= this.zombies.length) {
        this.isPlayerTurn = true;
        this.actionsRemaining = this.maxActionsPerDay;
        this.addCombatLog("=== YOUR TURN ===");
        this.updateUI();
        return;
      }
      
      const zombie = this.zombies[zombieIndex];
      const distance = Math.abs(this.player.x - zombie.x) + Math.abs(this.player.y - zombie.y);
      
      if (distance <= 5) {
        if (distance === 1) {
          // Attack player
          this.damagePlayer(8);
          this.addCombatLog(`Zombie attacks!`);
          
          // Attack animation
          zombie.sprite.setTint(0xffff00);
          this.time.delayedCall(200, () => {
            if (zombie.sprite.active) zombie.sprite.setTint(0xff6666);
          });
          
          zombieIndex++;
          this.time.delayedCall(400, processNextZombie);
        } else {
          // Move towards player
          const dx = Math.sign(this.player.x - zombie.x);
          const dy = Math.sign(this.player.y - zombie.y);
          
          let newX = zombie.x;
          let newY = zombie.y;
          
          if (Math.random() < 0.5 && dx !== 0) {
            newX += dx;
          } else if (dy !== 0) {
            newY += dy;
          } else if (dx !== 0) {
            newX += dx;
          }
          
          // Check if position is free
          if (!this.getZombieAt(newX, newY)) {
            zombie.x = newX;
            zombie.y = newY;
            
            const worldX = newX * TILE_SIZE + TILE_SIZE / 2;
            const worldY = newY * TILE_SIZE + TILE_SIZE / 2;
            
            this.tweens.add({
              targets: zombie.sprite,
              x: worldX,
              y: worldY,
              duration: 300,
              onComplete: () => {
                this.updateEntityHealthBar(zombie);
                zombieIndex++;
                processNextZombie();
              }
            });
          } else {
            zombieIndex++;
            processNextZombie();
          }
        }
      } else {
        zombieIndex++;
        processNextZombie();
      }
    };
    
    processNextZombie();
  }

  damagePlayer(amount: number): void {
    this.playerHealth -= amount;
    this.cameras.main.flash(200, 255, 0, 0, false);
    this.cameras.main.shake(100, 0.01);
    
    if (this.playerHealth <= 0) {
      this.gameOver();
    }
    
    this.updateUI();
  }

  endDay(): void {
    if (this.actionsRemaining > 0) {
      this.addCombatLog(`Wasted ${this.actionsRemaining} actions!`);
    }
    
    // Consume resources
    this.food -= 2;
    this.water -= 2;
    
    // Heal with medicine
    if (this.medicine > 0 && this.playerHealth < this.playerMaxHealth) {
      this.medicine--;
      this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 30);
      this.addCombatLog("Used medicine: +30 health");
    }
    
    // Check starvation
    if (this.food < 0 || this.water < 0) {
      this.damagePlayer(20);
      this.addCombatLog("Starvation damage!");
      this.food = Math.max(0, this.food);
      this.water = Math.max(0, this.water);
    }
    
    // New day
    this.dayNumber++;
    this.actionsRemaining = this.maxActionsPerDay;
    this.isPlayerTurn = true;
    
    // Spawn new zombies
    if (this.dayNumber % 2 === 0) {
      this.spawnNewZombie();
    }
    
    this.addCombatLog(`=== DAY ${this.dayNumber} ===`);
    this.updateUI();
  }

  spawnNewZombie(): void {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(edge) {
      case 0: x = 0; y = Math.floor(Math.random() * GRID_HEIGHT); break;
      case 1: x = GRID_WIDTH - 1; y = Math.floor(Math.random() * GRID_HEIGHT); break;
      case 2: x = Math.floor(Math.random() * GRID_WIDTH); y = 0; break;
      default: x = Math.floor(Math.random() * GRID_WIDTH); y = GRID_HEIGHT - 1; break;
    }
    
    if (!this.getEntityAt(x, y)) {
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;
      
      const sprite = this.add.sprite(worldX, worldY, 'zombie', 0);
      sprite.setScale(2);
      sprite.setDepth(9);
      sprite.setTint(0xff6666);
      
      const zombie: GridEntity = {
        id: `zombie-new-${Date.now()}`,
        x,
        y,
        sprite: sprite,
        type: 'zombie',
        health: 20
      };
      
      this.zombies.push(zombie);
      sprite.play('zombie-idle');
      this.createEntityHealthBar(zombie);
      this.addCombatLog("New zombie arrived!");
    }
  }

  toggleInventory(): void {
    this.inventoryOpen = !this.inventoryOpen;
    this.inventoryContainer.setVisible(this.inventoryOpen);
    
    if (this.inventoryOpen) {
      // Update inventory display
      const itemsText = (this.inventoryContainer.getByName('itemsText') || 
                       this.inventoryContainer.list.find(c => c.getData('itemsText'))) as Phaser.GameObjects.Text;
      
      if (itemsText && itemsText.setText) {
        const items = this.inventory.slice(-10).join('\n') || 'Empty';
        itemsText.setText(`Items:\n${items}`);
      }
      
      const resourcesText = (this.inventoryContainer.getByName('resourcesText') ||
                           this.inventoryContainer.list.find(c => c.getData('resourcesText'))) as Phaser.GameObjects.Text;
      
      if (resourcesText && resourcesText.setText) {
        resourcesText.setText(
          `Resources:\nFood: ${this.food}\nWater: ${this.water}\nMedicine: ${this.medicine}`
        );
      }
    }
  }

  cancelAction(): void {
    if (this.inventoryOpen) {
      this.toggleInventory();
    } else if (this.targetingMode) {
      this.switchMode('move');
    }
  }

  updateUI(): void {
    // Update health bar
    const healthPercent = this.playerHealth / this.playerMaxHealth;
    this.healthBar.setSize(146 * healthPercent, 16);
    
    if (healthPercent > 0.5) this.healthBar.setFillStyle(0x00ff00);
    else if (healthPercent > 0.25) this.healthBar.setFillStyle(0xffff00);
    else this.healthBar.setFillStyle(0xff0000);
    
    this.healthText.setText(`${this.playerHealth}/${this.playerMaxHealth}`);
    
    // Update other UI
    this.ammoText.setText(`🔫 Ammo: ${this.playerAmmo}`);
    this.actionText.setText(`Actions: ${this.actionsRemaining}/${this.maxActionsPerDay}`);
    
    // Update combat log
    const recentLogs = this.combatLog.slice(-10);
    this.combatLogText.setText(recentLogs.join('\n'));
  }

  addCombatLog(message: string): void {
    this.combatLog.push(message);
    if (this.combatLog.length > 50) {
      this.combatLog.shift();
    }
    this.updateUI();
  }

  gameOver(): void {
    this.scene.pause();
    
    const gameOverBg = this.add.rectangle(320, 240, 640, 480, 0x000000, 0.9);
    gameOverBg.setScrollFactor(0);
    gameOverBg.setDepth(300);
    
    const gameOverText = this.add.text(320, 240, 
      `GAME OVER\n\nSurvived ${this.dayNumber} days\n\nPress F5 to restart`,
      {
        fontSize: '32px',
        color: '#ff0000',
        fontFamily: 'monospace',
        align: 'center'
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);
    gameOverText.setDepth(301);
  }

  // Helper functions
  getEntityAt(x: number, y: number): GridEntity | null {
    if (this.player.x === x && this.player.y === y) return this.player;
    return this.getZombieAt(x, y);
  }

  getZombieAt(x: number, y: number): GridEntity | null {
    return this.zombies.find(z => z.x === x && z.y === y) || null;
  }
}

export default function CombatDeadGrid() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 640,
        height: 480,
        parent: 'game-container',
        backgroundColor: '#000000',
        pixelArt: true,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scene: CombatDeadGridScene,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      gameRef.current = new Phaser.Game(config);
      
      // Auto-focus canvas
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.focus();
      }, 100);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div id="game-container" className="border-4 border-green-600 rounded-lg shadow-2xl" />
      <div className="mt-4 text-green-400 text-center">
        <p className="text-xl font-bold mb-2">DEADGRID: TACTICAL COMBAT</p>
        <p className="text-sm">Click game to focus • Check combat log for battle updates</p>
      </div>
    </div>
  );
}