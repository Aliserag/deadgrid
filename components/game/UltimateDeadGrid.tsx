'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';

// Game configuration
const GRID_WIDTH = 20;
const GRID_HEIGHT = 14; 
const TILE_SIZE = 48;
const TURNS_PER_DAY = 15;

// Entity types
type EntityType = 'player' | 'zombie' | 'survivor' | 'base' | 'loot' | 'obstacle';
type ZombieType = 'small' | 'big' | 'axe';
type LootType = 'ammo' | 'medkit' | 'bandage' | 'food' | 'weapon';
type TurnPhase = 'player' | 'enemies' | 'survivors' | 'environment';

interface GridEntity {
  id: string;
  type: EntityType;
  gridPos: { x: number; y: number };
  sprite: Phaser.GameObjects.Sprite;
  health?: number;
  maxHealth?: number;
  damage?: number;
  faction?: string;
  lootType?: LootType;
}

class UltimateDeadGridScene extends Phaser.Scene {
  // Core systems
  private gridEntities: Map<string, GridEntity> = new Map();
  private turnPhase: TurnPhase = 'player';
  private turnNumber = 0;
  private dayNumber = 1;
  private isProcessingTurn = false;
  
  // Player state
  private player!: GridEntity;
  private playerAmmo = 30;
  private playerInventory: Map<string, number> = new Map([
    ['medkit', 2],
    ['bandage', 3],
    ['food', 5]
  ]);
  
  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private canMove = true;
  
  // UI elements
  private healthHearts: Phaser.GameObjects.Image[] = [];
  private turnText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private inventoryPanel!: Phaser.GameObjects.Container;
  private baseMenuPanel!: Phaser.GameObjects.Container;
  private isInventoryOpen = false;
  
  // Base building
  private playerBase: GridEntity | null = null;
  private baseResources = 0;

  constructor() {
    super({ key: 'UltimateDeadGridScene' });
  }

  preload(): void {
    const basePath = '/assets/PostApocalypse_AssetPack_v1.1.2';
    
    // Player sprites
    this.load.spritesheet('player-idle', 
      `${basePath}/Character/Main/Idle/Character_down_idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    this.load.spritesheet('player-run',
      `${basePath}/Character/Main/Run/Character_down_run-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    this.load.spritesheet('player-death',
      `${basePath}/Character/Main/Death/Character_side_death1-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Zombie sprites with death animations
    this.load.spritesheet('zombie-small-idle',
      `${basePath}/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    this.load.spritesheet('zombie-small-walk',
      `${basePath}/Enemies/Zombie_Small/Zombie_Small_Down_walk-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    this.load.spritesheet('zombie-small-death',
      `${basePath}/Enemies/Zombie_Small/Zombie_Small_Side_First-Death-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    this.load.spritesheet('zombie-big-idle',
      `${basePath}/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png`,
      { frameWidth: 16, frameHeight: 23 }
    );
    this.load.spritesheet('zombie-big-death',
      `${basePath}/Enemies/Zombie_Big/Zombie_Big_Side_First-Death-Sheet7.png`,
      { frameWidth: 16, frameHeight: 23 }
    );
    
    this.load.spritesheet('zombie-axe-idle',
      `${basePath}/Enemies/Zombie_Axe/Zombie_Axe_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 18 }
    );
    this.load.spritesheet('zombie-axe-death',
      `${basePath}/Enemies/Zombie_Axe/Zombie_Axe_Side_First-Death-Sheet6.png`,
      { frameWidth: 13, frameHeight: 18 }
    );
    
    // Loot items that can drop
    this.load.image('loot-ammo', `${basePath}/Objects/Pickable/Bullet-box_1_Blue.png`);
    this.load.image('loot-medkit', `${basePath}/Objects/Pickable/Bandage.png`);
    this.load.image('loot-food', `${basePath}/Objects/Pickable/Canned-soup.png`);
    this.load.image('loot-pistol', `${basePath}/Objects/Pickable/Pistol.png`);
    this.load.image('loot-shotgun', `${basePath}/Objects/Pickable/Shotgun.png`);
    this.load.image('loot-bat', `${basePath}/Objects/Pickable/Bat.png`);
    
    // Environment tiles
    this.load.image('tile-grass', `${basePath}/Tiles/Background_Dark-Green_TileSet.png`);
    this.load.image('tile-road', `${basePath}/Tiles/Background_Bleak-Yellow_TileSet.png`);
    this.load.image('tile-building', `${basePath}/Tiles/Buildings/Buildings_gray_TileSet.png`);
    
    // Objects
    this.load.image('barrel-red', `${basePath}/Objects/Barrel_red_1.png`);
    this.load.image('barrel-rust', `${basePath}/Objects/Barrel_rust_red_1.png`);
    this.load.image('tires', `${basePath}/Objects/2-Tires_Grass_Dark-Green.png`);
    this.load.image('bench', `${basePath}/Objects/Bench_1_down.png`);
    
    // Base/building assets
    this.load.image('base-tent', `${basePath}/Objects/Buildings/Tent_1.png`);
    this.load.image('base-wall', `${basePath}/Objects/Buildings/Reinforced-wooden-wall.png`);
    this.load.image('base-gate', `${basePath}/Objects/Buildings/Wooden-wall_Gate.png`);
    
    // UI assets
    this.load.image('heart-full', `${basePath}/UI/HP/Heart_Full.png`);
    this.load.image('heart-half', `${basePath}/UI/HP/Heart_Half.png`);
    this.load.image('heart-empty', `${basePath}/UI/HP/Heart_Empty.png`);
    this.load.image('icon-ammo', `${basePath}/UI/Inventory/Objects/Icon_Bullet-box_Blue.png`);
    this.load.image('icon-medkit', `${basePath}/UI/Inventory/Objects/Icon_First-Aid-Kit_Red.png`);
    this.load.image('icon-bandage', `${basePath}/UI/Inventory/Objects/Icon_Bandage.png`);
    this.load.image('icon-food', `${basePath}/UI/Inventory/Objects/Icon_Canned-soup.png`);
    
    // Blood effect placeholder (we'll use red particles)
    this.load.image('blood-particle', `${basePath}/Objects/Barrel_red_1.png`);
  }

  create(): void {
    this.createWorld();
    this.createAnimations();
    this.createPlayer();
    this.spawnInitialEnemies();
    this.createUI();
    this.setupControls();
    this.setupEventListeners();
    
    // Start the game
    this.startPlayerTurn();
  }

  createWorld(): void {
    this.cameras.main.setBackgroundColor('#0a0a0a');
    
    // Create varied tilemap
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const tileX = x * TILE_SIZE + TILE_SIZE / 2;
        const tileY = y * TILE_SIZE + TILE_SIZE / 2;
        
        const rand = Math.random();
        let tileKey = 'tile-grass';
        
        if (rand < 0.1) tileKey = 'tile-road';
        else if (rand < 0.15) tileKey = 'tile-building';
        
        const tile = this.add.image(tileX, tileY, tileKey);
        tile.setScale(3).setAlpha(0.3).setDepth(-2);
        
        if (Math.random() > 0.7) {
          tile.setTint(0x666666);
        }
      }
    }
    
    // Add environmental obstacles
    this.addEnvironmentalObjects();
    
    // Grid overlay
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x222222, 0.1);
    for (let x = 0; x <= GRID_WIDTH; x++) {
      graphics.moveTo(x * TILE_SIZE, 0);
      graphics.lineTo(x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      graphics.moveTo(0, y * TILE_SIZE);
      graphics.lineTo(GRID_WIDTH * TILE_SIZE, y * TILE_SIZE);
    }
  }

  addEnvironmentalObjects(): void {
    const objects = [
      { keys: ['barrel-red', 'barrel-rust'], count: 6 },
      { keys: ['tires'], count: 3 },
      { keys: ['bench'], count: 2 }
    ];
    
    objects.forEach(objConfig => {
      for (let i = 0; i < objConfig.count; i++) {
        let pos = this.getRandomEmptyPosition();
        if (!pos) continue;
        
        const key = objConfig.keys[Math.floor(Math.random() * objConfig.keys.length)];
        const worldPos = this.gridToWorld(pos);
        const sprite = this.add.sprite(worldPos.x, worldPos.y, key);
        sprite.setScale(2).setAlpha(0.9).setDepth(1);
        
        this.addGridEntity({
          id: `obstacle-${Date.now()}-${i}`,
          type: 'obstacle',
          gridPos: pos,
          sprite: sprite
        });
      }
    });
  }

  createAnimations(): void {
    // Player animations
    this.createAnim('player-idle-anim', 'player-idle', 0, 5, 6, -1);
    this.createAnim('player-walk-anim', 'player-run', 0, 5, 10, -1);
    this.createAnim('player-death-anim', 'player-death', 0, 5, 8, 0);
    
    // Zombie animations
    this.createAnim('zombie-small-idle-anim', 'zombie-small-idle', 0, 5, 4, -1);
    this.createAnim('zombie-small-walk-anim', 'zombie-small-walk', 0, 5, 6, -1);
    this.createAnim('zombie-small-death-anim', 'zombie-small-death', 0, 5, 8, 0);
    
    this.createAnim('zombie-big-idle-anim', 'zombie-big-idle', 0, 5, 4, -1);
    this.createAnim('zombie-big-death-anim', 'zombie-big-death', 0, 6, 8, 0);
    
    this.createAnim('zombie-axe-idle-anim', 'zombie-axe-idle', 0, 5, 4, -1);
    this.createAnim('zombie-axe-death-anim', 'zombie-axe-death', 0, 5, 8, 0);
  }

  createAnim(key: string, texture: string, start: number, end: number, rate: number, repeat: number): void {
    if (this.textures.exists(texture)) {
      this.anims.create({
        key: key,
        frames: this.anims.generateFrameNumbers(texture, { start, end }),
        frameRate: rate,
        repeat: repeat
      });
    }
  }

  createPlayer(): void {
    const startPos = { x: 10, y: 7 };
    const worldPos = this.gridToWorld(startPos);
    
    const sprite = this.add.sprite(worldPos.x, worldPos.y, 'player-idle', 0);
    sprite.setScale(3).setDepth(10);
    
    if (this.anims.exists('player-idle-anim')) {
      sprite.play('player-idle-anim');
    }
    
    this.player = {
      id: 'player',
      type: 'player',
      gridPos: startPos,
      sprite: sprite,
      health: 100,
      maxHealth: 100,
      damage: 25
    };
    
    this.gridEntities.set('player', this.player);
  }

  spawnInitialEnemies(): void {
    // Spawn zombies based on difficulty curve
    const zombieConfigs: { type: ZombieType, count: number, health: number, damage: number, lootChance: number }[] = [
      { type: 'small', count: 4, health: 30, damage: 10, lootChance: 0.3 },
      { type: 'big', count: 2, health: 60, damage: 20, lootChance: 0.5 },
      { type: 'axe', count: 1, health: 45, damage: 25, lootChance: 0.7 }
    ];
    
    zombieConfigs.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        this.spawnZombie(config);
      }
    });
  }

  spawnZombie(config: { type: ZombieType, health: number, damage: number, lootChance: number }): void {
    const pos = this.getRandomEmptyPosition(5); // Min 5 tiles from player
    if (!pos) return;
    
    const worldPos = this.gridToWorld(pos);
    const sprite = this.add.sprite(worldPos.x, worldPos.y, `zombie-${config.type}-idle`, 0);
    sprite.setScale(3).setDepth(5);
    
    const animKey = `zombie-${config.type}-idle-anim`;
    if (this.anims.exists(animKey)) {
      sprite.play(animKey);
    }
    
    const zombie: GridEntity = {
      id: `zombie-${Date.now()}-${Math.random()}`,
      type: 'zombie',
      gridPos: pos,
      sprite: sprite,
      health: config.health,
      maxHealth: config.health,
      damage: config.damage
    };
    
    sprite.setData('zombieType', config.type);
    sprite.setData('lootChance', config.lootChance);
    sprite.setData('detected', false);
    
    this.gridEntities.set(zombie.id, zombie);
  }

  createUI(): void {
    // Top bar
    const uiBar = this.add.rectangle(480, 35, 960, 70, 0x000000, 0.9);
    uiBar.setStrokeStyle(2, 0x333333).setDepth(100);
    
    // Health hearts
    this.createHealthDisplay();
    
    // Day and turn info
    this.dayText = this.add.text(250, 15, `DAY ${this.dayNumber}`, {
      fontSize: '18px',
      color: '#ff3333',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setDepth(101);
    
    this.turnText = this.add.text(250, 35, 'YOUR TURN', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setDepth(101);
    
    // Ammo counter
    const ammoIcon = this.add.image(400, 25, 'icon-ammo');
    ammoIcon.setScale(1.2).setDepth(101);
    
    this.ammoText = this.add.text(425, 20, `${this.playerAmmo}`, {
      fontSize: '16px',
      color: '#ffcc00',
      fontFamily: 'monospace'
    }).setDepth(101);
    
    // Inventory button
    const bagText = this.add.text(850, 20, '🎒', {
      fontSize: '24px'
    }).setDepth(101).setInteractive({ useHandCursor: true });
    
    bagText.on('pointerdown', () => this.toggleInventory());
    
    // Base button (appears when base is built)
    const baseText = this.add.text(900, 20, '🏠', {
      fontSize: '24px'
    }).setDepth(101).setInteractive({ useHandCursor: true });
    baseText.setVisible(false);
    baseText.on('pointerdown', () => this.openBaseMenu());
    baseText.setData('baseButton', true);
    
    // Create panels
    this.createInventoryPanel();
    this.createBaseMenuPanel();
    
    // Controls
    this.add.text(480, 650, 
      '[WASD/ARROWS] Move | [SPACE] Melee | [G] Shoot | [E] Pickup | [B] Build Base | [I] Inventory | [ENTER] End Turn',
      {
        fontSize: '11px',
        color: '#666666',
        fontFamily: 'monospace'
      }
    ).setOrigin(0.5).setDepth(101);
  }

  createHealthDisplay(): void {
    const startX = 20;
    const startY = 20;
    
    for (let i = 0; i < 5; i++) {
      const heart = this.add.image(startX + i * 25, startY, 'heart-full');
      heart.setScale(1.5).setDepth(101);
      this.healthHearts.push(heart);
    }
    
    this.updateHealthDisplay();
  }

  updateHealthDisplay(): void {
    if (!this.player) return;
    
    const healthPerHeart = 20;
    this.healthHearts.forEach((heart, index) => {
      const heartHealth = this.player.health! - (index * healthPerHeart);
      
      if (heartHealth >= healthPerHeart) {
        heart.setTexture('heart-full');
      } else if (heartHealth > 10) {
        heart.setTexture('heart-half');
      } else if (heartHealth > 0) {
        heart.setTexture('heart-half');
      } else {
        heart.setTexture('heart-empty');
      }
    });
  }

  createInventoryPanel(): void {
    this.inventoryPanel = this.add.container(480, 360);
    
    const bg = this.add.rectangle(0, 0, 400, 300, 0x222222, 0.95);
    bg.setStrokeStyle(3, 0x666666);
    
    const title = this.add.text(0, -120, 'INVENTORY', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    const closeBtn = this.add.text(180, -130, 'X', {
      fontSize: '20px',
      color: '#ff0000',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => this.toggleInventory());
    
    this.inventoryPanel.add([bg, title, closeBtn]);
    this.inventoryPanel.setDepth(200);
    this.inventoryPanel.setVisible(false);
    
    this.updateInventoryDisplay();
  }

  updateInventoryDisplay(): void {
    // Clear old items
    this.inventoryPanel.list.forEach((item: any) => {
      if (item.getData && item.getData('inventoryItem')) {
        item.destroy();
      }
    });
    
    // Add current items
    let index = 0;
    this.playerInventory.forEach((count, itemType) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const x = -150 + col * 80;
      const y = -50 + row * 80;
      
      const slot = this.add.rectangle(x, y, 50, 50, 0x333333, 0.8);
      slot.setStrokeStyle(1, 0x555555);
      slot.setData('inventoryItem', true);
      
      const icon = this.add.image(x, y, `icon-${itemType}`);
      icon.setScale(1.5);
      icon.setInteractive({ useHandCursor: true });
      icon.setData('inventoryItem', true);
      
      const countText = this.add.text(x + 15, y + 15, `${count}`, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      countText.setData('inventoryItem', true);
      
      icon.on('pointerdown', () => this.useItem(itemType as LootType));
      
      this.inventoryPanel.add([slot, icon, countText]);
      index++;
    });
  }

  createBaseMenuPanel(): void {
    this.baseMenuPanel = this.add.container(480, 360);
    
    const bg = this.add.rectangle(0, 0, 400, 300, 0x222222, 0.95);
    bg.setStrokeStyle(3, 0x666666);
    
    const title = this.add.text(0, -120, 'BASE MANAGEMENT', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    const closeBtn = this.add.text(180, -130, 'X', {
      fontSize: '20px',
      color: '#ff0000',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => this.closeBaseMenu());
    
    const resourceText = this.add.text(0, -60, `Resources: ${this.baseResources}`, {
      fontSize: '16px',
      color: '#ffcc00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Upgrade options
    const upgradeWalls = this.add.text(0, 0, '[Upgrade Walls - 10 Resources]', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    upgradeWalls.on('pointerdown', () => this.upgradeBase('walls'));
    
    this.baseMenuPanel.add([bg, title, closeBtn, resourceText, upgradeWalls]);
    this.baseMenuPanel.setDepth(200);
    this.baseMenuPanel.setVisible(false);
  }

  toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;
    this.inventoryPanel.setVisible(this.isInventoryOpen);
    if (this.isInventoryOpen) {
      this.updateInventoryDisplay();
    }
  }

  openBaseMenu(): void {
    if (this.playerBase) {
      this.baseMenuPanel.setVisible(true);
    }
  }

  closeBaseMenu(): void {
    this.baseMenuPanel.setVisible(false);
  }

  useItem(itemType: LootType): void {
    const count = this.playerInventory.get(itemType) || 0;
    if (count <= 0) return;
    
    let used = false;
    
    switch(itemType) {
      case 'medkit':
        if (this.player.health! < this.player.maxHealth!) {
          this.player.health = Math.min(this.player.maxHealth!, this.player.health! + 50);
          used = true;
        }
        break;
      case 'bandage':
        if (this.player.health! < this.player.maxHealth!) {
          this.player.health = Math.min(this.player.maxHealth!, this.player.health! + 20);
          used = true;
        }
        break;
      case 'food':
        if (this.player.health! < this.player.maxHealth!) {
          this.player.health = Math.min(this.player.maxHealth!, this.player.health! + 10);
          used = true;
        }
        break;
    }
    
    if (used) {
      this.playerInventory.set(itemType, count - 1);
      if (this.playerInventory.get(itemType) === 0) {
        this.playerInventory.delete(itemType);
      }
      this.updateHealthDisplay();
      this.updateInventoryDisplay();
      this.showFloatingText(this.player.sprite.x, this.player.sprite.y, `+Health`, 0x00ff00);
    }
  }

  setupControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D');
    
    this.input.keyboard!.on('keydown-ENTER', () => this.endPlayerTurn());
    this.input.keyboard!.on('keydown-SPACE', () => this.playerMeleeAttack());
    this.input.keyboard!.on('keydown-G', () => this.playerRangedAttack());
    this.input.keyboard!.on('keydown-E', () => this.pickupLoot());
    this.input.keyboard!.on('keydown-B', () => this.buildBase());
    this.input.keyboard!.on('keydown-I', () => this.toggleInventory());
  }

  setupEventListeners(): void {
    this.events.on('zombieDeath', (zombie: GridEntity) => {
      this.handleZombieDeath(zombie);
    });
    
    this.events.on('newDay', () => {
      this.dayNumber++;
      this.dayText.setText(`DAY ${this.dayNumber}`);
      this.spawnNewWave();
    });
  }

  update(): void {
    if (this.turnPhase !== 'player' || !this.canMove || this.isInventoryOpen) return;
    
    let moved = false;
    let newPos = { ...this.player.gridPos };
    
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      newPos.x--;
      moved = true;
      this.player.sprite.setFlipX(true);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      newPos.x++;
      moved = true;
      this.player.sprite.setFlipX(false);
    } else if (this.cursors.up.isDown || this.wasd.W.isDown) {
      newPos.y--;
      moved = true;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      newPos.y++;
      moved = true;
    }
    
    if (moved && this.isValidPosition(newPos, 'player')) {
      this.moveEntity(this.player, newPos);
    }
  }

  // Turn-based mechanics from V1
  startPlayerTurn(): void {
    this.turnPhase = 'player';
    this.isProcessingTurn = false;
    this.turnText.setText('YOUR TURN').setColor('#00ff00');
  }

  async endPlayerTurn(): Promise<void> {
    if (this.isProcessingTurn || this.turnPhase !== 'player') return;
    
    this.isProcessingTurn = true;
    this.turnPhase = 'enemies';
    this.turnText.setText('ENEMY TURN').setColor('#ff0000');
    
    // Process enemy turns
    await this.processEnemyTurns();
    
    // Process environment
    await this.processEnvironmentTurn();
    
    // Increment turn counter
    this.turnNumber++;
    if (this.turnNumber % TURNS_PER_DAY === 0) {
      this.events.emit('newDay');
    }
    
    // Start new player turn
    this.startPlayerTurn();
    this.canMove = true;
  }

  async processEnemyTurns(): Promise<void> {
    const zombies = Array.from(this.gridEntities.values()).filter(e => e.type === 'zombie');
    
    for (const zombie of zombies) {
      if (zombie.health! <= 0) continue;
      
      await this.processZombieTurn(zombie);
      await this.delay(300);
    }
  }

  async processZombieTurn(zombie: GridEntity): Promise<void> {
    // Check detection
    const distance = this.getDistance(zombie.gridPos, this.player.gridPos);
    const zombieType = zombie.sprite.getData('zombieType') as ZombieType;
    const detectionRange = zombieType === 'axe' ? 6 : zombieType === 'big' ? 4 : 5;
    
    let isDetected = zombie.sprite.getData('detected');
    
    // Distance-based detection probability
    if (distance <= detectionRange && !isDetected) {
      const detectionChance = 1 - (distance / detectionRange) * 0.5;
      if (Math.random() < detectionChance) {
        isDetected = true;
        zombie.sprite.setData('detected', true);
        this.showFloatingText(zombie.sprite.x, zombie.sprite.y - 20, '!', 0xff0000);
      }
    }
    
    if (!isDetected) return;
    
    // Move towards player or attack
    if (distance === 1) {
      // Attack player
      await this.zombieAttackPlayer(zombie);
    } else {
      // Move towards player
      const path = this.findPath(zombie.gridPos, this.player.gridPos);
      if (path && path.length > 1) {
        await this.moveEntity(zombie, path[1]);
      }
    }
  }

  async zombieAttackPlayer(zombie: GridEntity): Promise<void> {
    const damage = zombie.damage || 10;
    this.player.health! -= damage;
    
    // Blood effect
    this.createBloodEffect(this.player.sprite.x, this.player.sprite.y);
    
    // Visual feedback
    zombie.sprite.setTint(0xff0000);
    await this.delay(200);
    zombie.sprite.clearTint();
    
    this.cameras.main.shake(200, 0.02);
    this.cameras.main.flash(100, 100, 0, 0, false);
    
    this.showFloatingText(this.player.sprite.x, this.player.sprite.y, `-${damage}`, 0xff0000);
    this.updateHealthDisplay();
    
    if (this.player.health! <= 0) {
      this.gameOver();
    }
  }

  async processEnvironmentTurn(): Promise<void> {
    this.turnPhase = 'environment';
    this.turnText.setText('ENVIRONMENT').setColor('#ffaa00');
    
    // Chance to spawn new zombies
    if (Math.random() < 0.1 + (this.dayNumber * 0.02)) {
      this.spawnNewWave();
    }
    
    await this.delay(500);
  }

  spawnNewWave(): void {
    const spawnCount = Math.min(3, Math.floor(this.dayNumber / 3) + 1);
    
    for (let i = 0; i < spawnCount; i++) {
      let config;
      if (this.dayNumber < 3) {
        config = { type: 'small' as ZombieType, health: 30, damage: 10, lootChance: 0.3 };
      } else if (this.dayNumber < 6) {
        config = Math.random() < 0.7 
          ? { type: 'small' as ZombieType, health: 30, damage: 10, lootChance: 0.3 }
          : { type: 'big' as ZombieType, health: 60, damage: 20, lootChance: 0.5 };
      } else {
        const rand = Math.random();
        if (rand < 0.5) {
          config = { type: 'small' as ZombieType, health: 30, damage: 10, lootChance: 0.3 };
        } else if (rand < 0.8) {
          config = { type: 'big' as ZombieType, health: 60, damage: 20, lootChance: 0.5 };
        } else {
          config = { type: 'axe' as ZombieType, health: 45, damage: 25, lootChance: 0.7 };
        }
      }
      
      this.spawnZombie(config);
    }
    
    this.showFloatingText(480, 100, `Wave Incoming!`, 0xff0000);
  }

  // Combat mechanics
  playerMeleeAttack(): void {
    if (this.turnPhase !== 'player') return;
    
    const adjacentEnemies = this.getAdjacentEntities(this.player.gridPos, 'zombie');
    
    adjacentEnemies.forEach(zombie => {
      const damage = this.player.damage! + Math.floor(Math.random() * 10);
      zombie.health! -= damage;
      
      // Blood effect
      this.createBloodEffect(zombie.sprite.x, zombie.sprite.y);
      
      zombie.sprite.setTint(0xff0000);
      this.time.delayedCall(100, () => zombie.sprite.clearTint());
      
      this.showFloatingText(zombie.sprite.x, zombie.sprite.y, `-${damage}`, 0xffff00);
      
      if (zombie.health! <= 0) {
        this.events.emit('zombieDeath', zombie);
      }
    });
  }

  playerRangedAttack(): void {
    if (this.turnPhase !== 'player' || this.playerAmmo <= 0) return;
    
    this.playerAmmo--;
    this.ammoText.setText(`${this.playerAmmo}`);
    
    // Find closest visible zombie
    const zombies = Array.from(this.gridEntities.values()).filter(e => e.type === 'zombie');
    let target: GridEntity | null = null;
    let minDist = Infinity;
    
    zombies.forEach(zombie => {
      const dist = this.getDistance(this.player.gridPos, zombie.gridPos);
      if (dist < minDist && dist <= 8 && this.hasLineOfSight(this.player.gridPos, zombie.gridPos)) {
        target = zombie;
        minDist = dist;
      }
    });
    
    if (target) {
      const damage = 35 + Math.floor(Math.random() * 15);
      target.health! -= damage;
      
      // Muzzle flash effect
      const flash = this.add.circle(this.player.sprite.x, this.player.sprite.y, 10, 0xffff00);
      flash.setDepth(50);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2,
        duration: 100,
        onComplete: () => flash.destroy()
      });
      
      // Blood effect on target
      this.createBloodEffect(target.sprite.x, target.sprite.y);
      
      target.sprite.setTint(0xff0000);
      this.time.delayedCall(100, () => target!.sprite.clearTint());
      
      this.showFloatingText(target.sprite.x, target.sprite.y, `-${damage}`, 0xffff00);
      
      if (target.health! <= 0) {
        this.events.emit('zombieDeath', target);
      }
    }
  }

  handleZombieDeath(zombie: GridEntity): void {
    // Play death animation
    const zombieType = zombie.sprite.getData('zombieType');
    const deathAnim = `zombie-${zombieType}-death-anim`;
    
    if (this.anims.exists(deathAnim)) {
      zombie.sprite.play(deathAnim);
      zombie.sprite.once('animationcomplete', () => {
        // Drop loot
        const lootChance = zombie.sprite.getData('lootChance');
        if (Math.random() < lootChance) {
          this.dropLoot(zombie.gridPos);
        }
        
        // Remove zombie
        this.gridEntities.delete(zombie.id);
        zombie.sprite.destroy();
      });
    } else {
      // No death animation, just fade out
      this.tweens.add({
        targets: zombie.sprite,
        alpha: 0,
        scale: 0,
        duration: 500,
        onComplete: () => {
          const lootChance = zombie.sprite.getData('lootChance');
          if (Math.random() < lootChance) {
            this.dropLoot(zombie.gridPos);
          }
          this.gridEntities.delete(zombie.id);
          zombie.sprite.destroy();
        }
      });
    }
  }

  dropLoot(position: { x: number; y: number }): void {
    const lootTypes: { type: LootType, weight: number, spriteKey: string }[] = [
      { type: 'ammo', weight: 30, spriteKey: 'loot-ammo' },
      { type: 'medkit', weight: 10, spriteKey: 'loot-medkit' },
      { type: 'bandage', weight: 20, spriteKey: 'loot-medkit' },
      { type: 'food', weight: 30, spriteKey: 'loot-food' },
      { type: 'weapon', weight: 10, spriteKey: Math.random() < 0.5 ? 'loot-pistol' : 'loot-bat' }
    ];
    
    // Weighted random selection
    const totalWeight = lootTypes.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedLoot = lootTypes[0];
    for (const loot of lootTypes) {
      random -= loot.weight;
      if (random <= 0) {
        selectedLoot = loot;
        break;
      }
    }
    
    const worldPos = this.gridToWorld(position);
    const sprite = this.add.sprite(worldPos.x, worldPos.y, selectedLoot.spriteKey);
    sprite.setScale(2).setDepth(3);
    
    // Floating animation
    this.tweens.add({
      targets: sprite,
      y: sprite.y - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    const lootEntity: GridEntity = {
      id: `loot-${Date.now()}`,
      type: 'loot',
      gridPos: position,
      sprite: sprite,
      lootType: selectedLoot.type
    };
    
    this.gridEntities.set(lootEntity.id, lootEntity);
  }

  pickupLoot(): void {
    if (this.turnPhase !== 'player') return;
    
    const lootAtPosition = Array.from(this.gridEntities.values()).find(
      e => e.type === 'loot' && 
      e.gridPos.x === this.player.gridPos.x && 
      e.gridPos.y === this.player.gridPos.y
    );
    
    if (lootAtPosition) {
      const lootType = lootAtPosition.lootType!;
      
      if (lootType === 'ammo') {
        this.playerAmmo += 10;
        this.ammoText.setText(`${this.playerAmmo}`);
      } else if (lootType === 'weapon') {
        this.player.damage! += 5;
        this.showFloatingText(this.player.sprite.x, this.player.sprite.y, '+Damage!', 0xffff00);
      } else {
        const currentCount = this.playerInventory.get(lootType) || 0;
        this.playerInventory.set(lootType, currentCount + 1);
      }
      
      this.showFloatingText(this.player.sprite.x, this.player.sprite.y, `+${lootType}`, 0x00ff00);
      
      // Remove loot
      this.gridEntities.delete(lootAtPosition.id);
      lootAtPosition.sprite.destroy();
    }
  }

  // Base building
  buildBase(): void {
    if (this.turnPhase !== 'player' || this.playerBase) return;
    
    const worldPos = this.gridToWorld(this.player.gridPos);
    const sprite = this.add.sprite(worldPos.x, worldPos.y, 'base-tent');
    sprite.setScale(2).setDepth(2);
    sprite.setInteractive({ useHandCursor: true });
    
    sprite.on('pointerdown', () => {
      if (this.getDistance(this.player.gridPos, this.playerBase!.gridPos) <= 1) {
        this.openBaseMenu();
      }
    });
    
    this.playerBase = {
      id: 'player-base',
      type: 'base',
      gridPos: { ...this.player.gridPos },
      sprite: sprite,
      health: 100,
      maxHealth: 100
    };
    
    this.gridEntities.set('player-base', this.playerBase);
    
    // Show base button
    this.children.list.forEach((child: any) => {
      if (child.getData && child.getData('baseButton')) {
        child.setVisible(true);
      }
    });
    
    this.showFloatingText(worldPos.x, worldPos.y, 'Base Built!', 0x00ff00);
  }

  upgradeBase(upgradeType: string): void {
    if (this.baseResources >= 10) {
      this.baseResources -= 10;
      this.playerBase!.maxHealth! += 50;
      this.playerBase!.health! += 50;
      this.showFloatingText(this.playerBase!.sprite.x, this.playerBase!.sprite.y, 'Upgraded!', 0x00ff00);
      this.closeBaseMenu();
    }
  }

  // Helper functions
  moveEntity(entity: GridEntity, newPos: { x: number; y: number }): Promise<void> {
    return new Promise((resolve) => {
      this.canMove = false;
      entity.gridPos = newPos;
      
      const worldPos = this.gridToWorld(newPos);
      
      if (entity.type === 'player' && this.anims.exists('player-walk-anim')) {
        entity.sprite.play('player-walk-anim');
      }
      
      this.tweens.add({
        targets: entity.sprite,
        x: worldPos.x,
        y: worldPos.y,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          if (entity.type === 'player' && this.anims.exists('player-idle-anim')) {
            entity.sprite.play('player-idle-anim');
          }
          this.canMove = true;
          resolve();
        }
      });
    });
  }

  createBloodEffect(x: number, y: number): void {
    // Create red particle effect for blood
    for (let i = 0; i < 5; i++) {
      const blood = this.add.circle(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        Math.random() * 3 + 2,
        0xff0000
      );
      blood.setDepth(4);
      
      this.tweens.add({
        targets: blood,
        alpha: 0,
        scale: 0.5,
        duration: 1000,
        onComplete: () => blood.destroy()
      });
    }
  }

  showFloatingText(x: number, y: number, text: string, color: number): void {
    const floatingText = this.add.text(x, y - 30, text, {
      fontSize: '16px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(150);
    
    this.tweens.add({
      targets: floatingText,
      y: floatingText.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => floatingText.destroy()
    });
  }

  getAdjacentEntities(pos: { x: number; y: number }, type: EntityType): GridEntity[] {
    const adjacent: GridEntity[] = [];
    const offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    offsets.forEach(([dx, dy]) => {
      const checkPos = { x: pos.x + dx, y: pos.y + dy };
      this.gridEntities.forEach(entity => {
        if (entity.type === type && 
            entity.gridPos.x === checkPos.x && 
            entity.gridPos.y === checkPos.y) {
          adjacent.push(entity);
        }
      });
    });
    
    return adjacent;
  }

  findPath(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number }[] | null {
    // Simple pathfinding - just move towards target
    const path = [from];
    const current = { ...from };
    
    if (current.x < to.x) current.x++;
    else if (current.x > to.x) current.x--;
    else if (current.y < to.y) current.y++;
    else if (current.y > to.y) current.y--;
    
    if (this.isValidPosition(current, 'zombie')) {
      path.push(current);
      return path;
    }
    
    return null;
  }

  hasLineOfSight(from: { x: number; y: number }, to: { x: number; y: number }): boolean {
    // Simple line of sight check
    return true; // Simplified for now
  }

  isValidPosition(pos: { x: number; y: number }, entityType: EntityType): boolean {
    if (pos.x < 0 || pos.x >= GRID_WIDTH || pos.y < 0 || pos.y >= GRID_HEIGHT) {
      return false;
    }
    
    // Check for other entities
    for (const [id, entity] of this.gridEntities) {
      if (entity.gridPos.x === pos.x && entity.gridPos.y === pos.y) {
        // Allow player to walk on loot
        if (entityType === 'player' && entity.type === 'loot') {
          continue;
        }
        return false;
      }
    }
    
    return true;
  }

  getRandomEmptyPosition(minDistanceFromPlayer = 0): { x: number; y: number } | null {
    let attempts = 0;
    while (attempts < 100) {
      const pos = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
      
      if (this.isValidPosition(pos, 'zombie')) {
        if (!this.player || this.getDistance(pos, this.player.gridPos) >= minDistanceFromPlayer) {
          return pos;
        }
      }
      
      attempts++;
    }
    return null;
  }

  getDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  gridToWorld(gridPos: { x: number; y: number }): { x: number; y: number } {
    return {
      x: gridPos.x * TILE_SIZE + TILE_SIZE / 2,
      y: gridPos.y * TILE_SIZE + TILE_SIZE / 2
    };
  }

  addGridEntity(entity: GridEntity): void {
    this.gridEntities.set(entity.id, entity);
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }

  gameOver(): void {
    this.add.text(480, 360, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(300);
    
    this.add.text(480, 410, `Survived ${this.dayNumber} days`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(300);
    
    this.turnPhase = 'player';
    this.canMove = false;
  }
}

export default function UltimateDeadGrid() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 960,
      height: 700,
      pixelArt: true,
      scene: UltimateDeadGridScene
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-4xl font-bold text-red-600 mb-2">DEADGRID</h1>
      <p className="text-gray-400 mb-4">Survive the Apocalypse</p>
      <div id="game-container" className="border-2 border-gray-800 shadow-2xl" />
    </div>
  );
}