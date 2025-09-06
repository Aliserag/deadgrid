'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

class CompleteDeadGridScene extends Phaser.Scene {
  // Core game objects
  private player!: Phaser.GameObjects.Sprite;
  private zombies: Phaser.GameObjects.Sprite[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  
  // Grid settings
  private gridSize = 48;
  private gridWidth = 20;
  private gridHeight = 14;
  private playerGridPos = { x: 10, y: 7 };
  
  // Game state
  private canMove = true;
  private isPlayerTurn = true;
  private playerHealth = 100;
  private maxHealth = 100;
  private turnCount = 0;
  private playerAmmo = 20;
  
  // UI Elements
  private healthHearts: Phaser.GameObjects.Image[] = [];
  private turnText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private inventoryButton!: Phaser.GameObjects.Image;
  private inventoryPanel!: Phaser.GameObjects.Container;
  private isInventoryOpen = false;
  
  // Inventory items
  private inventory: string[] = ['medkit', 'ammo', 'food'];

  constructor() {
    super({ key: 'CompleteDeadGridScene' });
  }

  preload(): void {
    const basePath = '/assets/PostApocalypse_AssetPack_v1.1.2';
    
    // Characters
    this.load.spritesheet('player-idle', 
      `${basePath}/Character/Main/Idle/Character_down_idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    this.load.spritesheet('player-run',
      `${basePath}/Character/Main/Run/Character_down_run-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Zombies
    this.load.spritesheet('zombie-small',
      `${basePath}/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    this.load.spritesheet('zombie-big',
      `${basePath}/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png`,
      { frameWidth: 16, frameHeight: 23 }
    );
    
    this.load.spritesheet('zombie-axe',
      `${basePath}/Enemies/Zombie_Axe/Zombie_Axe_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 18 }
    );
    
    // Ground tiles
    this.load.image('tile-grass', `${basePath}/Tiles/Background_Dark-Green_TileSet.png`);
    this.load.image('tile-road', `${basePath}/Tiles/Background_Bleak-Yellow_TileSet.png`);
    this.load.image('tile-building', `${basePath}/Tiles/Buildings/Buildings_gray_TileSet.png`);
    
    // Objects
    this.load.image('barrel-red', `${basePath}/Objects/Barrel_red_1.png`);
    this.load.image('barrel-blue', `${basePath}/Objects/Barrel_blue_1.png`);
    this.load.image('barrel-rust', `${basePath}/Objects/Barrel_rust_red_1.png`);
    this.load.image('tires', `${basePath}/Objects/2-Tires_Grass_Dark-Green.png`);
    this.load.image('bench', `${basePath}/Objects/Bench_1_down.png`);
    this.load.image('garbage', `${basePath}/Objects/Garbage_1.png`);
    this.load.image('trash', `${basePath}/Objects/Trash-container_1.png`);
    this.load.image('shopping-cart', `${basePath}/Objects/Shopping-cart.png`);
    
    // Vehicles
    this.load.image('car-1', `${basePath}/Objects/Vehicles/Car_1_Red.png`);
    this.load.image('car-2', `${basePath}/Objects/Vehicles/Car_2_Blue.png`);
    this.load.image('car-3', `${basePath}/Objects/Vehicles/Car_3_Yellow.png`);
    
    // UI Elements
    this.load.image('heart-full', `${basePath}/UI/HP/Heart_Full.png`);
    this.load.image('heart-half', `${basePath}/UI/HP/Heart_Half.png`);
    this.load.image('heart-empty', `${basePath}/UI/HP/Heart_Empty.png`);
    this.load.image('inventory-bg', `${basePath}/UI/Inventory/Inventory_2.png`);
    this.load.image('inventory-slot', `${basePath}/UI/Inventory/Inventory_1.png`);
    this.load.image('inventory-close', `${basePath}/UI/Inventory/Inventory_Close.png`);
    
    // Items
    this.load.image('icon-pistol', `${basePath}/UI/Inventory/Objects/Icon_Pistol.png`);
    this.load.image('icon-shotgun', `${basePath}/UI/Inventory/Objects/Icon_Shotgun.png`);
    this.load.image('icon-bat', `${basePath}/UI/Inventory/Objects/Icon_Bat.png`);
    this.load.image('icon-ammo', `${basePath}/UI/Inventory/Objects/Icon_Bullet-box_Blue.png`);
    this.load.image('icon-medkit', `${basePath}/UI/Inventory/Objects/Icon_First-Aid-Kit_Red.png`);
    this.load.image('icon-bandage', `${basePath}/UI/Inventory/Objects/Icon_Bandage.png`);
    this.load.image('icon-food', `${basePath}/UI/Inventory/Objects/Icon_Canned-soup.png`);
    this.load.image('icon-water', `${basePath}/UI/Inventory/Objects/Icon_Medicine.png`);
  }

  create(): void {
    // Create world
    this.createWorld();
    
    // Create animations
    this.createAnimations();
    
    // Create player
    this.createPlayer();
    
    // Create zombies
    this.createZombies();
    
    // Create UI
    this.createUI();
    
    // Setup controls
    this.setupControls();
  }

  createWorld(): void {
    // Set dark background
    this.cameras.main.setBackgroundColor('#0a0a0a');
    
    // Create varied tilemap background
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        const tileX = x * this.gridSize + this.gridSize / 2;
        const tileY = y * this.gridSize + this.gridSize / 2;
        
        // Random tile type
        const rand = Math.random();
        let tileKey = 'tile-grass';
        
        if (rand < 0.1) {
          tileKey = 'tile-road';
        } else if (rand < 0.15) {
          tileKey = 'tile-building';
        }
        
        const tile = this.add.image(tileX, tileY, tileKey);
        tile.setScale(3);
        tile.setAlpha(0.3);
        tile.setDepth(-2);
        
        // Add random tint for variation
        if (Math.random() > 0.7) {
          tile.setTint(0x666666);
        }
      }
    }
    
    // Add random environmental objects
    this.addEnvironmentalObjects();
    
    // Draw subtle grid
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x222222, 0.15);
    
    for (let x = 0; x <= this.gridWidth; x++) {
      graphics.moveTo(x * this.gridSize, 0);
      graphics.lineTo(x * this.gridSize, this.gridHeight * this.gridSize);
    }
    
    for (let y = 0; y <= this.gridHeight; y++) {
      graphics.moveTo(0, y * this.gridSize);
      graphics.lineTo(this.gridWidth * this.gridSize, y * this.gridSize);
    }
  }

  addEnvironmentalObjects(): void {
    const objects = [
      { keys: ['barrel-red', 'barrel-blue', 'barrel-rust'], count: 8, scale: 1.5 },
      { keys: ['tires'], count: 4, scale: 2 },
      { keys: ['bench'], count: 3, scale: 2 },
      { keys: ['shopping-cart'], count: 2, scale: 2 },
      { keys: ['trash'], count: 3, scale: 2 },
      { keys: ['car-1', 'car-2', 'car-3'], count: 2, scale: 2.5 }
    ];
    
    const occupiedPositions: { x: number, y: number }[] = [];
    
    objects.forEach(objConfig => {
      for (let i = 0; i < objConfig.count; i++) {
        let pos: { x: number; y: number } = { x: 0, y: 0 };
        let attempts = 0;
        
        do {
          pos = {
            x: Math.floor(Math.random() * this.gridWidth),
            y: Math.floor(Math.random() * this.gridHeight)
          };
          attempts++;
        } while (
          (occupiedPositions.some(p => p.x === pos.x && p.y === pos.y) ||
           (pos.x === this.playerGridPos.x && pos.y === this.playerGridPos.y)) &&
          attempts < 50
        );
        
        if (attempts < 50) {
          occupiedPositions.push(pos);
          
          const key = objConfig.keys[Math.floor(Math.random() * objConfig.keys.length)];
          const worldX = pos.x * this.gridSize + this.gridSize / 2;
          const worldY = pos.y * this.gridSize + this.gridSize / 2;
          
          const obj = this.add.image(worldX, worldY, key);
          obj.setScale(objConfig.scale);
          obj.setAlpha(0.9);
          obj.setDepth(1);
          
          // Random rotation for some objects
          if (Math.random() > 0.5 && !key.includes('car')) {
            obj.setRotation(Math.random() * Math.PI * 2);
          }
        }
      }
    });
  }

  createAnimations(): void {
    // Player animations
    if (this.textures.exists('player-idle')) {
      this.anims.create({
        key: 'player-idle-anim',
        frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
    }
    
    if (this.textures.exists('player-run')) {
      this.anims.create({
        key: 'player-walk-anim',
        frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
    }
    
    // Zombie animations
    ['zombie-small', 'zombie-big', 'zombie-axe'].forEach(key => {
      if (this.textures.exists(key)) {
        this.anims.create({
          key: `${key}-anim`,
          frames: this.anims.generateFrameNumbers(key, { start: 0, end: 5 }),
          frameRate: 4,
          repeat: -1
        });
      }
    });
  }

  createPlayer(): void {
    const x = this.playerGridPos.x * this.gridSize + this.gridSize / 2;
    const y = this.playerGridPos.y * this.gridSize + this.gridSize / 2;
    
    this.player = this.add.sprite(x, y, 'player-idle', 0);
    this.player.setScale(3);
    this.player.setDepth(10);
    
    if (this.anims.exists('player-idle-anim')) {
      this.player.play('player-idle-anim');
    }
  }

  createZombies(): void {
    const zombieConfigs = [
      { key: 'zombie-small', count: 3, health: 30 },
      { key: 'zombie-big', count: 2, health: 60 },
      { key: 'zombie-axe', count: 1, health: 45 }
    ];
    
    zombieConfigs.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        let pos;
        let attempts = 0;
        
        do {
          pos = {
            x: Math.floor(Math.random() * this.gridWidth),
            y: Math.floor(Math.random() * this.gridHeight)
          };
          attempts++;
        } while (
          Math.abs(pos.x - this.playerGridPos.x) + Math.abs(pos.y - this.playerGridPos.y) < 5 &&
          attempts < 50
        );
        
        if (attempts < 50) {
          const x = pos.x * this.gridSize + this.gridSize / 2;
          const y = pos.y * this.gridSize + this.gridSize / 2;
          
          const zombie = this.add.sprite(x, y, config.key, 0);
          zombie.setScale(3);
          zombie.setDepth(5);
          zombie.setData('gridPos', pos);
          zombie.setData('type', config.key);
          zombie.setData('health', config.health);
          zombie.setData('maxHealth', config.health);
          
          if (this.anims.exists(`${config.key}-anim`)) {
            zombie.play(`${config.key}-anim`);
          }
          
          this.zombies.push(zombie);
        }
      }
    });
  }

  createUI(): void {
    // Top UI bar
    const uiBar = this.add.rectangle(480, 35, 960, 70, 0x000000, 0.8);
    uiBar.setStrokeStyle(2, 0x333333);
    uiBar.setDepth(100);
    
    // Health hearts
    this.createHealthDisplay();
    
    // Turn indicator
    this.turnText = this.add.text(20, 50, 'YOUR TURN', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setDepth(101);
    
    // Ammo counter
    const ammoIcon = this.add.image(350, 20, 'icon-ammo');
    ammoIcon.setScale(1.2).setDepth(101);
    
    this.ammoText = this.add.text(375, 15, `${this.playerAmmo}`, {
      fontSize: '16px',
      color: '#ffcc00',
      fontFamily: 'monospace'
    }).setDepth(101);
    
    // Inventory button (bag emoji or icon)
    this.inventoryButton = this.add.image(900, 30, 'icon-bat');
    this.inventoryButton.setScale(1.5).setDepth(101);
    this.inventoryButton.setInteractive({ useHandCursor: true });
    
    // Add bag emoji text
    const bagEmoji = this.add.text(850, 20, '🎒', {
      fontSize: '24px'
    }).setDepth(101).setInteractive({ useHandCursor: true });
    
    // Inventory click handlers
    this.inventoryButton.on('pointerdown', () => this.toggleInventory());
    bagEmoji.on('pointerdown', () => this.toggleInventory());
    
    // Create inventory panel (hidden initially)
    this.createInventoryPanel();
    
    // Controls help
    this.add.text(480, 650, 
      '[WASD/ARROWS] Move | [SPACE] Attack | [G] Shoot | [I] Inventory | [ENTER] End Turn',
      {
        fontSize: '12px',
        color: '#666666',
        fontFamily: 'monospace'
      }
    ).setOrigin(0.5).setDepth(101);
  }

  createHealthDisplay(): void {
    const heartSpacing = 25;
    const startX = 20;
    const startY = 20;
    
    // Create 5 hearts (each represents 20 health)
    for (let i = 0; i < 5; i++) {
      const heart = this.add.image(startX + i * heartSpacing, startY, 'heart-full');
      heart.setScale(1.5).setDepth(101);
      this.healthHearts.push(heart);
    }
    
    this.updateHealthDisplay();
  }

  updateHealthDisplay(): void {
    const healthPerHeart = 20;
    const heartsToShow = Math.ceil(this.playerHealth / healthPerHeart);
    
    this.healthHearts.forEach((heart, index) => {
      const heartHealth = this.playerHealth - (index * healthPerHeart);
      
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
    
    // Background
    const bg = this.add.rectangle(0, 0, 400, 300, 0x222222, 0.95);
    bg.setStrokeStyle(3, 0x666666);
    
    // Title
    const title = this.add.text(0, -120, 'INVENTORY', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Close button
    const closeBtn = this.add.text(180, -130, 'X', {
      fontSize: '20px',
      color: '#ff0000',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => this.toggleInventory());
    
    // Inventory slots
    const slotSize = 50;
    const startX = -150;
    const startY = -50;
    
    const items = [
      { key: 'icon-medkit', name: 'Medkit', count: 2 },
      { key: 'icon-ammo', name: 'Ammo', count: 3 },
      { key: 'icon-food', name: 'Food', count: 5 },
      { key: 'icon-bandage', name: 'Bandage', count: 4 },
      { key: 'icon-pistol', name: 'Pistol', count: 1 },
      { key: 'icon-bat', name: 'Bat', count: 1 }
    ];
    
    items.forEach((item, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const x = startX + col * (slotSize + 20);
      const y = startY + row * (slotSize + 20);
      
      // Slot background
      const slot = this.add.rectangle(x, y, slotSize, slotSize, 0x333333, 0.8);
      slot.setStrokeStyle(1, 0x555555);
      
      // Item icon
      const icon = this.add.image(x, y, item.key);
      icon.setScale(1.5);
      icon.setInteractive({ useHandCursor: true });
      
      // Item count
      if (item.count > 1) {
        const count = this.add.text(x + 15, y + 15, `${item.count}`, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'monospace'
        }).setOrigin(0.5);
        this.inventoryPanel.add(count);
      }
      
      // Click to use
      icon.on('pointerdown', () => this.useItem(item.name));
      
      this.inventoryPanel.add([slot, icon]);
    });
    
    this.inventoryPanel.add([bg, title, closeBtn]);
    this.inventoryPanel.setDepth(200);
    this.inventoryPanel.setVisible(false);
  }

  toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;
    this.inventoryPanel.setVisible(this.isInventoryOpen);
  }

  useItem(itemName: string): void {
    switch(itemName) {
      case 'Medkit':
        this.playerHealth = Math.min(this.maxHealth, this.playerHealth + 50);
        this.updateHealthDisplay();
        break;
      case 'Bandage':
        this.playerHealth = Math.min(this.maxHealth, this.playerHealth + 20);
        this.updateHealthDisplay();
        break;
      case 'Food':
        this.playerHealth = Math.min(this.maxHealth, this.playerHealth + 10);
        this.updateHealthDisplay();
        break;
      case 'Ammo':
        this.playerAmmo += 10;
        this.ammoText.setText(`${this.playerAmmo}`);
        break;
    }
    
    // Show usage feedback
    const feedback = this.add.text(480, 300, `Used ${itemName}!`, {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(150);
    
    this.tweens.add({
      targets: feedback,
      y: feedback.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => feedback.destroy()
    });
  }

  setupControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D');
    
    // Other keys
    this.input.keyboard!.on('keydown-ENTER', () => this.endPlayerTurn());
    this.input.keyboard!.on('keydown-SPACE', () => this.playerMeleeAttack());
    this.input.keyboard!.on('keydown-G', () => this.playerRangedAttack());
    this.input.keyboard!.on('keydown-I', () => this.toggleInventory());
  }

  update(): void {
    if (!this.isPlayerTurn || !this.canMove || this.isInventoryOpen) return;
    
    let moved = false;
    let newPos = { ...this.playerGridPos };
    
    // Check movement input
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      newPos.x--;
      moved = true;
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      newPos.x++;
      moved = true;
      this.player.setFlipX(false);
    } else if (this.cursors.up.isDown || this.wasd.W.isDown) {
      newPos.y--;
      moved = true;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      newPos.y++;
      moved = true;
    }
    
    if (moved && this.isValidPosition(newPos)) {
      this.movePlayer(newPos);
    }
  }

  isValidPosition(pos: { x: number; y: number }): boolean {
    if (pos.x < 0 || pos.x >= this.gridWidth || pos.y < 0 || pos.y >= this.gridHeight) {
      return false;
    }
    
    for (const zombie of this.zombies) {
      if (!zombie.active) continue;
      const zPos = zombie.getData('gridPos');
      if (zPos.x === pos.x && zPos.y === pos.y) {
        return false;
      }
    }
    
    return true;
  }

  movePlayer(newPos: { x: number; y: number }): void {
    this.canMove = false;
    this.playerGridPos = newPos;
    
    const x = newPos.x * this.gridSize + this.gridSize / 2;
    const y = newPos.y * this.gridSize + this.gridSize / 2;
    
    if (this.anims.exists('player-walk-anim')) {
      this.player.play('player-walk-anim');
    }
    
    this.tweens.add({
      targets: this.player,
      x: x,
      y: y,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (this.anims.exists('player-idle-anim')) {
          this.player.play('player-idle-anim');
        }
        this.canMove = true;
      }
    });
  }

  playerMeleeAttack(): void {
    if (!this.isPlayerTurn) return;
    
    this.zombies.forEach(zombie => {
      if (!zombie.active) return;
      
      const zPos = zombie.getData('gridPos');
      const distance = Math.abs(this.playerGridPos.x - zPos.x) + 
                      Math.abs(this.playerGridPos.y - zPos.y);
      
      if (distance === 1) {
        const health = zombie.getData('health') - 25;
        zombie.setData('health', health);
        
        zombie.setTint(0xff0000);
        this.time.delayedCall(100, () => zombie.clearTint());
        
        this.showDamage(zombie.x, zombie.y, 25);
        
        if (health <= 0) {
          this.killZombie(zombie);
        }
      }
    });
  }

  playerRangedAttack(): void {
    if (!this.isPlayerTurn || this.playerAmmo <= 0) return;
    
    this.playerAmmo--;
    this.ammoText.setText(`${this.playerAmmo}`);
    
    // Find closest zombie
    let closestZombie: Phaser.GameObjects.Sprite | null = null;
    let closestDist = Infinity;
    
    this.zombies.forEach((zombie: Phaser.GameObjects.Sprite) => {
      if (!zombie.active) return;
      const zPos = zombie.getData('gridPos');
      const dist = Math.abs(this.playerGridPos.x - zPos.x) + 
                  Math.abs(this.playerGridPos.y - zPos.y);
      if (dist < closestDist && dist <= 6) {
        closestZombie = zombie;
        closestDist = dist;
      }
    });
    
    if (closestZombie) {
      const zombie = closestZombie as Phaser.GameObjects.Sprite;
      const health = zombie.getData('health') - 35;
      zombie.setData('health', health);
      
      zombie.setTint(0xff0000);
      this.time.delayedCall(100, () => zombie.clearTint());
      
      this.showDamage(zombie.x, zombie.y, 35);
      
      if (health <= 0) {
        this.killZombie(zombie);
      }
    }
  }

  killZombie(zombie: Phaser.GameObjects.Sprite): void {
    this.tweens.add({
      targets: zombie,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 500,
      onComplete: () => zombie.destroy()
    });
  }

  showDamage(x: number, y: number, amount: number): void {
    const text = this.add.text(x, y - 30, `-${amount}`, {
      fontSize: '18px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(150);
    
    this.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }

  endPlayerTurn(): void {
    if (!this.isPlayerTurn) return;
    
    this.isPlayerTurn = false;
    this.turnCount++;
    this.turnText.setText('ENEMY TURN').setColor('#ff0000');
    
    // Process zombie turns
    let zombieIndex = 0;
    const processNextZombie = () => {
      if (zombieIndex >= this.zombies.length) {
        this.time.delayedCall(500, () => {
          this.isPlayerTurn = true;
          this.canMove = true;
          this.turnText.setText('YOUR TURN').setColor('#00ff00');
        });
        return;
      }
      
      const zombie = this.zombies[zombieIndex];
      zombieIndex++;
      
      if (!zombie || !zombie.active) {
        processNextZombie();
        return;
      }
      
      // Move zombie towards player
      const zPos = zombie.getData('gridPos');
      const newPos = { ...zPos };
      
      const dx = this.playerGridPos.x - zPos.x;
      const dy = this.playerGridPos.y - zPos.y;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) newPos.x++;
        else if (dx < 0) newPos.x--;
      } else if (dy !== 0) {
        if (dy > 0) newPos.y++;
        else if (dy < 0) newPos.y--;
      }
      
      // Check if can attack
      const attackDist = Math.abs(newPos.x - this.playerGridPos.x) + 
                        Math.abs(newPos.y - this.playerGridPos.y);
      
      if (attackDist === 0) {
        // Attack player
        this.playerHealth -= 15;
        this.updateHealthDisplay();
        
        zombie.setTint(0xff0000);
        this.time.delayedCall(200, () => zombie.clearTint());
        
        this.cameras.main.shake(200, 0.01);
        this.showDamage(this.player.x, this.player.y, 15);
        
        if (this.playerHealth <= 0) {
          this.gameOver();
          return;
        }
        
        this.time.delayedCall(500, processNextZombie);
      } else if (this.isValidZombiePosition(newPos, zombie)) {
        zombie.setData('gridPos', newPos);
        
        const x = newPos.x * this.gridSize + this.gridSize / 2;
        const y = newPos.y * this.gridSize + this.gridSize / 2;
        
        if (dx > 0) zombie.setFlipX(false);
        else if (dx < 0) zombie.setFlipX(true);
        
        this.tweens.add({
          targets: zombie,
          x: x,
          y: y,
          duration: 400,
          ease: 'Power2',
          onComplete: () => {
            this.time.delayedCall(200, processNextZombie);
          }
        });
      } else {
        this.time.delayedCall(100, processNextZombie);
      }
    };
    
    this.time.delayedCall(500, processNextZombie);
  }

  isValidZombiePosition(pos: { x: number; y: number }, movingZombie: Phaser.GameObjects.Sprite): boolean {
    if (pos.x < 0 || pos.x >= this.gridWidth || pos.y < 0 || pos.y >= this.gridHeight) {
      return false;
    }
    
    for (const zombie of this.zombies) {
      if (!zombie.active || zombie === movingZombie) continue;
      const zPos = zombie.getData('gridPos');
      if (zPos.x === pos.x && zPos.y === pos.y) {
        return false;
      }
    }
    
    return true;
  }

  gameOver(): void {
    this.add.text(480, 360, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(300);
    
    this.isPlayerTurn = false;
    this.canMove = false;
  }
}

export default function CompleteDeadGrid() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 960,
      height: 700,
      pixelArt: true,
      scene: CompleteDeadGridScene
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
      <div id="game-container" className="border-2 border-gray-700" />
    </div>
  );
}