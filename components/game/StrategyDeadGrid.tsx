'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';

// Game configuration - Much larger world
const GRID_WIDTH = 50;
const GRID_HEIGHT = 35;
const TILE_SIZE = 24; // Smaller tiles for larger map
const CAMERA_SPEED = 10;

// Game modes
type GameMode = 'exploration' | 'camp';
type BuildingType = 'house' | 'store' | 'hospital' | 'police' | 'military';

interface Building {
  id: string;
  type: BuildingType;
  gridPos: { x: number; y: number };
  looted: boolean;
  lootQuality: number; // 1-5
  danger: number; // 1-5
}

interface Expedition {
  id: string;
  target: Building;
  survivors: number;
  daysRemaining: number;
  success?: boolean;
}

interface DailyEvent {
  title: string;
  description: string;
  options: {
    text: string;
    consequence: () => void;
  }[];
}

class StrategyDeadGridScene extends Phaser.Scene {
  // Core game state
  private gameMode: GameMode = 'exploration';
  private dayNumber = 1;
  private movesThisDay = 0;
  private maxMovesPerDay = 1;
  
  // Map and entities
  private gridEntities: Map<string, any> = new Map();
  private buildings: Building[] = [];
  private playerPos = { x: 25, y: 17 };
  private playerSprite!: Phaser.GameObjects.Sprite;
  private zombies: Map<string, any> = new Map();
  
  // Camp management
  private campEstablished = false;
  private campPos: { x: number; y: number } | null = null;
  private survivors = 5;
  private food = 20;
  private water = 30;
  private ammo = 50;
  private medicine = 10;
  private expeditions: Expedition[] = [];
  
  // UI
  private mainCamera!: Phaser.Cameras.Scene2D.Camera;
  private minimap!: Phaser.Cameras.Scene2D.Camera;
  private uiText: { [key: string]: Phaser.GameObjects.Text } = {};
  private eventPanel!: Phaser.GameObjects.Container;
  private campPanel!: Phaser.GameObjects.Container;
  
  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  constructor() {
    super({ key: 'StrategyDeadGridScene' });
  }

  preload(): void {
    const basePath = '/assets/PostApocalypse_AssetPack_v1.1.2';
    
    // Essential sprites
    this.load.spritesheet('player-sprite', 
      `${basePath}/Character/Main/Idle/Character_down_idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Zombie sprites
    this.load.spritesheet('zombie-small',
      `${basePath}/Enemies/Zombie_Small/Zombie_Small_Down_Idle-Sheet6.png`,
      { frameWidth: 13, frameHeight: 16 }
    );
    
    // Tiles and buildings
    this.load.image('tile-grass', `${basePath}/Tiles/Background_Dark-Green_TileSet.png`);
    this.load.image('tile-road', `${basePath}/Tiles/Background_Bleak-Yellow_TileSet.png`);
    this.load.image('building-tile', `${basePath}/Tiles/Buildings/Buildings_gray_TileSet.png`);
    
    // Objects for buildings
    this.load.image('house', `${basePath}/Objects/Buildings/Tent_1.png`);
    this.load.image('store', `${basePath}/Objects/Barrel_red_1.png`);
    this.load.image('hospital', `${basePath}/Objects/Buildings/Antenna_1.png`);
    
    // UI
    this.load.image('heart-full', `${basePath}/UI/HP/Heart_Full.png`);
  }

  create(): void {
    // Setup world
    this.setupLargeWorld();
    this.generateBuildings();
    this.spawnZombies();
    
    // Create player
    this.createPlayer();
    
    // Setup cameras
    this.setupCameras();
    
    // Create UI
    this.createStrategicUI();
    
    // Setup controls
    this.setupControls();
    
    // Start game
    this.startNewDay();
  }

  setupLargeWorld(): void {
    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a0a');
    
    // Create varied terrain
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const worldX = x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = y * TILE_SIZE + TILE_SIZE / 2;
        
        // Terrain variation
        let tileKey = 'tile-grass';
        const noise = this.generateNoise(x, y);
        
        if (noise < 0.2) {
          tileKey = 'tile-road';
        } else if (noise < 0.3) {
          tileKey = 'building-tile';
        }
        
        const tile = this.add.image(worldX, worldY, tileKey);
        tile.setScale(1.5).setAlpha(0.3).setDepth(-2);
        
        // Random tinting
        if (Math.random() > 0.8) {
          tile.setTint(0x444444);
        }
      }
    }
    
    // Grid overlay
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x111111, 0.2);
    for (let x = 0; x <= GRID_WIDTH; x++) {
      graphics.moveTo(x * TILE_SIZE, 0);
      graphics.lineTo(x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      graphics.moveTo(0, y * TILE_SIZE);
      graphics.lineTo(GRID_WIDTH * TILE_SIZE, y * TILE_SIZE);
    }
  }

  generateBuildings(): void {
    // Generate clusters of buildings (cities)
    const cityCount = 8;
    
    for (let c = 0; c < cityCount; c++) {
      const centerX = 5 + Math.floor(Math.random() * (GRID_WIDTH - 10));
      const centerY = 5 + Math.floor(Math.random() * (GRID_HEIGHT - 10));
      const buildingCount = 5 + Math.floor(Math.random() * 10);
      
      for (let b = 0; b < buildingCount; b++) {
        const offset = 3;
        const x = centerX + Math.floor((Math.random() - 0.5) * offset * 2);
        const y = centerY + Math.floor((Math.random() - 0.5) * offset * 2);
        
        if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) continue;
        
        const types: BuildingType[] = ['house', 'house', 'house', 'store', 'store', 'hospital', 'police', 'military'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const building: Building = {
          id: `building-${c}-${b}`,
          type: type,
          gridPos: { x, y },
          looted: false,
          lootQuality: type === 'military' ? 5 : type === 'hospital' ? 4 : type === 'police' ? 4 : type === 'store' ? 3 : 2,
          danger: type === 'military' ? 5 : type === 'hospital' ? 3 : type === 'police' ? 4 : 2
        };
        
        this.buildings.push(building);
        
        // Visual representation
        const worldPos = this.gridToWorld(building.gridPos);
        const sprite = this.add.image(worldPos.x, worldPos.y, type === 'military' ? 'hospital' : type);
        sprite.setScale(1.2);
        sprite.setTint(building.looted ? 0x666666 : 0xffffff);
        sprite.setDepth(1);
        sprite.setData('building', building);
        
        // Make buildings interactive
        sprite.setInteractive();
        sprite.on('pointerdown', () => this.onBuildingClick(building));
      }
    }
  }

  spawnZombies(): void {
    // Spawn zombie hordes around the map
    const hordeCount = 20;
    
    for (let h = 0; h < hordeCount; h++) {
      const x = Math.floor(Math.random() * GRID_WIDTH);
      const y = Math.floor(Math.random() * GRID_HEIGHT);
      
      // Don't spawn on player start
      if (Math.abs(x - 25) < 5 && Math.abs(y - 17) < 5) continue;
      
      const worldPos = this.gridToWorld({ x, y });
      const zombie = this.add.sprite(worldPos.x, worldPos.y, 'zombie-small', 0);
      zombie.setScale(1.5);
      zombie.setDepth(5);
      zombie.setTint(0xff6666);
      
      const zombieData = {
        id: `zombie-${h}`,
        gridPos: { x, y },
        sprite: zombie,
        detected: false,
        health: 30
      };
      
      this.zombies.set(zombieData.id, zombieData);
    }
  }

  createPlayer(): void {
    const worldPos = this.gridToWorld(this.playerPos);
    this.playerSprite = this.add.sprite(worldPos.x, worldPos.y, 'player-sprite', 0);
    this.playerSprite.setScale(2);
    this.playerSprite.setDepth(10);
    this.playerSprite.setTint(0x00ff00); // Green tint for visibility
  }

  setupCameras(): void {
    // Main camera follows player
    this.mainCamera = this.cameras.main;
    this.mainCamera.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    this.mainCamera.startFollow(this.playerSprite);
    this.mainCamera.setZoom(1.5);
    
    // Minimap in corner
    this.minimap = this.cameras.add(10, 10, 200, 140);
    this.minimap.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    this.minimap.setZoom(0.1);
    this.minimap.setBackgroundColor(0x000000);
    this.minimap.setAlpha(0.8);
  }

  createStrategicUI(): void {
    // Top bar - game info
    const topBar = this.add.rectangle(512, 30, 1024, 60, 0x000000, 0.9);
    topBar.setScrollFactor(0);
    topBar.setDepth(100);
    
    // Day counter
    this.uiText.day = this.add.text(20, 10, `Day ${this.dayNumber}`, {
      fontSize: '20px',
      color: '#ff3333',
      fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(101);
    
    // Mode indicator
    this.uiText.mode = this.add.text(20, 35, 'EXPLORATION MODE', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(101);
    
    // Resources
    this.uiText.resources = this.add.text(200, 10, this.getResourceString(), {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(101);
    
    // Moves remaining
    this.uiText.moves = this.add.text(200, 35, `Moves: ${this.maxMovesPerDay - this.movesThisDay}/${this.maxMovesPerDay}`, {
      fontSize: '14px',
      color: '#ffff00',
      fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(101);
    
    // Controls
    this.add.text(512, 560, 
      this.gameMode === 'exploration' 
        ? '[WASD/Arrows] Move (1/day) | [C] Establish Camp | [E] Loot | [Space] End Day'
        : '[M] Map View | [S] Send Expedition | [R] Recall | [Space] Next Day',
      {
        fontSize: '12px',
        color: '#666666',
        fontFamily: 'monospace'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    
    // Create event panel (hidden initially)
    this.createEventPanel();
    
    // Create camp management panel
    this.createCampPanel();
  }

  createEventPanel(): void {
    this.eventPanel = this.add.container(512, 300);
    
    const bg = this.add.rectangle(0, 0, 600, 400, 0x222222, 0.95);
    bg.setStrokeStyle(3, 0x666666);
    
    const title = this.add.text(0, -180, 'EVENT', {
      fontSize: '24px',
      color: '#ff3333',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    const description = this.add.text(0, -100, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: 550 }
    }).setOrigin(0.5);
    
    this.eventPanel.add([bg, title, description]);
    this.eventPanel.setScrollFactor(0);
    this.eventPanel.setDepth(200);
    this.eventPanel.setVisible(false);
  }

  createCampPanel(): void {
    this.campPanel = this.add.container(512, 300);
    
    const bg = this.add.rectangle(0, 0, 700, 500, 0x222222, 0.95);
    bg.setStrokeStyle(3, 0x666666);
    
    const title = this.add.text(0, -220, 'CAMP MANAGEMENT', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Survivor count
    const survivorText = this.add.text(-300, -150, `Survivors: ${this.survivors}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    
    // Expedition list
    const expeditionTitle = this.add.text(-300, -100, 'Active Expeditions:', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
    
    // Actions
    const sendExpedition = this.add.text(-300, 50, '[S] Send New Expedition', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setInteractive();
    
    sendExpedition.on('pointerdown', () => this.showBuildingTargets());
    
    const closeBtn = this.add.text(320, -230, 'X', {
      fontSize: '20px',
      color: '#ff0000',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive();
    
    closeBtn.on('pointerdown', () => this.closeCampPanel());
    
    this.campPanel.add([bg, title, survivorText, expeditionTitle, sendExpedition, closeBtn]);
    this.campPanel.setScrollFactor(0);
    this.campPanel.setDepth(200);
    this.campPanel.setVisible(false);
  }

  setupControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D');
    
    // Game controls
    this.input.keyboard!.on('keydown-SPACE', () => this.endDay());
    this.input.keyboard!.on('keydown-C', () => this.establishCamp());
    this.input.keyboard!.on('keydown-E', () => this.lootBuilding());
    this.input.keyboard!.on('keydown-M', () => this.toggleMapView());
    
    // Camera controls
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      const zoom = this.mainCamera.zoom;
      this.mainCamera.setZoom(Phaser.Math.Clamp(zoom - deltaY * 0.001, 0.5, 3));
    });
  }

  update(): void {
    // Camera movement with keyboard
    const cam = this.mainCamera;
    
    if (this.input.keyboard!.addKey('Q').isDown) {
      cam.scrollX -= CAMERA_SPEED;
    }
    if (this.input.keyboard!.addKey('E').isDown) {
      cam.scrollX += CAMERA_SPEED;
    }
    
    // Player movement in exploration mode
    if (this.gameMode === 'exploration' && this.movesThisDay < this.maxMovesPerDay) {
      let moved = false;
      let newPos = { ...this.playerPos };
      
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasd.A)) {
        newPos.x--;
        moved = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasd.D)) {
        newPos.x++;
        moved = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.W)) {
        newPos.y--;
        moved = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasd.S)) {
        newPos.y++;
        moved = true;
      }
      
      if (moved && this.isValidPosition(newPos)) {
        this.movePlayer(newPos);
        this.movesThisDay++;
        this.uiText.moves.setText(`Moves: ${this.maxMovesPerDay - this.movesThisDay}/${this.maxMovesPerDay}`);
        
        // After moving, process zombie turns
        this.processZombieTurns();
      }
    }
  }

  movePlayer(newPos: { x: number; y: number }): void {
    this.playerPos = newPos;
    const worldPos = this.gridToWorld(newPos);
    
    this.tweens.add({
      targets: this.playerSprite,
      x: worldPos.x,
      y: worldPos.y,
      duration: 200,
      ease: 'Power2'
    });
  }

  processZombieTurns(): void {
    // Make zombies move towards player if detected
    this.zombies.forEach(zombie => {
      const distance = this.getDistance(zombie.gridPos, this.playerPos);
      
      // Detection check
      if (distance <= 5) {
        zombie.detected = true;
      }
      
      if (zombie.detected && distance > 1) {
        // Move towards player
        const newPos = { ...zombie.gridPos };
        
        if (zombie.gridPos.x < this.playerPos.x) newPos.x++;
        else if (zombie.gridPos.x > this.playerPos.x) newPos.x--;
        else if (zombie.gridPos.y < this.playerPos.y) newPos.y++;
        else if (zombie.gridPos.y > this.playerPos.y) newPos.y--;
        
        // Check if position is valid
        let canMove = true;
        this.zombies.forEach(otherZombie => {
          if (otherZombie.id !== zombie.id &&
              otherZombie.gridPos.x === newPos.x &&
              otherZombie.gridPos.y === newPos.y) {
            canMove = false;
          }
        });
        
        if (canMove) {
          zombie.gridPos = newPos;
          const worldPos = this.gridToWorld(newPos);
          
          this.tweens.add({
            targets: zombie.sprite,
            x: worldPos.x,
            y: worldPos.y,
            duration: 300,
            ease: 'Power2'
          });
        }
      }
      
      // Attack if adjacent
      if (distance === 1) {
        this.showFloatingText(this.playerSprite.x, this.playerSprite.y, 'Attacked!', 0xff0000);
        this.cameras.main.shake(200, 0.01);
      }
    });
  }

  endDay(): void {
    // Reset daily moves
    this.movesThisDay = 0;
    this.dayNumber++;
    
    // Update UI
    this.uiText.day.setText(`Day ${this.dayNumber}`);
    this.uiText.moves.setText(`Moves: ${this.maxMovesPerDay}/${this.maxMovesPerDay}`);
    
    // Process expeditions
    this.processExpeditions();
    
    // Consume resources
    this.consumeDailyResources();
    
    // Random events (Europa Universalis style)
    if (Math.random() < 0.5) {
      this.triggerRandomEvent();
    }
    
    // Spawn new zombies occasionally
    if (this.dayNumber % 3 === 0) {
      this.spawnNewZombieWave();
    }
    
    this.startNewDay();
  }

  startNewDay(): void {
    this.showFloatingText(512, 100, `Day ${this.dayNumber}`, 0xffff00);
  }

  triggerRandomEvent(): void {
    const events: DailyEvent[] = [
      {
        title: 'Survivors Found',
        description: 'A group of survivors approaches your position. They seem friendly but desperate.',
        options: [
          {
            text: 'Welcome them (70% +2 Survivors, 30% -10 Food)',
            consequence: () => {
              if (Math.random() < 0.7) {
                this.survivors += 2;
                this.showFloatingText(512, 200, '+2 Survivors!', 0x00ff00);
              } else {
                this.food -= 10;
                this.showFloatingText(512, 200, '-10 Food (Thieves!)', 0xff0000);
              }
            }
          },
          {
            text: 'Turn them away',
            consequence: () => {
              this.showFloatingText(512, 200, 'Survivors left...', 0xffff00);
            }
          },
          {
            text: 'Trade supplies (-5 Food, +10 Ammo)',
            consequence: () => {
              this.food -= 5;
              this.ammo += 10;
              this.showFloatingText(512, 200, 'Trade complete', 0x00ff00);
            }
          }
        ]
      },
      {
        title: 'Radio Signal',
        description: 'You pick up a distress signal from a nearby building. It could be a trap or genuine survivors.',
        options: [
          {
            text: 'Investigate (Mark building on map)',
            consequence: () => {
              // Mark a random building as special
              const building = this.buildings[Math.floor(Math.random() * this.buildings.length)];
              building.lootQuality = 5;
              this.showFloatingText(512, 200, 'Location marked!', 0x00ff00);
            }
          },
          {
            text: 'Ignore it',
            consequence: () => {
              this.showFloatingText(512, 200, 'Signal ignored', 0xffff00);
            }
          }
        ]
      },
      {
        title: 'Storm Approaching',
        description: 'Dark clouds gather. A storm will hit tomorrow, making expeditions dangerous.',
        options: [
          {
            text: 'Recall all expeditions',
            consequence: () => {
              this.expeditions = [];
              this.showFloatingText(512, 200, 'Expeditions recalled', 0x00ff00);
            }
          },
          {
            text: 'Risk it',
            consequence: () => {
              this.showFloatingText(512, 200, 'Expeditions continue...', 0xff0000);
            }
          }
        ]
      },
      {
        title: 'Supply Cache',
        description: 'Your scouts report an untouched supply cache nearby, but it\'s surrounded by zombies.',
        options: [
          {
            text: 'Send armed team (60% +20 Food, 40% -1 Survivor)',
            consequence: () => {
              if (Math.random() < 0.6) {
                this.food += 20;
                this.showFloatingText(512, 200, '+20 Food!', 0x00ff00);
              } else {
                this.survivors = Math.max(1, this.survivors - 1);
                this.showFloatingText(512, 200, 'Lost 1 Survivor!', 0xff0000);
              }
            }
          },
          {
            text: 'Too risky',
            consequence: () => {
              this.showFloatingText(512, 200, 'Cache abandoned', 0xffff00);
            }
          }
        ]
      }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    this.showEventDialog(event);
  }

  showEventDialog(event: DailyEvent): void {
    // Show event panel
    this.eventPanel.setVisible(true);
    
    // Update text
    const title = this.eventPanel.list[1] as Phaser.GameObjects.Text;
    const description = this.eventPanel.list[2] as Phaser.GameObjects.Text;
    
    title.setText(event.title);
    description.setText(event.description);
    
    // Clear old options
    this.eventPanel.list.slice(3).forEach((item: any) => {
      if (item.type === 'Text') item.destroy();
    });
    
    // Add option buttons
    event.options.forEach((option, index) => {
      const optionText = this.add.text(0, -20 + index * 40, `[${index + 1}] ${option.text}`, {
        fontSize: '14px',
        color: '#00ff00',
        fontFamily: 'monospace'
      }).setOrigin(0.5).setInteractive();
      
      optionText.on('pointerdown', () => {
        option.consequence();
        this.eventPanel.setVisible(false);
        this.updateResourceDisplay();
      });
      
      this.eventPanel.add(optionText);
      
      // Keyboard shortcuts
      this.input.keyboard!.once(`keydown-${index + 1}`, () => {
        option.consequence();
        this.eventPanel.setVisible(false);
        this.updateResourceDisplay();
      });
    });
  }

  establishCamp(): void {
    if (this.campEstablished) {
      this.showFloatingText(this.playerSprite.x, this.playerSprite.y, 'Camp already established!', 0xff0000);
      return;
    }
    
    // Check if area is safe
    let safe = true;
    this.zombies.forEach(zombie => {
      if (this.getDistance(zombie.gridPos, this.playerPos) < 3) {
        safe = false;
      }
    });
    
    if (!safe) {
      this.showFloatingText(this.playerSprite.x, this.playerSprite.y, 'Too dangerous here!', 0xff0000);
      return;
    }
    
    this.campEstablished = true;
    this.campPos = { ...this.playerPos };
    this.gameMode = 'camp';
    
    // Visual camp marker
    const worldPos = this.gridToWorld(this.campPos);
    const camp = this.add.image(worldPos.x, worldPos.y, 'house');
    camp.setScale(2);
    camp.setTint(0x00ff00);
    camp.setDepth(3);
    
    this.uiText.mode.setText('CAMP MODE');
    this.showFloatingText(this.playerSprite.x, this.playerSprite.y, 'Camp Established!', 0x00ff00);
    
    // Open camp panel
    this.campPanel.setVisible(true);
  }

  lootBuilding(): void {
    // Check if player is on a building
    const building = this.buildings.find(b => 
      b.gridPos.x === this.playerPos.x && 
      b.gridPos.y === this.playerPos.y
    );
    
    if (!building) {
      this.showFloatingText(this.playerSprite.x, this.playerSprite.y, 'No building here', 0xff0000);
      return;
    }
    
    if (building.looted) {
      this.showFloatingText(this.playerSprite.x, this.playerSprite.y, 'Already looted', 0xff0000);
      return;
    }
    
    // Loot based on quality
    const loot = Math.floor(Math.random() * 10 * building.lootQuality);
    this.food += loot;
    this.ammo += Math.floor(loot / 2);
    
    building.looted = true;
    
    // Update visual
    this.children.list.forEach((child: any) => {
      if (child.getData && child.getData('building') === building) {
        child.setTint(0x666666);
      }
    });
    
    this.showFloatingText(this.playerSprite.x, this.playerSprite.y, `+${loot} Food, +${Math.floor(loot/2)} Ammo`, 0x00ff00);
    this.updateResourceDisplay();
  }

  onBuildingClick(building: Building): void {
    if (this.gameMode !== 'camp') return;
    
    // Send expedition to this building
    if (this.survivors > 1) {
      const expedition: Expedition = {
        id: `exp-${Date.now()}`,
        target: building,
        survivors: 2,
        daysRemaining: Math.ceil(this.getDistance(this.campPos!, building.gridPos) / 5)
      };
      
      this.expeditions.push(expedition);
      this.survivors -= 2;
      
      this.showFloatingText(512, 200, `Expedition sent to ${building.type}`, 0x00ff00);
      this.updateResourceDisplay();
    }
  }

  showBuildingTargets(): void {
    // Highlight all unlooted buildings
    this.buildings.forEach(building => {
      if (!building.looted) {
        const worldPos = this.gridToWorld(building.gridPos);
        const highlight = this.add.circle(worldPos.x, worldPos.y, 15, 0xffff00, 0.5);
        highlight.setDepth(20);
        
        this.tweens.add({
          targets: highlight,
          alpha: 0,
          scale: 2,
          duration: 2000,
          onComplete: () => highlight.destroy()
        });
      }
    });
  }

  processExpeditions(): void {
    this.expeditions = this.expeditions.filter(exp => {
      exp.daysRemaining--;
      
      if (exp.daysRemaining <= 0) {
        // Expedition returns
        const success = Math.random() < (1 - exp.target.danger * 0.15);
        
        if (success) {
          const loot = exp.target.lootQuality * 10;
          this.food += loot;
          this.ammo += loot / 2;
          exp.target.looted = true;
          
          this.showFloatingText(512, 150, `Expedition returned: +${loot} resources!`, 0x00ff00);
        } else {
          // Lost survivors
          this.showFloatingText(512, 150, 'Expedition failed - survivors lost!', 0xff0000);
        }
        
        this.survivors += success ? 2 : 0;
        return false;
      }
      
      return true;
    });
    
    this.updateResourceDisplay();
  }

  consumeDailyResources(): void {
    this.food -= this.survivors;
    this.water -= this.survivors * 2;
    
    if (this.food < 0) {
      this.survivors = Math.max(1, this.survivors - 1);
      this.showFloatingText(512, 180, 'Starvation! Lost survivor', 0xff0000);
      this.food = 0;
    }
    
    this.updateResourceDisplay();
  }

  spawnNewZombieWave(): void {
    const count = Math.min(10, this.dayNumber);
    
    for (let i = 0; i < count; i++) {
      const edge = Math.floor(Math.random() * 4);
      let x, y;
      
      switch(edge) {
        case 0: x = 0; y = Math.floor(Math.random() * GRID_HEIGHT); break;
        case 1: x = GRID_WIDTH - 1; y = Math.floor(Math.random() * GRID_HEIGHT); break;
        case 2: x = Math.floor(Math.random() * GRID_WIDTH); y = 0; break;
        default: x = Math.floor(Math.random() * GRID_WIDTH); y = GRID_HEIGHT - 1; break;
      }
      
      const worldPos = this.gridToWorld({ x, y });
      const zombie = this.add.sprite(worldPos.x, worldPos.y, 'zombie-small', 0);
      zombie.setScale(1.5);
      zombie.setDepth(5);
      zombie.setTint(0xff6666);
      
      const zombieData = {
        id: `zombie-new-${Date.now()}-${i}`,
        gridPos: { x, y },
        sprite: zombie,
        detected: false,
        health: 30
      };
      
      this.zombies.set(zombieData.id, zombieData);
    }
    
    this.showFloatingText(512, 120, `${count} new zombies spotted!`, 0xff0000);
  }

  toggleMapView(): void {
    const zoom = this.mainCamera.zoom === 1.5 ? 0.5 : 1.5;
    this.mainCamera.setZoom(zoom);
  }

  closeCampPanel(): void {
    this.campPanel.setVisible(false);
  }

  updateResourceDisplay(): void {
    this.uiText.resources.setText(this.getResourceString());
  }

  getResourceString(): string {
    return `👥 ${this.survivors} | 🍖 ${this.food} | 💧 ${this.water} | 🔫 ${this.ammo} | 💊 ${this.medicine}`;
  }

  showFloatingText(x: number, y: number, text: string, color: number): void {
    const floatingText = this.add.text(x, y - 30, text, {
      fontSize: '16px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(150).setScrollFactor(0);
    
    this.tweens.add({
      targets: floatingText,
      y: floatingText.y - 30,
      alpha: 0,
      duration: 2000,
      onComplete: () => floatingText.destroy()
    });
  }

  isValidPosition(pos: { x: number; y: number }): boolean {
    return pos.x >= 0 && pos.x < GRID_WIDTH && pos.y >= 0 && pos.y < GRID_HEIGHT;
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

  generateNoise(x: number, y: number): number {
    // Simple noise function for terrain variation
    return (Math.sin(x * 0.1) * Math.cos(y * 0.1) + 1) / 2;
  }
}

export default function StrategyDeadGrid() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 1024,
      height: 600,
      pixelArt: true,
      scene: StrategyDeadGridScene
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
      <div id="game-container" className="border-2 border-gray-800 shadow-2xl" />
    </div>
  );
}