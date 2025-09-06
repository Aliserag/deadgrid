'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';

// Grid configuration
const GRID_WIDTH = 25;
const GRID_HEIGHT = 18;
const TILE_SIZE = 32;

interface GridEntity {
  id: string;
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Sprite;
  type: string;
}

class WorkingDeadGridScene extends Phaser.Scene {
  // Player
  private player!: GridEntity;
  private playerHealth = 100;
  private playerAmmo = 50;
  
  // Zombies
  private zombies: GridEntity[] = [];
  
  // Turn system
  private isPlayerTurn = true;
  private dayNumber = 1;
  private movesRemaining = 3;
  private maxMovesPerDay = 3;
  
  // Resources
  private food = 20;
  private water = 15;
  private medicine = 5;
  private inventory: string[] = [];
  
  // UI
  private healthText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  
  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'WorkingDeadGridScene' });
  }

  preload(): void {
    const basePath = '/assets/PostApocalypse_AssetPack_v1.1.2';
    
    // Load sprites with CORRECT dimensions (78x16 = 6 frames of 13x16)
    this.load.spritesheet('player-idle', 
      `${basePath}/Character/Main/Idle/Character_down_idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    this.load.spritesheet('zombie-small-idle',
      `${basePath}/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    this.load.spritesheet('zombie-big-idle',
      `${basePath}/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Load tilesets as spritesheets (16x16 tiles)
    this.load.spritesheet('tiles-green', 
      `${basePath}/Tiles/Background_Dark-Green_TileSet.png`,
      { frameWidth: 16, frameHeight: 16 }
    );
    
    this.load.spritesheet('tiles-yellow', 
      `${basePath}/Tiles/Background_Bleak-Yellow_TileSet.png`,
      { frameWidth: 16, frameHeight: 16 }
    );
    
    // Load individual objects for buildings
    this.load.image('barrel-red', `${basePath}/Objects/Barrel_red_1.png`);
    this.load.image('barrel-blue', `${basePath}/Objects/Barrel_blue_1.png`);
    this.load.image('antenna', `${basePath}/Objects/Buildings/Antenna_1.png`);
    this.load.image('trash-bag', `${basePath}/Objects/Trash-bag_1.png`);
    this.load.image('traffic-cone', `${basePath}/Objects/Traffic-cone.png`);
    this.load.image('vending-red', `${basePath}/Objects/Vending-machine_Red.png`);
    
    // UI elements
    this.load.image('heart-full', `${basePath}/UI/HP/Heart_Full.png`);
    this.load.image('heart-half', `${basePath}/UI/HP/Heart_Half.png`);
    this.load.image('heart-empty', `${basePath}/UI/HP/Heart_Empty.png`);
  }

  create(): void {
    console.log('Creating game scene...');
    
    // Make sure the game has focus
    this.input.keyboard!.enabled = true;
    this.game.canvas.focus();
    
    // Create world
    this.createTileBackground();
    
    // Create player
    this.createPlayer();
    
    // Create zombies
    this.createZombies();
    
    // Create objects
    this.createWorldObjects();
    
    // Setup UI
    this.createUI();
    
    // Setup controls
    this.setupControls();
    
    // Setup camera
    this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.centerOn(GRID_WIDTH * TILE_SIZE / 2, GRID_HEIGHT * TILE_SIZE / 2);
    
    console.log('Scene created successfully');
  }

  createTileBackground(): void {
    // Create a dark background first
    this.cameras.main.setBackgroundColor('#0a0a0a');
    
    // Create tile grid
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const worldX = x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = y * TILE_SIZE + TILE_SIZE / 2;
        
        // Use variety of tile frames
        const tileType = Math.random() < 0.7 ? 'tiles-green' : 'tiles-yellow';
        const frameIndex = Math.floor(Math.random() * 20); // Random tile from tileset
        
        const tile = this.add.sprite(worldX, worldY, tileType, frameIndex);
        tile.setScale(2); // Scale up 16x16 to 32x32
        tile.setDepth(-2);
        tile.setAlpha(0.6);
        
        // Add some tint variation
        if (Math.random() < 0.2) {
          tile.setTint(0x888888);
        }
      }
    }
    
    // Add grid lines for clarity
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x222222, 0.3);
    
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
    
    const playerSprite = this.add.sprite(worldX, worldY, 'player-idle', 0);
    playerSprite.setScale(2);
    playerSprite.setDepth(10);
    
    this.player = {
      id: 'player',
      x: startX,
      y: startY,
      sprite: playerSprite,
      type: 'player'
    };
    
    // Create player animation
    if (!this.anims.exists('player-idle-anim')) {
      this.anims.create({
        key: 'player-idle-anim',
        frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    playerSprite.play('player-idle-anim');
    console.log('Player created at', startX, startY);
  }

  createZombies(): void {
    // Create 5-8 zombies
    const zombieCount = 5 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < zombieCount; i++) {
      let x, y;
      
      // Find empty position not too close to player
      do {
        x = Math.floor(Math.random() * GRID_WIDTH);
        y = Math.floor(Math.random() * GRID_HEIGHT);
      } while (Math.abs(x - this.player.x) < 3 && Math.abs(y - this.player.y) < 3);
      
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;
      
      // Only use small zombies for now since they work
      const zombieSprite = this.add.sprite(worldX, worldY, 'zombie-small-idle', 0);
      zombieSprite.setScale(2);
      zombieSprite.setDepth(9);
      zombieSprite.setTint(0xaa8888);
      
      const zombie: GridEntity = {
        id: `zombie-${i}`,
        x,
        y,
        sprite: zombieSprite,
        type: 'zombie-small'
      };
      
      this.zombies.push(zombie);
      
      // Create zombie animation
      if (!this.anims.exists('zombie-small-idle-anim')) {
        this.anims.create({
          key: 'zombie-small-idle-anim',
          frames: this.anims.generateFrameNumbers('zombie-small-idle', { 
            start: 0, 
            end: 5
          }),
          frameRate: 6,
          repeat: -1
        });
      }
      
      zombieSprite.play('zombie-small-idle-anim');
    }
    
    console.log(`Created ${zombieCount} zombies`);
  }

  createWorldObjects(): void {
    // Add some random objects around the world
    const objects = ['barrel-red', 'barrel-blue', 'antenna', 'trash-bag', 'traffic-cone', 'vending-red'];
    const objectCount = 10 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < objectCount; i++) {
      const x = Math.floor(Math.random() * GRID_WIDTH);
      const y = Math.floor(Math.random() * GRID_HEIGHT);
      
      // Don't place on player or zombies
      if (x === this.player.x && y === this.player.y) continue;
      
      let occupied = false;
      for (const zombie of this.zombies) {
        if (zombie.x === x && zombie.y === y) {
          occupied = true;
          break;
        }
      }
      if (occupied) continue;
      
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;
      
      const objectKey = objects[Math.floor(Math.random() * objects.length)];
      const obj = this.add.image(worldX, worldY, objectKey);
      obj.setScale(1.5);
      obj.setDepth(5);
      
      // Make some objects darker/damaged looking
      if (Math.random() < 0.3) {
        obj.setTint(0x888888);
      }
    }
  }

  createUI(): void {
    // Top UI bar
    const uiBg = this.add.rectangle(400, 30, 800, 60, 0x000000, 0.8);
    uiBg.setScrollFactor(0);
    uiBg.setDepth(100);
    
    // Day counter
    this.dayText = this.add.text(20, 10, `Day ${this.dayNumber}`, {
      fontSize: '20px',
      color: '#ff3333',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.dayText.setScrollFactor(0);
    this.dayText.setDepth(101);
    
    // Health display with hearts
    const heartContainer = this.add.container(20, 35);
    heartContainer.setScrollFactor(0);
    heartContainer.setDepth(101);
    
    for (let i = 0; i < 5; i++) {
      const heartIndex = i * 20;
      const heartValue = (i + 1) * 20;
      
      let heartType = 'heart-empty';
      if (this.playerHealth >= heartValue) {
        heartType = 'heart-full';
      } else if (this.playerHealth >= heartValue - 10) {
        heartType = 'heart-half';
      }
      
      const heart = this.add.image(heartIndex, 0, heartType);
      heart.setScale(1.5);
      heartContainer.add(heart);
    }
    
    // Status text
    this.statusText = this.add.text(200, 10, 
      `Ammo: ${this.playerAmmo} | Food: ${this.food} | Water: ${this.water}`, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(101);
    
    // Health text
    this.healthText = this.add.text(200, 30, 
      `Moves: ${this.movesRemaining}/${this.maxMovesPerDay} | Turn: ${this.isPlayerTurn ? 'PLAYER' : 'ZOMBIES'}`, {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
    this.healthText.setScrollFactor(0);
    this.healthText.setDepth(101);
    
    // Controls hint
    const controls = this.add.text(400, 560, 
      '[WASD/Arrows] Move | [Space] End Day | [E] Interact', {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'monospace',
      align: 'center'
    });
    controls.setOrigin(0.5);
    controls.setScrollFactor(0);
    controls.setDepth(101);
  }

  setupControls(): void {
    if (!this.input || !this.input.keyboard) {
      console.error('Input system not available!');
      return;
    }
    
    // Create cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Add WASD keys
    this.wasd = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      E: Phaser.Input.Keyboard.KeyCodes.E
    });
    
    // Space key for ending turn
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Movement handlers
    this.input.keyboard.on('keydown-W', () => { console.log('W pressed'); this.movePlayer(0, -1); });
    this.input.keyboard.on('keydown-UP', () => { console.log('UP pressed'); this.movePlayer(0, -1); });
    this.input.keyboard.on('keydown-S', () => { console.log('S pressed'); this.movePlayer(0, 1); });
    this.input.keyboard.on('keydown-DOWN', () => { console.log('DOWN pressed'); this.movePlayer(0, 1); });
    this.input.keyboard.on('keydown-A', () => { console.log('A pressed'); this.movePlayer(-1, 0); });
    this.input.keyboard.on('keydown-LEFT', () => { console.log('LEFT pressed'); this.movePlayer(-1, 0); });
    this.input.keyboard.on('keydown-D', () => { console.log('D pressed'); this.movePlayer(1, 0); });
    this.input.keyboard.on('keydown-RIGHT', () => { console.log('RIGHT pressed'); this.movePlayer(1, 0); });
    
    // End day
    this.input.keyboard.on('keydown-SPACE', () => { console.log('SPACE pressed'); this.endDay(); });
    
    // Interact
    this.input.keyboard.on('keydown-E', () => { console.log('E pressed'); this.interact(); });
    
    // Test any key press
    this.input.keyboard.on('keydown', (event: any) => {
      console.log('Key pressed:', event.key);
    });
    
    console.log('Controls set up successfully');
    console.log('Keyboard available:', !!this.input.keyboard);
  }

  movePlayer(dx: number, dy: number): void {
    console.log('movePlayer called with', dx, dy);
    console.log('isPlayerTurn:', this.isPlayerTurn, 'movesRemaining:', this.movesRemaining);
    
    if (!this.isPlayerTurn) {
      this.showMessage('Not your turn!');
      return;
    }
    
    if (this.movesRemaining <= 0) {
      this.showMessage('No moves left! Press SPACE to end day');
      return;
    }
    
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;
    
    // Check bounds
    if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) {
      return;
    }
    
    // Check for zombie collision
    for (const zombie of this.zombies) {
      if (zombie.x === newX && zombie.y === newY) {
        this.attackZombie(zombie);
        return;
      }
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
        this.movesRemaining--;
        this.updateUI();
        
        // Process zombie turn after each move
        this.processZombieTurn();
      }
    });
  }

  attackZombie(zombie: GridEntity): void {
    if (this.playerAmmo <= 0) {
      this.showMessage('No ammo!');
      return;
    }
    
    this.playerAmmo -= 5;
    this.movesRemaining--;
    
    // Visual feedback
    this.cameras.main.shake(100, 0.005);
    zombie.sprite.setTint(0xff0000);
    
    // Remove zombie
    this.time.delayedCall(200, () => {
      zombie.sprite.destroy();
      const index = this.zombies.indexOf(zombie);
      if (index > -1) {
        this.zombies.splice(index, 1);
      }
    });
    
    this.updateUI();
  }

  processZombieTurn(): void {
    this.isPlayerTurn = false;
    
    let zombieIndex = 0;
    
    const moveNextZombie = () => {
      if (zombieIndex >= this.zombies.length) {
        this.isPlayerTurn = true;
        this.updateUI();
        return;
      }
      
      const zombie = this.zombies[zombieIndex];
      const dx = Math.sign(this.player.x - zombie.x);
      const dy = Math.sign(this.player.y - zombie.y);
      
      // Simple AI: move towards player if within 5 tiles
      const distance = Math.abs(this.player.x - zombie.x) + Math.abs(this.player.y - zombie.y);
      
      if (distance <= 5 && distance >= 1) { // Changed to >= to allow attacks at distance 1
        // Choose to move horizontally or vertically
        let newX = zombie.x;
        let newY = zombie.y;
        
        if (Math.abs(dx) > Math.abs(dy) || (Math.abs(dx) === Math.abs(dy) && Math.random() < 0.5)) {
          newX += dx;
        } else {
          newY += dy;
        }
        
        // Check if another zombie is already there
        let blocked = false;
        for (const other of this.zombies) {
          if (other !== zombie && other.x === newX && other.y === newY) {
            blocked = true;
            break;
          }
        }
        
        if (!blocked) {
          zombie.x = newX;
          zombie.y = newY;
          
          const worldX = newX * TILE_SIZE + TILE_SIZE / 2;
          const worldY = newY * TILE_SIZE + TILE_SIZE / 2;
          
          this.tweens.add({
            targets: zombie.sprite,
            x: worldX,
            y: worldY,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
              // Check if zombie is adjacent to player for attack
              const attackDistance = Math.abs(zombie.x - this.player.x) + Math.abs(zombie.y - this.player.y);
              if (attackDistance === 1 || (zombie.x === this.player.x && zombie.y === this.player.y)) {
                console.log('Zombie attacking!');
                this.damagePlayer(10);
                // Attack animation
                zombie.sprite.setTint(0xff0000);
                this.time.delayedCall(200, () => {
                  if (zombie.sprite && zombie.sprite.active) {
                    zombie.sprite.setTint(0xaa8888);
                  }
                });
              }
              
              zombieIndex++;
              moveNextZombie();
            }
          });
        } else {
          zombieIndex++;
          moveNextZombie();
        }
      } else {
        zombieIndex++;
        moveNextZombie();
      }
    };
    
    // Start zombie movement chain
    this.time.delayedCall(100, moveNextZombie);
  }

  damagePlayer(amount: number): void {
    this.playerHealth -= amount;
    this.cameras.main.flash(200, 255, 0, 0, false);
    this.cameras.main.shake(100, 0.01);
    this.showMessage(`-${amount} Health!`);
    
    if (this.playerHealth <= 0) {
      this.gameOver();
    }
    
    this.updateUI();
  }
  
  createInventoryDisplay(): void {
    // Create inventory panel (hidden by default)
    const inventoryBg = this.add.rectangle(650, 300, 250, 400, 0x222222, 0.9);
    inventoryBg.setStrokeStyle(2, 0x666666);
    inventoryBg.setScrollFactor(0);
    inventoryBg.setDepth(150);
    inventoryBg.setVisible(false);
    inventoryBg.setData('isInventory', true);
    
    const inventoryTitle = this.add.text(650, 120, 'INVENTORY', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
    inventoryTitle.setOrigin(0.5);
    inventoryTitle.setScrollFactor(0);
    inventoryTitle.setDepth(151);
    inventoryTitle.setVisible(false);
    inventoryTitle.setData('isInventory', true);
    
    const inventoryText = this.add.text(550, 160, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      lineSpacing: 5
    });
    inventoryText.setScrollFactor(0);
    inventoryText.setDepth(151);
    inventoryText.setVisible(false);
    inventoryText.setData('isInventory', true);
    inventoryText.setData('inventoryText', true);
  }
  
  toggleInventory(): void {
    // Toggle inventory visibility
    const inventoryItems = this.children.getChildren().filter(
      child => child.getData('isInventory')
    );
    
    const firstItem = inventoryItems[0] as Phaser.GameObjects.GameObject & { visible?: boolean };
    const isVisible = inventoryItems.length > 0 && firstItem?.visible;
    
    inventoryItems.forEach(item => {
      const gameObj = item as any;
      if (gameObj.setVisible) {
        gameObj.setVisible(!isVisible);
      }
    });
    
    if (!isVisible) {
      // Update inventory text
      const inventoryText = this.children.getChildren().find(
        child => child.getData('inventoryText')
      ) as Phaser.GameObjects.Text;
      
      if (inventoryText) {
        if (this.inventory.length === 0) {
          inventoryText.setText('Empty');
        } else {
          const items = this.inventory.slice(-15); // Show last 15 items
          inventoryText.setText(items.join('\n'));
        }
      }
    }
  }

  interact(): void {
    // Simple interaction - find loot
    if (Math.random() < 0.3) {
      const loot = Math.floor(Math.random() * 3);
      if (loot === 0) {
        this.food += 5;
        this.showMessage('+5 Food');
      } else if (loot === 1) {
        this.water += 3;
        this.showMessage('+3 Water');
      } else {
        this.playerAmmo += 10;
        this.showMessage('+10 Ammo');
      }
      this.updateUI();
    } else {
      this.showMessage('Nothing found');
    }
  }

  endDay(): void {
    // Consume resources
    this.food -= 2;
    this.water -= 3;
    
    if (this.food < 0) this.food = 0;
    if (this.water < 0) this.water = 0;
    
    // Heal slightly
    if (this.medicine > 0 && this.playerHealth < 100) {
      this.playerHealth = Math.min(100, this.playerHealth + 20);
      this.medicine--;
    }
    
    // New day
    this.dayNumber++;
    this.movesRemaining = this.maxMovesPerDay;
    this.isPlayerTurn = true;
    
    // Spawn new zombie every few days
    if (this.dayNumber % 3 === 0) {
      this.spawnNewZombie();
    }
    
    this.updateUI();
    this.showMessage(`Day ${this.dayNumber} begins...`);
  }

  spawnNewZombie(): void {
    const x = Math.random() < 0.5 ? 0 : GRID_WIDTH - 1;
    const y = Math.floor(Math.random() * GRID_HEIGHT);
    
    const worldX = x * TILE_SIZE + TILE_SIZE / 2;
    const worldY = y * TILE_SIZE + TILE_SIZE / 2;
    
    const zombieSprite = this.add.sprite(worldX, worldY, 'zombie-small-idle', 0);
    zombieSprite.setScale(2);
    zombieSprite.setDepth(9);
    zombieSprite.setTint(0xaa8888);
    
    const zombie: GridEntity = {
      id: `zombie-new-${Date.now()}`,
      x,
      y,
      sprite: zombieSprite,
      type: 'zombie-small'
    };
    
    this.zombies.push(zombie);
    zombieSprite.play('zombie-small-idle-anim');
  }

  updateUI(): void {
    this.dayText.setText(`Day ${this.dayNumber}`);
    this.statusText.setText(`Ammo: ${this.playerAmmo} | Food: ${this.food} | Water: ${this.water}`);
    this.healthText.setText(`Moves: ${this.movesRemaining}/${this.maxMovesPerDay} | Turn: ${this.isPlayerTurn ? 'PLAYER' : 'ZOMBIES'}`);
    
    // Update hearts
    const heartContainer = this.children.getChildren().find(
      child => child instanceof Phaser.GameObjects.Container && child.y === 35
    ) as Phaser.GameObjects.Container;
    
    if (heartContainer) {
      heartContainer.removeAll(true);
      
      for (let i = 0; i < 5; i++) {
        const heartIndex = i * 20;
        const heartValue = (i + 1) * 20;
        
        let heartType = 'heart-empty';
        if (this.playerHealth >= heartValue) {
          heartType = 'heart-full';
        } else if (this.playerHealth >= heartValue - 10) {
          heartType = 'heart-half';
        }
        
        const heart = this.add.image(heartIndex, 0, heartType);
        heart.setScale(1.5);
        heartContainer.add(heart);
      }
    }
  }

  showMessage(text: string): void {
    const msg = this.add.text(400, 300, text, {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    msg.setOrigin(0.5);
    msg.setScrollFactor(0);
    msg.setDepth(200);
    
    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: 250,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => msg.destroy()
    });
  }

  gameOver(): void {
    this.scene.pause();
    
    const gameOverBg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    gameOverBg.setScrollFactor(0);
    gameOverBg.setDepth(300);
    
    const gameOverText = this.add.text(400, 300, 
      `GAME OVER\n\nSurvived ${this.dayNumber} days`, {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'monospace',
      align: 'center'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);
    gameOverText.setDepth(301);
  }
}

export default function WorkingDeadGrid() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
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
        scene: WorkingDeadGridScene,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      gameRef.current = new Phaser.Game(config);
      setIsLoading(false);
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
      <div 
        id="game-container" 
        className="border-2 border-red-900 rounded-lg shadow-2xl cursor-pointer"
        onClick={() => {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            canvas.focus();
            console.log('Canvas focused');
          }
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-red-600 text-3xl animate-pulse">Loading DeadGrid...</div>
        </div>
      )}
      <div className="mt-4 text-gray-400 text-sm text-center">
        <p className="font-bold text-yellow-400">⚠️ Click on the game to enable controls ⚠️</p>
        <p>WASD/Arrow Keys: Move | Space: End Day | E: Search for Loot</p>
      </div>
    </div>
  );
}