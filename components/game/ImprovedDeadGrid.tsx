'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';

const GRID_WIDTH = 30;
const GRID_HEIGHT = 20;
const TILE_SIZE = 32;

interface GridPosition {
  x: number;
  y: number;
}

interface Zombie {
  id: string;
  pos: GridPosition;
  sprite: Phaser.GameObjects.Sprite;
  health: number;
  type: 'small' | 'big' | 'axe';
}

interface Building {
  id: string;
  pos: GridPosition;
  type: 'house' | 'store' | 'camp';
  sprite: Phaser.GameObjects.Sprite;
  looted: boolean;
}

interface GameEvent {
  title: string;
  description: string;
  options: {
    text: string;
    effect: () => void;
  }[];
}

class ImprovedDeadGridScene extends Phaser.Scene {
  // Core state
  private player!: Phaser.GameObjects.Sprite;
  private playerPos: GridPosition = { x: 15, y: 10 };
  private playerHealth = 100;
  private playerAmmo = 30;
  
  // Turn system
  private dayNumber = 1;
  private movesThisDay = 0;
  private maxMovesPerDay = 5;
  private isProcessingTurn = false;
  
  // Entities
  private zombies: Map<string, Zombie> = new Map();
  private buildings: Map<string, Building> = new Map();
  private campEstablished = false;
  
  // Resources
  private food = 20;
  private water = 15;
  private medicine = 5;
  private survivors = 3;
  
  // UI
  private uiContainer!: Phaser.GameObjects.Container;
  private eventModal: Phaser.GameObjects.Container | null = null;
  private statusText!: Phaser.GameObjects.Text;
  private resourceText!: Phaser.GameObjects.Text;
  
  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  constructor() {
    super({ key: 'ImprovedDeadGridScene' });
  }

  preload(): void {
    const basePath = '/assets/PostApocalypse_AssetPack_v1.1.2';
    
    // Player sprites
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
      `${basePath}/Enemies/Zombie_Big/Zombie_Big_Down_Idle-Sheet2.png`,
      { frameWidth: 17, frameHeight: 24 }
    );
    
    // Use actual tile images
    this.load.image('grass', `${basePath}/Tiles/Background_Dark-Green_TileSet.png`);
    this.load.image('road', `${basePath}/Tiles/Background_Bleak-Yellow_TileSet.png`);
    
    // Buildings - use actual objects
    this.load.image('barrel', `${basePath}/Objects/Barrel_1.png`);
    this.load.image('tent', `${basePath}/Objects/Buildings/Tent_1.png`);
    this.load.image('antenna', `${basePath}/Objects/Buildings/Antenna_1.png`);
    
    // UI
    this.load.image('heart', `${basePath}/UI/HP/Heart_Full.png`);
    this.load.image('heart-empty', `${basePath}/UI/HP/Heart_Half.png`);
  }

  create(): void {
    // Setup world
    this.createWorld();
    
    // Create player
    this.createPlayer();
    
    // Spawn initial entities
    this.spawnInitialZombies();
    this.createBuildings();
    
    // Setup UI
    this.createUI();
    
    // Setup controls
    this.setupControls();
    
    // Camera
    this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);
  }

  createWorld(): void {
    // Dark post-apocalyptic background
    this.cameras.main.setBackgroundColor('#1a1a1a');
    
    // Create tile grid with variety
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;
        
        // Create ground tile
        const rect = this.add.rectangle(
          worldX + TILE_SIZE/2, 
          worldY + TILE_SIZE/2, 
          TILE_SIZE - 1, 
          TILE_SIZE - 1, 
          0x2a2a2a, 
          0.8
        );
        rect.setStrokeStyle(1, 0x333333, 0.3);
        
        // Random debris/variation
        if (Math.random() < 0.1) {
          rect.setFillStyle(0x3a2a2a, 0.8);
        }
      }
    }
  }

  createPlayer(): void {
    const worldPos = this.gridToWorld(this.playerPos);
    this.player = this.add.sprite(worldPos.x, worldPos.y, 'player', 0);
    this.player.setScale(2);
    this.player.setDepth(10);
    
    // Simple idle animation
    this.anims.create({
      key: 'player-idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.player.play('player-idle');
  }

  spawnInitialZombies(): void {
    // Spawn 8-12 zombies around the map
    const zombieCount = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < zombieCount; i++) {
      const pos: GridPosition = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
      
      // Don't spawn too close to player
      if (this.getDistance(pos, this.playerPos) < 5) continue;
      
      const type = Math.random() < 0.7 ? 'small' : 'big';
      this.spawnZombie(pos, type);
    }
  }

  spawnZombie(pos: GridPosition, type: 'small' | 'big' | 'axe'): void {
    const worldPos = this.gridToWorld(pos);
    const sprite = this.add.sprite(worldPos.x, worldPos.y, `zombie-${type}`, 0);
    sprite.setScale(type === 'big' ? 1.5 : 2);
    sprite.setDepth(8);
    sprite.setTint(0xaa6666);
    
    const zombie: Zombie = {
      id: `zombie-${Date.now()}-${Math.random()}`,
      pos,
      sprite,
      health: type === 'big' ? 50 : 30,
      type
    };
    
    this.zombies.set(zombie.id, zombie);
    
    // Simple zombie animation
    const animKey = `zombie-${type}-idle`;
    if (!this.anims.exists(animKey)) {
      this.anims.create({
        key: animKey,
        frames: this.anims.generateFrameNumbers(`zombie-${type}`, { start: 0, end: type === 'big' ? 1 : 5 }),
        frameRate: 6,
        repeat: -1
      });
    }
    sprite.play(animKey);
  }

  createBuildings(): void {
    // Create 5-8 buildings scattered around
    const buildingCount = 5 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < buildingCount; i++) {
      const pos: GridPosition = {
        x: 3 + Math.floor(Math.random() * (GRID_WIDTH - 6)),
        y: 3 + Math.floor(Math.random() * (GRID_HEIGHT - 6))
      };
      
      // Don't place on player
      if (pos.x === this.playerPos.x && pos.y === this.playerPos.y) continue;
      
      const worldPos = this.gridToWorld(pos);
      const types = ['barrel', 'tent', 'antenna'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const sprite = this.add.sprite(worldPos.x, worldPos.y, type);
      sprite.setScale(1.5);
      sprite.setDepth(5);
      
      const building: Building = {
        id: `building-${i}`,
        pos,
        type: type === 'tent' ? 'camp' : type === 'barrel' ? 'store' : 'house',
        sprite,
        looted: false
      };
      
      this.buildings.set(building.id, building);
    }
  }

  createUI(): void {
    this.uiContainer = this.add.container(0, 0);
    this.uiContainer.setScrollFactor(0);
    this.uiContainer.setDepth(100);
    
    // Dark UI background
    const uiBg = this.add.rectangle(512, 30, 1024, 60, 0x000000, 0.8);
    uiBg.setScrollFactor(0);
    
    // Status text
    this.statusText = this.add.text(20, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    this.statusText.setScrollFactor(0);
    
    // Resource text
    this.resourceText = this.add.text(20, 30, '', {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'monospace'
    });
    this.resourceText.setScrollFactor(0);
    
    // Controls hint
    const controlsText = this.add.text(512, 560, 
      '[WASD/Arrows] Move | [Space] End Day | [E] Loot | [C] Camp | [ESC] Close',
      {
        fontSize: '12px',
        color: '#666666',
        fontFamily: 'monospace'
      }
    );
    controlsText.setOrigin(0.5);
    controlsText.setScrollFactor(0);
    
    this.uiContainer.add([uiBg, this.statusText, this.resourceText, controlsText]);
    
    this.updateUI();
  }

  updateUI(): void {
    // Update status
    this.statusText.setText(
      `Day ${this.dayNumber} | Health: ${this.playerHealth} | Ammo: ${this.playerAmmo} | Moves: ${this.maxMovesPerDay - this.movesThisDay}/${this.maxMovesPerDay}`
    );
    
    // Update resources
    this.resourceText.setText(
      `Survivors: ${this.survivors} | Food: ${this.food} | Water: ${this.water} | Medicine: ${this.medicine}`
    );
  }

  setupControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D,E,C,SPACE,ESC');
    
    // Movement
    this.input.keyboard!.on('keydown-W', () => this.tryMove(0, -1));
    this.input.keyboard!.on('keydown-UP', () => this.tryMove(0, -1));
    this.input.keyboard!.on('keydown-S', () => this.tryMove(0, 1));
    this.input.keyboard!.on('keydown-DOWN', () => this.tryMove(0, 1));
    this.input.keyboard!.on('keydown-A', () => this.tryMove(-1, 0));
    this.input.keyboard!.on('keydown-LEFT', () => this.tryMove(-1, 0));
    this.input.keyboard!.on('keydown-D', () => this.tryMove(1, 0));
    this.input.keyboard!.on('keydown-RIGHT', () => this.tryMove(1, 0));
    
    // Actions
    this.input.keyboard!.on('keydown-E', () => this.tryLoot());
    this.input.keyboard!.on('keydown-C', () => this.establishCamp());
    this.input.keyboard!.on('keydown-SPACE', () => this.endDay());
    this.input.keyboard!.on('keydown-ESC', () => this.closeEventModal());
    
    // Camera zoom
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      const zoom = this.cameras.main.zoom;
      this.cameras.main.setZoom(Phaser.Math.Clamp(zoom - deltaY * 0.001, 0.5, 2));
    });
  }

  tryMove(dx: number, dy: number): void {
    if (this.isProcessingTurn || this.eventModal) return;
    if (this.movesThisDay >= this.maxMovesPerDay) {
      this.showMessage('No moves remaining! Press SPACE to end day.');
      return;
    }
    
    const newPos: GridPosition = {
      x: Phaser.Math.Clamp(this.playerPos.x + dx, 0, GRID_WIDTH - 1),
      y: Phaser.Math.Clamp(this.playerPos.y + dy, 0, GRID_HEIGHT - 1)
    };
    
    // Check for zombie collision
    for (const zombie of this.zombies.values()) {
      if (zombie.pos.x === newPos.x && zombie.pos.y === newPos.y) {
        this.combatZombie(zombie);
        return;
      }
    }
    
    // Move player
    this.playerPos = newPos;
    const worldPos = this.gridToWorld(this.playerPos);
    
    this.tweens.add({
      targets: this.player,
      x: worldPos.x,
      y: worldPos.y,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.movesThisDay++;
        this.updateUI();
        this.processZombieTurns();
      }
    });
  }

  processZombieTurns(): void {
    this.isProcessingTurn = true;
    
    // Process each zombie
    const zombieArray = Array.from(this.zombies.values());
    let index = 0;
    
    const processNext = () => {
      if (index >= zombieArray.length) {
        this.isProcessingTurn = false;
        return;
      }
      
      const zombie = zombieArray[index];
      const distance = this.getDistance(zombie.pos, this.playerPos);
      
      // Zombie AI: move towards player if close
      if (distance <= 6 && distance > 1) {
        const dx = Math.sign(this.playerPos.x - zombie.pos.x);
        const dy = Math.sign(this.playerPos.y - zombie.pos.y);
        
        // Choose horizontal or vertical movement
        let newPos: GridPosition;
        if (Math.abs(this.playerPos.x - zombie.pos.x) > Math.abs(this.playerPos.y - zombie.pos.y)) {
          newPos = { x: zombie.pos.x + dx, y: zombie.pos.y };
        } else {
          newPos = { x: zombie.pos.x, y: zombie.pos.y + dy };
        }
        
        // Check if position is valid and not occupied by another zombie
        let canMove = true;
        for (const other of this.zombies.values()) {
          if (other.id !== zombie.id && other.pos.x === newPos.x && other.pos.y === newPos.y) {
            canMove = false;
            break;
          }
        }
        
        if (canMove) {
          zombie.pos = newPos;
          const worldPos = this.gridToWorld(newPos);
          
          this.tweens.add({
            targets: zombie.sprite,
            x: worldPos.x,
            y: worldPos.y,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
              // Check if zombie reached player
              if (newPos.x === this.playerPos.x && newPos.y === this.playerPos.y) {
                this.takeDamage(10);
              }
              index++;
              processNext();
            }
          });
        } else {
          index++;
          processNext();
        }
      } else {
        index++;
        processNext();
      }
    };
    
    processNext();
  }

  combatZombie(zombie: Zombie): void {
    if (this.playerAmmo > 0) {
      this.playerAmmo--;
      zombie.health -= 20;
      
      // Visual feedback
      this.cameras.main.shake(100, 0.01);
      zombie.sprite.setTint(0xff0000);
      this.time.delayedCall(100, () => zombie.sprite.setTint(0xaa6666));
      
      if (zombie.health <= 0) {
        // Zombie dies
        zombie.sprite.destroy();
        this.zombies.delete(zombie.id);
        
        // Drop loot chance
        if (Math.random() < 0.3) {
          this.food += Math.floor(Math.random() * 3) + 1;
          this.showMessage('Found supplies!');
        }
      }
    } else {
      this.showMessage('No ammo! Find more supplies!');
      this.takeDamage(15);
    }
    
    this.updateUI();
  }

  takeDamage(amount: number): void {
    this.playerHealth -= amount;
    this.cameras.main.flash(200, 255, 0, 0, false);
    
    if (this.playerHealth <= 0) {
      this.gameOver();
    }
    
    this.updateUI();
  }

  tryLoot(): void {
    // Check if on a building
    for (const building of this.buildings.values()) {
      if (building.pos.x === this.playerPos.x && building.pos.y === this.playerPos.y) {
        if (!building.looted) {
          building.looted = true;
          building.sprite.setTint(0x666666);
          
          // Random loot
          this.food += Math.floor(Math.random() * 5) + 2;
          this.water += Math.floor(Math.random() * 4) + 1;
          this.playerAmmo += Math.floor(Math.random() * 10) + 5;
          if (Math.random() < 0.3) this.medicine++;
          
          this.showMessage(`Looted ${building.type}!`);
          this.updateUI();
        } else {
          this.showMessage('Already looted!');
        }
        break;
      }
    }
  }

  establishCamp(): void {
    if (this.campEstablished) {
      this.showMessage('Camp already established!');
      return;
    }
    
    // Check if in safe area (no zombies nearby)
    let safe = true;
    for (const zombie of this.zombies.values()) {
      if (this.getDistance(zombie.pos, this.playerPos) < 3) {
        safe = false;
        break;
      }
    }
    
    if (safe) {
      this.campEstablished = true;
      const worldPos = this.gridToWorld(this.playerPos);
      const camp = this.add.sprite(worldPos.x, worldPos.y - 20, 'tent');
      camp.setScale(2);
      camp.setDepth(4);
      this.showMessage('Camp established! +2 max moves per day!');
      this.maxMovesPerDay += 2;
      this.updateUI();
    } else {
      this.showMessage('Too dangerous here! Clear zombies first!');
    }
  }

  endDay(): void {
    if (this.eventModal) return;
    
    // Consume resources
    this.food -= this.survivors;
    this.water -= this.survivors;
    
    if (this.food < 0 || this.water < 0) {
      this.showMessage('Starvation! Lost a survivor!');
      this.survivors = Math.max(1, this.survivors - 1);
      this.food = Math.max(0, this.food);
      this.water = Math.max(0, this.water);
    }
    
    // Heal if have medicine
    if (this.medicine > 0 && this.playerHealth < 100) {
      this.medicine--;
      this.playerHealth = Math.min(100, this.playerHealth + 20);
    }
    
    // Random event chance (reduced frequency)
    if (Math.random() < 0.2) { // 20% chance instead of frequent
      this.triggerRandomEvent();
    } else {
      this.startNewDay();
    }
  }

  triggerRandomEvent(): void {
    const events: GameEvent[] = [
      {
        title: 'Survivors Found',
        description: 'A small group of survivors approaches your position. They look hungry but friendly.',
        options: [
          {
            text: 'Welcome them (Cost: 5 food, 5 water)',
            effect: () => {
              if (this.food >= 5 && this.water >= 5) {
                this.food -= 5;
                this.water -= 5;
                this.survivors += 2;
                this.showMessage('New survivors joined!');
              } else {
                this.showMessage('Not enough resources!');
              }
              this.closeEventModal();
              this.startNewDay();
            }
          },
          {
            text: 'Turn them away',
            effect: () => {
              this.showMessage('The survivors leave disappointed.');
              this.closeEventModal();
              this.startNewDay();
            }
          }
        ]
      },
      {
        title: 'Supply Cache',
        description: 'You discover an old military supply cache. It might be booby-trapped.',
        options: [
          {
            text: 'Risk opening it',
            effect: () => {
              if (Math.random() < 0.7) {
                this.playerAmmo += 20;
                this.medicine += 2;
                this.showMessage('Great find! +20 ammo, +2 medicine!');
              } else {
                this.takeDamage(25);
                this.showMessage('It was trapped! -25 health!');
              }
              this.closeEventModal();
              this.startNewDay();
            }
          },
          {
            text: 'Leave it alone',
            effect: () => {
              this.showMessage('Better safe than sorry.');
              this.closeEventModal();
              this.startNewDay();
            }
          }
        ]
      },
      {
        title: 'Zombie Horde',
        description: 'A massive horde is approaching from the east!',
        options: [
          {
            text: 'Stand and fight',
            effect: () => {
              if (this.playerAmmo >= 15) {
                this.playerAmmo -= 15;
                this.showMessage('Horde defeated! Area secured.');
              } else {
                this.takeDamage(30);
                this.showMessage('Overwhelmed! -30 health!');
              }
              this.closeEventModal();
              this.startNewDay();
            }
          },
          {
            text: 'Run and hide',
            effect: () => {
              // Spawn extra zombies
              for (let i = 0; i < 3; i++) {
                const pos = {
                  x: Math.floor(Math.random() * GRID_WIDTH),
                  y: Math.floor(Math.random() * GRID_HEIGHT)
                };
                this.spawnZombie(pos, Math.random() < 0.5 ? 'small' : 'big');
              }
              this.showMessage('The horde passes... but zombies remain.');
              this.closeEventModal();
              this.startNewDay();
            }
          }
        ]
      }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    this.showEventModal(event);
  }

  showEventModal(event: GameEvent): void {
    if (this.eventModal) return;
    
    this.eventModal = this.add.container(512, 300);
    this.eventModal.setScrollFactor(0);
    this.eventModal.setDepth(200);
    
    // Background
    const bg = this.add.rectangle(0, 0, 600, 400, 0x222222, 0.95);
    bg.setStrokeStyle(3, 0xff3333);
    
    // Title
    const title = this.add.text(0, -150, event.title, {
      fontSize: '24px',
      color: '#ff3333',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Description
    const desc = this.add.text(0, -80, event.description, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: 500 },
      align: 'center'
    }).setOrigin(0.5);
    
    // Close hint
    const closeHint = this.add.text(0, -180, '[ESC] to close', {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.eventModal.add([bg, title, desc, closeHint]);
    
    // Options
    let yOffset = 20;
    event.options.forEach((option, index) => {
      const optionBg = this.add.rectangle(0, yOffset, 400, 40, 0x333333, 0.8)
        .setInteractive()
        .on('pointerover', () => optionBg.setFillStyle(0x444444, 0.9))
        .on('pointerout', () => optionBg.setFillStyle(0x333333, 0.8))
        .on('pointerdown', option.effect);
      
      const optionText = this.add.text(0, yOffset, `[${index + 1}] ${option.text}`, {
        fontSize: '14px',
        color: '#00ff00',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      if (this.eventModal) {
        this.eventModal.add([optionBg, optionText]);
      }
      
      // Keyboard shortcut
      this.input.keyboard!.once(`keydown-${index + 1}`, option.effect);
      
      yOffset += 50;
    });
  }

  closeEventModal(): void {
    if (this.eventModal) {
      this.eventModal.destroy();
      this.eventModal = null;
    }
  }

  startNewDay(): void {
    this.dayNumber++;
    this.movesThisDay = 0;
    
    // Spawn new zombies occasionally
    if (this.dayNumber % 3 === 0) {
      const count = Math.floor(this.dayNumber / 3);
      for (let i = 0; i < count; i++) {
        const pos = {
          x: Math.floor(Math.random() * GRID_WIDTH),
          y: Math.floor(Math.random() * GRID_HEIGHT)
        };
        this.spawnZombie(pos, Math.random() < 0.6 ? 'small' : 'big');
      }
    }
    
    this.updateUI();
    this.showMessage(`Day ${this.dayNumber} begins...`);
  }

  showMessage(text: string): void {
    const msg = this.add.text(512, 400, text, {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(150);
    
    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: 350,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => msg.destroy()
    });
  }

  gameOver(): void {
    this.scene.pause();
    
    const gameOverText = this.add.text(512, 300, `GAME OVER\nSurvived ${this.dayNumber} days`, {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'monospace',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 20 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300);
  }

  // Helper functions
  gridToWorld(pos: GridPosition): { x: number; y: number } {
    return {
      x: pos.x * TILE_SIZE + TILE_SIZE / 2,
      y: pos.y * TILE_SIZE + TILE_SIZE / 2
    };
  }

  getDistance(pos1: GridPosition, pos2: GridPosition): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }
}

export default function ImprovedDeadGrid() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1024,
        height: 640,
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
        scene: ImprovedDeadGridScene,
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
      <div id="game-container" className="border-2 border-red-900 rounded-lg shadow-2xl" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-red-600 text-3xl animate-pulse">Loading DeadGrid...</div>
        </div>
      )}
    </div>
  );
}