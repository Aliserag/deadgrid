'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { AssetManager } from '@/lib/game/AssetManager';
import { GridManager } from '@/lib/game/GridManager';
import { Player } from '@/lib/game/entities/Player';
import { Zombie } from '@/lib/game/entities/Zombie';

class SimpleTestScene extends Phaser.Scene {
  private player!: Player;
  private zombies: Zombie[] = [];
  private gridManager!: GridManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private canMove: boolean = true;
  private moveDelay: number = 200;

  constructor() {
    super({ key: 'SimpleTestScene' });
  }

  preload(): void {
    console.log('Starting preload...');
    
    // Load all assets
    AssetManager.loadAllAssets(this);
    
    this.load.on('filecomplete', (key: string) => {
      console.log('Loaded:', key);
    });
    
    this.load.on('loaderror', (file: any) => {
      console.error('Failed to load:', file.key, file.src);
    });
  }

  create(): void {
    console.log('Creating scene...');
    
    // Set background
    this.cameras.main.setBackgroundColor('#1a1a1a');
    
    // Initialize grid manager
    this.gridManager = new GridManager(16, 12, 48);
    
    // Draw simple grid
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    for (let x = 0; x <= 16; x++) {
      graphics.moveTo(x * 48, 0);
      graphics.lineTo(x * 48, 12 * 48);
    }
    
    for (let y = 0; y <= 12; y++) {
      graphics.moveTo(0, y * 48);
      graphics.lineTo(16 * 48, y * 48);
    }
    
    // Create animations
    try {
      AssetManager.createAnimations(this);
      console.log('Animations created');
    } catch (e) {
      console.error('Error creating animations:', e);
    }
    
    // Create player
    this.player = new Player(this, { x: 8, y: 6 });
    this.gridManager.addEntity({
      id: this.player.getId(),
      position: { x: 8, y: 6 },
      sprite: this.player.getSprite(),
      type: 'player'
    });
    
    // Create zombies
    const zombieTypes: ('small' | 'big' | 'axe')[] = ['small', 'big', 'axe'];
    zombieTypes.forEach((type, index) => {
      const zombie = new Zombie(this, { x: 3 + index * 4, y: 3 }, type);
      this.zombies.push(zombie);
      this.gridManager.addEntity({
        id: zombie.getId(),
        position: { x: 3 + index * 4, y: 3 },
        sprite: zombie.getSprite(),
        type: 'zombie'
      });
    });
    
    // Setup keyboard
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Add UI text
    this.add.text(10, 10, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    
    this.add.text(10, 30, `Player Health: ${this.player.getHealth()}`, {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
  }

  update(): void {
    if (!this.canMove) return;
    
    let moved = false;
    let newPos = { ...this.player.getPosition() };
    
    if (this.cursors.up.isDown) {
      newPos.y--;
      moved = true;
    } else if (this.cursors.down.isDown) {
      newPos.y++;
      moved = true;
    } else if (this.cursors.left.isDown) {
      newPos.x--;
      moved = true;
    } else if (this.cursors.right.isDown) {
      newPos.x++;
      moved = true;
    }
    
    if (moved) {
      // Check bounds
      if (newPos.x >= 0 && newPos.x < 16 && newPos.y >= 0 && newPos.y < 12) {
        // Check if occupied
        if (!this.gridManager.isOccupied(newPos)) {
          // Move player
          this.gridManager.moveEntity(this.player.getId(), newPos);
          this.player.moveTo(newPos, 48);
          
          // Set move delay
          this.canMove = false;
          this.time.delayedCall(this.moveDelay, () => {
            this.canMove = true;
          });
          
          // Move zombies randomly
          this.zombies.forEach(zombie => {
            if (!zombie.getIsAlive()) return;
            
            const zombiePos = { ...zombie.getPosition() };
            const directions = [
              { x: 0, y: -1 },
              { x: 0, y: 1 },
              { x: -1, y: 0 },
              { x: 1, y: 0 }
            ];
            
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const newZombiePos = {
              x: zombiePos.x + dir.x,
              y: zombiePos.y + dir.y
            };
            
            if (newZombiePos.x >= 0 && newZombiePos.x < 16 && 
                newZombiePos.y >= 0 && newZombiePos.y < 12 &&
                !this.gridManager.isOccupied(newZombiePos)) {
              this.gridManager.moveEntity(zombie.getId(), newZombiePos);
              zombie.moveTo(newZombiePos, 48);
            }
          });
        }
      }
    }
  }
}

export default function SimpleGameTest() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 768,
      height: 576,
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: SimpleTestScene
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
      <h1 className="text-2xl font-bold text-white mb-4">DeadGrid - Sprite Test</h1>
      <div id="game-container" className="border-2 border-gray-700" />
      <p className="text-gray-400 mt-4 text-sm">Testing Post-Apocalypse sprites with Phaser 3</p>
    </div>
  );
}