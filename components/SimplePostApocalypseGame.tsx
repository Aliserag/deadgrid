'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

class SimpleGameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private zombies: any[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerGridX = 5;
  private playerGridY = 5;
  private tileSize = 48;
  private gridWidth = 15;
  private gridHeight = 12;
  private isPlayerTurn = true;
  private playerHealth = 100;
  private keys: any;

  constructor() {
    super({ key: 'SimpleGameScene' });
  }

  preload() {
    console.log('Starting preload...');
    
    // Load character sprites with absolute paths
    this.load.spritesheet('player-idle', '/assets/PostApocalypse_AssetPack_v1.1.2/Character/Main/Idle/Character_down_idle-Sheet6.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Load zombie sprites
    this.load.spritesheet('zombie-small', '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    this.load.spritesheet('zombie-big', '/assets/PostApocalypse_AssetPack_v1.1.2/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Load UI
    this.load.image('heart-full', '/assets/PostApocalypse_AssetPack_v1.1.2/UI/HP/Heart_Full.png');
    this.load.image('heart-empty', '/assets/PostApocalypse_AssetPack_v1.1.2/UI/HP/Heart_Empty.png');
    
    // Error handling
    this.load.on('loaderror', (file: any) => {
      console.error('Failed to load:', file.key, file.src);
    });
    
    this.load.on('complete', () => {
      console.log('All assets loaded successfully');
    });
  }

  create() {
    console.log('Creating game scene...');
    
    // Set background color
    this.cameras.main.setBackgroundColor('#1a1a1a');
    
    // Draw simple grid
    this.drawGrid();
    
    // Create animations
    this.createAnimations();
    
    // Create player
    this.createPlayer();
    
    // Create zombies
    this.createZombies();
    
    // Create simple UI
    this.createUI();
    
    // Setup keyboard input
    this.setupInput();
    
    console.log('Game scene created');
  }

  drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x444444, 0.5);
    
    // Draw grid lines
    for (let x = 0; x <= this.gridWidth; x++) {
      graphics.moveTo(x * this.tileSize, 0);
      graphics.lineTo(x * this.tileSize, this.gridHeight * this.tileSize);
    }
    
    for (let y = 0; y <= this.gridHeight; y++) {
      graphics.moveTo(0, y * this.tileSize);
      graphics.lineTo(this.gridWidth * this.tileSize, y * this.tileSize);
    }
    
    graphics.strokePath();
    
    // Add some dark tiles for variation
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        if (Math.random() < 0.1) {
          const tile = this.add.rectangle(
            x * this.tileSize + this.tileSize/2,
            y * this.tileSize + this.tileSize/2,
            this.tileSize - 2,
            this.tileSize - 2,
            0x0a0a0a,
            0.5
          );
        }
      }
    }
  }

  createAnimations() {
    // Player idle animation
    this.anims.create({
      key: 'player-idle-anim',
      frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1
    });
    
    // Zombie animations
    this.anims.create({
      key: 'zombie-small-anim',
      frames: this.anims.generateFrameNumbers('zombie-small', { start: 0, end: 5 }),
      frameRate: 4,
      repeat: -1
    });
    
    this.anims.create({
      key: 'zombie-big-anim',
      frames: this.anims.generateFrameNumbers('zombie-big', { start: 0, end: 5 }),
      frameRate: 4,
      repeat: -1
    });
  }

  createPlayer() {
    const x = this.playerGridX * this.tileSize + this.tileSize/2;
    const y = this.playerGridY * this.tileSize + this.tileSize/2;
    
    this.player = this.add.sprite(x, y, 'player-idle');
    this.player.setScale(2.5);
    this.player.play('player-idle-anim');
    
    // Add a green outline to show it's the player
    const outline = this.add.rectangle(x, y, this.tileSize, this.tileSize);
    outline.setStrokeStyle(2, 0x00ff00, 0.5);
  }

  createZombies() {
    // Create small zombies
    for (let i = 0; i < 3; i++) {
      this.createZombie('small', 
        8 + Math.floor(Math.random() * 5),
        2 + Math.floor(Math.random() * 8)
      );
    }
    
    // Create big zombie
    this.createZombie('big', 10, 8);
  }

  createZombie(type: string, gridX: number, gridY: number) {
    const x = gridX * this.tileSize + this.tileSize/2;
    const y = gridY * this.tileSize + this.tileSize/2;
    
    const zombie = this.add.sprite(x, y, `zombie-${type}`);
    zombie.setScale(2.5);
    zombie.play(`zombie-${type}-anim`);
    
    this.zombies.push({
      sprite: zombie,
      gridX: gridX,
      gridY: gridY,
      type: type,
      health: type === 'big' ? 50 : 30
    });
  }

  createUI() {
    // UI Background
    const uiBg = this.add.rectangle(640, 650, 1280, 100, 0x000000, 0.8);
    uiBg.setStrokeStyle(2, 0x444444);
    
    // Health display
    this.add.text(20, 620, 'HEALTH:', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    
    // Health hearts
    for (let i = 0; i < 5; i++) {
      const heart = this.add.image(120 + i * 35, 635, 'heart-full');
      heart.setScale(2.5);
    }
    
    // Turn indicator
    const turnText = this.add.text(20, 650, 'YOUR TURN', {
      fontSize: '18px',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    
    // Controls
    this.add.text(640, 635, 'ARROW KEYS: Move', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.add.text(640, 655, 'SPACE: Attack | ENTER: End Turn', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  setupInput() {
    // Create cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Additional keys
    this.keys = this.input.keyboard!.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER
    });
    
    // Arrow key movement
    this.input.keyboard!.on('keydown-LEFT', () => this.tryMove(-1, 0));
    this.input.keyboard!.on('keydown-RIGHT', () => this.tryMove(1, 0));
    this.input.keyboard!.on('keydown-UP', () => this.tryMove(0, -1));
    this.input.keyboard!.on('keydown-DOWN', () => this.tryMove(0, 1));
    
    // Space for attack
    this.input.keyboard!.on('keydown-SPACE', () => this.tryAttack());
    
    // Enter to end turn
    this.input.keyboard!.on('keydown-ENTER', () => this.endTurn());
  }

  tryMove(dx: number, dy: number) {
    if (!this.isPlayerTurn) {
      console.log('Not player turn');
      return;
    }
    
    const newX = this.playerGridX + dx;
    const newY = this.playerGridY + dy;
    
    // Check bounds
    if (newX < 0 || newX >= this.gridWidth || newY < 0 || newY >= this.gridHeight) {
      console.log('Out of bounds');
      return;
    }
    
    // Check for zombie collision
    const zombieAt = this.zombies.find(z => 
      z.gridX === newX && z.gridY === newY && z.sprite.active
    );
    
    if (zombieAt) {
      console.log('Zombie blocking');
      this.showMessage('Zombie blocking!', this.player.x, this.player.y - 40);
      return;
    }
    
    // Move player
    this.playerGridX = newX;
    this.playerGridY = newY;
    
    const targetX = newX * this.tileSize + this.tileSize/2;
    const targetY = newY * this.tileSize + this.tileSize/2;
    
    // Flip sprite based on direction
    if (dx < 0) this.player.setFlipX(true);
    if (dx > 0) this.player.setFlipX(false);
    
    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: 200,
      onComplete: () => {
        this.endTurn();
      }
    });
  }

  tryAttack() {
    if (!this.isPlayerTurn) return;
    
    // Find adjacent zombies
    const adjacent = this.zombies.filter(z => {
      if (!z.sprite.active) return false;
      const dist = Math.abs(z.gridX - this.playerGridX) + Math.abs(z.gridY - this.playerGridY);
      return dist === 1;
    });
    
    if (adjacent.length === 0) {
      this.showMessage('No targets!', this.player.x, this.player.y - 40);
      return;
    }
    
    // Attack first adjacent zombie
    const target = adjacent[0];
    const damage = 20;
    target.health -= damage;
    
    // Show damage
    this.showDamage(target.sprite, damage);
    
    // Flash red
    target.sprite.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      target.sprite.clearTint();
    });
    
    // Kill if dead
    if (target.health <= 0) {
      this.tweens.add({
        targets: target.sprite,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 300,
        onComplete: () => {
          target.sprite.destroy();
        }
      });
    }
    
    this.endTurn();
  }

  endTurn() {
    this.isPlayerTurn = false;
    
    // Process zombie turns after a delay
    this.time.delayedCall(500, () => {
      this.processZombieTurns();
    });
  }

  processZombieTurns() {
    let index = 0;
    
    const moveNextZombie = () => {
      if (index >= this.zombies.length) {
        // All zombies done
        this.isPlayerTurn = true;
        return;
      }
      
      const zombie = this.zombies[index];
      index++;
      
      if (!zombie.sprite.active) {
        moveNextZombie();
        return;
      }
      
      // Calculate distance to player
      const dist = Math.abs(zombie.gridX - this.playerGridX) + 
                  Math.abs(zombie.gridY - this.playerGridY);
      
      if (dist === 1) {
        // Attack player
        this.attackPlayer(zombie);
        this.time.delayedCall(300, moveNextZombie);
      } else if (dist <= 5) {
        // Move towards player
        this.moveZombieTowardsPlayer(zombie);
        this.time.delayedCall(200, moveNextZombie);
      } else {
        moveNextZombie();
      }
    };
    
    moveNextZombie();
  }

  moveZombieTowardsPlayer(zombie: any) {
    let dx = 0, dy = 0;
    
    if (zombie.gridX < this.playerGridX) dx = 1;
    else if (zombie.gridX > this.playerGridX) dx = -1;
    
    if (zombie.gridY < this.playerGridY) dy = 1;
    else if (zombie.gridY > this.playerGridY) dy = -1;
    
    // Try to move
    const newX = zombie.gridX + dx;
    const newY = zombie.gridY + dy;
    
    // Check for other zombies
    const blocked = this.zombies.some(z => 
      z !== zombie && z.sprite.active && z.gridX === newX && z.gridY === newY
    );
    
    if (!blocked) {
      zombie.gridX = newX;
      zombie.gridY = newY;
      
      this.tweens.add({
        targets: zombie.sprite,
        x: newX * this.tileSize + this.tileSize/2,
        y: newY * this.tileSize + this.tileSize/2,
        duration: 200
      });
    }
  }

  attackPlayer(zombie: any) {
    const damage = zombie.type === 'big' ? 20 : 10;
    this.playerHealth -= damage;
    
    this.showDamage(this.player, damage);
    this.cameras.main.shake(100, 0.01);
    this.cameras.main.flash(100, 255, 0, 0, false);
    
    if (this.playerHealth <= 0) {
      this.gameOver();
    }
  }

  showMessage(text: string, x: number, y: number) {
    const msg = this.add.text(x, y, text, {
      fontSize: '14px',
      color: '#ffff00',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: msg,
      y: y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => msg.destroy()
    });
  }

  showDamage(target: any, damage: number) {
    const text = this.add.text(target.x, target.y - 30, `-${damage}`, {
      fontSize: '20px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: text,
      y: target.y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }

  gameOver() {
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.9);
    this.add.text(640, 300, 'GAME OVER', {
      fontSize: '72px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
}

export default function SimplePostApocalypseGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 1280,
        height: 720,
        scene: SimpleGameScene,
        pixelArt: true,
        render: {
          pixelArt: true,
          antialias: false
        }
      };
      
      gameRef.current = new Phaser.Game(config);
      console.log('Phaser game created');
    }
    
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-red-600 mb-4">DEADGRID</h1>
      <div ref={containerRef} className="border-2 border-red-900" />
      <p className="text-gray-400 mt-2">Use Arrow Keys to Move | Space to Attack | Enter to End Turn</p>
    </div>
  );
}