'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { AssetManager } from '@/lib/game/AssetManager';
import { GridManager } from '@/lib/game/GridManager';
import { TurnManager, TurnListener, TurnPhase } from '@/lib/game/TurnManager';
import { Player } from '@/lib/game/entities/Player';
import { Zombie } from '@/lib/game/entities/Zombie';

/**
 * DeadGrid Main Game Scene
 */
class DeadGridScene extends Phaser.Scene implements TurnListener {
  // Managers
  private gridManager!: GridManager;
  private turnManager!: TurnManager;
  
  // Entities
  private player!: Player;
  private zombies: Map<string, Zombie> = new Map();
  
  // UI Elements
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  
  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private gKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  
  constructor() {
    super({ key: 'DeadGridScene' });
  }
  
  preload(): void {
    // Load all assets
    AssetManager.loadAllAssets(this);
    
    // Show loading progress
    const loadingText = this.add.text(400, 300, 'Loading: 0%', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    this.load.on('progress', (value: number) => {
      loadingText.setText(`Loading: ${Math.floor(value * 100)}%`);
    });
    
    this.load.on('complete', () => {
      loadingText.destroy();
    });
  }
  
  create(): void {
    // Initialize managers
    this.gridManager = new GridManager(20, 15, 48);
    this.turnManager = new TurnManager(this, this.gridManager);
    this.turnManager.addListener(this);
    
    // Create animations
    AssetManager.createAnimations(this);
    
    // Setup world
    this.setupWorld();
    
    // Create player
    this.createPlayer();
    
    // Spawn zombies
    this.spawnInitialZombies();
    
    // Create UI
    this.createUI();
    
    // Setup input
    this.setupInput();
    
    // Setup events
    this.setupEvents();
    
    // Start game
    this.turnManager.startPlayerTurn();
  }
  
  setupWorld(): void {
    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a0a');
    
    // Draw grid
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x222222, 0.3);
    
    for (let x = 0; x <= 20; x++) {
      graphics.moveTo(x * 48, 0);
      graphics.lineTo(x * 48, 15 * 48);
    }
    
    for (let y = 0; y <= 15; y++) {
      graphics.moveTo(0, y * 48);
      graphics.lineTo(20 * 48, y * 48);
    }
    
    // Add environmental objects
    this.addEnvironment();
  }
  
  addEnvironment(): void {
    const objects = [
      { key: 'barrel-grey', count: 5 },
      { key: 'barrel-red', count: 3 },
      { key: 'crate-brown', count: 4 }
    ];
    
    objects.forEach(obj => {
      for (let i = 0; i < obj.count; i++) {
        let pos;
        let attempts = 0;
        
        do {
          pos = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 15)
          };
          attempts++;
        } while (this.gridManager.isOccupied(pos) && attempts < 20);
        
        if (attempts < 20) {
          const worldPos = this.gridManager.gridToWorld(pos);
          const sprite = this.add.image(worldPos.x, worldPos.y, obj.key);
          sprite.setScale(1.5);
          sprite.setAlpha(0.8);
          sprite.setDepth(1);
          
          this.gridManager.addEntity({
            id: `obstacle-${obj.key}-${i}`,
            position: pos,
            sprite: sprite as any,
            type: 'obstacle'
          });
        }
      }
    });
  }
  
  createPlayer(): void {
    const startPos = { x: 10, y: 7 };
    this.player = new Player(this, startPos);
    
    this.gridManager.addEntity({
      id: this.player.getId(),
      position: startPos,
      sprite: this.player.getSprite(),
      type: 'player'
    });
  }
  
  spawnInitialZombies(): void {
    const configs = [
      { type: 'small' as const, count: 4 },
      { type: 'big' as const, count: 2 },
      { type: 'axe' as const, count: 1 }
    ];
    
    configs.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        this.spawnZombie(config.type);
      }
    });
  }
  
  spawnZombie(type: 'small' | 'big' | 'axe'): void {
    let pos;
    let attempts = 0;
    
    do {
      // Spawn on edges
      const edge = Math.floor(Math.random() * 4);
      switch(edge) {
        case 0: pos = { x: Math.floor(Math.random() * 20), y: 0 }; break;
        case 1: pos = { x: 19, y: Math.floor(Math.random() * 15) }; break;
        case 2: pos = { x: Math.floor(Math.random() * 20), y: 14 }; break;
        default: pos = { x: 0, y: Math.floor(Math.random() * 15) }; break;
      }
      attempts++;
    } while (
      (this.gridManager.isOccupied(pos) || 
       this.gridManager.getDistance(pos, this.player.getPosition()) < 5) &&
      attempts < 50
    );
    
    if (attempts >= 50) return;
    
    const zombie = new Zombie(this, pos, type);
    this.zombies.set(zombie.getId(), zombie);
    
    this.gridManager.addEntity({
      id: zombie.getId(),
      position: pos,
      sprite: zombie.getSprite(),
      type: 'zombie'
    });
  }
  
  createUI(): void {
    // Top bar background
    const topBar = this.add.rectangle(480, 30, 960, 60, 0x000000, 0.8);
    topBar.setStrokeStyle(2, 0x333333);
    topBar.setDepth(100);
    
    // Day counter
    this.dayText = this.add.text(20, 20, `DAY ${this.turnManager.getDay()}`, {
      fontSize: '20px',
      color: '#ff3333',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setDepth(101);
    
    // Turn indicator
    this.turnText = this.add.text(20, 45, 'YOUR TURN', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace'
    }).setDepth(101);
    
    // Health bar
    this.createHealthBar();
    
    // Ammo counter
    const ammoIcon = this.add.image(450, 30, 'icon-ammo-blue');
    ammoIcon.setScale(1.2).setDepth(101);
    
    this.ammoText = this.add.text(475, 22, `${this.player.getAmmo()}`, {
      fontSize: '18px',
      color: '#ffcc00',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setDepth(101);
    
    // Controls
    this.add.text(480, 680, 
      '[ARROWS] Move | [SPACE] Attack | [G] Shoot | [ENTER] End Turn',
      {
        fontSize: '14px',
        color: '#666666',
        fontFamily: 'monospace'
      }
    ).setOrigin(0.5).setDepth(101);
  }
  
  createHealthBar(): void {
    // Background
    const barBg = this.add.rectangle(250, 30, 154, 20, 0x333333);
    barBg.setStrokeStyle(2, 0x666666).setDepth(101);
    
    // Health bar
    this.healthBar = this.add.graphics();
    this.healthBar.setDepth(101);
    this.updateHealthBar();
    
    // Health text
    this.healthText = this.add.text(250, 30, 
      `${this.player.getHealth()}/${this.player.getMaxHealth()}`,
      {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace'
      }
    ).setOrigin(0.5).setDepth(102);
  }
  
  updateHealthBar(): void {
    this.healthBar.clear();
    const healthPercent = this.player.getHealth() / this.player.getMaxHealth();
    const barWidth = 150 * healthPercent;
    
    let color = 0x00ff00;
    if (healthPercent < 0.3) color = 0xff0000;
    else if (healthPercent < 0.6) color = 0xffaa00;
    
    this.healthBar.fillStyle(color);
    this.healthBar.fillRect(175, 20, barWidth, 16);
  }
  
  setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.gKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }
  
  setupEvents(): void {
    // Game events
    this.events.on('spawnZombie', (data: any) => {
      this.spawnZombie(data.type);
    });
    
    this.events.on('gameOver', () => {
      this.scene.pause();
      this.add.text(480, 360, 'GAME OVER', {
        fontSize: '48px',
        color: '#ff0000',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(200);
    });
    
    this.events.on('newDay', (day: number) => {
      this.dayText.setText(`DAY ${day}`);
      
      // Flash day text
      this.tweens.add({
        targets: this.dayText,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 200,
        yoyo: true
      });
    });
  }
  
  update(): void {
    if (!this.turnManager.isPlayerTurn()) return;
    
    // Movement
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.handlePlayerMove('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.handlePlayerMove('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.handlePlayerMove('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.handlePlayerMove('right');
    }
    
    // Actions
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleMeleeAttack();
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.gKey)) {
      this.handleRangedAttack();
    }
    
    // End turn
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.turnManager.endPlayerTurn();
    }
  }
  
  handlePlayerMove(direction: 'up' | 'down' | 'left' | 'right'): void {
    const newPos = this.player.handleMovement(direction);
    
    // Check bounds
    if (newPos.x < 0 || newPos.x >= 20 || newPos.y < 0 || newPos.y >= 15) return;
    
    // Check if occupied
    if (!this.gridManager.isOccupied(newPos)) {
      this.gridManager.moveEntity(this.player.getId(), newPos);
      this.player.moveTo(newPos, 48);
    }
  }
  
  handleMeleeAttack(): void {
    const playerPos = this.player.getPosition();
    
    // Check adjacent zombies
    this.zombies.forEach(zombie => {
      if (!zombie.getIsAlive()) return;
      
      const zombiePos = zombie.getPosition();
      const distance = Math.abs(playerPos.x - zombiePos.x) + Math.abs(playerPos.y - zombiePos.y);
      
      if (distance === 1) {
        const damage = this.player.meleeAttack();
        zombie.takeDamage(damage);
        
        if (!zombie.getIsAlive()) {
          this.gridManager.removeEntity(zombie.getId());
          this.zombies.delete(zombie.getId());
        }
      }
    });
  }
  
  handleRangedAttack(): void {
    if (this.player.getAmmo() <= 0) {
      this.showMessage('No ammo!', 0xff0000);
      return;
    }
    
    const damage = this.player.rangedAttack();
    if (!damage) return;
    
    // Update ammo display
    this.ammoText.setText(`${this.player.getAmmo()}`);
    
    // Find closest zombie in line of sight
    const playerPos = this.player.getPosition();
    let closestZombie: Zombie | null = null;
    let closestDistance = Infinity;
    
    this.zombies.forEach(zombie => {
      if (!zombie.getIsAlive()) return;
      
      const zombiePos = zombie.getPosition();
      const distance = Math.abs(playerPos.x - zombiePos.x) + Math.abs(playerPos.y - zombiePos.y);
      
      if (distance < closestDistance && distance <= 5) {
        closestZombie = zombie;
        closestDistance = distance;
      }
    });
    
    if (closestZombie) {
      closestZombie.takeDamage(damage);
      
      if (!closestZombie.getIsAlive()) {
        this.gridManager.removeEntity(closestZombie.getId());
        this.zombies.delete(closestZombie.getId());
      }
    }
  }
  
  showMessage(text: string, color: number): void {
    const msg = this.add.text(480, 200, text, {
      fontSize: '24px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(150);
    
    this.tweens.add({
      targets: msg,
      y: msg.y - 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => msg.destroy()
    });
  }
  
  // TurnListener implementation
  onTurnStart(phase: TurnPhase): void {
    switch(phase) {
      case 'player':
        this.turnText.setText('YOUR TURN').setColor('#00ff00');
        break;
      case 'enemies':
        this.turnText.setText('ENEMY TURN').setColor('#ff0000');
        break;
      case 'environment':
        this.turnText.setText('ENVIRONMENT').setColor('#ffaa00');
        break;
    }
  }
  
  onTurnEnd(phase: TurnPhase): void {
    if (phase === 'player') {
      // Update UI after player turn
      this.updateHealthBar();
      this.healthText.setText(`${this.player.getHealth()}/${this.player.getMaxHealth()}`);
    }
  }
}

export default function DeadGridGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 960,
      height: 720,
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: DeadGridScene,
      callbacks: {
        postBoot: () => {
          setIsLoading(false);
        }
      }
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
      <h1 className="text-4xl font-bold text-red-600 mb-2">DEADGRID</h1>
      <p className="text-gray-400 mb-4">Turn-Based Zombie Survival</p>
      <div id="game-container" className="border-2 border-gray-800 shadow-2xl" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-2xl animate-pulse">Loading Post-Apocalypse World...</div>
        </div>
      )}
    </div>
  );
}