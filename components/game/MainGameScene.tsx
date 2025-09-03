'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { AssetManager } from '@/lib/game/AssetManager';
import { GridManager } from '@/lib/game/GridManager';
import { TurnManager, TurnListener, TurnPhase } from '@/lib/game/TurnManager';
import { Player } from '@/lib/game/entities/Player';
import { Zombie } from '@/lib/game/entities/Zombie';

/**
 * Main Game Scene - Fully modular and extensible
 */
class MainGameScene extends Phaser.Scene implements TurnListener {
  // Core managers
  private gridManager!: GridManager;
  private turnManager!: TurnManager;
  
  // Entities
  private player!: Player;
  private zombies: Zombie[] = [];
  
  // UI Elements
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private turnIndicator!: Phaser.GameObjects.Text;
  
  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: any;
  
  constructor() {
    super({ key: 'MainGameScene' });
  }
  
  preload(): void {
    // Load all assets using AssetManager
    AssetManager.loadAllAssets(this);
    
    // Show loading progress
    this.load.on('progress', (value: number) => {
      console.log(`Loading: ${Math.floor(value * 100)}%`);
    });
    
    this.load.on('complete', () => {
      console.log('All assets loaded');
    });
  }
  
  create(): void {
    // Initialize managers
    this.gridManager = new GridManager(20, 15, 48);
    this.turnManager = new TurnManager(this, this.gridManager);
    this.turnManager.addListener(this);
    
    // Create animations
    AssetManager.createAnimations(this);
    
    // Setup game world
    this.setupWorld();
    
    // Create player
    this.createPlayer();
    
    // Spawn initial zombies
    this.spawnInitialZombies();
    
    // Create UI
    this.createUI();
    
    // Setup input
    this.setupInput();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start game
    this.turnManager.startPlayerTurn();
  }
  
  setupWorld(): void {
    // Set background color
    this.cameras.main.setBackgroundColor('#0a0a0a');
    
    // Draw grid
    this.gridManager.drawGrid(this);
    
    // Add some environmental objects
    this.createEnvironment();
  }
  
  createEnvironment(): void {
    // Add random barrels and crates
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * 20);
      const y = Math.floor(Math.random() * 15);
      
      // Skip if position is occupied
      if (this.gridManager.isOccupied({ x, y })) continue;
      
      const worldPos = this.gridManager.gridToWorld({ x, y });
      const sprite = this.add.image(
        worldPos.x,
        worldPos.y,
        Math.random() < 0.5 ? 'barrel-grey' : 'crate-brown'
      );
      sprite.setScale(1.5);
      sprite.setAlpha(0.7);
      
      // Add to grid as obstacle
      this.gridManager.addEntity({
        id: `obstacle-${i}`,
        position: { x, y },
        sprite: sprite as any,
        type: 'obstacle'
      });
    }
  }
  
  createPlayer(): void {
    // Create player at center of map
    const startPos = { x: 10, y: 7 };
    this.player = new Player(this, startPos);
    
    // Store entity reference in sprite
    this.player.getSprite().setData('entity', this.player);
    
    // Add to grid
    this.gridManager.addEntity({
      id: this.player.getId(),
      position: startPos,
      sprite: this.player.getSprite(),
      type: 'player'
    });
  }
  
  spawnInitialZombies(): void {
    // Spawn different types of zombies
    const zombieConfigs = [
      { type: 'small' as const, count: 3 },
      { type: 'big' as const, count: 2 },
      { type: 'axe' as const, count: 1 }
    ];
    
    zombieConfigs.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        this.spawnZombie(config.type);
      }
    });
  }
  
  spawnZombie(type: 'small' | 'big' | 'axe'): void {
    // Find random unoccupied position
    let position;
    let attempts = 0;
    
    do {
      position = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 15)
      };
      attempts++;
    } while (
      (this.gridManager.isOccupied(position) || 
       this.gridManager.getDistance(position, this.player.getPosition()) < 5) &&
      attempts < 50
    );
    
    if (attempts >= 50) return;
    
    // Create zombie
    const zombie = new Zombie(this, position, type);
    zombie.getSprite().setData('entity', zombie);
    this.zombies.push(zombie);
    
    // Add to grid
    this.gridManager.addEntity({
      id: zombie.getId(),
      position,
      sprite: zombie.getSprite(),
      type: 'zombie'
    });
  }
  
  createUI(): void {
    // UI Background
    const uiBg = this.add.rectangle(640, 40, 1280, 80, 0x000000, 0.9);
    uiBg.setStrokeStyle(2, 0x444444);
    uiBg.setDepth(100);
    
    // Day counter
    this.dayText = this.add.text(20, 15, `DAY ${this.turnManager.getDay()}`, {
      fontSize: '24px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setDepth(101);
    
    // Turn indicator
    this.turnIndicator = this.add.text(20, 45, 'YOUR TURN', {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setDepth(101);
    
    // Health display
    this.createHealthDisplay();
    
    // Ammo counter
    const ammoIcon = this.add.image(500, 30, 'icon-ammo-blue');
    ammoIcon.setScale(1.5).setDepth(101);
    
    this.ammoText = this.add.text(530, 20, `${this.player.getAmmo()}`, {
      fontSize: '20px',
      color: '#ffcc00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setDepth(101);
    
    // Controls help
    this.add.text(640, 680, 
      '[↑↓←→] Move | [SPACE] Melee | [G] Shoot | [E] Use Item | [ENTER] End Turn',
      {
        fontSize: '14px',
        color: '#666666',
        fontFamily: 'monospace'
      }
    ).setOrigin(0.5).setDepth(101);
  }
  
  createHealthDisplay(): void {
    // Health bar background
    const barBg = this.add.rectangle(250, 30, 204, 24, 0x333333);
    barBg.setStrokeStyle(2, 0x666666).setDepth(101);
    
    // Health bar
    this.healthBar = this.add.graphics();
    this.healthBar.setDepth(101);
    this.updateHealthBar();
    
    // Health text
    this.healthText = this.add.text(250, 30, 
      `${this.player.getHealth()}/${this.player.getMaxHealth()}`,
      {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace'
      }
    ).setOrigin(0.5).setDepth(102);
  }
  
  updateHealthBar(): void {
    const healthPercent = this.player.getHealth() / this.player.getMaxHealth();
    const barWidth = 200 * healthPercent;
    
    this.healthBar.clear();
    
    // Color based on health
    let color = 0x00ff00;
    if (healthPercent < 0.3) color = 0xff0000;
    else if (healthPercent < 0.6) color = 0xffcc00;
    
    this.healthBar.fillStyle(color);
    this.healthBar.fillRect(150, 20, barWidth, 20);
    
    // Update text
    this.healthText.setText(`${this.player.getHealth()}/${this.player.getMaxHealth()}`);
  }
  
  setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    this.keys = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
      G: Phaser.Input.Keyboard.KeyCodes.G,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER
    });
    
    // Movement
    this.input.keyboard!.on('keydown-UP', () => this.handlePlayerMove('up'));
    this.input.keyboard!.on('keydown-DOWN', () => this.handlePlayerMove('down'));
    this.input.keyboard!.on('keydown-LEFT', () => this.handlePlayerMove('left'));
    this.input.keyboard!.on('keydown-RIGHT', () => this.handlePlayerMove('right'));
    
    this.input.keyboard!.on('keydown-W', () => this.handlePlayerMove('up'));
    this.input.keyboard!.on('keydown-S', () => this.handlePlayerMove('down'));
    this.input.keyboard!.on('keydown-A', () => this.handlePlayerMove('left'));
    this.input.keyboard!.on('keydown-D', () => this.handlePlayerMove('right'));
    
    // Actions
    this.input.keyboard!.on('keydown-SPACE', () => this.handleMeleeAttack());
    this.input.keyboard!.on('keydown-G', () => this.handleRangedAttack());
    this.input.keyboard!.on('keydown-E', () => this.handleUseItem());
    this.input.keyboard!.on('keydown-ENTER', () => this.handleEndTurn());
  }
  
  setupEventListeners(): void {
    // Listen for game events
    this.events.on('gameOver', () => this.handleGameOver());
    this.events.on('newDay', (day: number) => this.handleNewDay(day));
    this.events.on('spawnZombie', (data: any) => {
      if (!this.gridManager.isOccupied(data)) {
        this.spawnZombie(data.type);
      }
    });
    this.events.on('lootDropped', (data: any) => this.createLoot(data));
  }
  
  handlePlayerMove(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (!this.turnManager.isPlayerTurn()) return;
    
    const newPos = this.player.handleMovement(direction);
    
    // Check if position is valid
    if (!this.gridManager.isValidPosition(newPos)) return;
    
    // Check for obstacles or enemies
    const entityAt = this.gridManager.getEntityAt(newPos);
    if (entityAt && entityAt.type !== 'item') return;
    
    // Move player
    this.gridManager.moveEntity(this.player.getId(), newPos);
    this.player.moveTo(newPos, this.gridManager.getTileSize()).then(() => {
      // Check for items at new position
      if (entityAt && entityAt.type === 'item') {
        this.pickupItem(entityAt);
      }
      
      // End turn after movement
      this.turnManager.endPlayerTurn();
    });
  }
  
  handleMeleeAttack(): void {
    if (!this.turnManager.isPlayerTurn()) return;
    
    // Find adjacent enemies
    const adjacentPositions = this.gridManager.getAdjacentPositions(this.player.getPosition());
    
    for (const pos of adjacentPositions) {
      const entity = this.gridManager.getEntityAt(pos);
      if (entity && entity.type === 'zombie') {
        const zombie = entity.sprite.getData('entity') as Zombie;
        const damage = this.player.meleeAttack();
        zombie.takeDamage(damage);
        
        if (!zombie.getIsAlive()) {
          this.gridManager.removeEntity(zombie.getId());
          this.zombies = this.zombies.filter(z => z !== zombie);
        }
        
        this.turnManager.endPlayerTurn();
        break;
      }
    }
  }
  
  handleRangedAttack(): void {
    if (!this.turnManager.isPlayerTurn()) return;
    
    const damage = this.player.rangedAttack();
    if (!damage) {
      this.showMessage('No ammo!', this.player.getSprite().x, this.player.getSprite().y - 40);
      return;
    }
    
    // Find nearest zombie within range
    const zombiesInRange = this.gridManager.getEntitiesInRange(this.player.getPosition(), 5)
      .filter(e => e.type === 'zombie');
    
    if (zombiesInRange.length > 0) {
      const target = zombiesInRange[0];
      const zombie = target.sprite.getData('entity') as Zombie;
      
      // Show bullet trail
      this.createBulletTrail(
        this.player.getSprite().x,
        this.player.getSprite().y,
        zombie.getSprite().x,
        zombie.getSprite().y
      );
      
      zombie.takeDamage(damage);
      
      if (!zombie.getIsAlive()) {
        this.gridManager.removeEntity(zombie.getId());
        this.zombies = this.zombies.filter(z => z !== zombie);
      }
      
      this.ammoText.setText(`${this.player.getAmmo()}`);
      this.turnManager.endPlayerTurn();
    } else {
      this.showMessage('No targets in range!', this.player.getSprite().x, this.player.getSprite().y - 40);
    }
  }
  
  handleUseItem(): void {
    if (!this.turnManager.isPlayerTurn()) return;
    
    // Try to use healing item
    if (this.player.useHealthItem('medkit') || 
        this.player.useHealthItem('bandage') || 
        this.player.useHealthItem('food')) {
      this.updateHealthBar();
      this.turnManager.endPlayerTurn();
    } else {
      this.showMessage('No healing items!', this.player.getSprite().x, this.player.getSprite().y - 40);
    }
  }
  
  handleEndTurn(): void {
    if (!this.turnManager.isPlayerTurn()) return;
    this.turnManager.endPlayerTurn();
  }
  
  createBulletTrail(x1: number, y1: number, x2: number, y2: number): void {
    const bullet = this.add.circle(x1, y1, 3, 0xffff00);
    bullet.setDepth(50);
    
    this.tweens.add({
      targets: bullet,
      x: x2,
      y: y2,
      duration: 100,
      onComplete: () => bullet.destroy()
    });
  }
  
  createLoot(data: { position: any; type: string }): void {
    const worldPos = this.gridManager.gridToWorld(data.position);
    const sprite = this.add.image(worldPos.x, worldPos.y, `icon-${data.type}`);
    sprite.setScale(1.5);
    sprite.setData('lootType', data.type);
    
    // Add glow effect
    this.tweens.add({
      targets: sprite,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Add to grid
    this.gridManager.addEntity({
      id: `loot-${Math.random()}`,
      position: data.position,
      sprite: sprite as any,
      type: 'item'
    });
  }
  
  pickupItem(item: any): void {
    const lootType = item.sprite.getData('lootType');
    
    switch(lootType) {
      case 'ammo':
        this.player.addAmmo(10);
        this.ammoText.setText(`${this.player.getAmmo()}`);
        break;
      case 'bandage':
      case 'food':
      case 'medkit':
        this.player.addItem(lootType);
        break;
    }
    
    this.showMessage(`+${lootType}`, item.sprite.x, item.sprite.y);
    item.sprite.destroy();
    this.gridManager.removeEntity(item.id);
  }
  
  showMessage(text: string, x: number, y: number): void {
    const message = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(100);
    
    this.tweens.add({
      targets: message,
      y: y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => message.destroy()
    });
  }
  
  handleNewDay(day: number): void {
    this.dayText.setText(`DAY ${day}`);
    this.showMessage(`Day ${day} begins...`, 640, 360);
  }
  
  handleGameOver(): void {
    // Game over screen
    const bg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.95);
    bg.setDepth(200);
    
    this.add.text(640, 300, 'GAME OVER', {
      fontSize: '72px',
      color: '#ff0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(201);
    
    this.add.text(640, 380, `Survived ${this.turnManager.getDay()} days`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(201);
    
    this.add.text(640, 440, 'Press F5 to restart', {
      fontSize: '18px',
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(201);
  }
  
  // TurnListener interface implementation
  onTurnStart(phase: TurnPhase): void {
    switch(phase) {
      case 'player':
        this.turnIndicator.setText('YOUR TURN');
        this.turnIndicator.setColor('#00ff00');
        break;
      case 'enemies':
        this.turnIndicator.setText('ENEMIES TURN');
        this.turnIndicator.setColor('#ff0000');
        break;
      case 'environment':
        this.turnIndicator.setText('...');
        this.turnIndicator.setColor('#666666');
        break;
    }
  }
  
  onTurnEnd(phase: TurnPhase): void {
    // Handle turn end if needed
  }
}

/**
 * React component wrapper for the game
 */
export default function PostApocalypseModularGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 1280,
        height: 720,
        scene: MainGameScene,
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
        <h1 className="text-6xl font-bold text-red-700 tracking-wider mb-2">
          DEADGRID
        </h1>
        <p className="text-gray-500 text-lg">Modular Post-Apocalypse Survival</p>
      </div>
      <div ref={containerRef} className="border-4 border-gray-800 shadow-2xl" />
      <div className="mt-4 text-gray-600 text-xs text-center">
        <p>A fully modular, extensible zombie survival game</p>
      </div>
    </div>
  );
}