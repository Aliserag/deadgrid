'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { PostApocalypseLoader } from '@/lib/assets/postApocalypseSprites';

// Game types
type ZombieType = 'small' | 'big' | 'axe';

interface Entity {
  sprite: Phaser.GameObjects.Sprite;
  gridX: number;
  gridY: number;
  health: number;
  maxHealth: number;
}

interface Zombie extends Entity {
  type: ZombieType;
  detected: boolean;
}

interface LootItem {
  sprite: Phaser.GameObjects.Image;
  type: string;
  gridX: number;
  gridY: number;
}

// Main game scene with Post-Apocalypse sprites
class PostApocalypseScene extends Phaser.Scene {
  private spriteLoader!: PostApocalypseLoader;
  private player!: Phaser.GameObjects.Sprite;
  private zombies: Zombie[] = [];
  private loot: LootItem[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  
  // UI elements
  private healthHearts: Phaser.GameObjects.Image[] = [];
  private ammoText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  
  // Game state
  private isPlayerTurn = true;
  private playerHealth = 100;
  private playerMaxHealth = 100;
  private playerAmmo = 20;
  private playerInventory: string[] = [];
  private tileSize = 32;
  private mapSize = 20;
  private playerPos = { x: 10, y: 10 };
  private day = 1;
  private turnCount = 0;

  constructor() {
    super({ key: 'PostApocalypseScene' });
  }

  preload() {
    this.spriteLoader = new PostApocalypseLoader(this);
    this.spriteLoader.preloadAll();
  }

  create() {
    // Create tiled background
    this.createTiledBackground();
    
    // Create animations
    this.spriteLoader.createAnimations();
    
    // Create player
    this.createPlayer();
    
    // Create UI
    this.createUI();
    
    // Spawn initial entities
    this.spawnZombies();
    this.spawnLoot();
    
    // Setup controls
    this.setupControls();
  }

  createTiledBackground() {
    // Create a varied tile background
    const tileTypes = ['tile-grass', 'tile-dirt', 'tile-road'];
    
    for (let x = 0; x < this.mapSize; x++) {
      for (let y = 0; y < this.mapSize; y++) {
        // Create base tile
        let tileKey = 'tile-grass';
        
        // Add some roads
        if (x === 5 || x === 15) {
          tileKey = 'tile-road';
        } else if (y === 8 || y === 12) {
          tileKey = 'tile-road';
        } else if (Math.random() < 0.1) {
          tileKey = 'tile-dirt';
        }
        
        const tile = this.add.image(
          x * this.tileSize + 16,
          y * this.tileSize + 16,
          tileKey
        );
        tile.setScale(2);
        tile.setAlpha(0.8);
      }
    }
    
    // Add some random debris
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * this.mapSize);
      const y = Math.floor(Math.random() * this.mapSize);
      
      const debris = this.add.image(
        x * this.tileSize + 16,
        y * this.tileSize + 16,
        Math.random() < 0.5 ? 'obj-barrel' : 'obj-crate'
      );
      debris.setScale(0.5);
      debris.setAlpha(0.6);
    }
  }

  createPlayer() {
    this.player = this.add.sprite(
      this.playerPos.x * this.tileSize + 16,
      this.playerPos.y * this.tileSize + 16,
      'player-idle-down'
    );
    
    this.player.play('player-idle');
    this.player.setScale(1.5);
  }

  createUI() {
    // Dark UI background
    const uiBg = this.add.rectangle(640, 40, 1280, 80, 0x000000, 0.8);
    uiBg.setStrokeStyle(2, 0x444444);
    
    // Day counter
    this.dayText = this.add.text(10, 10, `DAY ${this.day}`, {
      fontSize: '24px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    
    // Turn indicator
    this.turnText = this.add.text(10, 40, 'YOUR TURN', {
      fontSize: '18px',
      color: '#4CAF50',
      fontFamily: 'monospace'
    });
    
    // Health display with hearts
    this.createHealthDisplay();
    
    // Ammo counter
    const ammoIcon = this.add.image(400, 30, 'icon-ammo-blue');
    ammoIcon.setScale(1.5);
    
    this.ammoText = this.add.text(430, 20, `${this.playerAmmo}`, {
      fontSize: '20px',
      color: '#ffcc00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    
    // Controls
    this.add.text(640, 680, '[↑↓←→] Move  [SPACE] Attack  [E] Pickup  [Enter] End Turn', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  createHealthDisplay() {
    // Display health as hearts
    const maxHearts = 5;
    const healthPerHeart = this.playerMaxHealth / maxHearts;
    
    for (let i = 0; i < maxHearts; i++) {
      const heart = this.add.image(200 + i * 35, 30, 'heart-full');
      heart.setScale(2);
      this.healthHearts.push(heart);
    }
    
    this.updateHealthDisplay();
  }

  updateHealthDisplay() {
    const maxHearts = this.healthHearts.length;
    const healthPerHeart = this.playerMaxHealth / maxHearts;
    
    this.healthHearts.forEach((heart, index) => {
      const heartHealth = (index + 1) * healthPerHeart;
      
      if (this.playerHealth >= heartHealth) {
        heart.setTexture('heart-full');
      } else if (this.playerHealth >= heartHealth - healthPerHeart / 2) {
        heart.setTexture('heart-half');
      } else {
        heart.setTexture('heart-empty');
      }
    });
  }

  spawnZombies() {
    // Spawn different types of zombies
    this.spawnZombieType('small', 3);
    this.spawnZombieType('big', 2);
    this.spawnZombieType('axe', 1);
  }

  spawnZombieType(type: ZombieType, count: number) {
    const spriteKeys = {
      small: 'zombie-small-idle',
      big: 'zombie-big-idle',
      axe: 'zombie-axe-idle'
    };
    
    const animKeys = {
      small: { idle: 'zombie-small-idle', walk: 'zombie-small-walk' },
      big: { idle: 'zombie-big-idle', walk: 'zombie-big-walk' },
      axe: { idle: 'zombie-axe-idle', walk: 'zombie-axe-walk' }
    };
    
    const healthValues = {
      small: 30,
      big: 50,
      axe: 40
    };
    
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * this.mapSize);
        y = Math.floor(Math.random() * this.mapSize);
      } while (
        Math.abs(x - this.playerPos.x) + Math.abs(y - this.playerPos.y) < 5
      );
      
      const sprite = this.add.sprite(
        x * this.tileSize + 16,
        y * this.tileSize + 16,
        spriteKeys[type]
      );
      
      sprite.play(animKeys[type].idle);
      sprite.setScale(1.5);
      sprite.setInteractive();
      
      const zombie: Zombie = {
        sprite,
        type,
        gridX: x,
        gridY: y,
        health: healthValues[type],
        maxHealth: healthValues[type],
        detected: false
      };
      
      this.zombies.push(zombie);
    }
  }

  spawnLoot() {
    const lootTypes = [
      { name: 'Ammo', icon: 'icon-ammo-blue' },
      { name: 'Medkit', icon: 'icon-medkit' },
      { name: 'Food', icon: 'icon-food' },
      { name: 'Bandage', icon: 'icon-bandage' }
    ];
    
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(Math.random() * this.mapSize);
      const y = Math.floor(Math.random() * this.mapSize);
      const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
      
      const sprite = this.add.image(
        x * this.tileSize + 16,
        y * this.tileSize + 16,
        lootType.icon
      );
      sprite.setScale(1.2);
      
      // Add glow effect
      this.tweens.add({
        targets: sprite,
        scaleX: 1.4,
        scaleY: 1.4,
        alpha: 0.7,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
      
      const loot: LootItem = {
        sprite,
        type: lootType.name,
        gridX: x,
        gridY: y
      };
      
      this.loot.push(loot);
    }
  }

  setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (!this.isPlayerTurn) return;
      
      let moved = false;
      let newX = this.playerPos.x;
      let newY = this.playerPos.y;
      
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
          this.handleAttack();
          return;
        case 'e':
        case 'E':
          this.pickupLoot();
          return;
        case 'Enter':
          this.endPlayerTurn();
          return;
      }
      
      if (moved && this.canMoveTo(newX, newY)) {
        this.movePlayer(newX, newY);
      }
    });
  }

  canMoveTo(x: number, y: number): boolean {
    if (x < 0 || x >= this.mapSize || y < 0 || y >= this.mapSize) {
      return false;
    }
    
    // Check for zombie collision
    const zombie = this.zombies.find(z => 
      z.gridX === x && z.gridY === y && z.sprite.active
    );
    
    return !zombie;
  }

  movePlayer(x: number, y: number) {
    this.playerPos.x = x;
    this.playerPos.y = y;
    
    this.tweens.add({
      targets: this.player,
      x: x * this.tileSize + 16,
      y: y * this.tileSize + 16,
      duration: 200,
      onComplete: () => {
        this.checkForLoot();
        this.endPlayerTurn();
      }
    });
  }

  handleAttack() {
    // Find adjacent zombies
    const adjacentZombies = this.zombies.filter(z => {
      const distance = Math.abs(this.playerPos.x - z.gridX) + 
                      Math.abs(this.playerPos.y - z.gridY);
      return z.sprite.active && distance === 1;
    });
    
    if (adjacentZombies.length > 0) {
      const target = adjacentZombies[0];
      const damage = Math.floor(Math.random() * 15) + 10;
      
      target.health -= damage;
      
      // Show damage
      this.showDamage(target.sprite, damage);
      
      // Flash red
      this.tweens.add({
        targets: target.sprite,
        tint: 0xff0000,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          target.sprite.clearTint();
        }
      });
      
      if (target.health <= 0) {
        this.killZombie(target);
      }
      
      this.endPlayerTurn();
    }
  }

  pickupLoot() {
    const lootAtPosition = this.loot.find(l => 
      l.gridX === this.playerPos.x && l.gridY === this.playerPos.y
    );
    
    if (lootAtPosition) {
      // Apply loot effects
      switch(lootAtPosition.type) {
        case 'Ammo':
          this.playerAmmo += 10;
          this.ammoText.setText(`${this.playerAmmo}`);
          break;
        case 'Medkit':
          this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 50);
          this.updateHealthDisplay();
          break;
        case 'Food':
          this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 20);
          this.updateHealthDisplay();
          break;
        case 'Bandage':
          this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 10);
          this.updateHealthDisplay();
          break;
      }
      
      this.playerInventory.push(lootAtPosition.type);
      
      // Show pickup message
      this.showMessage(`+${lootAtPosition.type}`, this.player.x, this.player.y - 30, '#00ff00');
      
      // Remove loot
      lootAtPosition.sprite.destroy();
      this.loot = this.loot.filter(l => l !== lootAtPosition);
    }
  }

  checkForLoot() {
    const lootAtPosition = this.loot.find(l => 
      l.gridX === this.playerPos.x && l.gridY === this.playerPos.y
    );
    
    if (lootAtPosition) {
      this.showMessage('Press E to pickup', this.player.x, this.player.y + 30, '#ffff00');
    }
  }

  killZombie(zombie: Zombie) {
    // Death effect
    this.tweens.add({
      targets: zombie.sprite,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      angle: 90,
      duration: 300,
      onComplete: () => {
        zombie.sprite.setActive(false);
        zombie.sprite.setVisible(false);
      }
    });
    
    // Drop loot chance
    if (Math.random() < 0.5) {
      const lootTypes = [
        { name: 'Ammo', icon: 'icon-ammo-green' },
        { name: 'Bandage', icon: 'icon-bandage' }
      ];
      
      const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
      
      const sprite = this.add.image(
        zombie.gridX * this.tileSize + 16,
        zombie.gridY * this.tileSize + 16,
        lootType.icon
      );
      sprite.setScale(1.2);
      
      this.tweens.add({
        targets: sprite,
        scaleX: 1.4,
        scaleY: 1.4,
        alpha: 0.7,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
      
      this.loot.push({
        sprite,
        type: lootType.name,
        gridX: zombie.gridX,
        gridY: zombie.gridY
      });
    }
  }

  showDamage(target: Phaser.GameObjects.Sprite, damage: number) {
    const damageText = this.add.text(target.x, target.y - 20, `-${damage}`, {
      fontSize: '18px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    
    this.tweens.add({
      targets: damageText,
      y: target.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy()
    });
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
      duration: 1500,
      onComplete: () => message.destroy()
    });
  }

  endPlayerTurn() {
    this.isPlayerTurn = false;
    this.turnCount++;
    
    // Check for new day
    if (this.turnCount % 15 === 0) {
      this.day++;
      this.dayText.setText(`DAY ${this.day}`);
      this.spawnZombies();
    }
    
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
        // All zombies moved, back to player
        this.isPlayerTurn = true;
        this.turnText.setText('YOUR TURN');
        this.turnText.setColor('#4CAF50');
        return;
      }
      
      const zombie = this.zombies[zombieIndex];
      zombieIndex++;
      
      if (!zombie.sprite.active) {
        moveNextZombie();
        return;
      }
      
      // Update zombie detection
      const distance = Math.abs(this.playerPos.x - zombie.gridX) + 
                      Math.abs(this.playerPos.y - zombie.gridY);
      
      if (distance <= 5) {
        zombie.detected = true;
      }
      
      if (zombie.detected) {
        // Move towards player
        let newX = zombie.gridX;
        let newY = zombie.gridY;
        
        if (zombie.gridX < this.playerPos.x) newX++;
        else if (zombie.gridX > this.playerPos.x) newX--;
        
        if (zombie.gridY < this.playerPos.y) newY++;
        else if (zombie.gridY > this.playerPos.y) newY--;
        
        // Check if attacking player
        if (newX === this.playerPos.x && newY === this.playerPos.y) {
          // Attack player
          const damage = zombie.type === 'small' ? 10 : 
                        zombie.type === 'big' ? 20 : 15;
          
          this.playerHealth -= damage;
          this.updateHealthDisplay();
          
          this.showDamage(this.player, damage);
          
          // Flash screen
          this.cameras.main.flash(200, 255, 0, 0, false);
          
          if (this.playerHealth <= 0) {
            this.gameOver();
          }
          
          this.time.delayedCall(300, moveNextZombie);
        } else {
          // Move zombie
          zombie.gridX = newX;
          zombie.gridY = newY;
          
          // Change to walk animation
          const animKeys = {
            small: 'zombie-small-walk',
            big: 'zombie-big-walk',
            axe: 'zombie-axe-walk'
          };
          
          zombie.sprite.play(animKeys[zombie.type]);
          
          this.tweens.add({
            targets: zombie.sprite,
            x: newX * this.tileSize + 16,
            y: newY * this.tileSize + 16,
            duration: 200,
            onComplete: () => {
              // Back to idle
              const idleKeys = {
                small: 'zombie-small-idle',
                big: 'zombie-big-idle',
                axe: 'zombie-axe-idle'
              };
              zombie.sprite.play(idleKeys[zombie.type]);
              moveNextZombie();
            }
          });
        }
      } else {
        moveNextZombie();
      }
    };
    
    moveNextZombie();
  }

  gameOver() {
    this.isPlayerTurn = false;
    
    const gameOverBg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.9);
    
    this.add.text(640, 300, 'YOU DIED', {
      fontSize: '72px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    this.add.text(640, 380, `Survived ${this.day} days`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.add.text(640, 450, 'Press F5 to restart', {
      fontSize: '18px',
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
  }
}

export default function PostApocalypseGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 1280,
        height: 720,
        backgroundColor: '#1a1a1a',
        scene: [PostApocalypseScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        pixelArt: true,
        antialias: false
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="mb-4 text-center">
        <h1 className="text-6xl font-bold text-red-700 tracking-wider mb-2 
                     drop-shadow-[0_0_20px_rgba(185,28,28,0.5)]"
            style={{ textShadow: '0 0 30px rgba(185,28,28,0.8)' }}>
          DEADGRID
        </h1>
        <p className="text-gray-500 text-lg">Post-Apocalypse Survival</p>
      </div>

      <div className="relative">
        <div 
          ref={containerRef} 
          className="border-4 border-gray-800 shadow-2xl rounded"
          style={{
            boxShadow: '0 0 60px rgba(185,28,28,0.3), inset 0 0 30px rgba(0,0,0,0.8)'
          }}
        />
      </div>

      <div className="mt-4 text-gray-600 text-xs text-center">
        <p>Survive the zombie apocalypse • Collect resources • Stay alive</p>
      </div>
    </div>
  );
}