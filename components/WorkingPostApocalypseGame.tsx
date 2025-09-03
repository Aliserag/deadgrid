'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';

// Simple working game with Post-Apocalypse sprites
class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private zombies: Phaser.GameObjects.Sprite[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerPos = { x: 10, y: 10 };
  private tileSize = 32;
  private mapSize = 20;
  private isPlayerTurn = true;
  private playerHealth = 100;
  private turnText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Set base URL for assets
    this.load.setBaseURL('/assets/PostApocalypse_AssetPack_v1.1.2/');
    
    // Load player sprites
    this.load.spritesheet('player-idle', 'Character/Main/Idle/Character_down_idle-Sheet6.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    this.load.spritesheet('player-run', 'Character/Main/Run/Character_down_run-Sheet6.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Load zombie sprites
    this.load.spritesheet('zombie-small', 'Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    this.load.spritesheet('zombie-big', 'Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    this.load.spritesheet('zombie-axe', 'Enemies/Zombie_Axe/Zombie_Axe_Down_Idle-Sheet6.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Load UI elements
    this.load.image('heart-full', 'UI/HP/Heart_Full.png');
    this.load.image('heart-half', 'UI/HP/Heart_Half.png');
    this.load.image('heart-empty', 'UI/HP/Heart_Empty.png');
    
    // Load item icons
    this.load.image('icon-ammo', 'UI/Inventory/Objects/Icon_Bullet-box_Blue.png');
    this.load.image('icon-medkit', 'UI/Inventory/Objects/Icon_First-Aid-Kit_Red.png');
    this.load.image('icon-food', 'UI/Inventory/Objects/Icon_Canned-soup.png');
    
    // Load tiles
    this.load.image('tile-grass', 'Tiles/Grass/Grass1.png');
    this.load.image('tile-road', 'Tiles/Road/Road_Horizontal.png');
  }

  create() {
    // Create dark background
    this.cameras.main.setBackgroundColor('#1a1a1a');
    
    // Create simple grid
    this.createGrid();
    
    // Create animations
    this.createAnimations();
    
    // Create player sprite
    this.player = this.add.sprite(
      this.playerPos.x * this.tileSize + 16,
      this.playerPos.y * this.tileSize + 16,
      'player-idle'
    );
    this.player.setScale(2);
    this.player.play('player-idle-anim');
    
    // Create zombies
    this.createZombies();
    
    // Create UI
    this.createUI();
    
    // Setup keyboard controls
    this.setupControls();
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    for (let x = 0; x <= this.mapSize; x++) {
      graphics.moveTo(x * this.tileSize, 0);
      graphics.lineTo(x * this.tileSize, this.mapSize * this.tileSize);
    }
    
    for (let y = 0; y <= this.mapSize; y++) {
      graphics.moveTo(0, y * this.tileSize);
      graphics.lineTo(this.mapSize * this.tileSize, y * this.tileSize);
    }
    
    graphics.strokePath();
  }

  createAnimations() {
    // Player idle animation
    if (!this.anims.exists('player-idle-anim')) {
      this.anims.create({
        key: 'player-idle-anim',
        frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Zombie animations
    if (!this.anims.exists('zombie-small-anim')) {
      this.anims.create({
        key: 'zombie-small-anim',
        frames: this.anims.generateFrameNumbers('zombie-small', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
    }
    
    if (!this.anims.exists('zombie-big-anim')) {
      this.anims.create({
        key: 'zombie-big-anim',
        frames: this.anims.generateFrameNumbers('zombie-big', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
    }
    
    if (!this.anims.exists('zombie-axe-anim')) {
      this.anims.create({
        key: 'zombie-axe-anim',
        frames: this.anims.generateFrameNumbers('zombie-axe', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
      });
    }
  }

  createZombies() {
    // Create different types of zombies
    const zombieTypes = [
      { sprite: 'zombie-small', anim: 'zombie-small-anim', count: 3 },
      { sprite: 'zombie-big', anim: 'zombie-big-anim', count: 2 },
      { sprite: 'zombie-axe', anim: 'zombie-axe-anim', count: 1 }
    ];
    
    zombieTypes.forEach(type => {
      for (let i = 0; i < type.count; i++) {
        const x = 5 + Math.floor(Math.random() * 10);
        const y = 5 + Math.floor(Math.random() * 10);
        
        const zombie = this.add.sprite(
          x * this.tileSize + 16,
          y * this.tileSize + 16,
          type.sprite
        );
        zombie.setScale(2);
        zombie.play(type.anim);
        zombie.setData('gridX', x);
        zombie.setData('gridY', y);
        zombie.setData('health', 30);
        zombie.setData('type', type.sprite);
        
        this.zombies.push(zombie);
      }
    });
  }

  createUI() {
    // Background for UI
    const uiBg = this.add.rectangle(640, 40, 1280, 80, 0x000000, 0.8);
    uiBg.setStrokeStyle(2, 0x444444);
    
    // Turn text
    this.turnText = this.add.text(10, 10, 'YOUR TURN', {
      fontSize: '20px',
      color: '#4CAF50',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    
    // Health text
    this.healthText = this.add.text(10, 40, `Health: ${this.playerHealth}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    
    // Health hearts
    for (let i = 0; i < 5; i++) {
      const heart = this.add.image(200 + i * 30, 30, 'heart-full');
      heart.setScale(2);
    }
    
    // Instructions
    this.add.text(640, 680, 'Use ARROW KEYS to move | SPACE to attack | ENTER to end turn', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Add keyboard event listener
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (!this.isPlayerTurn) return;
      
      let newX = this.playerPos.x;
      let newY = this.playerPos.y;
      let moved = false;
      
      switch(event.key) {
        case 'ArrowLeft':
          newX--;
          moved = true;
          this.player.setFlipX(true);
          break;
        case 'ArrowRight':
          newX++;
          moved = true;
          this.player.setFlipX(false);
          break;
        case 'ArrowUp':
          newY--;
          moved = true;
          break;
        case 'ArrowDown':
          newY++;
          moved = true;
          break;
        case ' ':
          this.attackNearbyZombie();
          return;
        case 'Enter':
          this.endPlayerTurn();
          return;
      }
      
      if (moved) {
        // Check bounds
        if (newX >= 0 && newX < this.mapSize && newY >= 0 && newY < this.mapSize) {
          // Check for zombie collision
          const zombieAtPosition = this.zombies.find(z => {
            return z.getData('gridX') === newX && 
                   z.getData('gridY') === newY && 
                   z.active;
          });
          
          if (!zombieAtPosition) {
            // Move player
            this.playerPos.x = newX;
            this.playerPos.y = newY;
            
            this.tweens.add({
              targets: this.player,
              x: newX * this.tileSize + 16,
              y: newY * this.tileSize + 16,
              duration: 200,
              onComplete: () => {
                this.endPlayerTurn();
              }
            });
          } else {
            // Can't move there - zombie blocking
            this.showMessage('Zombie blocking!', this.player.x, this.player.y - 40, '#ff0000');
          }
        }
      }
    });
  }

  attackNearbyZombie() {
    // Find adjacent zombies
    const adjacentZombies = this.zombies.filter(z => {
      if (!z.active) return false;
      
      const zx = z.getData('gridX');
      const zy = z.getData('gridY');
      const distance = Math.abs(this.playerPos.x - zx) + Math.abs(this.playerPos.y - zy);
      
      return distance === 1;
    });
    
    if (adjacentZombies.length > 0) {
      const target = adjacentZombies[0];
      const damage = 15 + Math.floor(Math.random() * 10);
      
      // Deal damage
      const currentHealth = target.getData('health') - damage;
      target.setData('health', currentHealth);
      
      // Show damage
      this.showDamage(target, damage);
      
      // Flash red
      target.setTint(0xff0000);
      this.time.delayedCall(100, () => {
        target.clearTint();
      });
      
      if (currentHealth <= 0) {
        // Kill zombie
        this.tweens.add({
          targets: target,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: 300,
          onComplete: () => {
            target.setActive(false);
            target.setVisible(false);
          }
        });
      }
      
      this.endPlayerTurn();
    } else {
      this.showMessage('No zombies in range!', this.player.x, this.player.y - 40, '#ffcc00');
    }
  }

  showMessage(text: string, x: number, y: number, color: string) {
    const message = this.add.text(x, y, text, {
      fontSize: '14px',
      color: color,
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: message,
      alpha: 0,
      y: y - 20,
      duration: 1000,
      onComplete: () => message.destroy()
    });
  }

  showDamage(target: Phaser.GameObjects.Sprite, damage: number) {
    const damageText = this.add.text(target.x, target.y - 20, `-${damage}`, {
      fontSize: '16px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    
    this.tweens.add({
      targets: damageText,
      y: target.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy()
    });
  }

  endPlayerTurn() {
    this.isPlayerTurn = false;
    this.turnText.setText('ZOMBIES TURN');
    this.turnText.setColor('#ff0000');
    
    // Process zombie turns
    this.time.delayedCall(500, () => {
      this.processZombieTurns();
    });
  }

  processZombieTurns() {
    let zombieIndex = 0;
    
    const moveNextZombie = () => {
      if (zombieIndex >= this.zombies.length) {
        // All zombies done, back to player
        this.isPlayerTurn = true;
        this.turnText.setText('YOUR TURN');
        this.turnText.setColor('#4CAF50');
        return;
      }
      
      const zombie = this.zombies[zombieIndex];
      zombieIndex++;
      
      if (!zombie.active) {
        moveNextZombie();
        return;
      }
      
      const zx = zombie.getData('gridX');
      const zy = zombie.getData('gridY');
      const distance = Math.abs(this.playerPos.x - zx) + Math.abs(this.playerPos.y - zy);
      
      // Only move if close to player
      if (distance <= 5 && distance > 1) {
        // Move towards player
        let newX = zx;
        let newY = zy;
        
        if (zx < this.playerPos.x) newX++;
        else if (zx > this.playerPos.x) newX--;
        
        if (zy < this.playerPos.y) newY++;
        else if (zy > this.playerPos.y) newY--;
        
        // Check if another zombie is there
        const blocked = this.zombies.some(z => 
          z !== zombie && z.active && 
          z.getData('gridX') === newX && 
          z.getData('gridY') === newY
        );
        
        if (!blocked) {
          zombie.setData('gridX', newX);
          zombie.setData('gridY', newY);
          
          this.tweens.add({
            targets: zombie,
            x: newX * this.tileSize + 16,
            y: newY * this.tileSize + 16,
            duration: 200,
            onComplete: moveNextZombie
          });
        } else {
          moveNextZombie();
        }
      } else if (distance === 1) {
        // Attack player
        const damage = 10;
        this.playerHealth -= damage;
        this.healthText.setText(`Health: ${this.playerHealth}`);
        
        this.showDamage(this.player, damage);
        
        // Flash screen
        this.cameras.main.flash(200, 255, 0, 0, false);
        
        if (this.playerHealth <= 0) {
          this.gameOver();
        }
        
        this.time.delayedCall(300, moveNextZombie);
      } else {
        moveNextZombie();
      }
    };
    
    moveNextZombie();
  }

  gameOver() {
    this.isPlayerTurn = false;
    
    const gameOverBg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.9);
    
    this.add.text(640, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(640, 400, 'Refresh to restart', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }
}

export default function WorkingPostApocalypseGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 1280,
        height: 720,
        backgroundColor: '#0a0a0a',
        scene: GameScene,
        pixelArt: true,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        }
      };
      
      gameRef.current = new Phaser.Game(config);
    }
    
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="mb-4 text-center">
        <h1 className="text-6xl font-bold text-red-700 mb-2">DEADGRID</h1>
        <p className="text-gray-500">Post-Apocalypse Survival</p>
      </div>
      <div ref={containerRef} className="border-4 border-gray-800" />
    </div>
  );
}