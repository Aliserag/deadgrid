'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

class FixedGameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private zombies: Phaser.GameObjects.Sprite[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private gridSize = 48;
  private playerGridPos = { x: 8, y: 6 };
  private canMove = true;
  private isPlayerTurn = true;
  private healthText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private playerHealth = 100;
  private turnCount = 0;

  constructor() {
    super({ key: 'FixedGameScene' });
  }

  preload(): void {
    const basePath = '/assets/PostApocalypse_AssetPack_v1.1.2';
    
    // Load player sprites - 78x16 for 6 frames = 13x16 per frame
    this.load.spritesheet('player-idle', 
      `${basePath}/Character/Main/Idle/Character_down_idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    this.load.spritesheet('player-run',
      `${basePath}/Character/Main/Run/Character_down_run-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Load zombie sprites with correct dimensions
    // Small zombie: 78x16 / 6 = 13x16
    this.load.spritesheet('zombie-small',
      `${basePath}/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Big zombie: 96x23 / 6 = 16x23
    this.load.spritesheet('zombie-big',
      `${basePath}/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet6.png`,
      { frameWidth: 16, frameHeight: 23 }
    );
    
    // Axe zombie: 78x18 / 6 = 13x18
    this.load.spritesheet('zombie-axe',
      `${basePath}/Enemies/Zombie_Axe/Zombie_Axe_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 18 }
    );
    
    // Load environment
    this.load.image('barrel', `${basePath}/Objects/Barrel_red_1.png`);
    this.load.image('crate', `${basePath}/Objects/Pickable/Ammo-crate_Green.png`);
    
    // Load tilesets for background
    this.load.image('tiles-grass', `${basePath}/Tiles/Background_Dark-Green_TileSet.png`);
    this.load.image('tiles-buildings', `${basePath}/Tiles/Buildings/Buildings_gray_TileSet.png`);
    
    // Load UI
    this.load.image('ammo-icon', `${basePath}/UI/Inventory/Objects/Icon_Bullet-box_Blue.png`);
  }

  create(): void {
    // Create tilemap background
    this.createTilemapBackground();
    
    // Draw grid overlay
    this.drawGrid();
    
    // Create animations
    this.createAnimations();
    
    // Create player
    this.createPlayer();
    
    // Create zombies
    this.createZombies();
    
    // Create environment
    this.createEnvironment();
    
    // Create UI
    this.createUI();
    
    // Setup controls - both arrows and WASD
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D');
    
    // End turn key
    this.input.keyboard!.on('keydown-ENTER', () => {
      this.endPlayerTurn();
    });
    
    // Attack key
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.playerAttack();
    });
  }

  createTilemapBackground(): void {
    // Create a simple tiled background using the grass tileset
    this.cameras.main.setBackgroundColor('#1a1a1a');
    
    // Create a repeating pattern of ground tiles
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 12; y++) {
        const tile = this.add.image(
          x * this.gridSize + this.gridSize / 2,
          y * this.gridSize + this.gridSize / 2,
          'tiles-grass'
        );
        tile.setScale(3);
        tile.setAlpha(0.3);
        tile.setDepth(-1);
        
        // Add variation with random tint
        if (Math.random() > 0.7) {
          tile.setTint(0x666666);
        }
      }
    }
  }
  
  drawGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.2);
    
    for (let x = 0; x <= 16; x++) {
      graphics.moveTo(x * this.gridSize, 0);
      graphics.lineTo(x * this.gridSize, 12 * this.gridSize);
    }
    
    for (let y = 0; y <= 12; y++) {
      graphics.moveTo(0, y * this.gridSize);
      graphics.lineTo(16 * this.gridSize, y * this.gridSize);
    }
  }

  createAnimations(): void {
    // Create player animations only if sprites loaded
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
    
    // Create zombie animations
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
    this.player.setScale(3);  // Increased scale for tiny sprites
    this.player.setDepth(10);
    
    // Only play animation if it exists
    if (this.anims.exists('player-idle-anim')) {
      this.player.play('player-idle-anim');
    }
  }

  createZombies(): void {
    const zombieTypes = [
      { key: 'zombie-small', pos: { x: 3, y: 3 } },
      { key: 'zombie-big', pos: { x: 12, y: 3 } },
      { key: 'zombie-axe', pos: { x: 7, y: 9 } }
    ];
    
    zombieTypes.forEach(type => {
      const x = type.pos.x * this.gridSize + this.gridSize / 2;
      const y = type.pos.y * this.gridSize + this.gridSize / 2;
      
      const zombie = this.add.sprite(x, y, type.key, 0);
      zombie.setScale(3);  // Increased scale for tiny sprites
      zombie.setDepth(5);
      
      // Only play animation if it exists
      if (this.anims.exists(`${type.key}-anim`)) {
        zombie.play(`${type.key}-anim`);
      }
      zombie.setData('gridPos', { ...type.pos });
      zombie.setData('type', type.key);
      zombie.setData('health', type.key === 'zombie-big' ? 60 : 30);
      
      this.zombies.push(zombie);
    });
  }

  createEnvironment(): void {
    // Add some barrels and crates
    const objects = [
      { x: 5, y: 5, key: 'barrel' },
      { x: 10, y: 2, key: 'crate' },
      { x: 2, y: 8, key: 'barrel' },
      { x: 14, y: 7, key: 'crate' }
    ];
    
    objects.forEach(obj => {
      const x = obj.x * this.gridSize + this.gridSize / 2;
      const y = obj.y * this.gridSize + this.gridSize / 2;
      const sprite = this.add.image(x, y, obj.key);
      sprite.setScale(1.5);
      sprite.setAlpha(0.8);
      sprite.setDepth(1);
    });
  }

  createUI(): void {
    // Top bar
    const topBar = this.add.rectangle(384, 25, 768, 50, 0x000000, 0.8);
    topBar.setStrokeStyle(2, 0x333333);
    topBar.setDepth(100);
    
    // Health
    this.healthText = this.add.text(20, 15, `Health: ${this.playerHealth}/100`, {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setDepth(101);
    
    // Turn indicator
    this.turnText = this.add.text(20, 35, 'YOUR TURN', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setDepth(101);
    
    // Turn counter
    this.add.text(650, 15, `Turn: ${this.turnCount}`, {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'monospace'
    }).setDepth(101);
    
    // Controls
    this.add.text(384, 550, 
      '[WASD/ARROWS] Move | [SPACE] Attack | [ENTER] End Turn',
      {
        fontSize: '14px',
        color: '#666666',
        fontFamily: 'monospace'
      }
    ).setOrigin(0.5).setDepth(101);
  }

  update(): void {
    if (!this.isPlayerTurn || !this.canMove) return;
    
    let moved = false;
    let newPos = { ...this.playerGridPos };
    
    // Check both arrow keys and WASD
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
      // Player must press Enter to end turn
    }
  }

  isValidPosition(pos: { x: number; y: number }): boolean {
    // Check bounds
    if (pos.x < 0 || pos.x >= 16 || pos.y < 0 || pos.y >= 12) {
      return false;
    }
    
    // Check zombie positions
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
    
    // Only play animation if it exists
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

  playerAttack(): void {
    if (!this.isPlayerTurn) return;
    
    // Check adjacent zombies
    this.zombies.forEach(zombie => {
      if (!zombie.active) return;
      
      const zPos = zombie.getData('gridPos');
      const distance = Math.abs(this.playerGridPos.x - zPos.x) + 
                      Math.abs(this.playerGridPos.y - zPos.y);
      
      if (distance === 1) {
        // Attack zombie
        const health = zombie.getData('health') - 20;
        zombie.setData('health', health);
        
        // Flash red
        zombie.setTint(0xff0000);
        this.time.delayedCall(100, () => {
          zombie.clearTint();
        });
        
        // Show damage
        const damageText = this.add.text(zombie.x, zombie.y - 30, '-20', {
          fontSize: '16px',
          color: '#ff0000',
          fontFamily: 'monospace'
        }).setOrigin(0.5);
        
        this.tweens.add({
          targets: damageText,
          y: damageText.y - 20,
          alpha: 0,
          duration: 1000,
          onComplete: () => damageText.destroy()
        });
        
        if (health <= 0) {
          // Kill zombie
          this.tweens.add({
            targets: zombie,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 500,
            onComplete: () => {
              zombie.destroy();
            }
          });
        }
      }
    });
  }

  endPlayerTurn(): void {
    if (!this.isPlayerTurn) return;
    
    this.isPlayerTurn = false;
    this.turnCount++;
    this.turnText.setText('ENEMY TURN').setColor('#ff0000');
    
    // Simple zombie AI with visible movement
    let zombieIndex = 0;
    const moveNextZombie = () => {
      if (zombieIndex >= this.zombies.length) {
        // All zombies moved, back to player turn
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
        moveNextZombie();
        return;
      }
      
      // Move zombie towards player
      const zPos = zombie.getData('gridPos');
      const newPos = { ...zPos };
      
      // Better pathfinding
      const dx = this.playerGridPos.x - zPos.x;
      const dy = this.playerGridPos.y - zPos.y;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) newPos.x++;
        else if (dx < 0) newPos.x--;
      } else if (dy !== 0) {
        if (dy > 0) newPos.y++;
        else if (dy < 0) newPos.y--;
      }
      
      // Check if zombie is next to player for attack
      const attackDistance = Math.abs(newPos.x - this.playerGridPos.x) + 
                           Math.abs(newPos.y - this.playerGridPos.y);
      
      if (attackDistance === 0) {
        // Attack player
        this.playerHealth -= 10;
        this.healthText.setText(`Health: ${this.playerHealth}/100`);
        
        // Update health color
        if (this.playerHealth <= 0) {
          this.healthText.setColor('#ff0000');
          this.add.text(384, 300, 'GAME OVER', {
            fontSize: '48px',
            color: '#ff0000',
            fontFamily: 'monospace'
          }).setOrigin(0.5).setDepth(200);
          return;
        } else if (this.playerHealth <= 30) {
          this.healthText.setColor('#ffaa00');
        }
        
        // Attack animation
        zombie.setTint(0xff0000);
        this.time.delayedCall(200, () => zombie.clearTint());
        
        // Camera effects
        this.cameras.main.shake(200, 0.01);
        this.cameras.main.flash(100, 100, 0, 0, false);
        
        this.time.delayedCall(500, moveNextZombie);
      } else if (this.isValidZombiePosition(newPos, zombie)) {
        // Move zombie with visible animation
        zombie.setData('gridPos', newPos);
        
        const x = newPos.x * this.gridSize + this.gridSize / 2;
        const y = newPos.y * this.gridSize + this.gridSize / 2;
        
        // Face direction of movement
        if (dx > 0) zombie.setFlipX(false);
        else if (dx < 0) zombie.setFlipX(true);
        
        this.tweens.add({
          targets: zombie,
          x: x,
          y: y,
          duration: 400,
          ease: 'Power2',
          onComplete: () => {
            this.time.delayedCall(200, moveNextZombie);
          }
        });
      } else {
        // Can't move, try next zombie
        this.time.delayedCall(100, moveNextZombie);
      }
    };
    
    this.time.delayedCall(500, moveNextZombie);
  }

  isValidZombiePosition(pos: { x: number; y: number }, movingZombie: Phaser.GameObjects.Sprite): boolean {
    // Check bounds
    if (pos.x < 0 || pos.x >= 16 || pos.y < 0 || pos.y >= 12) {
      return false;
    }
    
    // Check other zombies
    for (const zombie of this.zombies) {
      if (!zombie.active || zombie === movingZombie) continue;
      const zPos = zombie.getData('gridPos');
      if (zPos.x === pos.x && zPos.y === pos.y) {
        return false;
      }
    }
    
    return true;
  }
}

export default function FixedDeadGrid() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 768,
      height: 576,
      pixelArt: true,
      scene: FixedGameScene
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
      <h1 className="text-3xl font-bold text-red-600 mb-2">DEADGRID</h1>
      <p className="text-gray-400 mb-4 text-sm">Turn-Based Zombie Survival</p>
      <div id="game-container" className="border-2 border-gray-700" />
    </div>
  );
}