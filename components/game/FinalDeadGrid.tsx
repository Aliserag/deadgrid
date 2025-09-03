'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';

const GRID_WIDTH = 25;
const GRID_HEIGHT = 18;
const TILE_SIZE = 32;
const SHOOT_RANGE = 5;
const MELEE_RANGE = 1;

interface GridEntity {
  id: string;
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Sprite;
  type: string;
  health?: number;
  maxHealth?: number;
}

interface Camp {
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Sprite;
  level: number;
  survivors: number;
}

class FinalDeadGridScene extends Phaser.Scene {
  // Player
  private player!: GridEntity;
  private playerHealth = 100;
  private playerMaxHealth = 100;
  private playerAmmo = 50;
  
  // Zombies
  private zombies: GridEntity[] = [];
  private zombieSpawnRate = 0.1;
  
  // Camp
  private camp: Camp | null = null;
  private campSupplies = 0;
  private campDefense = 0;
  
  // Turn system  
  private isPlayerTurn = true;
  private dayNumber = 1;
  private actionsRemaining = 3;
  private maxActionsPerDay = 3;
  
  // Inventory
  private inventory: string[] = [];
  private inventoryOpen = false;
  
  // Resources
  private food = 15;
  private water = 15;
  private medicine = 3;
  private materials = 0;
  
  // UI Elements
  private healthBar!: Phaser.GameObjects.Rectangle;
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private inventoryContainer!: Phaser.GameObjects.Container;
  private campUI!: Phaser.GameObjects.Container;
  
  // Range indicators
  private rangeIndicators: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super({ key: 'FinalDeadGridScene' });
  }

  preload(): void {
    const basePath = '/assets/PostApocalypse_AssetPack_v1.1.2';
    
    // Player sprite
    this.load.spritesheet('player', 
      `${basePath}/Character/Main/Idle/Character_down_idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Zombie sprites
    this.load.spritesheet('zombie-small',
      `${basePath}/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    this.load.spritesheet('zombie-big',
      `${basePath}/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Proper tilesets
    this.load.spritesheet('tiles-green', 
      `${basePath}/Tiles/Background_Dark-Green_TileSet.png`,
      { frameWidth: 16, frameHeight: 16 }
    );
    
    this.load.spritesheet('tiles-yellow', 
      `${basePath}/Tiles/Background_Bleak-Yellow_TileSet.png`,
      { frameWidth: 16, frameHeight: 16 }
    );
    
    this.load.spritesheet('tiles-grass', 
      `${basePath}/Tiles/Background_Green_TileSet.png`,
      { frameWidth: 16, frameHeight: 16 }
    );
    
    // Buildings and objects
    this.load.image('barrel-red', `${basePath}/Objects/Barrel_red_1.png`);
    this.load.image('barrel-blue', `${basePath}/Objects/Barrel_blue_1.png`);
    this.load.image('trash', `${basePath}/Objects/Trash-bag_1.png`);
    this.load.image('antenna', `${basePath}/Objects/Buildings/Antenna_1.png`);
    this.load.image('door', `${basePath}/Objects/Buildings/Door_1_Beige.png`);
    
    // Camp structures
    this.load.image('wall-wood', `${basePath}/Objects/Buildable/Wooden/Wooden-wall_2.png`);
    this.load.image('wall-reinforced', `${basePath}/Objects/Buildable/Reinforced/Reinforced-wooden-wall_1.png`);
    
    // UI
    this.load.image('heart-full', `${basePath}/UI/HP/Heart_Full.png`);
    this.load.image('heart-half', `${basePath}/UI/HP/Heart_Half.png`);
    this.load.image('heart-empty', `${basePath}/UI/HP/Heart_Empty.png`);
  }

  create(): void {
    // Enable input
    this.input.keyboard!.enabled = true;
    
    // Create coherent world with proper tiles
    this.createTileWorld();
    
    // Create entities
    this.createPlayer();
    this.createInitialZombies();
    this.createLootables();
    
    // Create UI
    this.createUI();
    
    // Setup controls
    this.setupControls();
    
    // Camera
    this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setZoom(1.5);
    
    // Start game
    this.showMessage("Day 1: Find supplies and establish a camp!");
  }

  createTileWorld(): void {
    // Dark apocalyptic background
    this.cameras.main.setBackgroundColor('#0a0a0a');
    
    // Create coherent tile pattern - city blocks with roads
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const worldX = x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = y * TILE_SIZE + TILE_SIZE / 2;
        
        let tileType = 'tiles-green';
        let frameIndex = 0;
        
        // Create city blocks (5x5) with roads between
        const blockX = x % 6;
        const blockY = y % 6;
        
        if (blockX === 5 || blockY === 5) {
          // Roads
          tileType = 'tiles-yellow';
          frameIndex = 1; // Road tile
        } else if (blockX === 0 || blockY === 0 || blockX === 4 || blockY === 4) {
          // Sidewalks
          tileType = 'tiles-grass';
          frameIndex = 0;
        } else {
          // Building areas
          tileType = 'tiles-green';
          frameIndex = Math.random() < 0.3 ? 2 : 0; // Some variation
        }
        
        const tile = this.add.sprite(worldX, worldY, tileType, frameIndex);
        tile.setScale(2);
        tile.setDepth(-2);
        tile.setAlpha(0.8);
        
        // Add subtle tinting for atmosphere
        const darkness = 0.7 + Math.random() * 0.3;
        tile.setTint(Phaser.Display.Color.GetColor(
          Math.floor(255 * darkness),
          Math.floor(255 * darkness * 0.9),
          Math.floor(255 * darkness * 0.85)
        ));
      }
    }
    
    // Add grid overlay for clarity
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x222222, 0.2);
    for (let x = 0; x <= GRID_WIDTH; x++) {
      graphics.moveTo(x * TILE_SIZE, 0);
      graphics.lineTo(x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      graphics.moveTo(0, y * TILE_SIZE);
      graphics.lineTo(GRID_WIDTH * TILE_SIZE, y * TILE_SIZE);
    }
    graphics.setDepth(-1);
  }

  createPlayer(): void {
    const startX = Math.floor(GRID_WIDTH / 2);
    const startY = Math.floor(GRID_HEIGHT / 2);
    
    const worldX = startX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = startY * TILE_SIZE + TILE_SIZE / 2;
    
    const sprite = this.add.sprite(worldX, worldY, 'player', 0);
    sprite.setScale(2.5);
    sprite.setDepth(10);
    
    this.player = {
      id: 'player',
      x: startX,
      y: startY,
      sprite: sprite,
      type: 'player'
    };
    
    // Animation
    this.anims.create({
      key: 'player-idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    sprite.play('player-idle');
  }

  createInitialZombies(): void {
    const zombieCount = 5 + Math.floor(this.dayNumber / 2);
    
    for (let i = 0; i < zombieCount; i++) {
      this.spawnZombie();
    }
  }

  spawnZombie(edge: boolean = false): void {
    let x, y;
    
    if (edge) {
      // Spawn at map edge
      const side = Math.floor(Math.random() * 4);
      switch(side) {
        case 0: x = 0; y = Math.floor(Math.random() * GRID_HEIGHT); break;
        case 1: x = GRID_WIDTH - 1; y = Math.floor(Math.random() * GRID_HEIGHT); break;
        case 2: x = Math.floor(Math.random() * GRID_WIDTH); y = 0; break;
        default: x = Math.floor(Math.random() * GRID_WIDTH); y = GRID_HEIGHT - 1; break;
      }
    } else {
      // Random spawn away from player
      do {
        x = Math.floor(Math.random() * GRID_WIDTH);
        y = Math.floor(Math.random() * GRID_HEIGHT);
      } while (
        (Math.abs(x - this.player.x) < 4 && Math.abs(y - this.player.y) < 4) ||
        this.getEntityAt(x, y)
      );
    }
    
    if (this.getEntityAt(x, y)) return;
    
    const worldX = x * TILE_SIZE + TILE_SIZE / 2;
    const worldY = y * TILE_SIZE + TILE_SIZE / 2;
    
    const isBig = Math.random() < 0.3;
    const spriteKey = isBig ? 'zombie-big' : 'zombie-small';
    const sprite = this.add.sprite(worldX, worldY, spriteKey, 0);
    sprite.setScale(isBig ? 2.2 : 2.5);
    sprite.setDepth(9);
    sprite.setTint(0xcc6666);
    
    const zombie: GridEntity = {
      id: `zombie-${Date.now()}-${Math.random()}`,
      x,
      y,
      sprite: sprite,
      type: 'zombie',
      health: isBig ? 30 : 20,
      maxHealth: isBig ? 30 : 20
    };
    
    // Make zombie clickable for shooting
    sprite.setInteractive();
    sprite.on('pointerover', () => this.onZombieHover(zombie));
    sprite.on('pointerout', () => this.onZombieOut(zombie));
    sprite.on('pointerdown', () => this.onZombieClick(zombie));
    
    this.zombies.push(zombie);
    
    // Animation
    const animKey = `${spriteKey}-idle`;
    if (!this.anims.exists(animKey)) {
      this.anims.create({
        key: animKey,
        frames: this.anims.generateFrameNumbers(spriteKey, { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
    }
    sprite.play(animKey);
    
    // Add health bar
    this.createHealthBar(zombie);
  }

  createHealthBar(entity: GridEntity): void {
    if (!entity.health) return;
    
    const barBg = this.add.rectangle(0, -14, 20, 3, 0x000000);
    const barFill = this.add.rectangle(0, -14, 18, 2, 0x00ff00);
    barBg.setDepth(15);
    barFill.setDepth(16);
    
    entity.sprite.setData('healthBarBg', barBg);
    entity.sprite.setData('healthBarFill', barFill);
    
    this.updateHealthBar(entity);
  }

  updateHealthBar(entity: GridEntity): void {
    const barBg = entity.sprite.getData('healthBarBg') as Phaser.GameObjects.Rectangle;
    const barFill = entity.sprite.getData('healthBarFill') as Phaser.GameObjects.Rectangle;
    
    if (!barBg || !barFill || !entity.health || !entity.maxHealth) return;
    
    barBg.setPosition(entity.sprite.x, entity.sprite.y - 14);
    
    const healthPercent = entity.health / entity.maxHealth;
    barFill.setSize(18 * healthPercent, 2);
    barFill.setPosition(entity.sprite.x, entity.sprite.y - 14);
    
    if (healthPercent > 0.5) barFill.setFillStyle(0x00ff00);
    else if (healthPercent > 0.25) barFill.setFillStyle(0xffff00);
    else barFill.setFillStyle(0xff0000);
  }

  createLootables(): void {
    const lootCount = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < lootCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * GRID_WIDTH);
        y = Math.floor(Math.random() * GRID_HEIGHT);
      } while (this.getEntityAt(x, y));
      
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;
      
      const types = ['barrel-red', 'barrel-blue', 'trash'];
      const lootType = types[Math.floor(Math.random() * types.length)];
      
      const loot = this.add.image(worldX, worldY, lootType);
      loot.setScale(1.5);
      loot.setDepth(5);
      loot.setData('lootable', true);
      loot.setData('x', x);
      loot.setData('y', y);
    }
  }

  createUI(): void {
    // Top UI bar
    const uiBg = this.add.rectangle(400, 35, 800, 70, 0x000000, 0.85);
    uiBg.setScrollFactor(0);
    uiBg.setDepth(100);
    uiBg.setStrokeStyle(2, 0x00ff00);
    
    // Health bar
    this.healthBarBg = this.add.rectangle(100, 25, 150, 22, 0x333333);
    this.healthBarBg.setScrollFactor(0);
    this.healthBarBg.setDepth(101);
    
    this.healthBar = this.add.rectangle(100, 25, 146, 18, 0x00ff00);
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(102);
    
    this.healthText = this.add.text(100, 25, `${this.playerHealth}/${this.playerMaxHealth}`, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.healthText.setOrigin(0.5);
    this.healthText.setScrollFactor(0);
    this.healthText.setDepth(103);
    
    // Status text
    this.statusText = this.add.text(300, 15, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(101);
    
    // Day indicator
    const dayText = this.add.text(700, 25, `DAY ${this.dayNumber}`, {
      fontSize: '18px',
      color: '#ff3333',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    dayText.setOrigin(0.5);
    dayText.setScrollFactor(0);
    dayText.setDepth(101);
    
    // Hearts display
    const heartContainer = this.add.container(50, 50);
    heartContainer.setScrollFactor(0);
    heartContainer.setDepth(101);
    
    for (let i = 0; i < 5; i++) {
      const heartX = i * 18;
      const heartValue = (i + 1) * 20;
      
      let heartType = 'heart-empty';
      if (this.playerHealth >= heartValue) {
        heartType = 'heart-full';
      } else if (this.playerHealth >= heartValue - 10) {
        heartType = 'heart-half';
      }
      
      const heart = this.add.image(heartX, 0, heartType);
      heart.setScale(1.2);
      heartContainer.add(heart);
    }
    
    // Controls
    const controlsText = this.add.text(400, 450, 
      '[WASD/Arrows] Move | [Click Zombie] Shoot | [C] Camp | [E] Loot | [I] Inventory | [Space] End Day',
      {
        fontSize: '11px',
        color: '#666666',
        fontFamily: 'monospace',
        align: 'center'
      }
    );
    controlsText.setOrigin(0.5);
    controlsText.setScrollFactor(0);
    controlsText.setDepth(101);
    
    // Create inventory UI
    this.createInventoryUI();
    
    // Create camp UI
    this.createCampUI();
    
    this.updateStatusUI();
  }

  createInventoryUI(): void {
    this.inventoryContainer = this.add.container(400, 240);
    
    const bg = this.add.rectangle(0, 0, 450, 350, 0x1a1a1a, 0.95);
    bg.setStrokeStyle(3, 0x00ff00);
    
    const title = this.add.text(0, -150, '📦 INVENTORY', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const itemsList = this.add.text(-200, -110, '', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
      lineSpacing: 3
    });
    itemsList.setData('itemsList', true);
    
    const resources = this.add.text(-200, 50, '', {
      fontSize: '12px',
      color: '#ffff00',
      fontFamily: 'monospace',
      lineSpacing: 5
    });
    resources.setData('resourcesList', true);
    
    const closeHint = this.add.text(0, 150, 'Press [I] or [ESC] to close', {
      fontSize: '10px',
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.inventoryContainer.add([bg, title, itemsList, resources, closeHint]);
    this.inventoryContainer.setScrollFactor(0);
    this.inventoryContainer.setDepth(200);
    this.inventoryContainer.setVisible(false);
  }

  createCampUI(): void {
    this.campUI = this.add.container(400, 240);
    
    const bg = this.add.rectangle(0, 0, 500, 400, 0x1a1a1a, 0.95);
    bg.setStrokeStyle(3, 0x0088ff);
    
    const title = this.add.text(0, -170, '🏕️ CAMP MANAGEMENT', {
      fontSize: '20px',
      color: '#0088ff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const campInfo = this.add.text(-220, -130, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      lineSpacing: 5
    });
    campInfo.setData('campInfo', true);
    
    const actions = this.add.text(-220, 0, 
      'CAMP ACTIONS:\n' +
      '[1] Upgrade Defenses (10 materials)\n' +
      '[2] Recruit Survivor (20 food, 20 water)\n' +
      '[3] Send Scavenging Party\n' +
      '[4] Craft Ammo (5 materials)\n' +
      '[5] Heal All (uses medicine)',
      {
        fontSize: '11px',
        color: '#88ccff',
        fontFamily: 'monospace',
        lineSpacing: 8
      }
    );
    
    const closeHint = this.add.text(0, 170, 'Press [C] or [ESC] to close', {
      fontSize: '10px',
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.campUI.add([bg, title, campInfo, actions, closeHint]);
    this.campUI.setScrollFactor(0);
    this.campUI.setDepth(200);
    this.campUI.setVisible(false);
  }

  setupControls(): void {
    const keyboard = this.input.keyboard!;
    
    // Movement
    keyboard.on('keydown-W', () => this.movePlayer(0, -1));
    keyboard.on('keydown-UP', () => this.movePlayer(0, -1));
    keyboard.on('keydown-S', () => this.movePlayer(0, 1));
    keyboard.on('keydown-DOWN', () => this.movePlayer(0, 1));
    keyboard.on('keydown-A', () => this.movePlayer(-1, 0));
    keyboard.on('keydown-LEFT', () => this.movePlayer(-1, 0));
    keyboard.on('keydown-D', () => this.movePlayer(1, 0));
    keyboard.on('keydown-RIGHT', () => this.movePlayer(1, 0));
    
    // Actions
    keyboard.on('keydown-E', () => this.tryLoot());
    keyboard.on('keydown-C', () => this.toggleCamp());
    keyboard.on('keydown-I', () => this.toggleInventory());
    keyboard.on('keydown-SPACE', () => this.endDay());
    keyboard.on('keydown-ESC', () => this.closeAllUI());
    
    // Camp actions (when camp UI is open)
    keyboard.on('keydown-ONE', () => this.campAction(1));
    keyboard.on('keydown-TWO', () => this.campAction(2));
    keyboard.on('keydown-THREE', () => this.campAction(3));
    keyboard.on('keydown-FOUR', () => this.campAction(4));
    keyboard.on('keydown-FIVE', () => this.campAction(5));
  }

  onZombieHover(zombie: GridEntity): void {
    const distance = Math.abs(this.player.x - zombie.x) + Math.abs(this.player.y - zombie.y);
    
    if (distance <= SHOOT_RANGE) {
      zombie.sprite.setTint(0xff8888);
      this.input.setDefaultCursor('crosshair');
      
      // Show range indicator
      this.showRangeIndicator(zombie.x, zombie.y, true);
    }
  }

  onZombieOut(zombie: GridEntity): void {
    zombie.sprite.setTint(0xcc6666);
    this.input.setDefaultCursor('default');
    this.hideRangeIndicators();
  }

  onZombieClick(zombie: GridEntity): void {
    if (!this.isPlayerTurn || this.actionsRemaining <= 0) {
      this.showMessage("No actions remaining!");
      return;
    }
    
    const distance = Math.abs(this.player.x - zombie.x) + Math.abs(this.player.y - zombie.y);
    
    if (distance <= MELEE_RANGE) {
      this.meleeAttack(zombie);
    } else if (distance <= SHOOT_RANGE) {
      this.shootZombie(zombie);
    } else {
      this.showMessage("Target too far away!");
    }
  }

  shootZombie(zombie: GridEntity): void {
    if (this.playerAmmo < 5) {
      this.showMessage("Not enough ammo! Need 5");
      return;
    }
    
    this.playerAmmo -= 5;
    const damage = 15 + Math.floor(Math.random() * 6);
    zombie.health! -= damage;
    
    // Muzzle flash effect
    const flash = this.add.circle(this.player.sprite.x, this.player.sprite.y, 20, 0xffff00, 0.8);
    flash.setDepth(20);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 150,
      onComplete: () => flash.destroy()
    });
    
    // Impact effect
    const impact = this.add.circle(zombie.sprite.x, zombie.sprite.y, 15, 0xff0000, 0.6);
    impact.setDepth(20);
    this.tweens.add({
      targets: impact,
      alpha: 0,
      scale: 0.5,
      duration: 200,
      onComplete: () => impact.destroy()
    });
    
    // Camera shake
    this.cameras.main.shake(100, 0.003);
    
    this.showMessage(`Shot zombie! -${damage} HP`);
    
    if (zombie.health! <= 0) {
      this.killZombie(zombie);
    } else {
      this.updateHealthBar(zombie);
    }
    
    this.actionsRemaining--;
    this.updateStatusUI();
    
    if (this.actionsRemaining <= 0) {
      this.endPlayerTurn();
    }
  }

  meleeAttack(zombie: GridEntity): void {
    const damage = 10 + Math.floor(Math.random() * 6);
    zombie.health! -= damage;
    
    // Melee effect
    zombie.sprite.setTint(0xffffff);
    this.cameras.main.shake(50, 0.005);
    
    this.time.delayedCall(100, () => {
      if (zombie.sprite.active) zombie.sprite.setTint(0xcc6666);
    });
    
    this.showMessage(`Melee attack! -${damage} HP`);
    
    if (zombie.health! <= 0) {
      this.killZombie(zombie);
    } else {
      this.updateHealthBar(zombie);
      // Counter attack chance
      if (Math.random() < 0.4) {
        this.time.delayedCall(300, () => {
          this.damagePlayer(5);
          this.showMessage("Zombie counters!");
        });
      }
    }
    
    this.actionsRemaining--;
    this.updateStatusUI();
    
    if (this.actionsRemaining <= 0) {
      this.endPlayerTurn();
    }
  }

  killZombie(zombie: GridEntity): void {
    // Remove health bar
    const barBg = zombie.sprite.getData('healthBarBg');
    const barFill = zombie.sprite.getData('healthBarFill');
    if (barBg) barBg.destroy();
    if (barFill) barFill.destroy();
    
    // Death animation
    this.tweens.add({
      targets: zombie.sprite,
      alpha: 0,
      scale: 0.5,
      angle: 90,
      duration: 300,
      onComplete: () => {
        zombie.sprite.destroy();
        const index = this.zombies.indexOf(zombie);
        if (index > -1) this.zombies.splice(index, 1);
      }
    });
    
    // Drop loot
    const lootRoll = Math.random();
    if (lootRoll < 0.3) {
      this.playerAmmo += 3 + Math.floor(Math.random() * 5);
      this.inventory.push('Ammo');
      this.showMessage("Found ammo!");
    } else if (lootRoll < 0.5) {
      this.materials += 2;
      this.inventory.push('Materials');
      this.showMessage("Found materials!");
    }
  }

  movePlayer(dx: number, dy: number): void {
    if (!this.isPlayerTurn || this.actionsRemaining <= 0 || this.inventoryOpen || this.campUI.visible) {
      return;
    }
    
    const newX = Phaser.Math.Clamp(this.player.x + dx, 0, GRID_WIDTH - 1);
    const newY = Phaser.Math.Clamp(this.player.y + dy, 0, GRID_HEIGHT - 1);
    
    if (newX === this.player.x && newY === this.player.y) return;
    
    // Check for zombie
    const zombie = this.getZombieAt(newX, newY);
    if (zombie) {
      this.meleeAttack(zombie);
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
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.actionsRemaining--;
        this.updateStatusUI();
        
        if (this.actionsRemaining <= 0) {
          this.endPlayerTurn();
        }
      }
    });
  }

  tryLoot(): void {
    if (this.actionsRemaining <= 0) return;
    
    const lootables = this.children.getChildren().filter(
      child => child.getData('lootable') &&
               child.getData('x') === this.player.x &&
               child.getData('y') === this.player.y
    );
    
    if (lootables.length > 0) {
      const loot = lootables[0];
      loot.destroy();
      
      const roll = Math.random();
      if (roll < 0.25) {
        const ammo = 5 + Math.floor(Math.random() * 10);
        this.playerAmmo += ammo;
        this.inventory.push(`Ammo x${ammo}`);
        this.showMessage(`Found ${ammo} ammo!`);
      } else if (roll < 0.5) {
        const food = 3 + Math.floor(Math.random() * 5);
        this.food += food;
        this.inventory.push(`Food x${food}`);
        this.showMessage(`Found ${food} food!`);
      } else if (roll < 0.7) {
        const water = 3 + Math.floor(Math.random() * 5);
        this.water += water;
        this.inventory.push(`Water x${water}`);
        this.showMessage(`Found ${water} water!`);
      } else if (roll < 0.85) {
        this.medicine++;
        this.inventory.push('Medicine');
        this.showMessage("Found medicine!");
      } else {
        const materials = 2 + Math.floor(Math.random() * 4);
        this.materials += materials;
        this.inventory.push(`Materials x${materials}`);
        this.showMessage(`Found ${materials} materials!`);
      }
      
      this.actionsRemaining--;
      this.updateStatusUI();
      
      if (this.actionsRemaining <= 0) {
        this.endPlayerTurn();
      }
    } else {
      this.showMessage("Nothing to loot here!");
    }
  }

  toggleCamp(): void {
    if (!this.camp && this.materials >= 10) {
      // Establish camp
      this.establishCamp();
    } else if (this.camp) {
      // Open camp management
      this.campUI.setVisible(!this.campUI.visible);
      this.updateCampUI();
    } else {
      this.showMessage("Need 10 materials to establish camp!");
    }
  }

  establishCamp(): void {
    if (this.materials < 10) {
      this.showMessage("Not enough materials!");
      return;
    }
    
    this.materials -= 10;
    
    const campSprite = this.add.image(
      this.player.sprite.x,
      this.player.sprite.y - 20,
      'antenna'
    );
    campSprite.setScale(2);
    campSprite.setDepth(7);
    
    this.camp = {
      x: this.player.x,
      y: this.player.y,
      sprite: campSprite,
      level: 1,
      survivors: 1
    };
    
    // Add camp marker
    const marker = this.add.text(
      campSprite.x,
      campSprite.y - 20,
      '🏕️ CAMP',
      {
        fontSize: '10px',
        color: '#00ff00',
        fontFamily: 'monospace',
        backgroundColor: '#000000',
        padding: { x: 2, y: 1 }
      }
    );
    marker.setOrigin(0.5);
    marker.setDepth(8);
    
    this.maxActionsPerDay++;
    this.campDefense = 5;
    
    this.showMessage("Camp established! +1 action per day!");
  }

  updateCampUI(): void {
    if (!this.camp) return;
    
    const campInfo = this.campUI.list.find(c => c.getData('campInfo')) as Phaser.GameObjects.Text;
    if (campInfo) {
      campInfo.setText(
        `CAMP STATUS:\n` +
        `Level: ${this.camp.level}\n` +
        `Survivors: ${this.camp.survivors}\n` +
        `Defense: ${this.campDefense}\n` +
        `Supplies: ${this.campSupplies}\n\n` +
        `RESOURCES:\n` +
        `Materials: ${this.materials}\n` +
        `Food: ${this.food}\n` +
        `Water: ${this.water}\n` +
        `Medicine: ${this.medicine}`
      );
    }
  }

  campAction(action: number): void {
    if (!this.campUI.visible || !this.camp) return;
    
    switch(action) {
      case 1: // Upgrade defenses
        if (this.materials >= 10) {
          this.materials -= 10;
          this.campDefense += 5;
          this.camp.level++;
          this.showMessage("Defenses upgraded!");
          this.updateCampUI();
        } else {
          this.showMessage("Need 10 materials!");
        }
        break;
        
      case 2: // Recruit survivor
        if (this.food >= 20 && this.water >= 20) {
          this.food -= 20;
          this.water -= 20;
          this.camp.survivors++;
          this.maxActionsPerDay++;
          this.showMessage("Survivor recruited! +1 action per day!");
          this.updateCampUI();
        } else {
          this.showMessage("Need 20 food and 20 water!");
        }
        break;
        
      case 3: // Scavenging party
        if (this.camp.survivors > 1) {
          const found = Math.floor(Math.random() * 10) + 5;
          this.campSupplies += found;
          this.showMessage(`Scavenging party found ${found} supplies!`);
          this.updateCampUI();
        } else {
          this.showMessage("Need more survivors!");
        }
        break;
        
      case 4: // Craft ammo
        if (this.materials >= 5) {
          this.materials -= 5;
          this.playerAmmo += 20;
          this.showMessage("Crafted 20 ammo!");
          this.updateCampUI();
        } else {
          this.showMessage("Need 5 materials!");
        }
        break;
        
      case 5: // Heal all
        if (this.medicine > 0) {
          const healAmount = Math.min(50, this.playerMaxHealth - this.playerHealth);
          this.playerHealth += healAmount;
          this.medicine--;
          this.showMessage(`Healed ${healAmount} HP!`);
          this.updateStatusUI();
          this.updateCampUI();
        } else {
          this.showMessage("No medicine!");
        }
        break;
    }
  }

  toggleInventory(): void {
    this.inventoryOpen = !this.inventoryOpen;
    this.inventoryContainer.setVisible(this.inventoryOpen);
    
    if (this.inventoryOpen) {
      const itemsList = this.inventoryContainer.list.find(c => c.getData('itemsList')) as Phaser.GameObjects.Text;
      const resourcesList = this.inventoryContainer.list.find(c => c.getData('resourcesList')) as Phaser.GameObjects.Text;
      
      if (itemsList) {
        const recent = this.inventory.slice(-15);
        itemsList.setText(recent.length > 0 ? recent.join('\n') : 'Empty');
      }
      
      if (resourcesList) {
        resourcesList.setText(
          `RESOURCES:\n` +
          `💊 Medicine: ${this.medicine}\n` +
          `🍖 Food: ${this.food}\n` +
          `💧 Water: ${this.water}\n` +
          `🔨 Materials: ${this.materials}\n` +
          `🔫 Ammo: ${this.playerAmmo}`
        );
      }
    }
  }

  closeAllUI(): void {
    this.inventoryContainer.setVisible(false);
    this.inventoryOpen = false;
    this.campUI.setVisible(false);
  }

  endPlayerTurn(): void {
    this.isPlayerTurn = false;
    this.showMessage("Zombie turn...");
    
    this.time.delayedCall(300, () => {
      this.processZombieTurns();
    });
  }

  processZombieTurns(): void {
    let zombieIndex = 0;
    
    const processNext = () => {
      if (zombieIndex >= this.zombies.length) {
        this.isPlayerTurn = true;
        this.actionsRemaining = this.maxActionsPerDay;
        this.updateStatusUI();
        return;
      }
      
      const zombie = this.zombies[zombieIndex];
      const distance = Math.abs(this.player.x - zombie.x) + Math.abs(this.player.y - zombie.y);
      
      if (distance <= 6) {
        if (distance === 1) {
          // Attack
          const damage = 5 + Math.floor(Math.random() * 6);
          this.damagePlayer(damage);
          
          zombie.sprite.setTint(0xffff00);
          this.time.delayedCall(200, () => {
            if (zombie.sprite.active) zombie.sprite.setTint(0xcc6666);
          });
          
          zombieIndex++;
          this.time.delayedCall(300, processNext);
        } else {
          // Move towards player
          const dx = Math.sign(this.player.x - zombie.x);
          const dy = Math.sign(this.player.y - zombie.y);
          
          let newX = zombie.x;
          let newY = zombie.y;
          
          if (Math.abs(dx) > Math.abs(dy) || (Math.abs(dx) === Math.abs(dy) && Math.random() < 0.5)) {
            if (dx !== 0) newX += dx;
          } else {
            if (dy !== 0) newY += dy;
          }
          
          if (!this.getZombieAt(newX, newY)) {
            zombie.x = newX;
            zombie.y = newY;
            
            const worldX = newX * TILE_SIZE + TILE_SIZE / 2;
            const worldY = newY * TILE_SIZE + TILE_SIZE / 2;
            
            this.tweens.add({
              targets: zombie.sprite,
              x: worldX,
              y: worldY,
              duration: 250,
              onComplete: () => {
                this.updateHealthBar(zombie);
                zombieIndex++;
                processNext();
              }
            });
          } else {
            zombieIndex++;
            processNext();
          }
        }
      } else {
        zombieIndex++;
        processNext();
      }
    };
    
    processNext();
  }

  damagePlayer(amount: number): void {
    // Camp defense reduces damage
    if (this.camp && this.campDefense > 0) {
      amount = Math.max(1, amount - Math.floor(this.campDefense / 5));
    }
    
    this.playerHealth -= amount;
    this.cameras.main.flash(200, 255, 0, 0, false);
    this.cameras.main.shake(100, 0.01);
    this.showMessage(`-${amount} HP!`);
    
    if (this.playerHealth <= 0) {
      this.gameOver();
    }
    
    this.updateStatusUI();
  }

  endDay(): void {
    // Consume resources
    const foodCost = 2 + (this.camp ? this.camp.survivors : 0);
    const waterCost = 2 + (this.camp ? this.camp.survivors : 0);
    
    this.food -= foodCost;
    this.water -= waterCost;
    
    if (this.food < 0 || this.water < 0) {
      this.damagePlayer(20);
      this.showMessage("Starvation!");
      this.food = Math.max(0, this.food);
      this.water = Math.max(0, this.water);
    }
    
    // Camp generates supplies
    if (this.camp) {
      this.campSupplies += this.camp.survivors * 2;
    }
    
    // Heal if have medicine
    if (this.medicine > 0 && this.playerHealth < this.playerMaxHealth) {
      const heal = Math.min(30, this.playerMaxHealth - this.playerHealth);
      this.playerHealth += heal;
      this.medicine--;
      this.showMessage(`+${heal} HP (medicine used)`);
    }
    
    // New day
    this.dayNumber++;
    this.actionsRemaining = this.maxActionsPerDay;
    this.isPlayerTurn = true;
    
    // Spawn zombies
    const spawnCount = Math.floor(this.dayNumber / 2) + Math.floor(Math.random() * 3);
    for (let i = 0; i < spawnCount; i++) {
      this.spawnZombie(true);
    }
    
    this.showMessage(`Day ${this.dayNumber} - ${spawnCount} zombies approaching!`);
    this.updateStatusUI();
  }

  updateStatusUI(): void {
    // Update health bar
    const healthPercent = this.playerHealth / this.playerMaxHealth;
    this.healthBar.setSize(146 * healthPercent, 18);
    
    if (healthPercent > 0.5) this.healthBar.setFillStyle(0x00ff00);
    else if (healthPercent > 0.25) this.healthBar.setFillStyle(0xffff00);
    else this.healthBar.setFillStyle(0xff0000);
    
    this.healthText.setText(`${this.playerHealth}/${this.playerMaxHealth}`);
    
    // Update status
    this.statusText.setText(
      `🔫 Ammo: ${this.playerAmmo} | ` +
      `⚡ Actions: ${this.actionsRemaining}/${this.maxActionsPerDay} | ` +
      `🧟 Zombies: ${this.zombies.length}`
    );
    
    // Update hearts
    const heartContainer = this.children.getChildren().find(
      child => child instanceof Phaser.GameObjects.Container && child.y === 50
    ) as Phaser.GameObjects.Container;
    
    if (heartContainer) {
      heartContainer.removeAll(true);
      
      for (let i = 0; i < 5; i++) {
        const heartX = i * 18;
        const heartValue = (i + 1) * 20;
        
        let heartType = 'heart-empty';
        if (this.playerHealth >= heartValue) {
          heartType = 'heart-full';
        } else if (this.playerHealth >= heartValue - 10) {
          heartType = 'heart-half';
        }
        
        const heart = this.add.image(heartX, 0, heartType);
        heart.setScale(1.2);
        heartContainer.add(heart);
      }
    }
  }

  showMessage(text: string): void {
    const msg = this.add.text(400, 200, text, {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    msg.setOrigin(0.5);
    msg.setScrollFactor(0);
    msg.setDepth(250);
    
    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: 150,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => msg.destroy()
    });
  }

  showRangeIndicator(x: number, y: number, inRange: boolean): void {
    this.hideRangeIndicators();
    
    const indicator = this.add.rectangle(
      x * TILE_SIZE + TILE_SIZE / 2,
      y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE - 2,
      TILE_SIZE - 2,
      inRange ? 0x00ff00 : 0xff0000,
      0.2
    );
    indicator.setStrokeStyle(2, inRange ? 0x00ff00 : 0xff0000, 0.5);
    indicator.setDepth(6);
    
    this.rangeIndicators.push(indicator);
  }

  hideRangeIndicators(): void {
    this.rangeIndicators.forEach(ind => ind.destroy());
    this.rangeIndicators = [];
  }

  gameOver(): void {
    this.scene.pause();
    
    const gameOverBg = this.add.rectangle(400, 240, 800, 480, 0x000000, 0.9);
    gameOverBg.setScrollFactor(0);
    gameOverBg.setDepth(300);
    
    const stats = `GAME OVER\n\nSurvived: ${this.dayNumber} days\nZombies Killed: ${50 - this.zombies.length}\nCamp Level: ${this.camp ? this.camp.level : 0}\n\nPress F5 to restart`;
    
    const gameOverText = this.add.text(400, 240, stats, {
      fontSize: '24px',
      color: '#ff0000',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 5
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);
    gameOverText.setDepth(301);
  }

  // Helper functions
  getEntityAt(x: number, y: number): any {
    if (this.player.x === x && this.player.y === y) return this.player;
    return this.getZombieAt(x, y);
  }

  getZombieAt(x: number, y: number): GridEntity | null {
    return this.zombies.find(z => z.x === x && z.y === y) || null;
  }
}

export default function FinalDeadGrid() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
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
        scene: FinalDeadGridScene,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      gameRef.current = new Phaser.Game(config);
      
      // Auto-focus
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
      <div id="game-container" className="border-4 border-gray-700 rounded-lg shadow-2xl" />
      <div className="mt-4 text-gray-400 text-center">
        <p className="text-xl font-bold text-red-500 mb-2">DEADGRID: SURVIVAL</p>
        <p className="text-sm">Click zombies to shoot (5 ammo) • Walk into them for melee • Establish camps for bonuses</p>
      </div>
    </div>
  );
}